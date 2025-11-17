import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const users = await db.query.usersTable.findMany({});
  return users;
});
