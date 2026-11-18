import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      workbox: {
        // photos are stored for offline use; videos (.mp4/.mov/.webm) are not, so the app stays light
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,webp,ico,svg,woff2}"],
        globIgnores: ["**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese,latin-ext}-*.woff2"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: "My 4 Day Fitness",
        short_name: "4DayFit",
        description: "Your gym and calisthenics programs, tracked set by set.",
        theme_color: "#0A0A0B",
        background_color: "#0A0A0B",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: { manualChunks: { firebase: ["firebase/app", "firebase/auth", "firebase/firestore"] } },
    },
  },
});
