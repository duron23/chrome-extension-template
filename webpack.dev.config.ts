import { merge } from "webpack-merge";
import common, { AfterDonePlugin } from "./webpack.common.config";
import TerserPlugin from "terser-webpack-plugin";
import * as dotenv from "dotenv";
import { Configuration } from "webpack";

// Load environment variables for development
dotenv.config({ path: "./.env.dev" });

const config: Configuration = merge(
  common({ EXTENSION_BUILD: process.env.EXTENSION_BUILD || "dev" }),
  {
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
  }
);

export default config;
