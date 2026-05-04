export default defineNuxtRouteMiddleware(async (to) => {
  console.log("middleware called");
  const publicRoutes = ["/login", "/about", "/auth/callback"];

  if (publicRoutes.includes(to.path)) {
    return;
  }

  const { user, initAuth } = useAuth();
  const nuxtApp = useNuxtApp();

  // If we are on the server, or the client is still hydrating after a server render,
  // we skip the redirect. This gives the client time to run initAuth() and
  // restore the state from localStorage.
  if (
    import.meta.server ||
    (import.meta.client &&
      nuxtApp.isHydrating &&
      nuxtApp.payload.serverRendered)
  ) {
    console.log("i am in the middleware");
    return;
  }

  // Try to initialize auth from localStorage on the client
  if (import.meta.client && !user.value) {
    await initAuth();
  }

  if (!user.value) {
    return navigateTo("/login");
  }
});
