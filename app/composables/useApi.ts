import type { NitroFetchOptions } from "nitropack";

export const useApi = () => {
  const { accessToken, clearTokens } = useAuth();
  const config = useRuntimeConfig();

  /**
   * An authenticated wrapper around $fetch.
   * Best used for client-side actions like event listeners (@click, @submit).
   */
  const authFetch = async <T>(
    url: string,
    options: NitroFetchOptions<any> = {}
  ): Promise<T> => {
    const token =
      accessToken.value ||
      (import.meta.client ? localStorage.getItem("accessToken") : null);

    try {
      return await $fetch<T>(url, {
        ...options,
        headers: {
          ...options.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      } as any);
    } catch (error: any) {
      if (error.statusCode === 401) {
        clearTokens();
        navigateTo("/login");
      }
      throw error;
    }
  };

  return {
    authFetch,
  };
};

/**
 * A wrapper around Nuxt's useFetch that automatically adds the Authorization header.
 * Use this in components for reactive data fetching.
 */
export const useAuthFetch = <T>(
  url: string | (() => string),
  options: any = {}
) => {
  const { accessToken, logout } = useAuth();

  return useFetch<T>(url, {
    ...options,
    headers: computed(() => {
      const token =
        accessToken.value ||
        (import.meta.client ? localStorage.getItem("accessToken") : null);
      return {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
    }),
    onResponseError({ response }) {
      if (response.status === 401) {
        logout();
      }
    },
  });
};
