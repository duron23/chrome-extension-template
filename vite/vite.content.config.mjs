import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

/**
 * Load the features configuration file
 */
const loadFeaturesConfig = () => {
  const featuresPath = resolve(__dirname, "..", "config", "features.json");

  const defaultConfig = {
    features: {
      contentScripts: { enabled: true },
    },
  };

  try {
    if (fs.existsSync(featuresPath)) {
      const configData = fs.readFileSync(featuresPath, "utf8");
      const parsedConfig = JSON.parse(configData);

      if (parsedConfig?.features && typeof parsedConfig.features === "object") {
        return parsedConfig;
      }
    }
  } catch (error) {
    console.error(
      `Error loading features.json: ${error}, using default configuration`
    );
  }

  return defaultConfig;
};

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const isProd = mode === "production";

  // Map mode to extension build
  const modeToExtensionBuild = {
    development: "dev",
    uat: "uat",
    production: "prod",
  };

  const extensionBuild =
    process.env.EXTENSION_BUILD || modeToExtensionBuild[mode] || "dev";

  // Get parent folder name for extension naming
  const getParentFolderName = () => {
    return resolve(__dirname, "..").split(/[/\\]/).pop();
  };

  const extensionName = getParentFolderName();
  const basePath = resolve(__dirname, "..", "dist", extensionBuild);
  const outputPath = resolve(basePath, `${extensionName}-${extensionBuild}`);

  // Load features configuration
  const features = loadFeaturesConfig();

  // Only build content scripts if enabled
  if (!features.features?.contentScripts?.enabled) {
    console.log("📦 Content scripts disabled, skipping...");
    return {
      build: { write: false },
    };
  }

  console.log("📦 Building content scripts with IIFE format...");

  return {
    build: {
      outDir: outputPath,
      emptyOutDir: false, // Don't clear the directory as main build runs first
      sourcemap: isDev ? "inline" : false,
      minify: isProd ? "terser" : false,
      target: "es2024",

      rollupOptions: {
        input: {
          "content/content": resolve(
            __dirname,
            "..",
            "./src/content/content.ts"
          ),
        },
        output: {
          entryFileNames: "[name].bundle.js",
          format: "iife",
          name: "ContentScript",
          globals: {
            chrome: "chrome",
          },
        },
        external: ["chrome"],
      },
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      alias: {
        "@": resolve(__dirname, "..", "src"),
        "@/components": resolve(__dirname, "..", "src/components"),
        "@/utils": resolve(__dirname, "..", "src/utils"),
        "@/styles": resolve(__dirname, "..", "src/style"),
      },
    },

    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.EXTENSION_BUILD": JSON.stringify(extensionBuild),
    },
  };
});
