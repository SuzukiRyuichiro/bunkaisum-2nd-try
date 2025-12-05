import { relations, sql, eq, asc, ne } from "drizzle-orm";
import {
  int,
  primaryKey,
  sqliteTable,
  sqliteView,
  text,
} from "drizzle-orm/sqlite-core";

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
  emoji: text(),
  paidAt: text("paidAt"), // Store as "YYYY-MM-DD" string
  userId: int("userId").references(() => usersTable.id),
  groupId: int("groupId").references(() => groupsTable.id),
  splitType: text("splitType").default("equal"),
  ...timestamps,
});

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  displayName: text(),
  profilePictureUrl: text(),
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

export const involvementsTable = sqliteTable("involvements", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int("userId").references(() => usersTable.id),
  expenseId: int("expenseId").references(() => expensesTable.id),
  amount: int("amount").notNull(),
  type: text("type").notNull(),
  shareRatio: int("shareRatio"),
  ...timestamps,
});

export const groupsTable = sqliteTable("groups", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text("name"),
  ...timestamps,
});

export const groupMembersTable = sqliteTable("groupMembers", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int("userId").references(() => usersTable.id),
  groupId: int("groupId").references(() => groupsTable.id),
  ...timestamps,
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  expenses: many(expensesTable),
  oAuthAccounts: many(oAuthAccountsTable),
  involvements: many(involvementsTable),
  groupMembers: many(groupMembersTable),
}));

export const expensesRelations = relations(expensesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [expensesTable.userId],
    references: [usersTable.id],
  }),
  involvements: many(involvementsTable),
}));

export const groupsRelations = relations(groupsTable, ({ many }) => ({
  expenses: many(expensesTable),
  groupMembers: many(groupMembersTable),
}));

export const groupMembersRelations = relations(groupMembersTable, ({ one }) => {
  return {
    group: one(groupsTable, {
      fields: [groupMembersTable.groupId],
      references: [groupsTable.id],
    }),
    user: one(usersTable, {
      fields: [groupMembersTable.userId],
      references: [usersTable.id],
    }),
  };
});

export const oAuthAccountsRelations = relations(
  oAuthAccountsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [oAuthAccountsTable.userId],
      references: [usersTable.id],
    }),
  })
);
export const involvementsRelations = relations(
  involvementsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [involvementsTable.userId],
      references: [usersTable.id],
    }),
    expense: one(expensesTable, {
      fields: [involvementsTable.expenseId],
      references: [expensesTable.id],
    }),
  })
);

// views

export const balanceView = sqliteView("balanceView").as((queryBuilder) =>
  queryBuilder
    .select({
      userId: involvementsTable.userId,
      displayName: usersTable.displayName,
      profilePictureUrl: usersTable.profilePictureUrl,
      netBalance: sql<number>`SUM(${involvementsTable.amount})`.as(
        "netBalance"
      ),
      status: sql<string>`
      CASE
        WHEN SUM(${involvementsTable.amount}) < 0 THEN 'creditor'
        WHEN SUM(${involvementsTable.amount}) >= 0 THEN 'debtor'
      END
    `.as("status"),
    })
    .from(involvementsTable)
    .innerJoin(usersTable, eq(involvementsTable.userId, usersTable.id))
    .groupBy(involvementsTable.userId, usersTable.displayName)
    .having(({ netBalance }) => ne(netBalance, 0))
    .orderBy(asc(sql`"netBalance"`))
);
