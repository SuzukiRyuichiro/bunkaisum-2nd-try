import { findOrCreateUserFromOAuth } from "~~/server/utils/auth";

export default defineOAuthLineEventHandler({
  async onSuccess(event, { user }) {
    // here, find or create user with OAuth
    const ourUser = await findOrCreateUserFromOAuth({
      event,
      profile: user,
      provider: "line",
    });

    await setUserSession(event, {
      user: ourUser,
    });

    return sendRedirect(event, "/");
  },
});
