const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { parseString, Builder } = require("xml2js");
const { extractPublicKeyForManifest } = require("./extract-key");

// Determine the environment (dev, uat, or prod)
const env = process.env.NODE_ENV || "dev";
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

// Extract public key from PEM file if it exists
if (fs.existsSync(pemPath)) {
  const publicKey = extractPublicKeyForManifest(pemPath);
  if (publicKey) {
    // Add the key to the manifest
    manifest.key = publicKey;
    console.log("Added public key to manifest from existing PEM file");
    
    // Store the extension ID in the config if it's not already set
    if (!config[env].extensionId) {
      // The ID can be derived from the public key if needed
      // For now, we'll just indicate that it's managed by the PEM file
      config[env].extensionId = "managed-by-pem";
      console.log("Updated config with extension ID indicator");
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
  if (err) throw err;
  parseString(data, (err, result) => {
    if (err) throw err;

    // Modify the XML structure
    result.gupdate.app[0].$.appid = getExtensionId(); // Set appid on the app tag
    result.gupdate.app[0].updatecheck[0].$.version = manifest.version;
    
    // Remove duplicate appid from updatecheck if it exists
    if (result.gupdate.app[0].updatecheck[0].$.appid !== undefined) {
      delete result.gupdate.app[0].updatecheck[0].$.appid;
    }

    // Write the updated XML back to the file
    const builder = new Builder();
    const updatedXml = builder.buildObject(result);
    fs.writeFileSync(xmlFilePath, updatedXml, "utf8");

    console.log(`XML file updated with version: ${manifest.version}`);
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

function getExtensionId() {
  const envKey = env;
  if (config[envKey]) {
    return config[envKey].extensionId;
  } else {
    throw new Error("Invalid extensionId or environment");
  }
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
