import { expensesTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  // Here I wanna use Drizzle
  const db = useDrizzle(event);
  const expenses = await db.query.expensesTable.findMany();
  return { expenses };
});
