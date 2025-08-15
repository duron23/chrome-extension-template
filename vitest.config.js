/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { resolve } from "path";

// Main Vitest configuration for Chrome extension
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000, // Chrome APIs can be slow
    include: ["tests/**/*.{test,spec}.{js,ts,tsx}"],
    coverage: {
      include: ["src/**/*"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/index.html",
        "src/static/**",
        "src/**/index.tsx", // Entry point files typically don't need coverage
        "src/**/*.config.{js,ts,mjs}",
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
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
  define: {
    // Mock Chrome extension environment variables for tests
    "process.env.NODE_ENV": JSON.stringify("test"),
    "process.env.EXTENSION_ENV": JSON.stringify("test"),
  },
});
