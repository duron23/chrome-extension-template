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
        console.warn("⚠️  features.json is empty, using defaults");
        return defaultConfig;
      }

      const parsedConfig = JSON.parse(configData);

      if (
        !parsedConfig?.features ||
        typeof parsedConfig.features !== "object"
      ) {
        console.warn(
          "⚠️  Missing or invalid features object in features.json, using defaults"
        );
        return defaultConfig;
      }

      return parsedConfig;
    } else {
      console.log("⚠️  features.json not found, using defaults");
      return defaultConfig;
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("❌ Invalid JSON syntax in features.json:", error.message);
    } else if (error.code === "EACCES") {
      console.error(
        "❌ Permission denied reading features.json:",
        error.message
      );
    } else if (error.code === "EMFILE" || error.code === "ENFILE") {
      console.error(
        "❌ Too many open files, unable to read features.json:",
        error.message
      );
    } else {
      console.error(
        "❌ Unexpected error loading features.json:",
        error.message
      );
    }
    console.log("📋 Using default configuration due to error");
    return defaultConfig;
  }
};

export default defineConfig(async ({ mode }) => {
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

  // Find all content script entry points - using loop to process all *.content.ts files
  const contentEntries = {};

  try {
    // Look for *.content.ts files and content.ts files in src/content and any subdirectories
    // Use forward slashes for glob pattern on Windows
    const searchPatterns = [
      resolve(__dirname, "..", "src", "content", "**/*.content.ts").replace(
        /\\/g,
        "/"
      ),
      resolve(__dirname, "..", "src", "content", "**/content.ts").replace(
        /\\/g,
        "/"
      ),
    ];

    let contentFiles = [];
    searchPatterns.forEach((pattern) => {
      const files = glob.sync(pattern);
      contentFiles = contentFiles.concat(files);
    });

    // Remove duplicates
    contentFiles = [...new Set(contentFiles)];

    if (contentFiles.length === 0) {
      console.warn(
        "⚠️  No *.content.ts or content.ts files found in src/content/ directory"
      );
    } else {
      console.log(
        `📋 Found ${contentFiles.length} content script(s) (*.content.ts and content.ts)`
      );
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
        // Remove base path and preserve the full filename including .content part
        const relPath = file
          .replace(resolve(__dirname, "..") + "\\", "")
          .replace(/\\/g, "/");

        // Remove src/content/ prefix and .ts suffix, keep .content part
        let entryName = relPath
          .replace(/^src\/content\//, "")
          .replace(/\.ts$/, "");

        // Special handling for standalone content.ts files to avoid nested directories
        if (entryName === "content") {
          entryName = "content-script"; // Rename to avoid collision with content folder
        }

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

  // Import Vite's build function to build each content script individually
  const { build } = await import("vite");

  // Track build results for proper error handling
  const buildResults = [];
  let hasErrors = false;

  // Build each content script one at a time to avoid race conditions and resource conflicts
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 1000;

  for (const [entryName, entryPath] of Object.entries(contentEntries)) {
    console.log(`🔨 Building content script: ${entryName}...`);

    let attempts = 0;
    let buildSuccess = false;

    while (attempts < MAX_RETRY_ATTEMPTS && !buildSuccess) {
      try {
        attempts++;

        // Verify entry file exists and is accessible before building
        if (!fs.existsSync(entryPath)) {
          throw new Error(`Entry file not found: ${entryPath}`);
        }

        // Check file accessibility
        try {
          await fs.promises.access(entryPath, fs.constants.R_OK);
        } catch (accessError) {
          throw new Error(
            `Cannot read entry file: ${entryPath} (${accessError.message})`
          );
        }

        // Add small delay between builds to prevent file system race conditions
        if (attempts > 1) {
          console.log(
            `⏳ Retry attempt ${attempts}/${MAX_RETRY_ATTEMPTS} for ${entryName}...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY_MS * attempts)
          );
        }

        const buildStartTime = Date.now();

        const buildResult = await build({
          mode,
          configFile: false, // Prevent config conflicts
          build: {
            outDir: outputPath,
            emptyOutDir: false,
            sourcemap: isDev ? true : false,
            minify: isProd ? "terser" : false,
            target: "es2024",
            rollupOptions: {
              input: entryPath,
              output: {
                entryFileNames: `content/${entryName}.bundle.js`,
                chunkFileNames: "content/chunks/chunk-[name]-[hash].js",
                assetFileNames: "content/assets/asset-[name]-[hash].[ext]",
                format: "iife",
                name: `ContentScript_${entryName.replace(
                  /[^a-zA-Z0-9]/g,
                  "_"
                )}`,
                globals: {
                  chrome: "chrome",
                },
              },
              external: ["chrome"],
              onwarn: (warning, warn) => {
                // Handle build warnings gracefully
                if (warning.code === "CIRCULAR_DEPENDENCY") {
                  console.warn(
                    `⚠️  Circular dependency in ${entryName}: ${warning.message}`
                  );
                } else {
                  warn(warning);
                }
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
          logLevel: "warn", // Reduce log noise during individual builds
        });

        const buildTime = Date.now() - buildStartTime;

        // Get comprehensive file information to match Vite's output format
        const outputFile = resolve(
          outputPath,
          "content",
          `${entryName}.bundle.js`
        );
        const mapFile = resolve(
          outputPath,
          "content",
          `${entryName}.bundle.js.map`
        );

        let fileSize = "unknown";
        let gzipSize = "unknown";
        let mapSize = "unknown";

        try {
          if (fs.existsSync(outputFile)) {
            const stats = fs.statSync(outputFile);
            const sizeInKB = (stats.size / 1024).toFixed(2);
            fileSize = `${sizeInKB} kB`;

            // Calculate gzip size if we can
            try {
              const { gzipSync } = await import("zlib");
              const fileContent = fs.readFileSync(outputFile);
              const compressed = gzipSync(fileContent);
              const gzipSizeInKB = (compressed.length / 1024).toFixed(2);
              gzipSize = `${gzipSizeInKB} kB`;
            } catch (gzipError) {
              // Gzip calculation failed, keep as "unknown"
            }
          }

          // Check for source map file
          if (isDev && fs.existsSync(mapFile)) {
            const mapStats = fs.statSync(mapFile);
            const mapSizeInKB = (mapStats.size / 1024).toFixed(2);
            mapSize = `${mapSizeInKB} kB`;
          }
        } catch (sizeError) {
          // Ignore size calculation errors
        }

        buildResults.push({
          entryName,
          success: true,
          result: buildResult,
          buildTime,
          fileSize,
          gzipSize,
          mapSize,
          outputFile,
        });

        // Output in Vite-consistent format with full path and colors
        const basePath = `dist/${extensionBuild}/${extensionName}-${extensionBuild}/`;
        const contentDir = "content/";
        const fileName = `${entryName}.bundle.js`;

        // Use ANSI color codes to match Vite's exact output formatting
        const dim = "\x1b[2m"; // Dim gray for base path, filename, and file sizes
        const brightCyan = "\x1b[94m"; // Bright blue for directory name (matching background script)
        const reset = "\x1b[0m"; // Reset color

        // Construct colored path: dim(base) + brightCyan(content/) + dim(filename)
        const coloredPath = `${dim}${basePath}${brightCyan}${contentDir}${dim}${fileName}${reset}`;
        const plainPath = basePath + contentDir + fileName;
        const padding = Math.max(0, 68 - plainPath.length);

        let outputLine = `${coloredPath}${" ".repeat(
          padding
        )} ${dim}${fileSize.padStart(7)}${reset}`;

        if (gzipSize !== "unknown") {
          outputLine += `${dim} │ gzip: ${gzipSize.padStart(7)}${reset}`;
        }

        if (isDev && mapSize !== "unknown") {
          outputLine += `${dim} │ map: ${mapSize.padStart(7)}${reset}`;
        }

        console.log(outputLine);
        buildSuccess = true;
      } catch (buildError) {
        const errorMessage = buildError.message || "Unknown build error";
        console.error(
          `❌ Build attempt ${attempts}/${MAX_RETRY_ATTEMPTS} failed for ${entryName}: ${errorMessage}`
        );

        // Check if this is a retryable error
        const isRetryable =
          buildError.code === "EBUSY" || // File busy
          buildError.code === "ENOENT" || // File not found (temporary)
          buildError.code === "EMFILE" || // Too many open files
          buildError.code === "ENFILE" || // File table overflow
          errorMessage.includes("lock") || // Lock file issues
          errorMessage.includes("timeout"); // Timeout issues

        if (attempts >= MAX_RETRY_ATTEMPTS || !isRetryable) {
          hasErrors = true;
          buildResults.push({ entryName, success: false, error: errorMessage });
          console.error(`❌ Final failure for ${entryName}: ${errorMessage}`);

          if (buildError.stack) {
            console.error(`📋 Stack trace for ${entryName}:`, buildError.stack);
          }
          break;
        }
      }
    }
  }

  // Report final build status with detailed information
  const successCount = buildResults.filter((r) => r.success).length;
  const failureCount = buildResults.filter((r) => !r.success).length;

  if (hasErrors) {
    console.error(`❌ Content script build completed with errors:`);
    console.error(`   ✅ Successful: ${successCount}`);
    console.error(`   ❌ Failed: ${failureCount}`);

    // List failed builds
    buildResults
      .filter((r) => !r.success)
      .forEach((result) => {
        console.error(`   - ${result.entryName}: ${result.error}`);
      });

    // Don't exit the process, let the main build continue
    throw new Error(
      `Content script build failed for ${failureCount} script(s)`
    );
  } else {
    // Show summary in exact Vite format with colors
    const totalTime = buildResults.reduce(
      (sum, result) => sum + (result.buildTime || 0),
      0
    );

    const totalTimeInSeconds = (totalTime / 1000).toFixed(2);

    // Use green color for the success message to match Vite
    const green = "\x1b[32m";
    const reset = "\x1b[0m";
    console.log(`${green}✓${reset} built in ${totalTimeInSeconds}s`);
  }

  // Return a build configuration that skips the main Vite build
  // since we've already built all our content scripts individually
  // We need to provide a dummy input to prevent Rollup errors
  const dummyEntryContent = 'console.log("Content scripts already built");';
  const dummyEntryPath = resolve(outputPath, ".temp-content-entry.js");

  try {
    fs.writeFileSync(dummyEntryPath, dummyEntryContent);
  } catch (writeError) {
    console.warn(`⚠️  Could not create temp entry file: ${writeError.message}`);
  }

  return {
    build: {
      rollupOptions: {
        input: dummyEntryPath, // Use dummy file as input
        output: {
          dir: resolve(outputPath, ".temp"), // Output to temp directory
          format: "es",
        },
        external: () => false, // Don't mark anything as external
      },
      write: false, // Don't write any files since we've already done that
      emptyOutDir: false, // Don't clear the directory
    },
  };
});
