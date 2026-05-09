export interface User {
  id: number;
  displayName: string;
  profilePictureUrl: string;
}

export const useAuth = () => {
  const user = useState<User | null>("user", () => null);
  const accessToken = useState<string | null>("accessToken", () => null);
  const refreshToken = useState<string | null>("refreshToken", () => null);

  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    if (import.meta.client) {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
    }
  };

  const clearTokens = () => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    if (import.meta.client) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const fetchUser = async () => {
    const token = accessToken.value || (import.meta.client ? localStorage.getItem("accessToken") : null);
    if (!token) return null;

    try {
      const data = await $fetch<User>("/api/users/me", {
        baseURL: useRuntimeConfig().public.apiBase,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      user.value = data;
      return data;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // If unauthorized, we might want to try refreshing the token here
      // but for now let's just clear
      if ((error as any).statusCode === 401) {
        clearTokens();
      }
      return null;
    }
  };

  const initAuth = async () => {
    if (import.meta.client) {
      const access = localStorage.getItem("accessToken");
      const refresh = localStorage.getItem("refreshToken");
      if (access && refresh) {
        accessToken.value = access;
        refreshToken.value = refresh;
        await fetchUser();
      }
    }
  };

  const logout = async () => {
    // Optional: call backend logout to revoke refresh token
    clearTokens();
    return navigateTo("/login");
  };

  return {
    user: readonly(user),
    accessToken: readonly(accessToken),
    setTokens,
    clearTokens,
    fetchUser,
    initAuth,
    logout,
    loggedIn: computed(() => !!user.value),
  };
};
