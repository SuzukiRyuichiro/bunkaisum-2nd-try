import { eq } from "drizzle-orm";
import { expensesTable, involvementsTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Expense ID is required",
    });
  }

  const { expense, involvements } = await readBody(event);
  const { user } = await requireUserSession(event);

  // Update the expense
  await db
    .update(expensesTable)
    .set({ ...expense, userId: user.id })
    .where(eq(expensesTable.id, parseInt(id)));

  // Delete existing involvements
  await db
    .delete(involvementsTable)
    .where(eq(involvementsTable.expenseId, parseInt(id)));

  // Insert new involvements
  await db.insert(involvementsTable).values(
    involvements.map((involvement) => ({
      ...involvement,
      expenseId: parseInt(id),
    }))
  );

  return {
    success: true,
    id: parseInt(id),
  };
});
