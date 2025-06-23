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

// Function to ensure the manifest in the dist folder has the key property
const ensureManifestHasKey = () => {
  // Check if PEM file exists
  if (!fs.existsSync(pemPath)) {
    console.log("No PEM file found, skipping key insertion");
    return;
  }
  
  // Get manifest path in dist folder
  const distManifestPath = path.join(extensionPath, 'manifest.json');
  
  // Check if manifest exists in dist
  if (!fs.existsSync(distManifestPath)) {
    console.log("No manifest.json found in dist folder");
    return;
  }
  
  // Read the source manifest to get the key
  const sourceManifestPath = path.join(__dirname, 'src', 'manifest', 'manifest.json');
  let sourceManifest;
  try {
    sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
  } catch (err) {
    console.error("Error reading source manifest:", err);
    return;
  }
  
  // If source manifest doesn't have key, we need to extract it
  if (!sourceManifest.key) {
    console.log("Source manifest doesn't have key property");
    return;
  }
  
  // Read dist manifest
  let distManifest;
  try {
    distManifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
  } catch (err) {
    console.error("Error reading dist manifest:", err);
    return;
  }
  
  // Add key to dist manifest
  distManifest.key = sourceManifest.key;
  
  // Write updated manifest back to dist
  try {
    fs.writeFileSync(distManifestPath, JSON.stringify(distManifest, null, 2), 'utf8');
    console.log("Added key to manifest.json in dist folder");
  } catch (err) {
    console.error("Error writing updated manifest:", err);
  }
};

// Function to generate a dummy PEM file if needed
const ensurePemExists = () => {
  if (!fs.existsSync(pemPath)) {
    console.log("No PEM file found, generating a dummy one...");
    try {
      // Generate a simple RSA key pair
      const crypto = require('crypto');
      const { privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
      
      // Save the private key to PEM file
      fs.writeFileSync(pemPath, privateKey);
      console.log(`Created PEM file at: ${pemPath}`);
      
      // Update manifest with the new key
      const { execSync } = require('child_process');
      try {
        execSync(`node generate-manifest.js`, { 
          env: { ...process.env },
          stdio: 'inherit'
        });
        console.log("Generated and applied new key to manifest");
        return true;
      } catch (manifestError) {
        console.error(`Error updating manifest with new key: ${manifestError.message}`);
      }
    } catch (error) {
      console.error(`Error generating PEM: ${error.message}`);
    }
  }
  return fs.existsSync(pemPath);
};

const packExtension = () => {
  // Check if the extension directory exists before attempting to package
  if (!fs.existsSync(extensionPath)) {
    console.error(`Extension directory does not exist: ${extensionPath}`);
    console.error("Make sure to build the extension before packaging it.");
    return;
  }
  
  // Ensure the PEM file exists
  const pemExists = ensurePemExists();
  if (!pemExists) {
    console.error("Failed to ensure PEM file exists. Cannot continue packaging.");
    return;
  }
  
  // Ensure the manifest has the key before packaging
  ensureManifestHasKey();
  
  const command = `${chromePath} --pack-extension=${extensionPath}`;

  // Always use the PEM key since we ensure it exists
  const commandWithKey = `${command} --pack-extension-key=${pemPath}`;
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
              // Run generate-manifest.js again to update the manifest and XML with the new key and extension ID
            console.log("Updating manifest and XML with the new key and extension ID...");
            const { execSync } = require('child_process');
            try {
              execSync(`node generate-manifest.js`, { 
                env: { ...process.env },
                stdio: 'inherit'
              });
              console.log("Manifest and XML updated successfully with the new key and extension ID");
              
              // Read updated config to show the extension ID
              const updatedConfig = JSON.parse(
                fs.readFileSync(path.join(__dirname, 'src', 'manifest', 'config.json'), 'utf8')
              );
              const currentEnv = process.env.NODE_ENV || "dev";
              const extensionId = updatedConfig[currentEnv].calculatedId || "unknown";
              console.log(`Extension ID for ${currentEnv}: ${extensionId}`);
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
