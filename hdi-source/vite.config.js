import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/nws": {
        target: "https://api.weather.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nws/, ""),
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "HawaiiDisasterIntelligence/0.1 (https://github.com/TimothyT101/haic_mimir)",
        },
      },
    },
  },
});
