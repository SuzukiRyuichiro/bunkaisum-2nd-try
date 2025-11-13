import { expensesTable } from "~~/server/db/schema";
import useDrizzle, { Expense } from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  // Here I wanna use Drizzle
  const db = useDrizzle(event);
  const expense: Partial<Expense> = {
    title: event.context.params?.title,
    totalAmount: Number.parseInt(event.context.params?.totalAmount || "0"),
    paidAt: new Date(event.context.params?.paidAt || ""),
  };
  const expenses = await db.insert(expensesTable).values({});
  return { expenses };
});
