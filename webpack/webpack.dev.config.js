const { merge } = require("webpack-merge");
const common = require("./webpack.common.config");
const { AfterDonePlugin } = require("./webpack.common.config");
const TerserPlugin = require("terser-webpack-plugin");

const config = merge(common({ EXTENSION_BUILD: "dev" }), {
  mode: "development",
  devtool: "inline-source-map",
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
});

module.exports = config;
