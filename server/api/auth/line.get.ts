export default defineOAuthLineEventHandler({
  onError(event) {
    console.log(event);
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, { user });
    // TODO: change the link later
    return sendRedirect(event, "/");
  },
});
