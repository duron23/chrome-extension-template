#!/usr/bin/env node

/**
 * Watch-specific manifest preparation
 * Only updates the key property for dev environment if PEM exists
 * Does NOT update version numbers or config files
 */

const fs = require("fs");
const path = require("path");
const {
  extractPublicKeyForManifest,
  calculateExtensionId,
} = require("./extract-key");

// Get the parent folder name for the extension
const parentDir = path.basename(path.resolve(__dirname, "..", "."));

// Define paths
const manifestPath = path.resolve(
  __dirname,
  "..",
  "src",
  "manifest/manifest.json"
);
const configPath = path.resolve(__dirname, "..", "config", "config.json");
const pemPath = path.join(__dirname, "..", "keys", `${parentDir}-dev.pem`);

/**
 * Prepare manifest for watch mode
 */
const prepareWatchManifest = () => {
  console.log("🔍 Preparing manifest for watch mode...");

  // Check if dev PEM exists
  if (!fs.existsSync(pemPath)) {
    console.error("❌ Dev PEM key not found!");
    console.error(`   Expected: ${pemPath}`);
    console.error(
      "💡 Please run 'npm run build:dev' first to generate the development environment"
    );
    process.exit(1);
  }

  try {
    // Read the current manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // Extract public key from PEM
    const publicKey = extractPublicKeyForManifest(pemPath);
    if (!publicKey) {
      console.error("❌ Failed to extract public key from PEM file");
      process.exit(1);
    }

    // Calculate extension ID
    const extensionId = calculateExtensionId(publicKey);

    // Update manifest with key (same as build:dev does)
    manifest.key = publicKey;

    // Set name and description for dev environment (same as build:dev)
    const baseName = config.name || "Chrome Extension";
    const baseDescription = config.description || "A Chrome extension";
    const envConfig = config.dev;

    if (envConfig && envConfig.prefix) {
      manifest.name = `${envConfig.prefix} : ${baseName}`;
      manifest.description = `${envConfig.prefix} : ${baseDescription}`;
    } else {
      manifest.name = baseName;
      manifest.description = baseDescription;
    }

    // Write the updated manifest (atomic write)
    const tempPath = `${manifestPath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(manifest, null, 2), "utf8");
    fs.renameSync(tempPath, manifestPath);

    console.log(`✅ Watch manifest prepared with dev key`);
    console.log(`🆔 Extension ID: ${extensionId}`);
  } catch (error) {
    console.error("❌ Error preparing watch manifest:", error.message);
    process.exit(1);
  }
};

// Execute
prepareWatchManifest();
