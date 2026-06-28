import type { D1Database, KVNamespace } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";

import { buildSocialProviders } from "@/src/lib/auth-env";
import { buildDodoPlugin } from "@/src/lib/dodo";
import { getDb } from "@/src/db";

function authOptions(
  baseURL: string,
  trustedOrigins: string[],
  envSource: Record<string, string | undefined>,
) {
  return {
    baseURL,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    // Auto-link accounts that share a verified email. Only trusted providers
    // (Google/GitHub verify email ownership) may link, so a social sign-in
    // resolves to the existing account instead of failing `account_not_linked`.
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
        // Existing email/password accounts have `emailVerified: false`, and the
        // local-verified check defaults to true — which blocks linking with
        // `account_not_linked`. The linking provider (Google/GitHub) has already
        // verified the email, so it's safe to skip the local-verified gate.
        requireLocalEmailVerified: false,
      },
      // Keep the OAuth `state` in a self-contained encrypted cookie instead of a
      // DB verification record. The default "database" strategy (selected here
      // because Cloudflare KV makes sessions stateful) also requires a matching
      // signed cookie, and that cross-check fails under the OpenNext dev runtime
      // — surfacing as `state_mismatch` on the social callback.
      storeStateStrategy: "cookie" as const,
    },
    socialProviders: buildSocialProviders(envSource),
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 100 },
        "/sign-up/email": { window: 60, max: 100 },
        "/sign-in/social": { window: 60, max: 100 },
      },
    },
  };
}

async function authBuilder() {
  const dbInstance = await getDb();
  const cfCtx = await getCloudflareContext({ async: true });
  const env = cfCtx.env as {
    DB?: D1Database;
    KV?: KVNamespace;
    BETTER_AUTH_URL?: string;
    BETTER_AUTH_TRUSTED_ORIGINS?: string;
    BETTER_AUTH_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    DODO_PAYMENTS_API_KEY?: string;
    DODO_PAYMENTS_WEBHOOK_SECRET?: string;
    DODO_PAYMENTS_ENVIRONMENT?: string;
    DODO_PAYMENTS_SUCCESS_URL?: string;
    DODO_PRO_MONTHLY_PRODUCT_ID?: string;
  };

  const envSource: Record<string, string | undefined> = {
    BETTER_AUTH_URL: env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID ?? process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET ?? process.env.GITHUB_CLIENT_SECRET,
    DODO_PAYMENTS_API_KEY: env.DODO_PAYMENTS_API_KEY ?? process.env.DODO_PAYMENTS_API_KEY,
    DODO_PAYMENTS_WEBHOOK_SECRET:
      env.DODO_PAYMENTS_WEBHOOK_SECRET ?? process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
    DODO_PAYMENTS_ENVIRONMENT:
      env.DODO_PAYMENTS_ENVIRONMENT ?? process.env.DODO_PAYMENTS_ENVIRONMENT,
    DODO_PAYMENTS_SUCCESS_URL:
      env.DODO_PAYMENTS_SUCCESS_URL ?? process.env.DODO_PAYMENTS_SUCCESS_URL,
    DODO_PRO_MONTHLY_PRODUCT_ID:
      env.DODO_PRO_MONTHLY_PRODUCT_ID ?? process.env.DODO_PRO_MONTHLY_PRODUCT_ID,
  };
  const baseURL = env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const trustedOrigins = (env.BETTER_AUTH_TRUSTED_ORIGINS ?? process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const cfOptions = withCloudflare(
    {
      autoDetectIpAddress: true,
      geolocationTracking: true,
      cf: cfCtx.cf,
      d1: {
        db: dbInstance as unknown as ReturnType<typeof import("drizzle-orm/d1").drizzle>,
        options: {
          usePlural: true,
        },
      },
      kv: env.KV,
    },
    authOptions(baseURL, trustedOrigins, envSource),
  );

  const dodoPlugin = buildDodoPlugin(envSource);

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    ...cfOptions,
    plugins: [...(cfOptions.plugins ?? []), ...(dodoPlugin ? [dodoPlugin] : [])],
  });
}

/** Build auth per request so Cloudflare `cf` / bindings stay in sync (OpenNext on Workers). */
export async function initAuth() {
  return authBuilder();
}

/** Static export for Better Auth CLI schema generation. */
const staticCfOptions = withCloudflare(
  {
    autoDetectIpAddress: true,
    geolocationTracking: true,
    cf: {},
  },
  authOptions("http://localhost:3000", [], process.env as Record<string, string | undefined>),
);

// Force-build the Dodo plugin (dummy token) so `auth:generate` keeps the
// `dodo_customer_id` field on the users table. The client is only introspected
// for its schema here, never called.
const staticDodoPlugin = buildDodoPlugin({
  ...(process.env as Record<string, string | undefined>),
  DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY ?? "schema-gen-placeholder",
});

export const auth = betterAuth({
  ...staticCfOptions,
  plugins: [...(staticCfOptions.plugins ?? []), ...(staticDodoPlugin ? [staticDodoPlugin] : [])],
  database: drizzleAdapter({} as D1Database, {
    provider: "sqlite",
    usePlural: true,
  }),
});
