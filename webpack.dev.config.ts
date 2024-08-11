import { merge } from "webpack-merge";
import common from "./webpack.common.config";
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
  }
);

export default config;
