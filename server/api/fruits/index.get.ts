import { fruitsTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  // Here I wanna use Drizzle
  const db = useDrizzle(event);
  const fruits = await db.query.fruitsTable.findMany();
  return { fruits };
});
