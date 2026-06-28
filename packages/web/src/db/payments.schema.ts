import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { users } from "./auth.schema";

/**
 * Mirror of Dodo Payments subscription state, kept in sync via webhook callbacks
 * (see `src/lib/dodo.ts`). The source of truth is Dodo; this table exists so Pro
 * gating can be checked with a single local query instead of a Dodo API round-trip.
 */
export const subscriptions = sqliteTable(
  "subscriptions",
  {
    // Dodo subscription_id.
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Dodo customer_id (mirrors users.dodoCustomerId).
    customerId: text("customer_id").notNull(),
    productId: text("product_id").notNull(),
    // "pending" | "active" | "on_hold" | "cancelled" | "expired" | "failed"
    status: text("status").notNull(),
    cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" })
      .default(false)
      .notNull(),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("subscriptions_userId_idx").on(table.userId),
    index("subscriptions_customerId_idx").on(table.customerId),
  ],
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));
