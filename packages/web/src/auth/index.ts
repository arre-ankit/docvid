import type { D1Database, KVNamespace } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";

import { buildSocialProviders } from "@/src/lib/auth-env";
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
  } as const;
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
  };

  const envSource: Record<string, string | undefined> = {
    BETTER_AUTH_URL: env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID ?? process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET ?? process.env.GITHUB_CLIENT_SECRET,
  };
  const baseURL = env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const trustedOrigins = (env.BETTER_AUTH_TRUSTED_ORIGINS ?? process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    ...withCloudflare(
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
    ),
  });
}

let authInstance: Awaited<ReturnType<typeof authBuilder>> | null = null;

export async function initAuth() {
  if (!authInstance) {
    authInstance = await authBuilder();
  }
  return authInstance;
}

/** Static export for Better Auth CLI schema generation. */
export const auth = betterAuth({
  ...withCloudflare(
    {
      autoDetectIpAddress: true,
      geolocationTracking: true,
      cf: {},
    },
    authOptions("http://localhost:3000", [], process.env as Record<string, string | undefined>),
  ),
  database: drizzleAdapter({} as D1Database, {
    provider: "sqlite",
    usePlural: true,
  }),
});
