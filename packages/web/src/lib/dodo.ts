import "server-only";

import DodoPayments from "dodopayments";
import { checkout, dodopayments, portal, webhooks } from "@dodopayments/better-auth";

import { getDb } from "@/src/db";
import { subscriptions, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

type EnvSource = Record<string, string | undefined>;

function pick(source: EnvSource, key: string) {
  return source[key]?.trim() || undefined;
}

/**
 * Product slug -> env var holding the Dodo product id. Slugs are what the app
 * passes to checkout; the ids come from your Dodo dashboard. Stubbed ids are
 * fine for wiring — replace the env values once products exist in Dodo.
 */
const PRODUCT_SLUG_ENV: Record<string, string> = {
  "pro-monthly": "DODO_PRO_MONTHLY_PRODUCT_ID",
};

export type ProductSlug = keyof typeof PRODUCT_SLUG_ENV;

export function buildDodoProducts(source: EnvSource) {
  return Object.entries(PRODUCT_SLUG_ENV)
    .map(([slug, envKey]) => {
      const productId = pick(source, envKey);
      return productId ? { slug, productId } : null;
    })
    .filter((p): p is { slug: string; productId: string } => p !== null);
}

/** Statuses that unlock Pro features. */
export const ACTIVE_STATUSES = ["active", "on_hold"] as const;

/** A status that unlocks Pro features. */
function isActiveStatus(status: string) {
  return (ACTIVE_STATUSES as readonly string[]).includes(status);
}

/** Normalized subscription shape shared by webhook payloads and API responses. */
export type DodoSubscriptionData = {
  subscription_id: string;
  product_id: string;
  status: string;
  customer: { customer_id: string };
  cancel_at_next_billing_date?: boolean;
  next_billing_date?: Date | string | null;
};

type Db = Awaited<ReturnType<typeof getDb>>;

/** Build a raw Dodo client from env, or `undefined` when no API key is set. */
export function buildDodoClient(source: EnvSource) {
  const bearerToken = pick(source, "DODO_PAYMENTS_API_KEY");
  if (!bearerToken) return undefined;
  const environment =
    pick(source, "DODO_PAYMENTS_ENVIRONMENT") === "live_mode" ? "live_mode" : "test_mode";
  return new DodoPayments({ bearerToken, environment });
}

/** Upsert the mirrored subscription row for a known local user. */
export async function upsertSubscription(db: Db, userId: string, data: DodoSubscriptionData) {
  const periodEnd = data.next_billing_date ? new Date(data.next_billing_date) : null;
  const row = {
    id: data.subscription_id,
    userId,
    customerId: data.customer.customer_id,
    productId: data.product_id,
    status: data.status,
    cancelAtPeriodEnd: data.cancel_at_next_billing_date ?? false,
    currentPeriodEnd: periodEnd,
    updatedAt: new Date(),
  };

  await db
    .insert(subscriptions)
    .values(row)
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: row.status,
        productId: row.productId,
        cancelAtPeriodEnd: row.cancelAtPeriodEnd,
        currentPeriodEnd: row.currentPeriodEnd,
        updatedAt: row.updatedAt,
      },
    });
}

/**
 * Look up the local user that owns a Dodo customer and upsert the mirrored
 * subscription row. Runs inside the webhook request, so `getDb()` resolves the
 * D1 binding on Workers (or local SQLite in `next dev`).
 */
async function syncSubscription(payload: DodoSubscriptionData) {
  const db = await getDb();
  const customerId = payload.customer.customer_id;

  const owner = await db.query.users.findFirst({
    where: eq(users.dodoCustomerId, customerId),
    columns: { id: true },
  });
  if (!owner) {
    console.warn(`[dodo] webhook for unknown customer ${customerId}; skipping`);
    return;
  }

  await upsertSubscription(db, owner.id, payload);
}

/**
 * Query Dodo directly for a user's active subscription. Used as a fallback when
 * the local mirror is empty (e.g. webhooks can't reach localhost in dev). The
 * Dodo customer is resolved by stored id, falling back to a lookup by email.
 * Returns the active subscription data plus the resolved customer id, or null.
 */
export async function fetchActiveSubscriptionFromDodo(
  source: EnvSource,
  user: { email: string; dodoCustomerId?: string | null },
): Promise<DodoSubscriptionData | null> {
  const client = buildDodoClient(source);
  if (!client) return null;

  let customerId = user.dodoCustomerId?.trim() || undefined;
  if (!customerId) {
    const customers = await client.customers.list({ email: user.email });
    for await (const customer of customers) {
      customerId = customer.customer_id;
      break;
    }
    if (!customerId) return null;
  }

  for (const status of ACTIVE_STATUSES) {
    const subs = await client.subscriptions.list({ customer_id: customerId, status });
    for await (const sub of subs) {
      return {
        subscription_id: sub.subscription_id,
        product_id: sub.product_id,
        status: sub.status,
        customer: { customer_id: customerId },
        cancel_at_next_billing_date: sub.cancel_at_next_billing_date,
        next_billing_date: sub.next_billing_date,
      };
    }
  }

  return null;
}

/**
 * Build the Dodo Payments Better Auth plugin from a resolved env source.
 * Returns `undefined` when no API key is configured so auth still works without
 * payments (local dev, schema generation).
 */
export function buildDodoPlugin(source: EnvSource) {
  const client = buildDodoClient(source);
  if (!client) return undefined;

  const webhookKey = pick(source, "DODO_PAYMENTS_WEBHOOK_SECRET");
  const successUrl = pick(source, "DODO_PAYMENTS_SUCCESS_URL") ?? "/library?upgraded=1";

  const checkoutPlugin = checkout({
    products: buildDodoProducts(source),
    successUrl,
    authenticatedUsersOnly: true,
  });

  const webhooksPlugin = webhookKey
    ? webhooks({
        webhookKey,
        onSubscriptionActive: (p) => syncSubscription(p.data),
        onSubscriptionRenewed: (p) => syncSubscription(p.data),
        onSubscriptionOnHold: (p) => syncSubscription(p.data),
        onSubscriptionPlanChanged: (p) => syncSubscription(p.data),
        onSubscriptionCancelled: (p) => syncSubscription(p.data),
        onSubscriptionExpired: (p) => syncSubscription(p.data),
        onSubscriptionFailed: (p) => syncSubscription(p.data),
      })
    : null;

  // Built as one array literal (no `.push`) so the element type is the full
  // plugin union rather than being narrowed to the first two members.
  const plugins = webhooksPlugin
    ? [checkoutPlugin, portal(), webhooksPlugin]
    : [checkoutPlugin, portal()];

  return dodopayments({
    client,
    createCustomerOnSignUp: true,
    // The plugin's `use` is a positional tuple type; we build it dynamically
    // (webhooks only when a secret is set), so cast past the tuple check.
    use: plugins as never,
  });
}

export { isActiveStatus };
