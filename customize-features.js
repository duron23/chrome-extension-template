/**
 * Interactive CLI tool to customize extension features
 * This script helps users enable/disable features of the Chrome extension
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Path to the features configuration file
const featuresPath = path.resolve(__dirname, 'src', 'manifest', 'features.json');
const baseManifestPath = path.resolve(__dirname, 'src', 'manifest', 'manifest.json');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for better UX
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Load the features config file
 */
function loadFeaturesConfig() {
  try {
    if (fs.existsSync(featuresPath)) {
      return JSON.parse(fs.readFileSync(featuresPath, 'utf8'));
    } else {
      console.log(`${colors.yellow}No features.json found. Creating a default configuration.${colors.reset}`);
      return createDefaultConfig();
    }
  } catch (error) {
    console.error(`${colors.red}Error loading features configuration: ${error.message}${colors.reset}`);
    return createDefaultConfig();
  }
}

/**
 * Create default features configuration based on manifest.json
 */
function createDefaultConfig() {
  const defaultConfig = {
    features: {
      background: { enabled: true, description: "Background service worker for extension logic" },
      popup: { enabled: true, description: "Popup UI when clicking the extension icon" },
      options: { enabled: true, description: "Options page for extension settings" },
      sidepanel: { enabled: true, description: "Side panel UI for the extension" },
      offscreen: { enabled: true, description: "Offscreen document for background processing" },
      contentScripts: { 
        enabled: true, 
        description: "Content scripts that run on web pages",
        matches: ["http://localhost/*"]
      }
    },
    permissions: {
      storage: { enabled: true, description: "Access to extension storage" },
      sidePanel: { enabled: true, description: "Required for side panel functionality" },
      offscreen: { enabled: true, description: "Required for offscreen functionality" }
    },
    hostPermissions: {
      localhost: {
        enabled: true,
        pattern: "http://localhost/*",
        description: "Access to localhost for development"
      }
    }
  };
  
  // Try to load manifest to adjust default config
  try {
    if (fs.existsSync(baseManifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(baseManifestPath, 'utf8'));
      
      // Update based on manifest
      if (!manifest.background) defaultConfig.features.background.enabled = false;
      if (!manifest.action) defaultConfig.features.popup.enabled = false;
      if (!manifest.options_page) defaultConfig.features.options.enabled = false;
      if (!manifest.side_panel) defaultConfig.features.sidepanel.enabled = false;
      
      // Update permissions
      if (manifest.permissions) {
        for (const perm of Object.keys(defaultConfig.permissions)) {
          defaultConfig.permissions[perm].enabled = manifest.permissions.includes(perm);
        }
      }
      
      // Update host permissions
      if (manifest.host_permissions) {
        for (const hostKey of Object.keys(defaultConfig.hostPermissions)) {
          const pattern = defaultConfig.hostPermissions[hostKey].pattern;
          defaultConfig.hostPermissions[hostKey].enabled = 
            manifest.host_permissions.some(p => p === pattern);
        }
        
        // Add any additional host permissions from manifest
        manifest.host_permissions.forEach(pattern => {
          let exists = false;
          for (const hostKey of Object.keys(defaultConfig.hostPermissions)) {
            if (defaultConfig.hostPermissions[hostKey].pattern === pattern) {
              exists = true;
              break;
            }
          }
          
          if (!exists) {
            const key = pattern.replace(/[^a-zA-Z0-9]/g, '_');
            defaultConfig.hostPermissions[key] = {
              enabled: true,
              pattern: pattern,
              description: `Access to ${pattern}`
            };
          }
        });
      }
      
      // Update content scripts
      if (manifest.content_scripts && manifest.content_scripts.length > 0) {
        defaultConfig.features.contentScripts.matches = manifest.content_scripts[0].matches || ["http://localhost/*"];
      } else {
        defaultConfig.features.contentScripts.enabled = false;
      }
    }
  } catch (error) {
    console.error(`${colors.yellow}Warning: Could not read manifest.json. Using pure defaults.${colors.reset}`);
  }
  
  return defaultConfig;
}

/**
 * Save the features config to file
 */
function saveFeaturesConfig(config) {
  try {
    fs.writeFileSync(featuresPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`${colors.green}✓ Configuration saved to ${featuresPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error saving configuration: ${error.message}${colors.reset}`);
  }
}

/**
 * Show menu to customize features
 */
function showMainMenu(config) {
  console.log(`\n${colors.bright}${colors.cyan}CHROME EXTENSION FEATURE CUSTOMIZER${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}\n`);
  console.log('Select a category to customize:');
  console.log(`${colors.bright}1. Extension Components${colors.reset}`);
  console.log(`${colors.bright}2. Permissions${colors.reset}`);
  console.log(`${colors.bright}3. Host Permissions${colors.reset}`);
  console.log(`${colors.bright}4. Save and Exit${colors.reset}`);
  console.log(`${colors.bright}5. Exit without Saving${colors.reset}`);
  
  rl.question('\nChoice: ', (answer) => {
    switch (answer.trim()) {
      case '1':
        showFeaturesMenu(config);
        break;
      case '2':
        showPermissionsMenu(config);
        break;
      case '3':
        showHostPermissionsMenu(config);
        break;
      case '4':
        saveFeaturesConfig(config);
        console.log(`\n${colors.bright}${colors.green}Configuration saved! Now run a build to apply changes:${colors.reset}`);
        console.log(`npm run build:dev\n`);
        rl.close();
        break;
      case '5':
        console.log(`${colors.yellow}Exited without saving.${colors.reset}`);
        rl.close();
        break;
      default:
        console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
        showMainMenu(config);
    }
  });
}

/**
 * Show menu to customize extension components
 */
function showFeaturesMenu(config) {
  console.log(`\n${colors.bright}${colors.cyan}EXTENSION COMPONENTS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════${colors.reset}\n`);
  
  const features = config.features;
  const options = Object.keys(features);
  
  options.forEach((key, index) => {
    const feature = features[key];
    const status = feature.enabled ? 
      `${colors.green}Enabled${colors.reset}` : 
      `${colors.red}Disabled${colors.reset}`;
    console.log(`${colors.bright}${index + 1}. ${key}${colors.reset} [${status}]`);
    console.log(`   ${feature.description}`);
  });
  
  console.log(`\n${colors.bright}${options.length + 1}. Back to main menu${colors.reset}`);
  
  rl.question('\nToggle feature (or "back"): ', (answer) => {
    if (answer.toLowerCase() === 'back' || answer === (options.length + 1).toString()) {
      showMainMenu(config);
      return;
    }
    
    const index = parseInt(answer) - 1;
    if (isNaN(index) || index < 0 || index >= options.length) {
      console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
      showFeaturesMenu(config);
      return;
    }
    
    const key = options[index];
    features[key].enabled = !features[key].enabled;
    
    // Special case for content scripts - ask for matches if enabled
    if (key === 'contentScripts' && features[key].enabled) {
      rl.question('\nEnter comma-separated URL patterns for content scripts (e.g., http://localhost/*,https://*.example.com/*): ', 
        (patterns) => {
          if (patterns.trim()) {
            features[key].matches = patterns.split(',').map(p => p.trim());
          }
          showFeaturesMenu(config);
        });
    } else {
      showFeaturesMenu(config);
    }
  });
}

/**
 * Show menu to customize permissions
 */
function showPermissionsMenu(config) {
  console.log(`\n${colors.bright}${colors.cyan}PERMISSIONS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════${colors.reset}\n`);
  
  const permissions = config.permissions;
  const options = Object.keys(permissions);
  
  options.forEach((key, index) => {
    const permission = permissions[key];
    const status = permission.enabled ? 
      `${colors.green}Enabled${colors.reset}` : 
      `${colors.red}Disabled${colors.reset}`;
    console.log(`${colors.bright}${index + 1}. ${key}${colors.reset} [${status}]`);
    console.log(`   ${permission.description}`);
  });
  
  console.log(`\n${colors.bright}${options.length + 1}. Add new permission${colors.reset}`);
  console.log(`${colors.bright}${options.length + 2}. Back to main menu${colors.reset}`);
  
  rl.question('\nToggle permission (or "back"): ', (answer) => {
    if (answer.toLowerCase() === 'back' || answer === (options.length + 2).toString()) {
      showMainMenu(config);
      return;
    }
    
    if (answer === (options.length + 1).toString()) {
      addNewPermission(config);
      return;
    }
    
    const index = parseInt(answer) - 1;
    if (isNaN(index) || index < 0 || index >= options.length) {
      console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
      showPermissionsMenu(config);
      return;
    }
    
    const key = options[index];
    permissions[key].enabled = !permissions[key].enabled;
    showPermissionsMenu(config);
  });
}

/**
 * Show menu to customize host permissions
 */
function showHostPermissionsMenu(config) {
  console.log(`\n${colors.bright}${colors.cyan}HOST PERMISSIONS${colors.reset}`);
  console.log(`${colors.cyan}═════════════════${colors.reset}\n`);
  
  const hostPermissions = config.hostPermissions;
  const options = Object.keys(hostPermissions);
  
  options.forEach((key, index) => {
    const hostPerm = hostPermissions[key];
    const status = hostPerm.enabled ? 
      `${colors.green}Enabled${colors.reset}` : 
      `${colors.red}Disabled${colors.reset}`;
    console.log(`${colors.bright}${index + 1}. ${key}${colors.reset} [${status}]`);
    console.log(`   Pattern: ${hostPerm.pattern}`);
    console.log(`   ${hostPerm.description}`);
  });
  
  console.log(`\n${colors.bright}${options.length + 1}. Add new host permission${colors.reset}`);
  console.log(`${colors.bright}${options.length + 2}. Back to main menu${colors.reset}`);
  
  rl.question('\nToggle host permission (or "back"): ', (answer) => {
    if (answer.toLowerCase() === 'back' || answer === (options.length + 2).toString()) {
      showMainMenu(config);
      return;
    }
    
    if (answer === (options.length + 1).toString()) {
      addNewHostPermission(config);
      return;
    }
    
    const index = parseInt(answer) - 1;
    if (isNaN(index) || index < 0 || index >= options.length) {
      console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
      showHostPermissionsMenu(config);
      return;
    }
    
    const key = options[index];
    hostPermissions[key].enabled = !hostPermissions[key].enabled;
    showHostPermissionsMenu(config);
  });
}

/**
 * Add a new permission
 */
function addNewPermission(config) {
  rl.question('\nEnter the new permission name (e.g., "tabs", "cookies"): ', (name) => {
    if (!name.trim()) {
      console.log(`${colors.red}Permission name cannot be empty.${colors.reset}`);
      showPermissionsMenu(config);
      return;
    }
    
    rl.question('Enter a description for this permission: ', (description) => {
      description = description.trim() || `Permission to use the ${name} API`;
      
      config.permissions[name] = {
        enabled: true,
        description: description
      };
      
      console.log(`${colors.green}✓ Added permission: ${name}${colors.reset}`);
      showPermissionsMenu(config);
    });
  });
}

/**
 * Add a new host permission
 */
function addNewHostPermission(config) {
  rl.question('\nEnter the URL pattern (e.g., "https://*.example.com/*"): ', (pattern) => {
    if (!pattern.trim()) {
      console.log(`${colors.red}Pattern cannot be empty.${colors.reset}`);
      showHostPermissionsMenu(config);
      return;
    }
    
    rl.question('Enter a name for this host permission: ', (name) => {
      name = name.trim() || pattern.replace(/[^a-zA-Z0-9]/g, '_');
      
      rl.question('Enter a description for this host permission: ', (description) => {
        description = description.trim() || `Access to ${pattern}`;
        
        config.hostPermissions[name] = {
          enabled: true,
          pattern: pattern,
          description: description
        };
        
        console.log(`${colors.green}✓ Added host permission: ${pattern}${colors.reset}`);
        showHostPermissionsMenu(config);
      });
    });
  });
}

// Main execution
console.log(`${colors.bright}${colors.cyan}Chrome Extension Feature Customizer${colors.reset}`);
console.log(`${colors.cyan}This utility helps you customize which features your extension will include.${colors.reset}`);

const featuresConfig = loadFeaturesConfig();
showMainMenu(featuresConfig);
