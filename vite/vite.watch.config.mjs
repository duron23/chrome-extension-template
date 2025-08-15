import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config.mjs";

export default defineConfig((env) => {
  const config = baseConfig({ ...env, mode: "watch" });

  // Watch-specific overrides
  const watchConfig = {
    mode: "development",
    build: {
      sourcemap: "inline",
      minify: false,
      watch: {}, // Enable watch mode
    },
  };

  return mergeConfig(config, watchConfig);
});
