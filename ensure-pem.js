/**
 * This script ensures a PEM file exists before building the extension.
 * It's called by the prebuild script in package.json.
 */
const fs = require("fs");
const path = require("path");

// Simple file locking mechanism to prevent race conditions
const locks = new Map();

/**
 * Acquire a lock for a file path to prevent concurrent operations
 * @param {string} filePath - The file path to lock
 * @returns {Promise<Function>} - A function to release the lock
 */
const acquireFileLock = (filePath) => {
  return new Promise((resolve) => {
    const checkLock = () => {
      if (locks.has(filePath)) {
        setTimeout(checkLock, 10); // Wait 10ms and check again
      } else {
        locks.set(filePath, true);
        resolve(() => locks.delete(filePath));
      }
    };
    checkLock();
  });
};

/**
 * Atomic file write operation to prevent corruption
 * @param {string} filePath - Path to write to
 * @param {string} content - Content to write
 */
const atomicWriteFile = (filePath, content) => {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, content, 'utf8');
  fs.renameSync(tempPath, filePath);
};

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
}

// Function to generate a PEM file if it doesn't exist
const generatePemIfNeeded = async () => {
  // Check if PEM already exists
  if (fs.existsSync(pemPath)) {
    return true;
  }

  // Acquire lock for PEM file operations
  const releaseLock = await acquireFileLock(pemPath);
  
  try {
    // Double-check after acquiring lock (another process might have created it)
    if (fs.existsSync(pemPath)) {
      return true;
    }

    console.log(`🔑 Generating PEM key for ${env} environment...`);
    
    // Generate a simple RSA key pair
    const crypto = require('crypto');
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    // Use atomic write for PEM file
    atomicWriteFile(pemPath, privateKey);
    return true;
  } catch (error) {
    console.error(`Error generating PEM: ${error.message}`);
    return false;
  } finally {
    releaseLock();
  }
};

// Main execution function
const main = async () => {
  // Generate PEM if needed
  const success = await generatePemIfNeeded();
  if (!success) {
    console.error("❌ Failed to generate PEM key. Extension ID may not be consistent.");
    process.exit(1);
  }

  // Run extract-key.js to update the public key in manifest
  const { extractPublicKeyForManifest, calculateExtensionId } = require("./extract-key");
  if (fs.existsSync(pemPath)) {
    const publicKey = extractPublicKeyForManifest(pemPath);
    if (publicKey) {
      const extensionId = calculateExtensionId(publicKey);
      console.log(`✅ Extension ID for ${env}: ${extensionId}`);
      
      // Update config if needed with proper locking
      const configLock = await acquireFileLock(configPath);
      try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        
        if (!config[env]) {
          config[env] = { extensionId: "", version: "0.0.0" };
        }
        
        if (!config[env].extensionId || config[env].extensionId === "") {
          config[env].extensionId = extensionId;
          config[env].calculatedId = extensionId;
          atomicWriteFile(configPath, JSON.stringify(config, null, 2));
        }
      } catch (error) {
        console.error(`⚠️  Error updating config: ${error.message}`);
      } finally {
        configLock();
      }
    }
  }
};

// Execute main function and handle errors
main().catch(error => {
  console.error('Error in ensure-pem:', error);
  process.exit(1);
});
