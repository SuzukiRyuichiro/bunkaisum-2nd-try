import { groupsTable } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const id = getRouterParam(event, "id");
  if (!id) return null;

  const group = await db.query.groupsTable.findFirst({
    where: (_, { eq }) => eq(groupsTable.id, parseInt(id)),
    with: {
      groupMembers: {
        columns: {},
        with: {
          user: true,
        },
      },
    },
  });

  if (!group) throw new Error("Not found");

  return {
    ...group,
    groupMembers: group.groupMembers.map(({ user }) => user),
    membersCount: group.groupMembers.length,
  };
});
