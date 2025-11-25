export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, fetch } = useUserSession();

  // Wait for the session to be fetched before checking
  await fetch();

  if (!loggedIn.value) {
    return navigateTo("/login");
  }
});
