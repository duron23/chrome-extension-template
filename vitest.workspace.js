import { defineWorkspace } from "vitest/config";

// Vitest workspace configuration for Chrome extension
// This resolves the "multiple projects" warning by explicitly defining projects
export default defineWorkspace([
  // Main test suite - uses the primary vitest configuration
  {
    extends: "./vitest.config.js",
    test: {
      name: "unit-tests",
      include: ["tests/unit/**/*.{test,spec}.{js,ts,tsx}"],
      environment: "jsdom",
    },
  },

  // E2E tests could be added as a separate project
  {
    extends: "./vitest.config.js",
    test: {
      name: "e2e-tests",
      include: ["tests/e2e/**/*.{test,spec}.{js,ts}"],
      environment: "node",
      testTimeout: 60000, // E2E tests typically need more time
    },
  },
]);
