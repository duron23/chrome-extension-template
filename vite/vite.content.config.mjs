import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { glob } from "glob";

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

  // Find all content script entry points - using loop to process all content.ts files
  const contentEntries = {};
  // Look for content.ts files in src/ and any subdirectories
  // Use forward slashes for glob pattern on Windows
  const searchPath = resolve(__dirname, "..", "src", "**/content.ts").replace(
    /\\/g,
    "/"
  );

  const contentFiles = glob.sync(searchPath);

  contentFiles.forEach((file) => {
    // Create a unique name for each entry based on its path
    const relPath = file
      .replace(resolve(__dirname, "..") + "\\", "")
      .replace(/\\/g, "/");
    const entryName = relPath.replace(/\.ts$/, "").replace(/^src\//, "");
    contentEntries[entryName] = file;
  });

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
        input: contentEntries,
        output: {
          entryFileNames: "[name].bundle.js",
          chunkFileNames: "chunks/chunk-[name]-[hash].js", // never starts with _
          assetFileNames: "assets/asset-[name]-[hash].[ext]", // never starts with _
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
