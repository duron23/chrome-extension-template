/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "tests/setup.ts",
    coverage: {
      include: ["src/**/*"],
      exclude: ["src/**/*.d.ts", "src/**/index.html", "src/static/**"],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
  resolve: {
    alias: {
      "@": resolve("src"),
      "@/components": resolve("src/components"),
      "@/utils": resolve("src/utils"),
      "@/styles": resolve("src/style"),
    },
  },
});
