import { eq } from "drizzle-orm";
import { usersTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const userId = (event.context.user as { userId: number })?.userId;
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const db = useDrizzle(event);
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return user;
});
