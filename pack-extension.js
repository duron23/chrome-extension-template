const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Determine the environment (development or production)
const env = process.env.NODE_ENV || "dev"; // Default to 'dev' instead of 'development'

// Load the appropriate .env file
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

// Make sure EXTENSION_BUILD is set
if (!process.env.EXTENSION_BUILD) {
  process.env.EXTENSION_BUILD = env;
}
console.log("Building for environment:", process.env.EXTENSION_BUILD);

const getParentFolderName = () => {
  const parentDir = path.basename(path.resolve(__dirname, "."));
  return parentDir;
};

const parentDir = getParentFolderName();
console.log("............................... Parent Dir:   ", parentDir);

// Use a dedicated keys directory for storing PEM files
const keysDirectory = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDirectory)) {
  fs.mkdirSync(keysDirectory);
}

const extensionPath = path.join(
  __dirname,
  `dist/${process.env.EXTENSION_BUILD}/${parentDir}${process.env.EXTENSION_BUILD}`
);

console.log("...............................Extension Path", extensionPath);

// Store PEM files in the keys directory instead of dist
const pemPath = path.join(
  keysDirectory,
  `${parentDir}-${process.env.EXTENSION_BUILD}.pem`
);

console.log("...............................pem Path", pemPath);

// Adjust the path if Chrome is installed elsewhere
const chromePath = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`;

const packExtension = () => {
  // Check if the extension directory exists before attempting to package
  if (!fs.existsSync(extensionPath)) {
    console.error(`Extension directory does not exist: ${extensionPath}`);
    console.error("Make sure to build the extension before packaging it.");
    return;
  }
  
  const command = `${chromePath} --pack-extension=${extensionPath}`;

  // Check if a PEM file already exists in our keys directory
  const commandWithKey = fs.existsSync(pemPath)
    ? `${command} --pack-extension-key=${pemPath}`
    : command;
  exec(commandWithKey, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error packing extension: ${stderr}`);
    } else {
      console.log(`Extension packed successfully: ${stdout}`);
      
      // If we didn't use an existing PEM, Chrome generated one in the dist directory
      // We should copy it to our keys directory for future use
      if (!fs.existsSync(pemPath)) {
        const generatedPemPath = `${extensionPath}.pem`;
        if (fs.existsSync(generatedPemPath)) {
          try {
            fs.copyFileSync(generatedPemPath, pemPath);
            console.log(`Copied generated PEM file to: ${pemPath}`);
            
            // Clean up the generated PEM
            fs.unlinkSync(generatedPemPath);
            console.log(`Removed generated PEM from dist directory`);
            
            // Run generate-manifest.js again to update the manifest with the new key
            console.log("Updating manifest with the new key...");
            const { execSync } = require('child_process');
            try {
              execSync(`node generate-manifest.js`, { 
                env: { ...process.env },
                stdio: 'inherit'
              });
              console.log("Manifest updated successfully with the new key");
            } catch (manifestError) {
              console.error(`Error updating manifest with key: ${manifestError.message}`);
            }
          } catch (copyError) {
            console.error(`Error copying PEM file: ${copyError.message}`);
          }
        }
      }
    }
  });
};

packExtension();
