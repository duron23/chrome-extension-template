import { merge } from "webpack-merge";
import common from "./webpack.common.config";
import TerserPlugin from "terser-webpack-plugin";
import * as dotenv from "dotenv";
import { Configuration } from "webpack";

// Load environment variables for uat
dotenv.config({ path: "./.env.uat" });

const config: Configuration = merge(
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
  }
);

export default config;
