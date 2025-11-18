import * as schema from "~~/server/db/schema";
import { H3Event } from "h3";
import { drizzle } from "drizzle-orm/d1";

export default function useDrizzle(event: H3Event) {
  const { db } = event.context.cloudflare.env;
  return drizzle(db, { schema });
}

export type Expense = typeof schema.expensesTable.$inferSelect;
export type User = typeof schema.usersTable.$inferSelect;
export type ExpenseWithUser = Expense & { user: User };
export type OAuthAccounts = typeof schema.oAuthAccountsTable.$inferSelect;
