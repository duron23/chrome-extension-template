const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { parseString, Builder } = require("xml2js");
const { extractPublicKeyForManifest, calculateExtensionId } = require("./extract-key");

// Determine the environment (dev, uat, or prod)
const env = (process.env.NODE_ENV || "dev").trim(); // Trim to remove any whitespace
// Load the common .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });
// Load the appropriate .env file
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

// Paths to the manifest and XML files
const manifestPath = path.resolve(
  __dirname,
  "src",
  "manifest/manifest.json"
);
const xmlFilePath = path.resolve(
  __dirname,
  "src",
  "manifest/manifest.xml"
);
const configFilePath = path.resolve(__dirname, "src", "manifest/config.json");
const featuresFilePath = path.resolve(__dirname, "src", "manifest/features.json");

// Read the existing manifest file
const manifest = JSON.parse(
  fs.readFileSync(manifestPath, "utf8")
);

const config = JSON.parse(
  fs.readFileSync(configFilePath, "utf8")
);

// Read the features configuration
let features = {};
if (fs.existsSync(featuresFilePath)) {
  features = JSON.parse(fs.readFileSync(featuresFilePath, "utf8"));
  console.log("Features configuration loaded");
} else {
  console.log("No features.json found, using default manifest");
}

console.log("Config", config);

// Get the parent folder name for the extension
const parentDir = path.basename(path.resolve(__dirname, "."));

// Define the path to the PEM file
const keysDir = path.join(__dirname, "keys");
// Make sure the keys directory exists
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

const pemPath = path.join(keysDir, `${parentDir}-${env}.pem`);
console.log("PEM path:", pemPath);

// Function to generate a dummy PEM file if needed
const generateDummyPemIfNeeded = () => {
  if (!fs.existsSync(pemPath)) {
    console.log("No PEM file found, generating a dummy one...");
    const { execSync } = require('child_process');
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
      console.log(`Created dummy PEM file at: ${pemPath}`);
      return true;
    } catch (error) {
      console.error(`Error generating dummy PEM: ${error.message}`);
      return false;
    }
  }
  return false;
};

// Generate dummy PEM if needed
const pemWasGenerated = generateDummyPemIfNeeded();

// Extract public key from PEM file
if (fs.existsSync(pemPath)) {
  const publicKey = extractPublicKeyForManifest(pemPath);
  if (publicKey) {
    // Add the key to the manifest
    manifest.key = publicKey;
    console.log("Added public key to manifest from PEM file");    // Calculate the actual extension ID from the public key
    const calculatedExtensionId = calculateExtensionId(publicKey);
    console.log(`Calculated ID from public key: ${calculatedExtensionId}`);
    
    // Make sure the environment exists in config
    if (!config[env]) {
      config[env] = { extensionId: "", version: "0.0.0" };
    }
    
    // If no explicit extension ID is set, use the calculated one
    if (!config[env].extensionId || config[env].extensionId === "") {
      config[env].extensionId = calculatedExtensionId;
      console.log(`Setting extension ID in config to calculated ID: ${calculatedExtensionId}`);
    }
  }
}

manifest.version = getIncreamentedVersion();

if (process.env.EXTENSION_BUILD !== "prod") {
  // Modify the description based on the environment
  manifest.name = `${env} : ${process.env.NAME}`;
  manifest.description = `${env} : ${process.env.DESC}`;
} else {
  // Modify the description based on the environment
  manifest.name = `${process.env.NAME}`;
  manifest.description = `${process.env.DESC}`;
}

// Apply feature toggles if features.json exists
if (Object.keys(features).length > 0) {
  applyFeatureToggles(manifest, features);
}

// Write the updated manifest back to the file
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf8");

console.log(`Manifest file updated for ${env}:`, manifest);

// Update the XML file
fs.readFile(xmlFilePath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading XML file: ${err}`);
    return;
  }
  
  parseString(data, (err, result) => {
    if (err) {
      console.error(`Error parsing XML: ${err}`);
      return;
    }

    try {
      // Get the actual extension ID
      const extensionId = getExtensionId();
      
      // Modify the XML structure
      result.gupdate.app[0].$.appid = extensionId; // Set appid on the app tag
      result.gupdate.app[0].updatecheck[0].$.version = manifest.version;
      
      // Remove duplicate appid from updatecheck if it exists
      if (result.gupdate.app[0].updatecheck[0].$.appid !== undefined) {
        delete result.gupdate.app[0].updatecheck[0].$.appid;
      }

      // Write the updated XML back to the file
      const builder = new Builder();
      const updatedXml = builder.buildObject(result);
      fs.writeFileSync(xmlFilePath, updatedXml, "utf8");

      console.log(`XML file updated with version: ${manifest.version} and extension ID: ${extensionId}`);
    } catch (error) {
      console.error(`Error updating XML file: ${error.message}`);
    }
  });
});

// Function to get the version
function getIncreamentedVersion() {
  const envKey = env;

  console.log(`Environment Key: ${envKey}`);
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
  if (config[envKey].extensionId && config[envKey].extensionId !== "" && 
      config[envKey].extensionId !== "managed-by-pem") {
    console.log(`Using explicitly configured extension ID: ${config[envKey].extensionId}`);
    return config[envKey].extensionId;
  }
  
  // Second priority: Calculate from manifest.key if available
  if (manifest.key) {
    const calculatedId = calculateExtensionId(manifest.key);
    console.log(`Calculated extension ID from manifest key: ${calculatedId}`);
    // Save it for future use
    config[envKey].calculatedId = calculatedId;
    return calculatedId;
  }
  
  // If we got here, we don't have a valid extension ID
  console.warn("No valid extension ID available. Using empty string.");
  return "";
}

/**
 * Apply feature toggles from features.json to the manifest
 * @param {Object} manifest - The manifest object to modify
 * @param {Object} featureConfig - The feature configuration object
 */
function applyFeatureToggles(manifest, featureConfig) {
  console.log("Applying feature toggles to manifest...");
  
  // Handle component features
  if (featureConfig.features) {
    // Background script
    if (featureConfig.features.background && !featureConfig.features.background.enabled) {
      delete manifest.background;
      console.log("- Disabled background service worker");
    }
    
    // Popup
    if (featureConfig.features.popup && !featureConfig.features.popup.enabled) {
      delete manifest.action;
      console.log("- Disabled popup UI");
    }
    
    // Options page
    if (featureConfig.features.options && !featureConfig.features.options.enabled) {
      delete manifest.options_page;
      console.log("- Disabled options page");
    }
    
    // Side panel
    if (featureConfig.features.sidepanel && !featureConfig.features.sidepanel.enabled) {
      delete manifest.side_panel;
      console.log("- Disabled side panel");
    }
    
    // Content scripts
    if (featureConfig.features.contentScripts) {
      if (!featureConfig.features.contentScripts.enabled) {
        manifest.content_scripts = [];
        console.log("- Disabled content scripts");
      } else if (featureConfig.features.contentScripts.matches) {
        // Update content script matches if specified
        if (manifest.content_scripts && manifest.content_scripts.length > 0) {
          manifest.content_scripts[0].matches = featureConfig.features.contentScripts.matches;
          console.log(`- Updated content script matches: ${JSON.stringify(featureConfig.features.contentScripts.matches)}`);
        }
      }
    }
  }
  
  // Handle permissions
  if (featureConfig.permissions) {
    const enabledPermissions = [];
    
    // Process each permission
    Object.keys(featureConfig.permissions).forEach(permKey => {
      const permConfig = featureConfig.permissions[permKey];
      if (permConfig.enabled) {
        enabledPermissions.push(permKey);
      } else {
        console.log(`- Removed permission: ${permKey}`);
      }
    });
    
    // Only update if we have permissions to set
    if (enabledPermissions.length > 0) {
      manifest.permissions = enabledPermissions;
      console.log(`- Set permissions to: ${JSON.stringify(enabledPermissions)}`);
    } else {
      delete manifest.permissions;
      console.log("- Removed all permissions");
    }
  }
  
  // Handle host permissions
  if (featureConfig.hostPermissions) {
    const enabledHostPermissions = [];
    
    // Process each host permission
    Object.keys(featureConfig.hostPermissions).forEach(hostKey => {
      const hostConfig = featureConfig.hostPermissions[hostKey];
      if (hostConfig.enabled && hostConfig.pattern) {
        enabledHostPermissions.push(hostConfig.pattern);
      } else {
        console.log(`- Removed host permission: ${hostKey}`);
      }
    });
    
    // Only update if we have host permissions to set
    if (enabledHostPermissions.length > 0) {
      manifest.host_permissions = enabledHostPermissions;
      console.log(`- Set host permissions to: ${JSON.stringify(enabledHostPermissions)}`);
    } else {
      delete manifest.host_permissions;
      console.log("- Removed all host permissions");
    }
  }
  
  console.log("Feature toggles applied successfully");
}
