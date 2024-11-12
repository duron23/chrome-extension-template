import { exec } from "child_process";
import path from "path";
import fs from "fs";
import * as dotenv from "dotenv";

// Determine the environment (development or production)
const env = process.env.NODE_ENV || "development";

// Load the appropriate .env file
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

const getParentFolderName = (): string => {
  const parentDir = path.basename(path.resolve(__dirname, "."));
  return parentDir;
};

const parentDir = getParentFolderName();
console.log("............................... Parent Dir:   ", parentDir);

const basePath = path.join(__dirname, `dist/${process.env.EXTENSION_BUILD}`);
console.log("............................... BasePath/PEM: ", basePath);

const extensionPath = path.join(
  __dirname,
  `dist/${process.env.EXTENSION_BUILD}/${parentDir}${process.env.EXTENSION_BUILD}`
);

console.log("...............................Extension Path", extensionPath);

const pemPath = path.join(
  basePath,
  `${parentDir}${process.env.EXTENSION_BUILD}.pem`
);

console.log("...............................pem Path", pemPath);

// Adjust the path if Chrome is installed elsewhere
const chromePath = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`;

const packExtension = () => {
  const command = `${chromePath} --pack-extension=${extensionPath}`;

  const commandWithKey = fs.existsSync(pemPath)
    ? `${command} --pack-extension-key=${pemPath}`
    : command;

  exec(commandWithKey, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error packing extension: ${stderr}`);
    } else {
      console.log(`Extension packed successfully: ${stdout}`);
    }
  });
};

packExtension();
