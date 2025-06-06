const { merge } = require("webpack-merge");
const common = require("./webpack.common.config");
const { AfterDonePlugin } = require("./webpack.common.config");
const TerserPlugin = require("terser-webpack-plugin");
const dotenv = require("dotenv");

// Load environment variables for uat
dotenv.config({ path: "./.env.uat" });

const config = merge(
  common({ EXTENSION_BUILD: process.env.EXTENSION_BUILD || "prod" }),
  {
    mode: "production",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
      /* splitChunks: {
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
      }, */
    },
    plugins: [new AfterDonePlugin()],
  }
);

module.exports = config;
