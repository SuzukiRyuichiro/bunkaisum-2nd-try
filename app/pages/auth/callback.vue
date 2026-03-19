<script setup lang="ts">
const route = useRoute();
const { setTokens, fetchUser } = useAuth();

onMounted(async () => {
  const accessToken = route.query.accessToken as string;
  const refreshToken = route.query.refreshToken as string;

  if (accessToken && refreshToken) {
    setTokens(accessToken, refreshToken);
    await fetchUser();
    navigateTo("/");
  } else {
    console.error("Missing tokens in callback URL");
    navigateTo("/login");
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4" />
      <p>Logging you in...</p>
    </div>
  </div>
</template>
