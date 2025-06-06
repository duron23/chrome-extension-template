const { merge } = require("webpack-merge");
const common = require("./webpack.common.config");
const { AfterDonePlugin } = require("./webpack.common.config");
const TerserPlugin = require("terser-webpack-plugin");
const dotenv = require("dotenv");

// Load environment variables for production
dotenv.config({ path: "./.env.prod" });

const config = merge(
  common({ EXTENSION_BUILD: process.env.EXTENSION_BUILD || "prod" }),  {
    mode: "production",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      })],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: (chunk) =>
              chunk.name !== "background" &&
              chunk.name !== "content/content",
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
          },
        },
      },
    },
    plugins: [new AfterDonePlugin()],
  }
);

module.exports = config;
