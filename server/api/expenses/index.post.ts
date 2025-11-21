import { expensesTable, involvementsTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  // Here I wanna use Drizzle
  const db = useDrizzle(event);
  const { expense, involvements } = await readBody(event);

  const { user } = await requireUserSession(event);

  // // Insert expense
  // // Insert multiple involvements

  const [newExpense] = await db
    .insert(expensesTable)
    .values({ userId: user.id, ...expense })
    .returning();

  const newInvolvements = await db
    .insert(involvementsTable)
    .values(
      involvements.map((involvement) => ({
        ...involvement,
        expenseId: newExpense.id,
      }))
    )
    .returning();

  // return newExpense;
  return newInvolvements;
});
