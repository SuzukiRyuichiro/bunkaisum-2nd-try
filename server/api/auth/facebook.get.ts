export default defineOAuthFacebookEventHandler({
  async onSuccess(event, { user }) {
    await setUserSession(event, { user });
    // TODO: change the link later
    return sendRedirect(event, "/about");
  },
});
