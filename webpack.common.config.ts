import * as path from "path";
import CopyPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import * as dotenv from "dotenv";
import { Configuration } from "webpack";

dotenv.config();
const manifestVersion = process.env.MANIFEST_VERSION;

const getParentFolderName = (): string => {
  const parentDir = path.basename(path.resolve(__dirname, "."));
  return parentDir;
};

interface Env {
  EXTENSION_BUILD: string;
}

const getHtmlPlugins = (
  chunks: { path: string; fileName: string }[]
): HtmlWebpackPlugin[] => {
  return chunks.map(
    (chunk) =>
      new HtmlWebpackPlugin({
        title: chunk.fileName,
        filename: `${chunk.path}${chunk.fileName}.html`,
        chunks: [`${chunk.path}${chunk.fileName}`],
        template: `src/index.html`,
      })
  );
};

const config = (env: Env): Configuration => {
  const extensionName = `${getParentFolderName()}`;
  const basePath = `./dist/${env.EXTENSION_BUILD}`;
  const outputPath = `${basePath}/${extensionName}${env.EXTENSION_BUILD}`;

  return {
    entry: {
      "content/content": path.resolve("./src/content/content.ts"),
      "popup/popup": path.resolve("./src/popup/index.tsx"),
      "options/options": path.resolve("./src/options/index.tsx"),
      "sidepanel/sidepanel": path.resolve("./src/sidepanel/index.tsx"),
      background: path.resolve("./src/background/background.ts"),
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, `${outputPath}`),
      filename: "[name].bundle.js",
      libraryTarget: "module",
    },
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [
        {
          use: "ts-loader",
          test: /\.tsx?$/,
          exclude: /node_modules/,
        },
        {
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  indent: "postcss",
                  plugins: [tailwindcss, autoprefixer],
                },
              },
            },
          ],
          test: /\.css$/i,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              `./src/manifest/v${manifestVersion}/manifest.json`
            ),
            to: path.resolve(`${outputPath}/manifest.json`),
          },
          {
            from: path.resolve(
              `./src/manifest/v${manifestVersion}/manifest.xml`
            ),
            to: path.resolve(`${basePath}/manifest.xml`),
          },
          {
            from: path.resolve("./src/static"),
            to: path.resolve(`${outputPath}/static/`),
          },
        ],
      }),
      ...getHtmlPlugins([
        { path: "popup/", fileName: "popup" },
        { path: "options/", fileName: "options" },
        { path: "sidepanel/", fileName: "sidepanel" },
      ]),
    ],
    /* optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]src[\\/]/,
            name: "commons",
            chunks: "all",
          },
        },
      },
    }, */
  };
};

export default config;
