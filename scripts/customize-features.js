/**
 * Interactive CLI tool to customize extension features
 * This script helps users enable/disable features of the Chrome extension
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");

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

// Path to the features configuration file
const featuresPath = path.resolve(__dirname, "..", "config", "features.json");
const baseManifestPath = path.resolve(
  __dirname,
  "..",
  "src",
  "manifest",
  "manifest.json"
);

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ANSI color codes for better UX
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Load the features config file
 */
function loadFeaturesConfig() {
  try {
    if (fs.existsSync(featuresPath)) {
      return JSON.parse(fs.readFileSync(featuresPath, "utf8"));
    } else {
      console.log(
        `${colors.yellow}No features.json found. Creating a default configuration.${colors.reset}`
      );
      return createDefaultConfig();
    }
  } catch (error) {
    console.error(
      `${colors.red}Error loading features configuration: ${error.message}${colors.reset}`
    );
    return createDefaultConfig();
  }
}

/**
 * Create default features configuration based on manifest.json
 * NOTE: Only the 5 core components are customizable: popup, options, sidepanel, offscreen, contentScripts
 * Permissions and host_permissions are managed separately and should not be modified here
 */
function createDefaultConfig() {
  const defaultConfig = {
    features: {
      popup: {
        enabled: true,
        description: "Popup UI when clicking the extension icon",
      },
      options: {
        enabled: true,
        description: "Options page for extension settings",
      },
      sidepanel: {
        enabled: true,
        description: "Side panel UI for the extension",
      },
      offscreen: {
        enabled: true,
        description: "Offscreen document for background processing",
      },
      contentScripts: {
        enabled: true,
        description: "Content scripts that run on web pages",
        matches: ["http://localhost/*"],
      },
    },
  };

  // Try to load manifest to adjust default config
  try {
    if (fs.existsSync(baseManifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(baseManifestPath, "utf8"));

      // Update based on manifest - only for the 5 customizable components
      if (!manifest.action) defaultConfig.features.popup.enabled = false;
      if (!manifest.options_page)
        defaultConfig.features.options.enabled = false;
      if (!manifest.side_panel)
        defaultConfig.features.sidepanel.enabled = false;

      // Update content scripts
      if (manifest.content_scripts && manifest.content_scripts.length > 0) {
        defaultConfig.features.contentScripts.matches = manifest
          .content_scripts[0].matches || ["http://localhost/*"];
      } else {
        defaultConfig.features.contentScripts.enabled = false;
      }
    }
  } catch (error) {
    console.error(
      `${colors.yellow}Warning: Could not read manifest.json. Using pure defaults.${colors.reset}`
    );
  }

  return defaultConfig;
}

/**
 * Save the features config to file with atomic operation and locking
 */
async function saveFeaturesConfig(config) {
  const releaseLock = await acquireFileLock(featuresPath);
  try {
    atomicWriteFile(featuresPath, JSON.stringify(config, null, 2));
    console.log(
      `${colors.green}✓ Configuration saved to ${featuresPath}${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}Error saving configuration: ${error.message}${colors.reset}`
    );
  } finally {
    releaseLock();
  }
}

/**
 * Show menu to customize features
 */
async function showMainMenu(config) {
  console.log(
    `\n${colors.bright}${colors.cyan}CHROME EXTENSION FEATURE CUSTOMIZER${colors.reset}`
  );
  console.log(
    `${colors.cyan}═══════════════════════════════════${colors.reset}\n`
  );
  console.log("Select an option:");
  console.log(
    `${colors.bright}1. Customize Extension Components${colors.reset}`
  );
  console.log(`${colors.bright}2. Save and Exit${colors.reset}`);
  console.log(`${colors.bright}3. Exit without Saving${colors.reset}`);
  console.log(
    `\n${colors.yellow}Note: Only the 5 core components are customizable.${colors.reset}`
  );
  console.log(
    `${colors.yellow}Permissions and host permissions must be managed in manifest.json directly.${colors.reset}`
  );

  rl.question("\nChoice: ", async (answer) => {
    switch (answer.trim()) {
      case "1":
        await showFeaturesMenu(config);
        break;
      case "2":
        await saveFeaturesConfig(config);
        console.log(
          `\n${colors.bright}${colors.green}Configuration saved! Now run a build to apply changes:${colors.reset}`
        );
        console.log(`npm run build:dev\n`);
        rl.close();
        break;
      case "3":
        console.log(`${colors.yellow}Exited without saving.${colors.reset}`);
        rl.close();
        break;
      default:
        console.log(
          `${colors.red}Invalid choice. Please try again.${colors.reset}`
        );
        await showMainMenu(config);
    }
  });
}

/**
 * Show menu to customize extension components
 * Only the 5 core components are customizable: popup, options, sidepanel, offscreen, contentScripts
 */
async function showFeaturesMenu(config) {
  console.log(
    `\n${colors.bright}${colors.cyan}EXTENSION COMPONENTS${colors.reset}`
  );
  console.log(`${colors.cyan}═══════════════════${colors.reset}\n`);
  console.log(
    `${colors.yellow}Note: Only these 5 components can be customized:${colors.reset}`
  );

  const features = config.features;
  const options = Object.keys(features);

  options.forEach((key, index) => {
    const feature = features[key];
    const status = feature.enabled
      ? `${colors.green}Enabled${colors.reset}`
      : `${colors.red}Disabled${colors.reset}`;
    console.log(
      `${colors.bright}${index + 1}. ${key}${colors.reset} [${status}]`
    );
    console.log(`   ${feature.description}`);
  });

  console.log(
    `\n${colors.bright}${options.length + 1}. Back to main menu${colors.reset}`
  );

  rl.question('\nToggle feature (or "back"): ', async (answer) => {
    if (
      answer.toLowerCase() === "back" ||
      answer === (options.length + 1).toString()
    ) {
      await showMainMenu(config);
      return;
    }

    const index = parseInt(answer) - 1;
    if (isNaN(index) || index < 0 || index >= options.length) {
      console.log(
        `${colors.red}Invalid choice. Please try again.${colors.reset}`
      );
      await showFeaturesMenu(config);
      return;
    }

    const key = options[index];
    features[key].enabled = !features[key].enabled;

    // Special case for content scripts - ask for matches if enabled
    if (key === "contentScripts" && features[key].enabled) {
      rl.question(
        "\nEnter comma-separated URL patterns for content scripts (e.g., http://localhost/*,https://*.example.com/*): ",
        async (patterns) => {
          if (patterns.trim()) {
            features[key].matches = patterns.split(",").map((p) => p.trim());
          }
          await showFeaturesMenu(config);
        }
      );
    } else {
      await showFeaturesMenu(config);
    }
  });
}

// Main execution - wrapped in async function
(async () => {
  console.log(
    `${colors.bright}${colors.cyan}Chrome Extension Feature Customizer${colors.reset}`
  );
  console.log(
    `${colors.cyan}This utility helps you customize which of the 5 core components your extension will include.${colors.reset}`
  );
  console.log(
    `${colors.yellow}Note: Permissions and host permissions must be managed directly in manifest.json${colors.reset}`
  );

  const featuresConfig = loadFeaturesConfig();
  await showMainMenu(featuresConfig);
})().catch((error) => {
  console.error("Error in customize-features:", error);
  process.exit(1);
});
