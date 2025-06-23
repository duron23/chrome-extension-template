/**
 * This script ensures a PEM file exists before building the extension.
 * It's called by the prebuild script in package.json.
 */
const fs = require("fs");
const path = require("path");

// Get environment from command line arguments or default to dev
const env = process.env.NODE_ENV || "dev";

// Get the parent folder name for the extension
const parentDir = path.basename(path.resolve(__dirname, "."));

// Define paths
const keysDir = path.join(__dirname, "keys");
const pemPath = path.join(keysDir, `${parentDir}-${env}.pem`);
const configPath = path.resolve(__dirname, "src", "manifest/config.json");

// Ensure keys directory exists
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
  console.log(`Created keys directory: ${keysDir}`);
}

// Function to generate a PEM file if it doesn't exist
const generatePemIfNeeded = () => {
  if (!fs.existsSync(pemPath)) {
    console.log(`No PEM file found at ${pemPath}, generating new one...`);
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
      return true;
    } catch (error) {
      console.error(`Error generating PEM: ${error.message}`);
      return false;
    }
  }
  console.log(`Using existing PEM file at: ${pemPath}`);
  return true;
};

// Generate PEM if needed
const success = generatePemIfNeeded();
if (!success) {
  console.error("Failed to ensure PEM file exists. Build may not have consistent extension ID.");
  process.exit(1);
}

// Run extract-key.js to update the public key in manifest
const { extractPublicKeyForManifest, calculateExtensionId } = require("./extract-key");
if (fs.existsSync(pemPath)) {
  const publicKey = extractPublicKeyForManifest(pemPath);
  if (publicKey) {
    const extensionId = calculateExtensionId(publicKey);
    console.log(`Extension ID for ${env} environment: ${extensionId}`);
    
    // Update config if needed
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      
      if (!config[env].extensionId || config[env].extensionId === "") {
        config[env].extensionId = extensionId;
        config[env].calculatedId = extensionId;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
        console.log(`Updated config.json with extension ID: ${extensionId}`);
      }
    } catch (error) {
      console.error(`Error updating config: ${error.message}`);
    }
  }
}

console.log("Pre-build checks completed successfully.");
