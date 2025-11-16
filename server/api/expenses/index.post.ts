import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { expensesTable } from "~~/server/db/schema";
import useDrizzle, { Expense } from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  // Here I wanna use Drizzle
  const db = useDrizzle(event);
  const { expense } = await readBody(event);

  if (!expense) return;
  const { user } = await requireUserSession(event);

  const newExpense = await db
    .insert(expensesTable)
    .values({ userId: user.id, ...expense });

  return { newExpense };
});
