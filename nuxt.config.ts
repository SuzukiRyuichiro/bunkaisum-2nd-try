// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "nitro-cloudflare-dev",
    "@nuxt/ui",
    "@nuxt/icon",
    "nuxt-auth-utils",
  ],
  css: ["~/assets/css/main.css"],
  nitro: {
    preset: "cloudflare-module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
});