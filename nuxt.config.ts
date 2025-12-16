// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: [
    "nitro-cloudflare-dev",
    "@nuxt/ui",
    "@nuxt/icon",
    "nuxt-auth-utils",
    "@vite-pwa/nuxt",
  ],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      enableEmojiSuggestions: true,
    },
  },
  nitro: {
    preset: "cloudflare-module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  ui: {
    colorMode: false,
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Bunkaisum - シェアハウスの割り勘",
      short_name: "Bunkaisum",
      description: "シェアハウスの支出を簡単に割り勘できるアプリ",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      id: "/",
      icons: [
        {
          src: "/android/android-launchericon-192-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/android/android-launchericon-512-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
      screenshots: [
        {
          src: "/screenshots/groups.png",
          sizes: "846x808",
          type: "image/png",
          form_factor: "wide",
          label: "Groups page",
        },
        {
          src: "/screenshots/expenses.png",
          sizes: "846x1598",
          type: "image/png",
          form_factor: "narrow",
          label: "Groups page",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: "/",
      type: "module",
    },
  },
});
