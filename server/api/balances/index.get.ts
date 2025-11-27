import { balanceView, usersTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const balances = await db.select().from(balanceView);
  return balances;
});
