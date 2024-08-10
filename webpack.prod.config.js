const { merge } = require("webpack-merge");
const common = require("./webpack.common.config.js");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
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
            chunk.name !== "sidepanel",
        },
      },
    },
  },
});
