const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const dotenv = require("dotenv");
const fs = require("fs");
const { exec } = require("child_process");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

dotenv.config();

const getParentFolderName = () => {
  const parentDir = path.basename(path.resolve(__dirname, "."));
  return parentDir;
};

// Cache the features config to avoid race conditions and multiple file reads
let cachedFeaturesConfig = null;

/**
 * Load the features configuration file if it exists
 * @returns {Object} The features configuration
 */
const loadFeaturesConfig = () => {
  // Return cached config if already loaded to prevent race conditions
  if (cachedFeaturesConfig !== null) {
    return cachedFeaturesConfig;
  }

  const featuresPath = path.resolve(
    __dirname,
    "src",
    "manifest",
    "features.json"
  );

  // Default configuration
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
    // Check if file exists and is readable
    if (fs.existsSync(featuresPath)) {
      const stats = fs.statSync(featuresPath);
      if (stats.isFile()) {
        const configData = fs.readFileSync(featuresPath, "utf8");
        const parsedConfig = JSON.parse(configData);

        // Validate that the config has the expected structure
        if (
          parsedConfig &&
          parsedConfig.features &&
          typeof parsedConfig.features === "object"
        ) {
          cachedFeaturesConfig = parsedConfig;
          return cachedFeaturesConfig;
        } else {
          console.warn(
            "Invalid features.json structure, using default configuration"
          );
        }
      }
    }
  } catch (error) {
    console.error(
      `Error loading features.json: ${error.message}, using default configuration`
    );
  }

  // Cache and return default config
  cachedFeaturesConfig = defaultConfig;
  return cachedFeaturesConfig;
};

class AfterDonePlugin {
  constructor() {
    // Track running processes to prevent overlapping executions
    this.isRunning = false;
  }

  apply(compiler) {
    compiler.hooks.done.tap("AfterDonePlugin", (stats) => {
      // Prevent race conditions by checking if already running
      if (this.isRunning) {
        console.log("⏭️  Extension packaging already in progress, skipping...");
        return;
      }

      this.isRunning = true;

      // Capture environment variables at execution time to prevent race conditions
      const env = process.env.NODE_ENV || "dev";
      const extensionBuild = process.env.EXTENSION_BUILD || env;

      // Execute pack-extension.js with the correct environment variables
      const childEnv = {
        ...process.env,
        NODE_ENV: env,
        EXTENSION_BUILD: extensionBuild,
      };

      exec(
        `node pack-extension.js`,
        {
          env: childEnv,
          timeout: 30000, // 30 second timeout
          maxBuffer: 1024 * 1024, // 1MB buffer
        },
        (err, stdout, stderr) => {
          // Reset running flag regardless of outcome
          this.isRunning = false;

          if (err) {
            console.error(`❌ Extension packaging failed: ${err.message}`);
            if (stderr) {
              console.error(`📋 Details: ${stderr}`);
            }
          } else {
            const buildTime = stats.endTime - stats.startTime;
            console.log(`✅ Build completed successfully in ${buildTime}ms`);
            if (stdout && stdout.trim()) {
              // Only log packing output if it contains meaningful information
              const output = stdout.trim();
              if (!output.includes("injecting env") && output.length > 0) {
                console.log(`📦 ${output}`);
              }
            }
          }
        }
      );
    });
  }
}

const getHtmlPlugins = (chunks) => {
  return chunks.map(
    (chunk) =>
      new HtmlWebpackPlugin({
        title: chunk.fileName,
        filename: `${chunk.path}${chunk.fileName}.html`,
        chunks: [`${chunk.path}${chunk.fileName}`],
        template: `src/index.html`,
      })
  );
};

const config = (env) => {
  // Validate environment parameter
  if (!env || typeof env !== "object") {
    throw new Error(
      "Environment configuration is required and must be an object"
    );
  }

  // Capture environment variables at config time to prevent race conditions
  const extensionBuild =
    env.EXTENSION_BUILD || process.env.EXTENSION_BUILD || "dev";
  const shouldAnalyze = process.env.ANALYZE === "true";

  const extensionName = `${getParentFolderName()}`;
  const basePath = `./dist/${extensionBuild}`;
  const outputPath = `${basePath}/${extensionName}${extensionBuild}`;

  // Load feature configuration once at the beginning
  const features = loadFeaturesConfig();

  const enabledFeatures = Object.entries(features.features)
    .filter(([_, val]) => val && val.enabled)
    .map(([key]) => key);

  if (enabledFeatures.length > 0) {
    console.log(
      `📦 Building extension with features: ${enabledFeatures.join(", ")}`
    );
  }

  const copyPluginOptions = {
    patterns: [
      {
        from: path.resolve(`./src/manifest/manifest.json`),
        to: path.resolve(`${outputPath}/manifest.json`),
      },
      {
        from: path.resolve(`../config/manifest.xml`),
        to: path.resolve(`${basePath}/manifest.xml`),
      },
      {
        from: path.resolve("./src/root"),
        to: path.resolve(`${outputPath}/`),
      },
    ],
  };

  // Build entry points based on enabled features with safety checks
  const entries = {};

  // Background script is always included (not customizable)
  entries.background = path.resolve("./src/background/background.ts");

  // Only include entries for enabled features (the 5 customizable components)
  // Use optional chaining and explicit boolean checks to prevent race conditions
  if (features.features?.contentScripts?.enabled === true) {
    entries["content/content"] = path.resolve("./src/content/content.ts");
  }

  if (features.features?.popup?.enabled === true) {
    entries["popup/popup"] = path.resolve("./src/popup/index.tsx");
  }

  if (features.features?.options?.enabled === true) {
    entries["options/options"] = path.resolve("./src/options/index.tsx");
  }

  if (features.features?.sidepanel?.enabled === true) {
    entries["sidepanel/sidepanel"] = path.resolve("./src/sidepanel/index.tsx");
  }

  if (features.features?.offscreen?.enabled === true) {
    entries["offscreen/offscreen"] = path.resolve("./src/offscreen/index.tsx");
  }

  return {
    target: ["web", "es2024"],
    entry: entries,
    output: {
      clean: true,
      path: path.resolve(__dirname, `${outputPath}`),
      filename: "[name].bundle.js",
      library: {
        type: "module",
      },
      environment: {
        module: true,
        dynamicImport: false,
      },
    },
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [
        {
          use: {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.json",
            },
          },
          test: /\.tsx?$/,
          exclude: /node_modules/,
        },
        {
          // Process CSS with PostCSS and Tailwind
          test: /\.(css)$/i,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { importLoaders: 1 },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: ["tailwindcss", "autoprefixer"],
                },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      fullySpecified: false,
    },
    plugins: [
      // CSS is now inlined via style-loader
      new CopyPlugin(copyPluginOptions),
      ...getHtmlPlugins([
        ...(features.features?.popup?.enabled === true
          ? [{ path: "popup/", fileName: "popup" }]
          : []),
        ...(features.features?.options?.enabled === true
          ? [{ path: "options/", fileName: "options" }]
          : []),
        ...(features.features?.sidepanel?.enabled === true
          ? [{ path: "sidepanel/", fileName: "sidepanel" }]
          : []),
        ...(features.features?.offscreen?.enabled === true
          ? [{ path: "offscreen/", fileName: "offscreen" }]
          : []),
      ]),
      ...(shouldAnalyze ? [new BundleAnalyzerPlugin()] : []),
      // AfterDonePlugin is added by environment-specific configs (dev, prod, uat)
      // to prevent duplicate executions
    ],
  };
};

module.exports = config;
module.exports.AfterDonePlugin = AfterDonePlugin;
