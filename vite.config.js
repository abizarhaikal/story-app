import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

const isProd = process.env.NODE_ENV === "production";
const base = isProd ? "/story-app/" : "/";

export default defineConfig({
  base,
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
      strategies: "injectManifest",
      srcDir: "src", // <--- folder custom sw.js kamu
      filename: "sw.js", // <--- nama file custom sw.js kamu
      includeAssets: [
        "favicon.png",
        "robots.txt",
        "apple-touch-icon.png",
        "icons/icon-192x192.png",
        "icons/iconku2-512x512.png",
        "screenshots/home-desktop.png",
        "screenshots/home-mobile2.png",
      ],
      manifest: {
        name: "StoryApp",
        short_name: "StoryApp",
        description: "Aplikasi berbagi cerita dan lokasi",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          {
            src: `${base}icons/icon-192x192.png`,
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: `${base}icons/iconku2-512x512.png`,
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: `${base}screenshots/home-desktop.png`,
            sizes: "2560x1440",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: `${base}screenshots/home-mobile2.png`,
            sizes: "960x1600",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});