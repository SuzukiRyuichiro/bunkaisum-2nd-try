import { expensesTable, involvementsTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const groupId = getRouterParam(event, "groupId");

  if (!groupId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group ID is required",
    });
  }

  const { expense, involvements } = await readBody(event);
  const { user } = await requireUserSession(event);

  // Insert expense with groupId
  const [newExpense] = await db
    .insert(expensesTable)
    .values({
      userId: user.id,
      groupId: parseInt(groupId),
      ...expense
    })
    .returning();

  const newInvolvements = await db.insert(involvementsTable).values(
    involvements.map((involvement) => ({
      ...involvement,
      expenseId: newExpense.id,
    }))
  );

  return {
    success: true,
    id: newExpense.id,
  };
});
