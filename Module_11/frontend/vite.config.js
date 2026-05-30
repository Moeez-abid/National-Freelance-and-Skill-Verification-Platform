import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// =============================================================
// Vite config — proxies /api/* calls to the backend on port 3011
// so the frontend (port 5011) avoids CORS issues in development.
// =============================================================
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5011,
    proxy: {
      "/api": {
        target: "http://localhost:3011",
        changeOrigin: true,
      },
    },
  },
});
