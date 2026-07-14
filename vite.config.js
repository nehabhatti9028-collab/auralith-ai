import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000", // localhost ki jagah 127.0.0.1 kiya hai
        changeOrigin: true,
        secure: false,
      },
    },
  },
});