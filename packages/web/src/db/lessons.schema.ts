import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

/** App-owned lesson index — KV/R2 hold the heavy lesson payload. */
export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    status: text("status").notNull().default("running"),
    title: text("title"),
    claimToken: text("claim_token").notNull(),
    customizationJson: text("customization_json"),
    createdAt: text("created_at").notNull(),
    claimedAt: text("claimed_at"),
    expiresAt: text("expires_at").notNull(),
  },
  (table) => [
    index("lessons_user_id_idx").on(table.userId, table.createdAt),
    index("lessons_claim_token_idx").on(table.claimToken),
  ],
);

export type LessonRow = typeof lessons.$inferSelect;
export type NewLessonRow = typeof lessons.$inferInsert;
