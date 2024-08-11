const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const dotenv = require("dotenv");

dotenv.config();
const manifestVersion = process.env.MANIFEST_VERSION;

const getParentFolderName = () => {
  const parentDir = path.basename(path.resolve(__dirname, "."));
  return parentDir;
};

module.exports = (env) => {
  const extensionName = `${getParentFolderName()}`;
  const basePath = `./dist/${env.EXTENSION_BUILD}`;
  const outputPath = `${basePath}/${extensionName}${env.EXTENSION_BUILD}`;
  return {
    entry: {
      "content/content": path.resolve("./src/content/content.ts"),
      "popup/popup": path.resolve("./src/popup/index.tsx"),
      "options/options": path.resolve("./src/options/index.tsx"),
      "sidepanel/sidepanel": path.resolve("./src/sidepanel/index.tsx"),
      background: path.resolve("./src/background/background.ts"),
      mqttClient: path.resolve("./src/background/mqttClient.ts"),
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, `${outputPath}`),
      filename: "[name].bundle.js",
      libraryTarget: "module",
    },
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [
        {
          use: "ts-loader",
          test: /\.tsx?$/,
          exclude: /node_modules/,
        },
        {
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  indent: "postcss",
                  plugins: [tailwindcss, autoprefixer],
                },
              },
            },
          ],
          test: /\.css$/i,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              `./src/manifest/v${manifestVersion}/manifest.json`
            ),
            to: path.resolve(`${outputPath}/manifest.json`),
          },
          {
            from: path.resolve(
              `./src/manifest/v${manifestVersion}/manifest.xml`
            ),
            to: path.resolve(`${basePath}/manifest.xml`),
          },
          {
            from: path.resolve("./src/static"),
            to: path.resolve(`${outputPath}/static/`),
          },
        ],
      }),
      ...getHtmlPlugins([
        { path: "popup/", fileName: "popup" },
        { path: "options/", fileName: "options" },
        { path: "sidepanel/", fileName: "sidepanel" },
      ]),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]src[\\/]/,
            name: "commons",
            chunks: "all",
          },
        },
      },
    },
  };
};

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlWebpackPlugin({
        title: chunk.fileName,
        filename: `${chunk.path}${chunk.fileName}.html`,
        chunks: [`${chunk.path}${chunk.fileName}`],
        template: `src/index.html`,
      })
  );
}

/* 

[
      { name: "popup/popup", title: "Action Page" },
      { name: "options/options", title: "options" },
    ]

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlWebpackPlugin({
        title: chunk.title,
        filename: `${chunk.name}.html`,
        chunks: [chunk.name],
        template: `${chunk.name}/index.html`,
      })
  );
} */

/* 

{ htmlName: "popup", chuck: "popup", title: "Popup" },
{ htmlName: "options", chuck: "options", title: "options" },

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlWebpackPlugin({
        title: chunk.title,
        filename: `${chunk.chuck}/${chunk.chuck}.html`,
        chunks: [`${chunk.chuck}/${chunk.chuck}`],
      })
  );
} */
