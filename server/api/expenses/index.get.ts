import { eq, sql } from "drizzle-orm";
import {
  expensesTable,
  involvementsTable,
  usersTable,
} from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  // Here I wanna use Drizzle
  const db = useDrizzle(event);
  const expenses = await db.query.expensesTable.findMany({
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
