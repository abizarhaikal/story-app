import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/story-app/",
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW", // Sementara gunakan generateSW
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "story-api",
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      includeAssets: ["favicon.png", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "StoryApp",
        short_name: "StoryApp",
        description: "Aplikasi berbagi cerita dan lokasi",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/iconku2-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/home-desktop.png",
            sizes: "2560x1440",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/screenshots/home-mobile2.png",
            sizes: "960x1600",
            type: "image/png",
            // tidak perlu form_factor wide untuk mobile
          },
        ],
      },
    }),
  ],
});
