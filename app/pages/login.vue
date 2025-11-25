<template>
  <AuthState v-slot="{ loggedIn, clear }">
    <UButton v-if="loggedIn" @click="clear">Logout</UButton>
    <UButton
      v-else
      icon="i-simple-icons-line"
      size="md"
      color="primary"
      variant="solid"
      @click="handleLogin"
      >LINEでログイン</UButton
    >
  </AuthState>
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
