import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "src",
  base: "./",
  publicDir: path.resolve(__dirname, "public"),
  css: {
    devSourcemap: true,
  },
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    emptyOutDir: true,
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
