import { sql } from "drizzle-orm/sql";
import { expensesTable, groupsTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const groupId = parseInt(getRouterParam(event, "group_id") || "");

  if (isNaN(groupId)) throw new Error("Invalid Group ID");

  const expenses = await db.query.expensesTable.findMany({
    where: (_, { eq }) => eq(expensesTable.groupId, groupId),
    with: {
      user: true,
    },
    orderBy: (expensesTable, { desc }) => [desc(expensesTable.createdAt)],
    extras: {
      participantCount:
        sql`(select count(*) from "involvements" where "involvements"."expenseId" = "expensesTable"."id" and "involvements"."type" = 'share')`.as(
          "participantCount"
        ),
    },
  });

  return expenses;
});
