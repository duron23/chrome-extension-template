import { defineConfig } from "vite";
import { resolve } from "path";

// Main Vite configuration for the project
export default defineConfig({
  root: resolve("./"),

  // Base configuration shared across all builds
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    alias: {
      "@": resolve("src"),
      "@/components": resolve("src/components"),
      "@/utils": resolve("src/utils"),
      "@/styles": resolve("src/style"),
    },
  },

  // Test configuration using Vitest
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
    coverage: {
      include: ["src/**/*"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/index.html",
        "src/static/**",
        "src/**/index.tsx",
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

  // Define environment variables
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
    "process.env.EXTENSION_BUILD": JSON.stringify(
      process.env.EXTENSION_BUILD || "dev"
    ),
    "process.env.EXTENSION_ENV": JSON.stringify("test"),
  },

  // Server config for development
  server: {
    open: false,
    port: 3000,
  },

  // Optimization
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
