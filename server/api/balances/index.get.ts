import { balanceView, usersTable } from "~~/server/db/schema";
import useDrizzle, { User } from "~~/server/utils/drizzle";

type BalanceViewRow = typeof balanceView.$inferSelect;

type Settlement = {
  from: BalanceViewRow;
  to: BalanceViewRow;
  amount: number;
};

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const balances = await db.select().from(balanceView);

  // Clone the matched rows so mutating `netBalance` below does not
  // modify the original `balances` objects we return in the response.
  const debtors = balances
    .filter((balance) => balance.status === "debtor")
    .map((b) => ({ ...b }))
    .sort((a, b) => b.netBalance - a.netBalance);

  const creditors = balances
    .filter((balance) => balance.status === "creditor")
    .map((b) => ({ ...b }))
    .sort((a, b) => a.netBalance - b.netBalance);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    // Get remaining credit or debts
    const debtor = debtors[i];
    const creditor = creditors[j];
    // Get whichever the smaller
    // Get the amount that would be transacted
    const amount = Math.min(
      Math.abs(debtor.netBalance),
      Math.abs(creditor.netBalance)
    );

    // Record the transaction
    settlements.push({
      from: debtor,
      to: creditor,
      amount,
    });

    debtor.netBalance -= amount;
    creditor.netBalance += amount;

    // Make sure to recalculate whatever that remained and update
    // Increment the cursor to the next person on the one that was completed
    if (debtor.netBalance === 0) i += 1;
    if (creditor.netBalance === 0) j += 1;
  }

  return { balances, settlements };
});
