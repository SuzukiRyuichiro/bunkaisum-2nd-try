import { groupMembersTable, groupsTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);

  const { name, emoji, userIds } = await readBody(event);
  const { user } = await requireUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "You must be logged in to create a group",
    });
  }

  const [newGroup] = await db
    .insert(groupsTable)
    .values({ name, emoji })
    .returning();

  const newGroupMembers = await db
    .insert(groupMembersTable)
    .values(userIds.map((userId) => ({ userId, groupId: newGroup.id })))
    .returning();

  if (newGroup.id && newGroupMembers.length >= 2) {
    return {
      success: true,
      newGroup,
    };
  }

  return {
    success: false,
  };
});
