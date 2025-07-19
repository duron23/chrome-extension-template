const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

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

// Determine the environment (development or production)
const env = (process.env.NODE_ENV || "dev").trim(); // Default to 'dev' instead of 'development'

// Make sure EXTENSION_BUILD is set
if (!process.env.EXTENSION_BUILD) {
  process.env.EXTENSION_BUILD = env;
} else {
  process.env.EXTENSION_BUILD = process.env.EXTENSION_BUILD.trim();
}

console.log(
  `🔧 Packaging extension for ${process.env.EXTENSION_BUILD} environment`
);

const getParentFolderName = () => {
  const parentDir = path.basename(path.resolve(__dirname, "..", "."));
  return parentDir;
};

const parentDir = getParentFolderName();

// Use a dedicated keys directory for storing PEM files
const keysDirectory = path.join(__dirname, "..", "keys");
if (!fs.existsSync(keysDirectory)) {
  fs.mkdirSync(keysDirectory);
}

const extensionPath = path.join(
  __dirname,
  "..",
  `dist/${process.env.EXTENSION_BUILD}/${parentDir}-${process.env.EXTENSION_BUILD}`
);

// Store PEM files in the keys directory instead of dist
const pemPath = path.join(
  keysDirectory,
  `${parentDir}-${process.env.EXTENSION_BUILD}.pem`
);

// Adjust the path if Chrome is installed elsewhere
const chromePath = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`;

// Function to ensure the manifest in the dist folder has the key property
const ensureManifestHasKey = async () => {
  // Check if PEM file exists
  if (!fs.existsSync(pemPath)) {
    return;
  }

  // Get manifest path in dist folder
  const distManifestPath = path.join(extensionPath, "manifest.json");

  // Check if manifest exists in dist
  if (!fs.existsSync(distManifestPath)) {
    return;
  }

  // Acquire lock for manifest operations
  const releaseLock = await acquireFileLock(distManifestPath);

  try {
    // Read the source manifest to get the key
    const sourceManifestPath = path.join(
      __dirname,
      "..",
      "src",
      "manifest",
      "manifest.json"
    );
    let sourceManifest;
    try {
      sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8"));
    } catch (err) {
      console.error("Error reading source manifest:", err);
      return;
    }

    // If source manifest doesn't have key, we need to extract it
    if (!sourceManifest.key) {
      return;
    }

    // Read dist manifest
    let distManifest;
    try {
      distManifest = JSON.parse(fs.readFileSync(distManifestPath, "utf8"));
    } catch (err) {
      console.error("Error reading dist manifest:", err);
      return;
    }

    // Add key to dist manifest
    distManifest.key = sourceManifest.key;

    // Write updated manifest back to dist using atomic write
    atomicWriteFile(distManifestPath, JSON.stringify(distManifest, null, 2));
  } catch (err) {
  } finally {
    releaseLock();
  }
};

// Function to generate a dummy PEM file if needed
const ensurePemExists = async () => {
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

    console.log("🔑 Generating new PEM key for extension signing...");

    // Generate a simple RSA key pair
    const crypto = require("crypto");
    const { privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Use atomic write for PEM file
    atomicWriteFile(pemPath, privateKey);
    console.log(`✅ Created PEM key: ${path.basename(pemPath)}`);

    // Update manifest with the new key (with proper error handling)
    const { execSync } = require("child_process");
    try {
      execSync(`node generate-manifest.js`, {
        env: { ...process.env },
        stdio: "inherit",
        timeout: 30000, // 30 second timeout
      });
      return true;
    } catch (manifestError) {
      console.error(
        `Error updating manifest with new key: ${manifestError.message}`
      );
      // Don't fail the whole process if manifest update fails
      return true;
    }
  } catch (error) {
    console.error(`Error generating PEM: ${error.message}`);
    return false;
  } finally {
    releaseLock();
  }
};

const packExtension = async () => {
  // Check if the extension directory exists before attempting to package
  if (!fs.existsSync(extensionPath)) {
    console.error(`❌ Extension build not found: ${extensionPath}`);
    console.error("🔨 Please run the build command first: npm run build:dev");
    return;
  }

  // Ensure the PEM file exists (with race condition protection)
  const pemExists = await ensurePemExists();
  if (!pemExists) {
    console.error(
      "❌ Failed to create or find PEM key. Cannot package extension."
    );
    return;
  }

  // Ensure the manifest has the key before packaging (with race condition protection)
  await ensureManifestHasKey();

  const command = `${chromePath} --pack-extension=${extensionPath}`;

  // Always use the PEM key since we ensure it exists
  const commandWithKey = `${command} --pack-extension-key=${pemPath}`;
  exec(commandWithKey, { timeout: 60000 }, async (error, stdout, stderr) => {
    if (error) {
      console.error(
        `❌ Extension packaging failed: ${stderr || error.message}`
      );
    } else {
      console.log(`📦 Extension packaged successfully`);

      // If we didn't use an existing PEM, Chrome generated one in the dist directory
      // We should copy it to our keys directory for future use
      if (!fs.existsSync(pemPath)) {
        const generatedPemPath = `${extensionPath}.pem`;
        if (fs.existsSync(generatedPemPath)) {
          // Acquire lock before copying
          const releaseLock = await acquireFileLock(pemPath);
          try {
            // Use atomic copy operation
            const pemContent = fs.readFileSync(generatedPemPath, "utf8");
            atomicWriteFile(pemPath, pemContent);

            // Clean up the generated PEM
            fs.unlinkSync(generatedPemPath);

            // Run generate-manifest.js again to update the manifest and XML with the new key and extension ID
            const { execSync } = require("child_process");
            try {
              execSync(`node generate-manifest.js`, {
                env: { ...process.env },
                stdio: "inherit",
                timeout: 30000,
              });

              // Read updated config to show the extension ID
              const configPath = path.join(
                __dirname,
                "..",
                "config",
                "config.json"
              );
              if (fs.existsSync(configPath)) {
                const updatedConfig = JSON.parse(
                  fs.readFileSync(configPath, "utf8")
                );
                const currentEnv = process.env.NODE_ENV || "dev";
                const extensionId =
                  updatedConfig[currentEnv]?.extensionId || "unknown";
                console.log(`🆔 Extension ID: ${extensionId}`);
              }
            } catch (manifestError) {
              console.error(
                `⚠️  Failed to update manifest: ${manifestError.message}`
              );
            }
          } catch (copyError) {
            console.error(`⚠️  Failed to save PEM key: ${copyError.message}`);
          } finally {
            releaseLock();
          }
        }
      }
    }
  });
};

// Execute the async function
packExtension().catch((error) => {
  console.error("Error in pack extension:", error);
  process.exit(1);
});
