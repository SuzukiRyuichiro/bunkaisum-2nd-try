import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const groups = await db.query.groupsTable.findMany({
    with: {
      groupMembers: {
        columns: {},
        with: {
          user: true,
        },
      },
    },
  });

  return groups.map((group) => {
    return {
      ...group,
      groupMembers: group.groupMembers.map(({ user }) => user),
      membersCount: group.groupMembers.length,
    };
  });
});
