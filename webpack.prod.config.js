const { merge } = require("webpack-merge");
const common = require("./webpack.common.config.js");
const TerserPlugin = require("terser-webpack-plugin");
const dotenv = require("dotenv");

// Load environment variables for production
dotenv.config({ path: "./.env.prod" });

module.exports = merge(
  common({ EXTENSION_BUILD: process.env.EXTENSION_BUILD }),
  {
    mode: "production",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
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
