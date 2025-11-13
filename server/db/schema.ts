import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/gel-core";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const fruitsTable = sqliteTable("fruits", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  color: text().notNull(),
});

export const expensesTable = sqliteTable("expenses", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  totalAmount: int().notNull().default(0),
  createdAt: int("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  paidAt: int("paidAt", { mode: "timestamp" }).notNull(),
});
