import { findOrCreateUserFromOAuth } from "~~/server/utils/auth";
import { generateAccessToken, generateRefreshToken } from "~~/server/utils/jwt";
import { refreshTokens } from "~~/server/db/schema";
import useDrizzle from "~~/server/utils/drizzle";

export default defineOAuthLineEventHandler({
  async onSuccess(event, { user }) {
    const ourUser = await findOrCreateUserFromOAuth({
      event,
      profile: user,
      provider: "line",
    });

    if (!ourUser) {
      console.log("hey we failed");
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create user",
      });
    }

    const db = useDrizzle(event);
    const accessToken = await generateAccessToken({ userId: ourUser.id });
    const refreshToken = await generateRefreshToken({ userId: ourUser.id });

    await db.insert(refreshTokens).values({
      userId: ourUser.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const query = getQuery(event);
    const isTauri = query.tauri === "1";
    const redirectBase = isTauri ? "tauri://localhost" : "";

    return sendRedirect(
      event,
      `${redirectBase}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  },
});
