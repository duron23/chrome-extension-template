import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import fs from "fs";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";

// Get __dirname equivalent in ESM
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Cache the features config to avoid race conditions
let cachedFeaturesConfig = null;
let loadingPromise = null; // Prevent concurrent loading

/**
 * Plugin to clean the environment-specific directory before building
 */
const cleanEnvDirPlugin = (envDir) => {
  return {
    name: "clean-env-dir",
    buildStart() {
      if (fs.existsSync(envDir)) {
        console.log(`🧹 Cleaning ${envDir} to remove stale files...`);
        fs.rmSync(envDir, { recursive: true, force: true });
      }
    },
  };
};

/**
 * Plugin to inline CSS into JS bundles for Chrome extensions
 */
const inlineCSSPlugin = () => {
  return {
    name: "inline-css",
    enforce: "post",
    generateBundle(options, bundle) {
      // Find CSS files
      const cssFiles = Object.keys(bundle).filter((fileName) =>
        fileName.endsWith(".css")
      );

      if (cssFiles.length === 0) return;

      // Get CSS content
      const cssContent = cssFiles
        .map((fileName) => {
          const cssAsset = bundle[fileName];
          return cssAsset.source || cssAsset.code;
        })
        .join("\n");

      // Create CSS injection code
      const cssInjectionCode = `
// Inject CSS into document head
const style = document.createElement('style');
style.textContent = \`${cssContent
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$")}\`;
document.head.appendChild(style);
`;

      // Inject CSS into each JS bundle (except offscreen)
      Object.keys(bundle).forEach((fileName) => {
        if (
          fileName.endsWith(".bundle.js") &&
          !fileName.includes("offscreen")
        ) {
          const jsAsset = bundle[fileName];
          if (jsAsset.code) {
            jsAsset.code = cssInjectionCode + jsAsset.code;
          }
        }
      });

      // Remove CSS files from bundle since they're now inlined
      cssFiles.forEach((fileName) => {
        delete bundle[fileName];
      });
    },
  };
};

/**
 * Load the features configuration file with enhanced error handling and race condition protection
 */
const loadFeaturesConfig = () => {
  // Return cached result if available
  if (cachedFeaturesConfig !== null) {
    return cachedFeaturesConfig;
  }

  // If already loading, return default config to prevent blocking
  if (loadingPromise !== null) {
    return {
      features: {
        popup: { enabled: true },
        options: { enabled: true },
        sidepanel: { enabled: true },
        offscreen: { enabled: true },
        contentScripts: { enabled: true },
      },
    };
  }

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
      const featuresContent = fs.readFileSync(featuresPath, "utf8");

      // Validate JSON content before parsing
      if (!featuresContent.trim()) {
        console.warn("⚠️  features.json is empty, using defaults");
        cachedFeaturesConfig = defaultConfig;
        return cachedFeaturesConfig;
      }

      const parsedConfig = JSON.parse(featuresContent);

      // Validate config structure
      if (!parsedConfig || typeof parsedConfig !== "object") {
        console.warn("⚠️  Invalid features.json structure, using defaults");
        cachedFeaturesConfig = defaultConfig;
        return cachedFeaturesConfig;
      }

      // Ensure features object exists
      if (!parsedConfig.features || typeof parsedConfig.features !== "object") {
        console.warn(
          "⚠️  Missing or invalid features object in features.json, using defaults"
        );
        cachedFeaturesConfig = defaultConfig;
        return cachedFeaturesConfig;
      }

      cachedFeaturesConfig = parsedConfig;
    } else {
      console.log("⚠️  features.json not found, using defaults");
      cachedFeaturesConfig = defaultConfig;
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
    cachedFeaturesConfig = defaultConfig;
  }

  return cachedFeaturesConfig;
};

const createHtmlPlugin = (features, outputPath) => {
  return {
    name: "create-html",
    generateBundle() {
      try {
        const templatePath = resolve(__dirname, "..", "src", "template.html");

        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template file not found at ${templatePath}`);
        }

        const htmlTemplate = fs.readFileSync(templatePath, "utf8");

        if (!htmlTemplate.trim()) {
          throw new Error("Template file is empty");
        }

        const uiComponents = [
          { name: "popup", enabled: features.features?.popup?.enabled },
          { name: "options", enabled: features.features?.options?.enabled },
          { name: "sidepanel", enabled: features.features?.sidepanel?.enabled },
          { name: "offscreen", enabled: features.features?.offscreen?.enabled },
        ];

        uiComponents.forEach(({ name, enabled }) => {
          if (enabled) {
            try {
              let html;

              // Use custom HTML for offscreen document
              if (name === "offscreen") {
                const offscreenPath = resolve(
                  __dirname,
                  "..",
                  "src",
                  "offscreen",
                  "offscreen.html"
                );

                if (!fs.existsSync(offscreenPath)) {
                  console.warn(
                    `⚠️  Offscreen HTML template not found at ${offscreenPath}, skipping`
                  );
                  return;
                }

                html = fs.readFileSync(offscreenPath, "utf8");

                if (!html.trim()) {
                  console.warn(
                    `⚠️  Offscreen HTML template is empty, skipping`
                  );
                  return;
                }
              } else {
                // Use template for UI components
                html = htmlTemplate.replace(
                  "<%= htmlWebpackPlugin.options.title %>",
                  name
                );
                html = html.replace(
                  "</head>",
                  `  <script type="module" src="./${name}.bundle.js"></script>\n</head>`
                );
              }

              const dir = resolve(outputPath, name);

              // Ensure directory exists with proper error handling
              try {
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }
              } catch (dirError) {
                if (dirError.code === "EACCES") {
                  throw new Error(
                    `Permission denied creating directory ${dir}`
                  );
                } else if (dirError.code === "ENOSPC") {
                  throw new Error(
                    `No space left on device when creating directory ${dir}`
                  );
                } else {
                  throw new Error(
                    `Failed to create directory ${dir}: ${dirError.message}`
                  );
                }
              }

              const htmlPath = resolve(dir, `${name}.html`);

              try {
                fs.writeFileSync(htmlPath, html, "utf8");
              } catch (writeError) {
                if (writeError.code === "EACCES") {
                  throw new Error(`Permission denied writing ${htmlPath}`);
                } else if (writeError.code === "ENOSPC") {
                  throw new Error(
                    `No space left on device when writing ${htmlPath}`
                  );
                } else {
                  throw new Error(
                    `Failed to write ${htmlPath}: ${writeError.message}`
                  );
                }
              }
            } catch (componentError) {
              console.error(
                `❌ Error processing ${name} component:`,
                componentError.message
              );
              // Continue with other components instead of failing the entire build
            }
          }
        });
      } catch (error) {
        console.error("❌ Critical error in createHtmlPlugin:", error.message);
        throw error; // Re-throw critical errors that should fail the build
      }
    },
  };
};

/**
 * Main UI Vite configuration for Chrome extension components
 */
export default defineConfig(({ mode }) => {
  const isDev = mode === "development" || mode === "uat";
  const isProd = mode === "production";
  const isWatch = mode === "watch";

  // Map mode to extension build
  const modeToExtensionBuild = {
    development: "dev",
    uat: "uat",
    production: "prod",
    watch: "dev", // Watch mode uses dev build
  };

  const extensionBuild =
    process.env.EXTENSION_BUILD || modeToExtensionBuild[mode] || "dev";

  // Load features configuration
  const features = loadFeaturesConfig();

  // Get parent folder name for extension naming
  const getParentFolderName = () => {
    return resolve(__dirname, "..").split(/[/\\]/).pop();
  };

  // Base paths for build output
  const basePath = resolve(__dirname, "..", "dist", extensionBuild);
  const extensionName = getParentFolderName();
  const outputPath = resolve(basePath, `${extensionName}-${extensionBuild}`);

  console.log(
    `📦 Building extension with features: ${Object.entries(
      features.features || {}
    )
      .filter(([, config]) => config.enabled)
      .map(([name]) => name)
      .join(", ")}`
  );

  // Dynamically build entry points based on enabled features
  const uiEntries = {};

  if (features.features?.popup?.enabled === true) {
    uiEntries["popup/popup"] = resolve(
      __dirname,
      "..",
      "./src/popup/index.tsx"
    );
  }

  if (features.features?.options?.enabled === true) {
    uiEntries["options/options"] = resolve(
      __dirname,
      "..",
      "./src/options/index.tsx"
    );
  }

  if (features.features?.sidepanel?.enabled === true) {
    uiEntries["sidepanel/sidepanel"] = resolve(
      __dirname,
      "..",
      "./src/sidepanel/index.tsx"
    );
  }

  if (features.features?.offscreen?.enabled === true) {
    uiEntries["offscreen/offscreen"] = resolve(
      __dirname,
      "..",
      "./src/offscreen/offscreen.ts"
    );
  }

  const config = {
    plugins: [
      react({
        // Use the modern automatic JSX runtime consistently across environments
        // to align with tsconfig (jsx: "react-jsx") and React 17+ guidelines.
        jsxRuntime: "automatic",
        // Ensure dev transform (jsxDEV) is only used in dev/uat. In prod we want jsx/jsxs.
        development: isDev,
        // Extra guard: pass through to Babel to prevent accidental dev JSX in prod
        babel: {
          plugins: [],
          caller: {
            name: "vite-plugin-react",
            supportsStaticESM: true,
            supportsTopLevelAwait: true,
            development: isDev,
          },
        },
      }),
      tailwindcss(), // Using the new Tailwind CSS v4 Vite plugin
      inlineCSSPlugin(),
      // Only clean environment directory in non-watch mode to prevent race conditions
      ...(isWatch ? [] : [cleanEnvDirPlugin(basePath)]),
      viteStaticCopy({
        targets: [
          {
            src: "src/manifest/manifest.json",
            dest: ".",
            rename: "manifest.json",
          },
          {
            src: "config/manifest.xml",
            dest: "../",
            rename: "manifest.xml",
          },
          // Conditionally copy src/root contents only if there are non-.gitkeep files
          ...(() => {
            const rootPath = resolve(__dirname, "..", "src", "root");
            try {
              if (fs.existsSync(rootPath)) {
                try {
                  const files = fs.readdirSync(rootPath, {
                    withFileTypes: true,
                  });
                  const hasNonGitkeepFiles = files.some(
                    (file) => file.name !== ".gitkeep"
                  );
                  if (hasNonGitkeepFiles) {
                    return [
                      {
                        src: ["src/root/*", "!src/root/.gitkeep"],
                        dest: ".",
                      },
                    ];
                  }
                } catch (readError) {
                  if (readError.code === "EACCES") {
                    console.warn(
                      "⚠️  Permission denied reading src/root directory"
                    );
                  } else if (readError.code === "ENOTDIR") {
                    console.warn("⚠️  src/root exists but is not a directory");
                  } else {
                    console.warn(
                      `⚠️  Error reading src/root directory: ${readError.message}`
                    );
                  }
                }
              }
            } catch (error) {
              console.warn(
                `⚠️  Could not check src/root directory: ${error.message}`
              );
            }
            return [];
          })(),
        ],
      }),
      createHtmlPlugin(features, outputPath),
      // Bundle analyzer (only when ANALYZE=true)
      ...(process.env.ANALYZE === "true"
        ? [
            visualizer({
              filename: resolve(outputPath, "stats.html"),
              open: true,
              brotliSize: true,
              gzipSize: true,
            }),
          ]
        : []),
    ],

    build: {
      outDir: outputPath,
      emptyOutDir: !isWatch, // Don't clean directory in watch mode to prevent race conditions
      sourcemap: isDev ? "inline" : false,
      minify: isProd ? "terser" : false,
      target: "es2024",
      cssCodeSplit: false,

      rollupOptions: {
        input: uiEntries,
        external: ["chrome"],
        output: {
          format: "es",
          entryFileNames: "[name].bundle.js",
          chunkFileNames: "chunks/chunk-[name]-[hash].js", // never starts with _
          assetFileNames: "assets/asset-[name]-[hash].[ext]", // never starts with _
        },
      },
    },

    // Ensure esbuild uses the correct JSX runtime per mode to avoid jsxDEV leaking into prod
    esbuild: {
      jsx: "automatic",
      jsxImportSource: "react",
      jsxDev: isDev,
    },

    // Remove PostCSS configuration since we're using the Vite plugin
    // css: {
    //   postcss: {
    //     plugins: [require("@tailwindcss/postcss")],
    //   },
    // },

    define: {
      "process.env.NODE_ENV": JSON.stringify(
        isProd ? "production" : "development"
      ),
      "process.env.EXTENSION_BUILD": JSON.stringify(extensionBuild),
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

    server: {
      open: false,
      port: 3000,
    },

    optimizeDeps: {
      include: ["react", "react-dom"],
    },
  };

  return config;
});
