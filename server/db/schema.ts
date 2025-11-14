import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/gel-core";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: int("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

export const expensesTable = sqliteTable("expenses", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text(),
  totalAmount: int().default(0),
  paidAt: int("paidAt", { mode: "timestamp" }),
  ...timestamps,
});

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  displayName: text(),
  ...timestamps,
});

export const oauthAccountsTable = sqliteTable("oauthAccounts", {
  id: int().primaryKey({ autoIncrement: true }),
  provider: text(),
  providerUserId: text(),
  accessToken: text(),
  refreshToken: text(),
  expiresAt: int("expiresAt", { mode: "timestamp" }),
  userId: int("userId").references(() => usersTable.id),
  ...timestamps,
});
