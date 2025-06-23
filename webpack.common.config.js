const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const tailwindcss = require("@tailwindcss/postcss");
const autoprefixer = require("autoprefixer");
const dotenv = require("dotenv");
const { exec } = require("child_process");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

dotenv.config();

const getParentFolderName = () => {
  const parentDir = path.basename(path.resolve(__dirname, "."));
  return parentDir;
};

class AfterDonePlugin {
  apply(compiler) {
    compiler.hooks.done.tap("AfterDonePlugin", (stats) => {
      exec("node pack-extension.js", (err, stdout, stderr) => {
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

/* class AfterEmitPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      "AfterEmitPlugin",
      (compilation, callback) => {
        console.log("============================");
        exec("node pack-extension.js", (err, stdout, stderr) => {
          if (err) {
            console.error(`Error during packing: ${stderr}`);
          } else {
            console.log(`Packing output: ${stdout}`);
          }
          callback(); // Ensure Webpack continues after the command execution
        });
      }
    );
  }
} */

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

  return {
    target: ["web", "es2023"],
    entry: {
      "content/content": path.resolve("./src/content/content.ts"),
      "popup/popup": path.resolve("./src/popup/index.tsx"),
      "options/options": path.resolve("./src/options/index.tsx"),
      "sidepanel/sidepanel": path.resolve("./src/sidepanel/index.tsx"),
      "offscreen/offscreen": path.resolve("./src/offscreen/index.tsx"),
      background: path.resolve("./src/background/background.ts"),
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, `${outputPath}`),
      filename: "[name].bundle.js",
      libraryTarget: "module",
    },
    experiments: {
      outputModule: true,
    },    module: {
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
          use: isProduction 
            ? [
                "style-loader",
                {
                  loader: "css-loader",
                  options: {
                    importLoaders: 1,
                    modules: false,
                  },
                },
                {
                  loader: "postcss-loader",
                  options: {
                    postcssOptions: {
                      plugins: [
                        tailwindcss,
                        autoprefixer,
                        ...(isProduction ? [require('cssnano')({ preset: 'default' })] : []),
                      ],
                    },
                  },
                },
              ]
            : [
                "style-loader",
                "css-loader",
                {
                  loader: "postcss-loader",
                  options: {
                    postcssOptions: {
                      plugins: [tailwindcss, autoprefixer],
                    },
                  },
                },
              ],
          test: /\.css$/i,        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    plugins: [
      new CopyPlugin(copyPluginOptions),
      ...getHtmlPlugins([
        { path: "popup/", fileName: "popup" },
        { path: "options/", fileName: "options" },
        { path: "sidepanel/", fileName: "sidepanel" },
        { path: "offscreen/", fileName: "offscreen" },
      ]),
      ...(shouldAnalyze ? [new BundleAnalyzerPlugin()] : []),
      //new AfterDonePlugin(),
    ],
  };
};

module.exports = config;
module.exports.AfterDonePlugin = AfterDonePlugin;
