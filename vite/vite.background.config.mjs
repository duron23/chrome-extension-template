import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

/**
 * Load the features configuration file with enhanced error handling
 */
const loadFeaturesConfig = () => {
  const featuresPath = resolve(__dirname, "..", "config", "features.json");

  const defaultConfig = {
    features: {
      popup: { enabled: true },
      options: { enabled: true },
      sidepanel: { enabled: true },
      offscreen: { enabled: true },
      contentScripts: { enabled: true },
    },
  };

  try {
    if (fs.existsSync(featuresPath)) {
      const configData = fs.readFileSync(featuresPath, "utf8");

      if (!configData.trim()) {
        console.warn("⚠️  features.json is empty, using default configuration");
        return defaultConfig;
      }

      const parsedConfig = JSON.parse(configData);

      if (
        !parsedConfig?.features ||
        typeof parsedConfig.features !== "object"
      ) {
        console.warn(
          "⚠️  Invalid features structure in features.json, using default configuration"
        );
        return defaultConfig;
      }

      return parsedConfig;
    } else {
      console.log("ℹ️  features.json not found, using default configuration");
      return defaultConfig;
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        `❌ Invalid JSON syntax in features.json: ${error.message}`
      );
    } else if (error.code === "EACCES") {
      console.error(
        `❌ Permission denied reading features.json: ${error.message}`
      );
    } else if (error.code === "EMFILE" || error.code === "ENFILE") {
      console.error(
        `❌ Too many open files, unable to read features.json: ${error.message}`
      );
    } else {
      console.error(`❌ Error loading features.json: ${error.message}`);
    }
    console.log("📋 Using default configuration due to error");
    return defaultConfig;
  }
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

  console.log(
    "📦 Building background service worker with 1:1 transpilation (ESM)..."
  );

  return {
    build: {
      outDir: outputPath,
      emptyOutDir: false, // Don't clear the directory as main build runs first
      sourcemap: isDev ? "inline" : false,
      minify: isProd ? "terser" : false,
      target: "es2024",

      lib: {
        entry: resolve(__dirname, "..", "./src/background/background.ts"),
        name: "background",
        fileName: () => "background.bundle.js",
        formats: ["es"],
      },

      rollupOptions: {
        external: ["chrome"],
        output: {
          preserveModules: true, // 1:1 transpilation as per rules
          preserveModulesRoot: "src", // Use src as root to prevent _virtual paths
          chunkFileNames: "chunks/chunk-[name]-[hash].js", // never starts with _
          assetFileNames: "assets/asset-[name]-[hash].[ext]", // never starts with _
          entryFileNames: (chunkInfo) => {
            // Handle virtual modules specifically
            if (chunkInfo.name.startsWith("_virtual/")) {
              return `virtual/${chunkInfo.name.replace("_virtual/", "")}.js`;
            }
            // Keep original filename for background entry
            if (chunkInfo.name === "background") {
              return "background.bundle.js";
            }
            // Use original filename for other modules
            return "[name].js";
          },
        },
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
