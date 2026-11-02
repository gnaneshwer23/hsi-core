import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoSrc = path.resolve(rootDir, "../src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@hsi": repoSrc,
    },
  },
  server: {
    port: 5173,
    fs: {
      // Thin demos import substrate APIs from ../src
      allow: [rootDir, repoSrc],
    },
  },
  build: {
    outDir: "dist",
  },
});
