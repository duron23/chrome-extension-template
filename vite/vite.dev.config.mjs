import { defineConfig } from "vite";
import baseConfig from "./vite.config.mjs";

export default defineConfig((env) => {
  return {
    ...baseConfig({ ...env, mode: "development" }),
    mode: "development",
  };
});
