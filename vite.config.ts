import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "https://Auren-Noct.github.io/image-comparator",
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
