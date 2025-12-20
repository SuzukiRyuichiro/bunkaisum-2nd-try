<template>
  <div class="h-screen grid place-items-center">
    <AuthState v-slot="{ loggedIn, clear }">
      <div v-if="loggedIn">
        <UButton @click="clear">Logout</UButton>
        <UButton to="/">Go home</UButton>
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
    </AuthState>
  </div>
</template>

<script setup lang="ts">
const lineLoginUrl = computed(() => {
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return `/api/auth/line?state=${state}`;
});

const handleLogin = () => {
  // Force full page navigation (not client-side routing)
  navigateTo(lineLoginUrl.value, { external: true });
};
</script>
