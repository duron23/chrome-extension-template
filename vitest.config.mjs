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
    // Chrome extension specific test configuration
    testTimeout: 10000, // Chrome APIs can be slow
    clearMocks: true,
    restoreMocks: true,
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
