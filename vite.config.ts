import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync } from "fs";
import { defineConfig } from "vite";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().split("T")[0]),
  },
  // Strip console.* and debugger from production bundles. Keeps logging
  // available in dev (vite dev server) while preventing internal state,
  // API paths, and verdict objects from leaking to visitor DevTools.
  esbuild:
    mode === "production"
      ? { drop: ["console", "debugger"] }
      : undefined,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
}));
