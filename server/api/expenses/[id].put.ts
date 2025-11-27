import { eq } from "drizzle-orm";
import { expensesTable, involvementsTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const { expense, involvements } = await readBody(event);
  const { user } = await requireUserSession(event);
  const expenseId = Number(event.context.params?.id);

  if (!expenseId) {
    throw createError({
      statusCode: 400,
      message: "Invalid expense ID",
    });
  }

  // Verify the expense exists and belongs to the user
  const existingExpense = await db.query.expensesTable.findFirst({
    where: eq(expensesTable.id, expenseId),
  });

  if (!existingExpense) {
    throw createError({
      statusCode: 404,
      message: "Expense not found",
    });
  }

  // Update the expense
  await db
    .update(expensesTable)
    .set({
      ...expense,
      userId: user.id,
    })
    .where(eq(expensesTable.id, expenseId));

  // Delete old involvements
  await db
    .delete(involvementsTable)
    .where(eq(involvementsTable.expenseId, expenseId));

  // Insert new involvements
  await db.insert(involvementsTable).values(
    involvements.map((involvement) => ({
      ...involvement,
      expenseId: expenseId,
    }))
  );

  return {
    success: true,
    id: expenseId,
  };
});
