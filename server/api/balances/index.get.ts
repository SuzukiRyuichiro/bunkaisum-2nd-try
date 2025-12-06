import { balanceView } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";
import { calculateSettlements } from "~~/server/utils/settlements";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const balances = await db.select().from(balanceView);
  const settlements = calculateSettlements(balances);

  return { balances, settlements };
});
