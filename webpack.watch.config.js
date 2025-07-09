const { merge } = require("webpack-merge");
const common = require("./webpack.common.config");
const TerserPlugin = require("terser-webpack-plugin");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables for development
dotenv.config({ path: "./.env.dev" });

const config = merge(
  common({ EXTENSION_BUILD: process.env.EXTENSION_BUILD || "dev" }),
  {
    mode: "development",
    devtool: "inline-source-map", // disable source maps to avoid ConcatSource error in reloader
    optimization: {
      minimize: false, // disable minification to avoid conflicts with extension reloader
    }
  }
);

module.exports = config;
