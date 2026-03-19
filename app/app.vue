<template>
  <VitePwaManifest />
  <UApp :toaster="toaster">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import type { ToasterProps } from "@nuxt/ui";

const toaster: ToasterProps = { position: "bottom-right" };
const { initAuth } = useAuth();

// Initialize auth from localStorage on page load
if (import.meta.client) {
  initAuth();
}
</script>
