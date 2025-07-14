#!/usr/bin/env node

/**
 * Debug script to help identify extension ID issues
 */

const fs = require("fs");
const path = require("path");
const {
  extractPublicKeyForManifest,
  calculateExtensionId,
} = require("./extract-key");

const configPath = path.resolve(__dirname, "..", "config", "config.json");
const keysDir = path.join(__dirname, "..", "keys");

console.log("🔍 Extension ID Debug Information");
console.log("═══════════════════════════════════");

// Read config
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (error) {
  console.error("❌ Error reading config.json:", error.message);
  process.exit(1);
}

// Get parent folder name
const parentDir = path.basename(path.resolve(__dirname, "..", "."));

// Check each environment
const environments = ["dev", "uat", "prod"];

environments.forEach((env) => {
  console.log(`\n📋 ${env.toUpperCase()} Environment`);
  console.log("────────────────────");

  const pemPath = path.join(keysDir, `${parentDir}-${env}.pem`);
  const envConfig = config[env];

  if (!envConfig) {
    console.log("   ❌ Environment not configured in config.json");
    return;
  }

  console.log(
    `   📄 Config Extension ID: ${envConfig.extensionId || "Not set"}`
  );
  console.log(`   📝 Config Version: ${envConfig.version}`);
  console.log(`   🏷️  Config Prefix: ${envConfig.prefix || "None"}`);

  if (envConfig.calculatedId) {
    console.log(`   🧮 Calculated ID: ${envConfig.calculatedId}`);
  }

  // Check PEM file
  if (fs.existsSync(pemPath)) {
    console.log(`   🔑 PEM File: ✅ Found`);

    try {
      const publicKey = extractPublicKeyForManifest(pemPath);
      if (publicKey) {
        const calculatedId = calculateExtensionId(publicKey);
        console.log(`   🎯 ID from PEM: ${calculatedId}`);

        // Check for inconsistencies
        if (envConfig.extensionId && envConfig.extensionId !== calculatedId) {
          console.log(
            `   ⚠️  WARNING: Config ID (${envConfig.extensionId}) doesn't match PEM-derived ID (${calculatedId})`
          );
        }

        if (envConfig.calculatedId && envConfig.calculatedId !== calculatedId) {
          console.log(
            `   ⚠️  WARNING: Stored calculated ID (${envConfig.calculatedId}) doesn't match current PEM-derived ID (${calculatedId})`
          );
        }
      } else {
        console.log("   ❌ Failed to extract public key from PEM");
      }
    } catch (error) {
      console.log(`   ❌ Error processing PEM: ${error.message}`);
    }
  } else {
    console.log(`   🔑 PEM File: ❌ Not found at ${pemPath}`);
  }
});

// Check for duplicate extension IDs
console.log("\n🔍 Duplicate ID Check");
console.log("────────────────────");

const extensionIds = {};
let foundDuplicates = false;

environments.forEach((env) => {
  const envConfig = config[env];
  if (envConfig && envConfig.extensionId && envConfig.extensionId !== "") {
    if (extensionIds[envConfig.extensionId]) {
      console.log(
        `❌ DUPLICATE: Extension ID ${envConfig.extensionId} is used by both ${
          extensionIds[envConfig.extensionId]
        } and ${env}`
      );
      foundDuplicates = true;
    } else {
      extensionIds[envConfig.extensionId] = env;
    }
  }
});

if (!foundDuplicates) {
  const validIds = Object.keys(extensionIds);
  if (validIds.length > 0) {
    console.log(
      `✅ No duplicates found. ${validIds.length} unique extension ID(s) configured.`
    );
  } else {
    console.log("ℹ️  No extension IDs configured yet.");
  }
}

// Recommendations
console.log("\n💡 Recommendations");
console.log("──────────────────");

environments.forEach((env) => {
  const pemPath = path.join(keysDir, `${parentDir}-${env}.pem`);
  const envConfig = config[env];

  if (!fs.existsSync(pemPath)) {
    console.log(
      `🔧 Run 'cross-env NODE_ENV=${env} npm run ensure-pem' to create PEM for ${env}`
    );
  }

  if (!envConfig || !envConfig.extensionId || envConfig.extensionId === "") {
    console.log(
      `📦 Run 'npm run build:${env}' to generate extension ID for ${env}`
    );
  }
});

console.log("\n═══════════════════════════════════");
