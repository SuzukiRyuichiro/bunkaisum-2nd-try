import { groupMembersTable, usersTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const groupId = parseInt(getRouterParam(event, "groupId") || "");

  if (isNaN(groupId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group ID invalid",
    });
  }

  const usersAndGroupMembers = await db
    .select()
    .from(usersTable)
    .leftJoin(groupMembersTable, eq(groupMembersTable.userId, usersTable.id))
    .where(eq(groupMembersTable.groupId, groupId));

  const users = usersAndGroupMembers.map(({ users }) => users);

  return users;
});
