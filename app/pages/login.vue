<template>
  <div class="h-screen grid place-items-center">
    <div v-if="loggedIn" class="grid gap-2">
      <UButton class="justify-center" @click="logout">Logout</UButton>
      <UButton class="justify-center" to="/">Go home</UButton>
    </div>
    <UButton
      v-else
      icon="i-simple-icons-line"
      size="md"
      class="bg-[#06c755] hover:bg-[#04b54e]"
      variant="solid"
      @click="handleLogin"
      >LINEでログイン</UButton
    >
  </div>
</template>

<script setup lang="ts">
const { loggedIn, logout } = useAuth();
const config = useRuntimeConfig();

const lineLoginUrl = computed(() => {
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const base = config.public.apiBase || "";
  const isTauriOrigin = window.location.origin.startsWith("tauri://") || window.location.origin.startsWith("http://tauri.localhost") || window.location.origin.startsWith("app://");
  const tauriParam = isTauriOrigin ? "&tauri=1" : "";
  return `${base}/api/auth/line?state=${state}${tauriParam}`;
});

const handleLogin = () => {
  // Force full page navigation (not client-side routing)
  navigateTo(lineLoginUrl.value, { external: true });
};
</script>
