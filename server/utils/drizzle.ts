import * as schema from "../db/schema";
import { H3Event } from "h3";
import { drizzle } from "drizzle-orm/d1";

export default function useDrizzle(event: H3Event) {
  const { db } = event.context.cloudflare.env;
  return drizzle(db, { schema });
}

export type Fruit = typeof schema.fruitsTable.$inferSelect;
export type Expense = typeof schema.expensesTable.$inferSelect;
