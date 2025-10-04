import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "screenshot-desktop.png",
        "screenshot-mobile.png",
      ],
      manifest: {
        name: "Image Comparator",
        short_name: "ImgComp",
        description:
          "Compara dos imágenes y visualiza las diferencias y similitudes.",
        theme_color: "#111827",
        background_color: "#ffffff",
        lang: "es",
        scope: "/image-comparator/",
        start_url: "/image-comparator/",
        display: "standalone",
        id: "/image-comparator/",
        orientation: "any",
        categories: ["utilities", "photo", "graphics"],
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [
          {
            src: "screenshot-desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Vista de escritorio de la aplicación",
          },
          {
            src: "screenshot-mobile.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "narrow",
            label: "Vista móvil de la aplicación",
          },
        ],
      },
    }),
  ],
  base: "https://Auren-Noct.github.io/image-comparator",
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
