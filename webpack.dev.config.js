const { merge } = require("webpack-merge");
const common = require("./webpack.common.config.js");

module.exports = merge(common, {
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
            chunk.name !== "sidepanel",
        },
      },
    },
  },
});
