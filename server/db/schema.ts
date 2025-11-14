import { relations, sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: int("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdateFn(() => new Date())
    .$type<Date>(),
};

export const expensesTable = sqliteTable("expenses", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text(),
  totalAmount: int().default(0),
  paidAt: text("paidAt"), // Store as "YYYY-MM-DD" string
  userId: int("userId").references(() => usersTable.id),
  ...timestamps,
});

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  displayName: text(),
  ...timestamps,
});

export const oAuthAccountsTable = sqliteTable("oAuthAccounts", {
  id: int().primaryKey({ autoIncrement: true }),
  provider: text(),
  providerUserId: text(),
  accessToken: text(),
  refreshToken: text(),
  expiresAt: int("expiresAt", { mode: "timestamp" }),
  userId: int("userId").references(() => usersTable.id),
  ...timestamps,
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  expenses: many(expensesTable),
  oAuthAccounts: many(oAuthAccountsTable),
}));

export const expensesRelations = relations(expensesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [expensesTable.userId],
    references: [usersTable.id],
  }),
}));

export const oAuthAccountsRelations = relations(
  oAuthAccountsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [oAuthAccountsTable.userId],
      references: [usersTable.id],
    }),
  })
);
