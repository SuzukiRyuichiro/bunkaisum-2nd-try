export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ["/login", "/about", "/auth/callback"];

  if (publicRoutes.includes(to.path)) {
    return;
  }

  const { user, initAuth } = useAuth();
  
  // Try to initialize auth from localStorage on the client
  if (import.meta.client && !user.value) {
    await initAuth();
  }

  if (!user.value) {
    return navigateTo("/login");
  }
});
