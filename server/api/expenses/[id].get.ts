import { expensesTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  // Here I wanna use Drizzle
  const db = useDrizzle(event);
  const id = getRouterParam(event, "id");
  if (!id) return null;

  const expense = await db.query.expensesTable.findFirst({
    where: (_, { eq }) => eq(expensesTable.id, parseInt(id)),
    with: {
      user: true,
      involvements: {
        with: {
          user: true,
        },
      },
    },
  });

  return expense;
});
