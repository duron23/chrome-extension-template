#!/usr/bin/env node
/**
 * reset-extension.js
 *
 * This script resets the extension template to a clean state by:
 * 1. Resetting name and description to template defaults
 * 2. Resetting version numbers in config.json
 * 3. Clearing extension IDs in config.json
 * 4. Deleting PEM files
 * 5. Removing the key from manifest.json
 * 6. Clearing appid in manifest.xml
 * 7. Optionally, clearing the dist directory
 *
 * This script is designed for template distribution and fresh project starts.
 * Use this when preparing the template for sharing or starting a new project.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

// File locking utilities
const lockFile = require("proper-lockfile");

// Check for command line arguments
const args = process.argv.slice(2);
const isAutoMode = args.includes("--auto") || args.includes("-a");

// Create readline interface for user input (only if not in auto mode)
const rl = !isAutoMode
  ? readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
  : null;

// File paths
const configPath = path.join(__dirname, "..", "config", "config.json");
const manifestJsonPath = path.join(
  __dirname,
  "..",
  "src",
  "manifest",
  "manifest.json"
);
const manifestXmlPath = path.join(__dirname, "..", "config", "manifest.xml");
const packagePath = path.join(__dirname, "..", "package.json");
const packageLockPath = path.join(__dirname, "..", "package-lock.json");
const keysDir = path.join(__dirname, "..", "keys");
const distDir = path.join(__dirname, "..", "dist");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Print banner
console.log(colors.cyan);
console.log("┌─────────────────────────────────────────────────┐");
console.log("│               EXTENSION RESET                   │");
console.log("│                                                 │");
console.log("│  This script will reset your extension to a     │");
console.log("│  clean state by removing all generated IDs,     │");
console.log("│  keys, version increments, and resetting        │");
console.log("│  name/description to defaults.                  │");
console.log("└─────────────────────────────────────────────────┘");
console.log(colors.reset);

// If in auto mode, skip confirmation and directly perform cleanup
if (isAutoMode) {
  console.log(colors.cyan + "Running in automatic mode..." + colors.reset);
  performCleanup(false)
    .then(() => {
      console.log(
        colors.green + "✅ Reset completed automatically" + colors.reset
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error(
        colors.red + "❌ Reset failed: " + error.message + colors.reset
      );
      process.exit(1);
    });
} else {
  // Ask for confirmation
  rl.question(
    colors.yellow +
      "This will reset the template to clean defaults (name, IDs, versions, keys). Continue? (y/n): " +
      colors.reset,
    (answer) => {
      if (answer.toLowerCase() !== "y") {
        console.log(colors.blue + "Reset cancelled." + colors.reset);
        rl.close();
        return;
      }

      // Ask about clearing dist directory
      rl.question(
        colors.yellow +
          "Do you also want to clear the dist directory? (y/n): " +
          colors.reset,
        async (clearDist) => {
          const shouldClearDist = clearDist.toLowerCase() === "y";
          await performCleanup(shouldClearDist);
          rl.close();
        }
      );
    }
  );
}

/**
 * Safely write file content with atomic operation and locking
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 */
async function safeWriteFile(filePath, content) {
  const tempPath = filePath + ".tmp";
  let release;

  try {
    // Acquire lock
    release = await lockFile.lock(filePath, {
      retries: {
        retries: 10,
        factor: 2,
        minTimeout: 100,
        maxTimeout: 1000,
      },
    });

    // Write to temp file first
    fs.writeFileSync(tempPath, content, "utf8");

    // Atomic rename
    fs.renameSync(tempPath, filePath);
  } finally {
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    // Release lock
    if (release) {
      await release();
    }
  }
}

/**
 * Safely read and parse JSON file with locking
 * @param {string} filePath - Path to the JSON file
 * @returns {Object} Parsed JSON object
 */
async function safeReadJson(filePath) {
  let release;

  try {
    // Acquire lock for reading
    release = await lockFile.lock(filePath, {
      retries: {
        retries: 10,
        factor: 2,
        minTimeout: 100,
        maxTimeout: 1000,
      },
    });

    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } finally {
    // Release lock
    if (release) {
      await release();
    }
  }
}

async function performCleanup(clearDistDir) {
  console.log(colors.cyan + "\nStarting cleanup process..." + colors.reset);
  let success = true;

  try {
    // 1. Reset config.json
    console.log("Resetting config.json...");
    if (fs.existsSync(configPath)) {
      const config = await safeReadJson(configPath);

      // Reset all environments
      const environments = ["dev", "uat", "prod"];
      environments.forEach((env) => {
        if (config[env]) {
          config[env].extensionId = "";
          config[env].version = "0.0.0"; // Consistently use 0.0.0 for all environments
          // Remove calculatedId property if it exists (legacy)
          if (config[env].calculatedId) {
            delete config[env].calculatedId;
          }
        }
      });

      // Reset name and description to defaults
      config.name = "Chrome Extension Template";
      config.description =
        "A modern Chrome extension template with comprehensive tooling";

      // Write back the updated config
      await safeWriteFile(configPath, JSON.stringify(config, null, 2));
      console.log(
        colors.green +
          "✅ Config reset successfully (including name and description)" +
          colors.reset
      );
    } else {
      console.log(
        colors.yellow + "⚠ config.json not found, skipping" + colors.reset
      );
    }

    // 2. Remove key from manifest.json and reset version
    console.log("Removing key and resetting version in manifest.json...");
    if (fs.existsSync(manifestJsonPath)) {
      const manifest = await safeReadJson(manifestJsonPath);

      // Reset the version to 0.0.0
      manifest.version = "0.0.0";

      // Remove the key property if it exists
      if (manifest.key) {
        delete manifest.key;
        console.log(
          colors.green + "✅ Key removed from manifest.json" + colors.reset
        );
      } else {
        console.log(
          colors.yellow + "⚠ No key found in manifest.json" + colors.reset
        );
      }

      // Write the updated manifest back
      await safeWriteFile(manifestJsonPath, JSON.stringify(manifest, null, 2));
      console.log(
        colors.green + "✅ Version reset in manifest.json" + colors.reset
      );
    } else {
      console.log(
        colors.yellow + "⚠ manifest.json not found, skipping" + colors.reset
      );
    }

    // 3. Reset package.json name and description
    console.log("Resetting package.json name and description...");
    if (fs.existsSync(packagePath)) {
      const packageJson = await safeReadJson(packagePath);

      // Reset name and description
      packageJson.name = "chrome-extension-template";
      packageJson.description =
        "A modern Chrome extension template with comprehensive tooling";

      // Write back the updated package.json
      await safeWriteFile(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(
        colors.green + "✅ Package.json reset successfully" + colors.reset
      );
    } else {
      console.log(
        colors.yellow + "⚠ package.json not found, skipping" + colors.reset
      );
    }

    // 4. Reset package-lock.json name
    console.log("Resetting package-lock.json name...");
    if (fs.existsSync(packageLockPath)) {
      const packageLockJson = await safeReadJson(packageLockPath);

      // Reset name
      packageLockJson.name = "chrome-extension-template";
      if (packageLockJson.packages && packageLockJson.packages[""]) {
        packageLockJson.packages[""].name = "chrome-extension-template";
      }

      // Write back the updated package-lock.json
      await safeWriteFile(
        packageLockPath,
        JSON.stringify(packageLockJson, null, 2)
      );
      console.log(
        colors.green + "✅ Package-lock.json reset successfully" + colors.reset
      );
    } else {
      console.log(
        colors.yellow + "⚠ package-lock.json not found, skipping" + colors.reset
      );
    }

    // 5. Clear appid in manifest.xml and reset version
    console.log(
      "Clearing extension ID and resetting version in manifest.xml..."
    );
    if (fs.existsSync(manifestXmlPath)) {
      try {
        // Import xml2js on demand to avoid adding a dependency to the script
        const xml2js = require("xml2js");
        const Builder = xml2js.Builder;

        // Read XML content with locking
        let release;
        try {
          release = await lockFile.lock(manifestXmlPath, {
            retries: {
              retries: 10,
              factor: 2,
              minTimeout: 100,
              maxTimeout: 1000,
            },
          });

          const xmlContent = fs.readFileSync(manifestXmlPath, "utf8");

          // Parse XML content
          let result;
          xml2js.parseString(xmlContent, (err, res) => {
            if (err) throw err;
            result = res;
          });

          // Clear the appid
          if (
            result &&
            result.gupdate &&
            result.gupdate.app &&
            result.gupdate.app[0] &&
            result.gupdate.app[0].$
          ) {
            result.gupdate.app[0].$.appid = "";
          }

          // Reset the version to 0.0.0 in the updatecheck tag
          if (
            result &&
            result.gupdate &&
            result.gupdate.app &&
            result.gupdate.app[0] &&
            result.gupdate.app[0].updatecheck &&
            result.gupdate.app[0].updatecheck[0] &&
            result.gupdate.app[0].updatecheck[0].$
          ) {
            result.gupdate.app[0].updatecheck[0].$.version = "0.0.0";
          }

          // Convert back to XML string
          const builder = new Builder();
          const updatedXml = builder.buildObject(result);

          // Write back to file atomically
          const tempPath = manifestXmlPath + ".tmp";
          fs.writeFileSync(tempPath, updatedXml, "utf8");
          fs.renameSync(tempPath, manifestXmlPath);

          console.log(
            colors.green +
              "✅ Extension ID cleared and version reset in manifest.xml" +
              colors.reset
          );
        } finally {
          if (release) {
            await release();
          }
        }
      } catch (error) {
        console.error(
          colors.red +
            `❌ Error updating manifest.xml: ${error.message}` +
            colors.reset
        );
        console.log(
          colors.yellow +
            "💡 You may need to install xml2js: npm install xml2js" +
            colors.reset
        );
      }
    } else {
      console.log(
        colors.yellow + "⚠ manifest.xml not found, skipping" + colors.reset
      );
    }

    // 6. Delete all PEM files
    console.log("Deleting PEM files...");
    if (fs.existsSync(keysDir)) {
      const pemFiles = fs
        .readdirSync(keysDir)
        .filter((file) => file.endsWith(".pem"));

      if (pemFiles.length > 0) {
        pemFiles.forEach((file) => {
          const filePath = path.join(keysDir, file);
          fs.unlinkSync(filePath);
          console.log(colors.green + `✅ Deleted ${file}` + colors.reset);
        });
      } else {
        console.log(
          colors.yellow + "⚠ No PEM files found, skipping" + colors.reset
        );
      }
    } else {
      console.log(
        colors.yellow + "⚠ Keys directory not found, skipping" + colors.reset
      );
    }

    // 7. Optionally clear the dist directory
    if (clearDistDir && fs.existsSync(distDir)) {
      console.log("Clearing dist directory...");

      // Use rimraf if available, otherwise use native fs
      try {
        execSync("npx rimraf dist");
        console.log(colors.green + "✅ Dist directory cleared" + colors.reset);
      } catch (e) {
        // Fallback to recursive directory deletion
        deleteDirectory(distDir);
        console.log(
          colors.green +
            "✅ Dist directory cleared (using fallback method)" +
            colors.reset
        );
      }
    }
  } catch (error) {
    console.error(
      colors.red + `❌ Error during cleanup: ${error.message}` + colors.reset
    );
    success = false;
  }

  if (success) {
    console.log(
      colors.green + "\n✅ Reset completed successfully! 🎉" + colors.reset
    );
    console.log("Your extension template has been reset to a clean state.");
    console.log('Use "npm run customize" to configure your project settings.');
  } else {
    console.log(
      colors.red +
        "\n❌ Reset encountered some errors. Please check the output above." +
        colors.reset
    );
  }
}

// Helper function to recursively delete a directory
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const currentPath = path.join(dirPath, file);
      if (fs.statSync(currentPath).isDirectory()) {
        deleteDirectory(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}
