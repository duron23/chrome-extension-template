const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

const extensionName = "testmanifest2";

module.exports = {
  entry: {
    "popup/popup": path.resolve("./src/popup/index.tsx"),
    "options/options": path.resolve("./src/options/index.tsx"),
    background: path.resolve("./src/background/background.ts"),
    //"content/content": path.resolve("./src/content/content.tsx"),
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, `./dist/${extensionName}`),
    filename: "[name]_bundle.js",
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
          from: path.resolve("./src/root/"),
          to: path.resolve(`./dist/${extensionName}/`),
        },
        {
          from: path.resolve("./src/static"),
          to: path.resolve(`./dist/${extensionName}/static/`),
        },
      ],
    }),
    ...getHtmlPlugins([
      { path: "popup/", fileName: "popup" },
      { path: "options/", fileName: "options" },
    ]),
  ],
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
