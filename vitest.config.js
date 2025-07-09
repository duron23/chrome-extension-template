/// <reference types="vitest" />
const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
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
        "src/manifest/**"
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage"
    }
  },
});
