export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ["/login", "/about"];

  if (publicRoutes.includes(to.path)) {
    return;
  }

  const { loggedIn, fetch } = useUserSession();
  await fetch();

  if (!loggedIn.value) {
    return navigateTo("/login");
  }
});
