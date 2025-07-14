const fs = require("fs");
const path = require("path");
const { parseString, Builder } = require("xml2js");
const {
  extractPublicKeyForManifest,
  calculateExtensionId,
} = require("./extract-key");

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
  fs.writeFileSync(tempPath, content, "utf8");
  fs.renameSync(tempPath, filePath);
};

// Determine the environment (dev, uat, or prod)
const env = (process.env.NODE_ENV || "dev").trim(); // Trim to remove any whitespace

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

console.log(`📋 Generating manifest for ${env} environment...`);

// Paths to the manifest and XML files
const manifestPath = path.resolve(
  __dirname,
  "..",
  "src",
  "manifest/manifest.json"
);
const xmlFilePath = path.resolve(__dirname, "..", "config", "manifest.xml");
const configFilePath = path.resolve(__dirname, "..", "config", "config.json");
const featuresFilePath = path.resolve(
  __dirname,
  "..",
  "config",
  "features.json"
);

// Read the existing manifest file
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));

// Read the features configuration
let features = {};
if (fs.existsSync(featuresFilePath)) {
  features = JSON.parse(fs.readFileSync(featuresFilePath, "utf8"));
} else {
  console.log(
    "ℹ️  Using default manifest configuration (no features.json found)"
  );
}

// Get the parent folder name for the extension
const parentDir = path.basename(path.resolve(__dirname, "..", "."));

// Define the path to the PEM file
const keysDir = path.join(__dirname, "..", "keys");
// Make sure the keys directory exists
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

const pemPath = path.join(keysDir, `${parentDir}-${env}.pem`);

// Function to generate a dummy PEM file if needed
const generateDummyPemIfNeeded = async () => {
  // Check if PEM already exists
  if (fs.existsSync(pemPath)) {
    return false;
  }

  // Acquire lock for PEM file operations
  const releaseLock = await acquireFileLock(pemPath);

  try {
    // Double-check after acquiring lock (another process might have created it)
    if (fs.existsSync(pemPath)) {
      return false;
    }

    console.log("🔑 Generating new PEM key...");

    // Generate a simple RSA key pair
    const crypto = require("crypto");
    const { privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Use atomic write for PEM file
    atomicWriteFile(pemPath, privateKey);
    return true;
  } catch (error) {
    console.error(`Error generating dummy PEM: ${error.message}`);
    return false;
  } finally {
    releaseLock();
  }
};

// Main execution function to handle async operations
const main = async () => {
  // Generate dummy PEM if needed (with race condition protection)
  const pemWasGenerated = await generateDummyPemIfNeeded();

  // Extract public key from PEM file
  if (fs.existsSync(pemPath)) {
    const publicKey = extractPublicKeyForManifest(pemPath);
    if (publicKey) {
      // Add the key to the manifest
      manifest.key = publicKey;

      // Calculate the actual extension ID from the public key
      const calculatedExtensionId = calculateExtensionId(publicKey);

      // Make sure the environment exists in config
      if (!config[env]) {
        config[env] = { extensionId: "", version: "0.0.0" };
      }

      // If no explicit extension ID is set, use the calculated one
      if (!config[env].extensionId || config[env].extensionId === "") {
        config[env].extensionId = calculatedExtensionId;
        console.log(`🆔 Extension ID: ${calculatedExtensionId}`);
      }
    }
  }

  manifest.version = getIncreamentedVersion();

  // Set name and description based on environment
  const envConfig = config[env];
  const baseName = config.name || "Chrome Extension";
  const baseDescription = config.description || "A Chrome extension";

  if (envConfig && envConfig.prefix) {
    // Add environment prefix for non-production builds
    manifest.name = `${envConfig.prefix} : ${baseName}`;
    manifest.description = `${envConfig.prefix} : ${baseDescription}`;
  } else {
    // Production build or no prefix specified
    manifest.name = baseName;
    manifest.description = baseDescription;
  }

  // Apply feature toggles if features.json exists
  if (Object.keys(features).length > 0) {
    applyFeatureToggles(manifest, features);
  }

  // Write files with atomic operations and locks
  await writeManifestFiles();

  // Update the XML file
  await updateXmlFile();
};

/**
 * Write manifest and config files with proper locking
 */
const writeManifestFiles = async () => {
  // Acquire locks for both files
  const manifestLock = await acquireFileLock(manifestPath);
  const configLock = await acquireFileLock(configFilePath);

  try {
    // Write the updated manifest and config back to files using atomic writes
    atomicWriteFile(manifestPath, JSON.stringify(manifest, null, 2));
    atomicWriteFile(configFilePath, JSON.stringify(config, null, 2));
  } finally {
    manifestLock();
    configLock();
  }
};

/**
 * Update XML file with proper error handling
 */
const updateXmlFile = async () => {
  try {
    const data = fs.readFileSync(xmlFilePath, "utf8");

    const result = await new Promise((resolve, reject) => {
      parseString(data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Get the actual extension ID
    const extensionId = getExtensionId();

    // Modify the XML structure
    result.gupdate.app[0].$.appid = extensionId; // Set appid on the app tag
    result.gupdate.app[0].updatecheck[0].$.version = manifest.version;

    // Remove duplicate appid from updatecheck if it exists
    if (result.gupdate.app[0].updatecheck[0].$.appid !== undefined) {
      delete result.gupdate.app[0].updatecheck[0].$.appid;
    } // Write the updated XML back to the file with atomic operation
    const xmlLock = await acquireFileLock(xmlFilePath);
    try {
      const builder = new Builder();
      const updatedXml = builder.buildObject(result);
      atomicWriteFile(xmlFilePath, updatedXml);
    } finally {
      xmlLock();
    }
  } catch (error) {
    console.error(`Error updating XML file: ${error.message}`);
  }
};

// Function to get the version
function getIncreamentedVersion() {
  const envKey = env;

  if (config[envKey]) {
    const currentVersion = config[envKey].version;
    const versionParts = currentVersion.split(".");
    versionParts[2] = (parseInt(versionParts[2], 10) + 1).toString();
    config[envKey].version = versionParts.join(".");
    return config[envKey].version;
  } else {
    throw new Error(`Invalid environment: ${envKey}`);
  }
}

/**
 * Get the extension ID for the current environment.
 * Prioritizes the extensionId from config.json if it's set (not empty).
 * Falls back to the calculatedId from the PEM's public key if available.
 * @returns {string} The extension ID
 */
function getExtensionId() {
  const envKey = env;
  if (!config[envKey]) {
    throw new Error(`Invalid environment: ${envKey}`);
  }
  // First priority: Use explicitly set extension ID that's not empty
  if (
    config[envKey].extensionId &&
    config[envKey].extensionId !== "" &&
    config[envKey].extensionId !== "managed-by-pem"
  ) {
    return config[envKey].extensionId;
  }

  // Second priority: Calculate from manifest.key if available
  if (manifest.key) {
    const calculatedId = calculateExtensionId(manifest.key);
    // Save it for future use
    config[envKey].calculatedId = calculatedId;
    return calculatedId;
  }

  // If we got here, we don't have a valid extension ID
  console.warn("⚠️  No valid extension ID available");
  return "";
}

/**
 * Apply feature toggles from features.json to the manifest
 * Only adds features if they are enabled and not already present in manifest
 * @param {Object} manifest - The manifest object to modify
 * @param {Object} featureConfig - The feature configuration object
 */
function applyFeatureToggles(manifest, featureConfig) {
  // Ensure permissions array exists
  if (!manifest.permissions) {
    manifest.permissions = [];
  }

  // Handle component features - only add if enabled and not already present
  if (featureConfig.features) {
    // Popup (action)
    if (featureConfig.features.popup && featureConfig.features.popup.enabled) {
      if (!manifest.action) {
        manifest.action = {
          default_popup: "popup/popup.html",
        };
      }
    }

    // Side panel
    if (
      featureConfig.features.sidepanel &&
      featureConfig.features.sidepanel.enabled
    ) {
      if (!manifest.side_panel) {
        manifest.side_panel = {
          default_path: "sidepanel/sidepanel.html",
        };
      }
      // Add sidePanel permission if not already present
      if (!manifest.permissions.includes("sidePanel")) {
        manifest.permissions.push("sidePanel");
      }
    }

    // Offscreen document
    if (
      featureConfig.features.offscreen &&
      featureConfig.features.offscreen.enabled
    ) {
      // Add offscreen permission if not already present
      if (!manifest.permissions.includes("offscreen")) {
        manifest.permissions.push("offscreen");
      }
    }

    // Options page
    if (
      featureConfig.features.options &&
      featureConfig.features.options.enabled
    ) {
      if (!manifest.options_page) {
        manifest.options_page = "options/options.html";
      }
    }

    // Content scripts
    if (
      featureConfig.features.contentScripts &&
      featureConfig.features.contentScripts.enabled
    ) {
      if (!manifest.content_scripts || manifest.content_scripts.length === 0) {
        const matches = featureConfig.features.contentScripts.matches || [
          "http://*/*",
        ];
        manifest.content_scripts = [
          {
            js: ["content/content.bundle.js"],
            matches: matches,
          },
        ];
      }
    }
  }

  // NOTE: Feature management only adds the following components if enabled and not present:
  // 1. popup - adds action to manifest
  // 2. options - adds options_page to manifest
  // 3. sidepanel - adds side_panel to manifest and sidePanel permission
  // 4. offscreen - adds offscreen permission (no direct manifest component)
  // 5. contentScripts - adds content_scripts to manifest
  //
  // Existing properties in manifest.json are never overridden
  // Permissions are only added, never removed or modified
}

// Execute main function and handle errors
main().catch((error) => {
  console.error("Error in manifest generation:", error);
  process.exit(1);
});
