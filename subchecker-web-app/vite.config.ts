import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/health": {
        target: "http://localhost:3000", // TODO Wenn das Backend auf dem PI läuft dann target: "http://192.168.0.9:3000",
        changeOrigin: true,
      },
    },
  },
})