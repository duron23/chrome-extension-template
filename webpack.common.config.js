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

/**
 * Load the features configuration file if it exists
 * @returns {Object} The features configuration
 */
const loadFeaturesConfig = () => {
  const featuresPath = path.resolve(__dirname, "src", "manifest", "features.json");
  
  if (fs.existsSync(featuresPath)) {
    try {
      return JSON.parse(fs.readFileSync(featuresPath, "utf8"));
    } catch (error) {
      console.error(`Error loading features.json: ${error.message}`);
    }
  }
  
  // Return default config if features.json doesn't exist or has errors
  return {
    features: {
      popup: { enabled: true },
      options: { enabled: true },
      sidepanel: { enabled: true },
      offscreen: { enabled: true },
      contentScripts: { enabled: true }
    }
  };
};

class AfterDonePlugin {
  apply(compiler) {
    compiler.hooks.done.tap("AfterDonePlugin", (stats) => {
      // Get the current environment from compiler options
      const env = process.env.NODE_ENV || "dev";
      const extensionBuild = process.env.EXTENSION_BUILD || env;
      
      // Execute pack-extension.js with the correct environment variables
      exec(`node pack-extension.js`, {
        env: { ...process.env, NODE_ENV: env, EXTENSION_BUILD: extensionBuild }
      }, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error during packing: ${stderr}`);
        } else {
          console.log(
            "!============================!",
            stats.endTime - stats.startTime
          );
          console.log(`Packing output: ${stdout}`);
        }
      });
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
  const extensionName = `${getParentFolderName()}`;
  const basePath = `./dist/${env.EXTENSION_BUILD}`;
  const outputPath = `${basePath}/${extensionName}${env.EXTENSION_BUILD}`;
  const isProduction = env.EXTENSION_BUILD === 'prod';
  const shouldAnalyze = process.env.ANALYZE === 'true';
  
  // Load feature configuration
  const features = loadFeaturesConfig();
  console.log("Building with features:", 
    Object.entries(features.features)
      .filter(([_, val]) => val.enabled)
      .map(([key]) => key)
      .join(", ")
  );
  
  const copyPluginOptions = {
    patterns: [
      {
        from: path.resolve(`./src/manifest/manifest.json`),
        to: path.resolve(`${outputPath}/manifest.json`),
      },
      {
        from: path.resolve(`./src/manifest/manifest.xml`),
        to: path.resolve(`${basePath}/manifest.xml`),
      },
      {
        from: path.resolve("./src/static"),
        to: path.resolve(`${outputPath}/static/`),
      },
    ],
  };

  // Build entry points based on enabled features
  const entries = {};
  
  // Background script is always included (not customizable)
  entries.background = path.resolve("./src/background/background.ts");
  
  // Only include entries for enabled features (the 5 customizable components)
  if (features.features.contentScripts?.enabled) {
    entries["content/content"] = path.resolve("./src/content/content.ts");
  }
  
  if (features.features.popup?.enabled) {
    entries["popup/popup"] = path.resolve("./src/popup/index.tsx");
  }
  
  if (features.features.options?.enabled) {
    entries["options/options"] = path.resolve("./src/options/index.tsx");
  }
  
  if (features.features.sidepanel?.enabled) {
    entries["sidepanel/sidepanel"] = path.resolve("./src/sidepanel/index.tsx");
  }
  
  if (features.features.offscreen?.enabled) {
    entries["offscreen/offscreen"] = path.resolve("./src/offscreen/index.tsx");
  }

  return {
    target: ["web", "es2023"],
    entry: entries,
    output: {
      clean: true,
      path: path.resolve(__dirname, `${outputPath}`),
      filename: "[name].bundle.js",
      // Enable ES module output for Chrome extension compatibility with type: "module"
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
          /* use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  "@babel/preset-typescript",
                  "@babel/preset-env",
                  "@babel/preset-react",
                ],
              },
            },
          ], */
          test: /\.tsx?$/,
          exclude: /node_modules/,
        },
        {
          // Process CSS with PostCSS and Tailwind
          test: /\.(css)$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: { importLoaders: 1 }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'tailwindcss',
                    'autoprefixer'
                  ]
                }
              }
            }
          ]
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
        ...(features.features.popup?.enabled ? [{ path: "popup/", fileName: "popup" }] : []),
        ...(features.features.options?.enabled ? [{ path: "options/", fileName: "options" }] : []),
        ...(features.features.sidepanel?.enabled ? [{ path: "sidepanel/", fileName: "sidepanel" }] : []),
        ...(features.features.offscreen?.enabled ? [{ path: "offscreen/", fileName: "offscreen" }] : []),
      ]),
      ...(shouldAnalyze ? [new BundleAnalyzerPlugin()] : []),
      new AfterDonePlugin(),
    ],
  };
};

module.exports = config;
module.exports.AfterDonePlugin = AfterDonePlugin;
