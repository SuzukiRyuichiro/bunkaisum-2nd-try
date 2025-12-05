import useDrizzle from "~~/server/utils/drizzle";

export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const groups = await db.query.groupsTable.findMany({
    with: {
      groupMembers: {
        with: {
          user: true,
        },
      },
    },
  });

  return groups;
});
