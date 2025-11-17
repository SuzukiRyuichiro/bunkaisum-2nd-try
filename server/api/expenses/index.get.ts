import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  // Here I wanna use Drizzle
  const db = useDrizzle(event);
  const expenses = await db.query.expensesTable.findMany({
    with: {
      user: true,
    },
  });
  return expenses;
});
