/**
 * This script ensures a PEM file exists before building the extension.
 * It's called by the prebuild script in package.json.
 */
const fs = require("fs");
const path = require("path");

// Simple file locking mechanism to prevent race conditions
const locks = new Map();
const lockTimeouts = new Map(); // Track lock timeouts

/**
 * Acquire a lock for a file path to prevent concurrent operations with timeout
 * @param {string} filePath - The file path to lock
 * @param {number} timeout - Maximum time to wait for lock in milliseconds (default: 30000)
 * @returns {Promise<Function>} - A function to release the lock
 */
const acquireFileLock = (filePath, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const lockKey = path.resolve(filePath); // Normalize path for consistent locking
    const startTime = Date.now();

    const checkLock = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed > timeout) {
        reject(
          new Error(`Failed to acquire lock for ${filePath} after ${timeout}ms`)
        );
        return;
      }

      if (locks.has(lockKey)) {
        setTimeout(checkLock, 10); // Wait 10ms and check again
      } else {
        locks.set(lockKey, {
          timestamp: Date.now(),
          process: process.pid,
        });

        // Set up auto-cleanup timeout
        const timeoutId = setTimeout(() => {
          if (locks.has(lockKey)) {
            console.warn(`⚠️  Force releasing stale lock for ${filePath}`);
            locks.delete(lockKey);
            lockTimeouts.delete(lockKey);
          }
        }, timeout * 2); // Auto-cleanup after double the lock timeout

        lockTimeouts.set(lockKey, timeoutId);

        const releaseLock = () => {
          locks.delete(lockKey);
          const timeoutId = lockTimeouts.get(lockKey);
          if (timeoutId) {
            clearTimeout(timeoutId);
            lockTimeouts.delete(lockKey);
          }
        };

        resolve(releaseLock);
      }
    };
    checkLock();
  });
};

/**
 * Atomic file write operation to prevent corruption with backup
 * @param {string} filePath - Path to write to
 * @param {string} content - Content to write
 */
const atomicWriteFile = (filePath, content) => {
  const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  const backupPath = `${filePath}.backup`;

  try {
    // Create backup if original file exists
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    // Write to temporary file first
    fs.writeFileSync(tempPath, content, "utf8");

    // Atomic rename
    fs.renameSync(tempPath, filePath);

    // Remove backup after successful write
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  } catch (error) {
    // Cleanup temp file if it exists
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        console.warn(
          `⚠️  Failed to cleanup temp file ${tempPath}: ${cleanupError.message}`
        );
      }
    }

    // Restore from backup if available
    if (fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
        console.log(`✅ Restored ${filePath} from backup`);
      } catch (restoreError) {
        console.error(
          `❌ Failed to restore from backup: ${restoreError.message}`
        );
      }
    }

    throw error;
  }
};

// Get environment from command line arguments or default to dev
const env = (process.env.NODE_ENV || "dev").trim();

// Validate environment
const validEnvironments = ["dev", "uat", "prod"];
if (!validEnvironments.includes(env)) {
  console.error(
    `❌ Invalid environment: ${env}. Valid environments are: ${validEnvironments.join(
      ", "
    )}`
  );
  process.exit(1);
}

console.log(`🔧 Ensuring PEM key for ${env} environment...`);

// Get the parent folder name for the extension
const parentDir = path.basename(path.resolve(__dirname, "..", "."));

// Define paths
const keysDir = path.join(__dirname, "..", "keys");
const pemPath = path.join(keysDir, `${parentDir}-${env}.pem`);
const configPath = path.resolve(__dirname, "..", "config", "config.json");

// Ensure keys directory exists
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

// Function to generate a PEM file if it doesn't exist
const generatePemIfNeeded = async () => {
  // Check if PEM already exists
  if (fs.existsSync(pemPath)) {
    console.log(`✅ PEM key already exists: ${pemPath}`);
    return true;
  }

  // Acquire lock for PEM file operations
  const releaseLock = await acquireFileLock(pemPath);

  try {
    // Double-check after acquiring lock (another process might have created it)
    if (fs.existsSync(pemPath)) {
      console.log(`✅ PEM key already exists: ${pemPath}`);
      return true;
    }

    console.log(`🔑 Generating PEM key for ${env} environment...`);

    // Generate a simple RSA key pair
    const crypto = require("crypto");

    try {
      const { privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });

      // Use atomic write for PEM file
      atomicWriteFile(pemPath, privateKey);
      console.log(`✅ PEM key generated successfully: ${pemPath}`);
      return true;
    } catch (cryptoError) {
      if (cryptoError.code === "ERR_OSSL_UNSUPPORTED") {
        console.error("❌ OpenSSL error: RSA key generation not supported");
      } else if (cryptoError.code === "ERR_CRYPTO_OPERATION_FAILED") {
        console.error("❌ Crypto operation failed during key generation");
      } else {
        console.error(
          `❌ Crypto error during key generation: ${cryptoError.message}`
        );
      }
      throw cryptoError;
    }
  } catch (error) {
    if (error.code === "EACCES") {
      console.error(`❌ Permission denied writing PEM file: ${pemPath}`);
    } else if (error.code === "ENOSPC") {
      console.error(`❌ No space left on device for PEM file: ${pemPath}`);
    } else if (error.code === "ENOTDIR") {
      console.error(`❌ Invalid directory path for PEM file: ${pemPath}`);
    } else {
      console.error(`❌ Error generating PEM: ${error.message}`);
    }
    return false;
  } finally {
    releaseLock();
  }
};

// Main execution function with comprehensive error handling
const main = async () => {
  try {
    // Generate PEM if needed
    const success = await generatePemIfNeeded();
    if (!success) {
      console.error(
        "❌ Failed to generate PEM key. Extension ID may not be consistent."
      );
      process.exit(1);
    }

    // Run extract-key.js to update the public key in manifest
    try {
      const {
        extractPublicKeyForManifest,
        calculateExtensionId,
      } = require("./extract-key");

      if (fs.existsSync(pemPath)) {
        try {
          const publicKey = extractPublicKeyForManifest(pemPath);
          if (publicKey) {
            const extensionId = calculateExtensionId(publicKey);
            console.log(`✅ Extension ID for ${env}: ${extensionId}`);

            // Update config if needed with proper locking
            if (fs.existsSync(configPath)) {
              const configLock = await acquireFileLock(configPath);
              try {
                const configData = fs.readFileSync(configPath, "utf8");

                if (!configData.trim()) {
                  console.warn(
                    "⚠️  Config file is empty, creating new structure"
                  );
                  const newConfig = {};
                  newConfig[env] = {
                    extensionId: extensionId,
                    version: "1.0.0",
                  };
                  atomicWriteFile(
                    configPath,
                    JSON.stringify(newConfig, null, 2)
                  );
                  return;
                }

                const config = JSON.parse(configData);

                if (!config[env]) {
                  config[env] = { extensionId: "", version: "1.0.0" };
                }

                if (
                  !config[env].extensionId ||
                  config[env].extensionId === ""
                ) {
                  config[env].extensionId = extensionId;
                  config[env].calculatedId = extensionId;
                  atomicWriteFile(configPath, JSON.stringify(config, null, 2));
                  console.log("✅ Config updated with extension ID");
                }
              } catch (configError) {
                if (configError instanceof SyntaxError) {
                  console.error(
                    `❌ Invalid JSON in config file: ${configError.message}`
                  );
                } else if (configError.code === "EACCES") {
                  console.error(
                    `❌ Permission denied accessing config: ${configPath}`
                  );
                } else {
                  console.error(
                    `❌ Error updating config: ${configError.message}`
                  );
                }
                console.log("📋 Continuing without config update");
              } finally {
                configLock();
              }
            } else {
              console.warn(
                `⚠️  Config file not found at ${configPath}, creating new one`
              );
              try {
                const newConfig = {};
                newConfig[env] = { extensionId: extensionId, version: "1.0.0" };
                atomicWriteFile(configPath, JSON.stringify(newConfig, null, 2));
                console.log("✅ New config file created");
              } catch (createError) {
                console.error(
                  `❌ Failed to create config file: ${createError.message}`
                );
              }
            }
          } else {
            console.warn("⚠️  Failed to extract public key from PEM file");
          }
        } catch (keyError) {
          console.error(`❌ Error processing PEM key: ${keyError.message}`);
        }
      } else {
        console.warn(`⚠️  PEM file not found at ${pemPath}`);
      }
    } catch (requireError) {
      console.error(
        `❌ Failed to load extract-key module: ${requireError.message}`
      );
    }

    console.log(`✅ PEM key ensured for ${env} environment`);
  } catch (error) {
    console.error(`❌ Critical error in ensure-pem: ${error.message}`);
    if (error.stack) {
      console.error("📋 Stack trace:", error.stack);
    }
    process.exit(1);
  }
};

// Execute main function and handle errors
main().catch((error) => {
  console.error("Error in ensure-pem:", error);
  process.exit(1);
});
