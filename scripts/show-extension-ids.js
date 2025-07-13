/**
 * Extension ID Information Display
 *
 * This utility shows the current extension ID configuration for all environments
 * and helps verify consistency between configured IDs and PEM-derived IDs.
 */
const fs = require("fs");
const path = require("path");
const {
  extractPublicKeyForManifest,
  calculateExtensionId,
} = require("./extract-key");

// Path to the config file
const configFilePath = path.resolve(__dirname, "..", "config", "config.json");

// Check if the config file exists
if (!fs.existsSync(configFilePath)) {
  console.error("❌ Config file not found:", configFilePath);
  process.exit(1);
}

// Read the config file
const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));

// Get the project directory name
const projectDir = path.basename(path.resolve(__dirname, ".."));

console.log("🆔 Extension ID Information");
console.log("═══════════════════════════");

// Process each environment
["dev", "uat", "prod"].forEach((env) => {
  console.log(`\n📋 ${env.toUpperCase()} Environment`);
  console.log("─".repeat(20));

  // Get the configured extension ID
  const configuredId = config[env]?.extensionId || "Not configured";
  console.log(`   Configured ID: ${configuredId}`);

  // Check if we have a PEM file for this environment
  const pemPath = path.join(
    __dirname,
    "..",
    "keys",
    `${projectDir}-${env}.pem`
  );
  const hasPem = fs.existsSync(pemPath);

  if (hasPem) {
    const publicKey = extractPublicKeyForManifest(pemPath);
    const calculatedId = calculateExtensionId(publicKey);

    console.log(`   PEM Status: ✅ Found`);
    console.log(
      `   Calculated ID: ${calculatedId || "❌ Could not calculate"}`
    );

    // Check if the ID matches what's in config
    if (
      configuredId !== "managed-by-pem" &&
      configuredId !== calculatedId &&
      calculatedId
    ) {
      console.log(
        "   ⚠️  WARNING: Configured ID does not match PEM-derived ID!"
      );
    } else if (calculatedId) {
      console.log("   ✅ ID consistency verified");
    }
  } else {
    console.log(`   PEM Status: ❌ Not found`);
    console.log("   📝 ID will be generated when packaging");
  }
});

console.log("\n═══════════════════════════");
console.log("📖 Usage Information");
console.log("═══════════════════════════");
console.log("To ensure consistent extension IDs across builds:");
console.log("");
console.log("🏗️  Build Commands:");
console.log("   npm run build:dev   # Development build with packaging");
console.log("   npm run build:uat   # UAT build with packaging");
console.log("   npm run build:prod  # Production build with packaging");
console.log("");
console.log("🔑 Key Management:");
console.log("   • PEM files are automatically created in keys/ directory");
console.log("   • Extension IDs are derived from PEM keys for consistency");
console.log("   • Same ID for both unpacked and CRX installations");
console.log("");
