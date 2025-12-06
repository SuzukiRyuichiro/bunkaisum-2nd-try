import { sql, eq, ne, asc } from "drizzle-orm";
import {
  expensesTable,
  involvementsTable,
  usersTable,
} from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";
import { calculateSettlements } from "~~/server/utils/settlements";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const groupId = getRouterParam(event, "groupId");

  if (!groupId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group ID is required",
    });
  }

  const balances = await db
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
    .innerJoin(expensesTable, eq(involvementsTable.expenseId, expensesTable.id))
    .innerJoin(usersTable, eq(involvementsTable.userId, usersTable.id))
    .where(eq(expensesTable.groupId, parseInt(groupId)))
    .groupBy(
      involvementsTable.userId,
      usersTable.displayName,
      usersTable.profilePictureUrl
    )
    .having(({ netBalance }) => ne(netBalance, 0))
    .orderBy(asc(sql`"netBalance"`));

  const settlements = calculateSettlements(balances);

  return { balances, settlements };
});
