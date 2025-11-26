import type { H3Event } from "h3";
import useDrizzle from "./drizzle";
import { oAuthAccountsTable, usersTable } from "../db/schema";

type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
};

export const findOrCreateUserFromOAuth = async ({
  event,
  profile,
  provider,
}: {
  event: H3Event;
  profile: LineProfile;
  provider: "line"; // will add more later
}) => {
  const db = useDrizzle(event);
  // Step 1: check if the user exists, if so, return that

  try {
    const existingOAuthAccount = await db.query.oAuthAccountsTable.findFirst({
      where: (table, { eq, and }) =>
        and(
          eq(oAuthAccountsTable.providerUserId, profile.userId),
          eq(oAuthAccountsTable.provider, provider)
        ),
      with: {
        user: true,
      },
    });

    if (existingOAuthAccount) {
      return existingOAuthAccount.user;
    }

    // Step 2: create the oauth record
    const [user] = await db
      .insert(usersTable)
      .values({
        displayName: profile.displayName,
        profilePictureUrl: profile.pictureUrl,
      })
      .returning();

    await db.insert(oAuthAccountsTable).values({
      provider,
      providerUserId: profile.userId,
      userId: user.id,
    });

    return user;
  } catch (error) {
    console.error(error);
  }
};
