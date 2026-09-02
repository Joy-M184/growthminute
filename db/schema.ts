import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const plans = sqliteTable("plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  adminKey: text("admin_key"),
  title: text("title").notNull(),
  planDate: text("plan_date").notNull(),
  sourceText: text("source_text").notNull().default(""),
  itemsJson: text("items_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => [
  uniqueIndex("idx_plans_code").on(table.code),
  uniqueIndex("idx_plans_admin_key").on(table.adminKey),
]);

export const checkIns = sqliteTable("check_ins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id").notNull().references(() => plans.id),
  participantName: text("participant_name").notNull(),
  completedJson: text("completed_json").notNull(),
  reflection: text("reflection").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => [index("idx_check_ins_plan_id").on(table.planId)]);

export const cashTransactions = sqliteTable("cash_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull(),
  mode: text("mode").notNull(),
  type: text("type").notNull(),
  amountPence: integer("amount_pence").notNull(),
  category: text("category").notNull(),
  note: text("note").notNull().default(""),
  transactionDate: text("transaction_date").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => [
  index("idx_cash_transactions_owner_mode_date").on(table.ownerId, table.mode, table.transactionDate),
]);

export const userPreferences = sqliteTable("user_preferences", {
  ownerId: text("owner_id").primaryKey(),
  productAccess: text("product_access").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});
