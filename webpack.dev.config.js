const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.config.js");
const dotenv = require("dotenv");

// Load environment variables for development
dotenv.config({ path: "./.env.dev" });

module.exports = merge(
  common({ EXTENSION_BUILD: process.env.EXTENSION_BUILD }),
  {
    mode: "development",
    devtool: "cheap-module-source-map",
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: (chunk) =>
              chunk.name !== "background" &&
              chunk.name !== "content" &&
              chunk.name !== "popup" &&
              chunk.name !== "options" &&
              chunk.name !== "sidepanel",
          },
        },
      },
    },
  }
);
