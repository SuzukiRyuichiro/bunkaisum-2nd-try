<template>
  <div>
    <p class="font-semibold">yo</p>
    <UAlert title="Heads up!" />

    <div v-if="loggedIn">
      <h1>Welcome {{ user.name }}!</h1>
      <p>Logged in since {{ session?.loggedInAt }}</p>
      <button @click="clear">Logout</button>
    </div>
    <div v-else>
      <h1>Not logged in</h1>
      <UButton
        v-if="!loggedIn"
        to="/api/auth/facebook"
        icon="i-simple-icons-facebook"
        label="Login with Facebook"
        color="neutral"
        size="xs"
        external
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, user, session, clear } = useUserSession();
</script>
