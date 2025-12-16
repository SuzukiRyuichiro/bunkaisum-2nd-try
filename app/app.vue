<template>
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

useHead({
  link: [
    {
      rel: "manifest",
      href: "/manifest.webmanifest",
    },
  ],
  meta: [
    {
      name: "theme-color",
      content: "#ffffff",
    },
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "default",
    },
  ],
});
</script>
