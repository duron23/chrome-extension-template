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
 * Load the features configuration file
 */
const loadFeaturesConfig = () => {
  if (cachedFeaturesConfig !== null) {
    return cachedFeaturesConfig;
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
      cachedFeaturesConfig = JSON.parse(featuresContent);
    } else {
      console.log("⚠️  features.json not found, using defaults");
      cachedFeaturesConfig = defaultConfig;
    }
  } catch (error) {
    console.error("❌ Error loading features.json:", error);
    cachedFeaturesConfig = defaultConfig;
  }

  return cachedFeaturesConfig;
};

const createHtmlPlugin = (features, outputPath) => {
  return {
    name: "create-html",
    generateBundle() {
      const htmlTemplate = fs.readFileSync(
        resolve(__dirname, "..", "src", "template.html"),
        "utf8"
      );

      const uiComponents = [
        { name: "popup", enabled: features.features?.popup?.enabled },
        { name: "options", enabled: features.features?.options?.enabled },
        { name: "sidepanel", enabled: features.features?.sidepanel?.enabled },
        { name: "offscreen", enabled: features.features?.offscreen?.enabled },
      ];

      uiComponents.forEach(({ name, enabled }) => {
        if (enabled) {
          let html;

          // Use custom HTML for offscreen document
          if (name === "offscreen") {
            html = fs.readFileSync(
              resolve(__dirname, "..", "src", "offscreen", "offscreen.html"),
              "utf8"
            );
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
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(resolve(dir, `${name}.html`), html);
        }
      });
    },
  };
};

/**
 * Main UI Vite configuration for Chrome extension components
 */
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

  // Load features configuration
  const features = loadFeaturesConfig();

  // Base paths for build output
  const basePath = resolve(__dirname, "..", "dist", extensionBuild);
  const extensionName = "chrome-extension-template";
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
        // WORKAROUND: React 19 with @vitejs/plugin-react@4.6.0 has an issue where
        // the automatic JSX runtime exports jsxDEV in production builds, causing
        // "jsxDEV is not a function" errors. Using classic runtime in production
        // as a temporary fix until the plugin is updated to properly handle React 19.
        jsxRuntime: isProd ? "classic" : "automatic",
        development: isDev,
      }),
      tailwindcss(), // Using the new Tailwind CSS v4 Vite plugin
      inlineCSSPlugin(),
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
          {
            src: "src/root/worker.js",
            dest: ".",
            rename: "worker.js",
          },
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
      emptyOutDir: false,
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
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
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
