import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

/**
 * Load the features configuration file with enhanced error handling
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

  // Load features configuration
  const features = loadFeaturesConfig();

  // Find all content script entry points - using loop to process all content.ts files
  const contentEntries = {};

  try {
    // Look for content.ts files in src/ and any subdirectories
    // Use forward slashes for glob pattern on Windows
    const searchPath = resolve(__dirname, "..", "src", "**/content.ts").replace(
      /\\/g,
      "/"
    );

    const contentFiles = glob.sync(searchPath);

    if (contentFiles.length === 0) {
      console.warn("⚠️  No content.ts files found in src/ directory");
    } else {
      console.log(`📋 Found ${contentFiles.length} content script(s)`);
    }

    contentFiles.forEach((file) => {
      try {
        // Verify file exists and is readable
        if (!fs.existsSync(file)) {
          console.warn(`⚠️  Content script file not found: ${file}`);
          return;
        }

        const stats = fs.statSync(file);
        if (!stats.isFile()) {
          console.warn(`⚠️  Content script path is not a file: ${file}`);
          return;
        }

        // Create a unique name for each entry based on its path
        const relPath = file
          .replace(resolve(__dirname, "..") + "\\", "")
          .replace(/\\/g, "/");
        const entryName = relPath.replace(/\.ts$/, "").replace(/^src\//, "");

        // Validate entry name
        if (!entryName || entryName.includes("..")) {
          console.warn(
            `⚠️  Invalid entry name generated for ${file}: ${entryName}`
          );
          return;
        }

        contentEntries[entryName] = file;
      } catch (fileError) {
        console.error(
          `❌ Error processing content script ${file}: ${fileError.message}`
        );
      }
    });
  } catch (globError) {
    console.error(
      `❌ Error searching for content scripts: ${globError.message}`
    );
    console.log("📋 Continuing with empty content entries");
  }

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
