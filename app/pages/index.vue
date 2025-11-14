<template>
  <div>
    <p class="font-semibold">yo</p>
    <UAlert title="Heads up!" />

    <div v-if="loggedIn">
      <h1>Welcome {{ user?.name }}!</h1>
      <h1>{{ user }}</h1>
      <UAvatar :src="user?.pictureUrl" size="xl" />

      <p>Logged in since {{ session?.loggedInAt }}</p>
      <UButton @click="clear">Logout</UButton>
    </div>
    <div v-else>
      <h1>Not logged in</h1>
      <UButton
        v-if="!loggedIn"
        :to="lineLoginUrl"
        icon="i-simple-icons-line"
        label="Login with line"
        color="neutral"
        size="xs"
        external
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, user, session, clear } = useUserSession();

const lineLoginUrl = computed(() => {
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return `/api/auth/line?state=${state}`;
});
</script>
