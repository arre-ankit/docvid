import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/src/db";
import { subscriptions, users } from "@/src/db/schema";
import { getSession } from "@/src/auth/server";
import { readAuthEnvSource } from "@/src/lib/auth-env";
import { ACTIVE_STATUSES, fetchActiveSubscriptionFromDodo, upsertSubscription } from "@/src/lib/dodo";

export type SubscriptionStatus = {
  isPro: boolean;
  status: string | null;
  productId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

const FREE: SubscriptionStatus = {
  isPro: false,
  status: null,
  productId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

/**
 * Read the active subscription for a user. Checks the local mirror first; if
 * empty, falls back to Dodo's API as the source of truth and self-heals the
 * local row (and the user's `dodoCustomerId`). The fallback is what makes Pro
 * status reliable when webhooks can't reach the app — e.g. `localhost` in dev.
 */
export async function getSubscriptionForUser(userId: string): Promise<SubscriptionStatus> {
  const db = await getDb();

  const local = await db.query.subscriptions.findFirst({
    where: and(eq(subscriptions.userId, userId), inArray(subscriptions.status, [...ACTIVE_STATUSES])),
    orderBy: [desc(subscriptions.currentPeriodEnd)],
  });
  if (local) return toStatus(local);

  // No active local row — ask Dodo directly.
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true, dodoCustomerId: true },
  });
  if (!user) return FREE;

  const envSource = await readAuthEnvSource();
  const remote = await fetchActiveSubscriptionFromDodo(envSource, user).catch((err) => {
    console.warn("[dodo] subscription fallback lookup failed", err);
    return null;
  });
  if (!remote) return FREE;

  // Persist so subsequent reads hit the fast local path, and backfill the
  // customer id for users created before the Dodo integration existed.
  await upsertSubscription(db, userId, remote);
  if (!user.dodoCustomerId) {
    await db
      .update(users)
      .set({ dodoCustomerId: remote.customer.customer_id })
      .where(eq(users.id, userId));
  }

  return {
    isPro: true,
    status: remote.status,
    productId: remote.product_id,
    currentPeriodEnd: remote.next_billing_date ? new Date(remote.next_billing_date) : null,
    cancelAtPeriodEnd: remote.cancel_at_next_billing_date ?? false,
  };
}

function toStatus(row: typeof subscriptions.$inferSelect): SubscriptionStatus {
  return {
    isPro: true,
    status: row.status,
    productId: row.productId,
    currentPeriodEnd: row.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
  };
}

/** Subscription status for the currently signed-in user (free if signed out). */
export async function getCurrentSubscription(): Promise<SubscriptionStatus> {
  const session = await getSession();
  if (!session) return FREE;
  return getSubscriptionForUser(session.user.id);
}

/** Convenience guard for gating Pro-only server actions / routes. */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  return (await getSubscriptionForUser(userId)).isPro;
}
