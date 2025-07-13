# Chrome Extension Feature Customization

This document explains how to use the powerful feature customization system to configure your Chrome extension components and permissions.

## Overview

The Chrome Extension Template includes a flexible feature system that allows you to enable or disable extension components based on your specific needs. This helps keep your extension lightweight and focused on the features you actually use.

## Interactive Customization Tool

The easiest way to configure your extension is using the interactive CLI tool:

```bash
npm run customize
```

This tool provides a user-friendly interface to configure:

### Extension Components
- **Background Service Worker**: Core background processing
- **Popup UI**: Extension popup interface (React-based)
- **Options Page**: Extension settings page (React-based)
- **Side Panel**: Chrome side panel integration (React-based)
- **Offscreen Document**: For APIs requiring DOM context (React-based)
- **Content Scripts**: Scripts that run on web pages

### Content Script Configuration
When enabling content scripts, you can configure:
- **URL Patterns**: Which websites the content script should run on
- **Run At**: When the script should execute (document_start, document_end, document_idle)
- **All Frames**: Whether to inject into all frames or just the main frame

### Permissions
Configure standard Chrome extension permissions:
- **storage**: For chrome.storage API
- **activeTab**: Access to the currently active tab
- **scripting**: For chrome.scripting API
- **tabs**: For chrome.tabs API
- **sidePanel**: For chrome.sidePanel API (Chrome 114+)
- **offscreen**: For chrome.offscreen API (Chrome 109+)
- **notifications**: For chrome.notifications API
- **contextMenus**: For chrome.contextMenus API
- **alarms**: For chrome.alarms API
- **cookies**: For chrome.cookies API
- **webNavigation**: For chrome.webNavigation API
- **history**: For chrome.history API
- **bookmarks**: For chrome.bookmarks API

**Note**: Permissions must be managed manually in `manifest.json`. The feature system only controls extension components, not permissions.

### Host Permissions
Add host permissions for specific websites or patterns:
- **All URLs**: `*://*/*` (requires user permission)
- **Specific Domains**: `https://example.com/*`
- **Custom Patterns**: Add your own URL patterns

**Note**: Host permissions must be managed manually in `manifest.json`. The feature system only controls extension components, not host permissions.

## Manual Configuration

You can also manually edit the configuration files:

### Features Configuration (`src/manifest/features.json`)

```json
{
  "features": {
    "popup": { 
      "enabled": true,
      "description": "Popup UI when clicking the extension icon"
    },
    "options": { 
      "enabled": false,
      "description": "Options page for extension settings"
    },
    "sidepanel": { 
      "enabled": true,
      "description": "Side panel UI for the extension"
    },
    "offscreen": { 
      "enabled": false,
      "description": "Offscreen document for background processing"
    },
    "contentScripts": {
      "enabled": true,
      "description": "Content scripts that run on web pages",
      "matches": ["https://example.com/*"],
      "runAt": "document_idle",
      "allFrames": false
    }
  }
}
```

**Important**: This file only controls the 5 core extension components. Background service worker is always included and cannot be disabled. Permissions and host permissions must be managed directly in `manifest.json`.
```

### Environment Configuration (`src/manifest/config.json`)

This file contains environment-specific settings:

```json
{
  "dev": {
    "name": "My Extension (Dev)",
    "description": "Development version of my extension",
    "version": "0.1.0",
    "extensionId": "generated-extension-id"
  },
  "uat": {
    "name": "My Extension (UAT)",
    "description": "UAT version of my extension",
    "version": "0.1.0",
    "extensionId": "different-extension-id"
  },
  "prod": {
    "name": "My Extension",
    "description": "Production version of my extension",
    "version": "1.0.0",
    "extensionId": "production-extension-id"
  }
}
```

## How It Works

### Build Process Integration

1. **Feature Detection**: The build system reads `features.json` to determine which components to include
2. **Webpack Configuration**: Enabled components are added to webpack entry points
3. **Manifest Generation**: The manifest.json is dynamically updated based on enabled features
4. **File Copying**: Only the files for enabled components are copied to the build directory

### Manifest Generation (Non-Destructive)

The `generate-manifest.js` script uses a **non-destructive approach**:
- **Reads the existing manifest.json** as the base configuration
- **Only adds entries for enabled features** that are not already present
- **Never overrides existing entries** in the manifest
- **Preserves manual customizations** you've made to the manifest

#### Feature Addition Logic

For each enabled feature, the system checks if the corresponding manifest entry exists:

- **Popup**: Adds `action.default_popup` only if `action` doesn't exist
- **Options**: Adds `options_page` only if it doesn't exist  
- **Side Panel**: Adds `side_panel.default_path` only if `side_panel` doesn't exist
- **Content Scripts**: Adds `content_scripts` array only if it doesn't exist or is empty
- **Offscreen**: No direct manifest changes (just enables webpack entry point)

#### Example Behavior

```javascript
// If manifest.json already has:
{
  "action": {
    "default_popup": "my-custom-popup.html",
    "default_title": "My Extension"
  }
}

// And features.json has popup enabled:
{
  "features": {
    "popup": { "enabled": true }
  }
}

// Result: The existing action configuration is preserved
// The system will NOT override your custom popup path
```

### Webpack Integration

The webpack configuration automatically:
- Includes entry points for enabled components
- Excludes disabled components from the build
- Optimizes bundle size by removing unused code
- Updates HTML templates to match enabled features

## Best Practices

### Start Minimal
Begin with only the features you need:
```bash
npm run customize
# Enable only background and popup initially
# Add more features as your extension grows
```

### Environment-Specific Features
You can have different features enabled for different environments by maintaining separate feature files or using environment-specific logic.

### Permission Management
- **Extension Components**: Controlled via `features.json` (5 core components only)
- **Chrome Permissions**: Must be managed manually in `manifest.json`
- **Host Permissions**: Must be managed manually in `manifest.json`
- Be aware that some permissions require user consent
- Consider the privacy implications of each permission

### Non-Destructive Updates
- The feature system never overrides existing manifest entries
- If you manually configure `action`, `side_panel`, `options_page`, or `content_scripts` in manifest.json, those settings will be preserved
- Features only add missing entries for enabled components
- This allows for custom configurations alongside the feature system

### Testing Configuration
After changing features:
1. Rebuild your extension: `npm run build:dev`
2. Test all enabled features work correctly
3. Verify disabled features are not accessible
4. Run the full test suite: `npm run ci`

## Common Configurations

### Basic Popup Extension
```json
{
  "features": {
    "popup": { "enabled": true },
    "options": { "enabled": false },
    "sidepanel": { "enabled": false },
    "offscreen": { "enabled": false },
    "contentScripts": { "enabled": false }
  }
}
```

### Content Script Extension
```json
{
  "features": {
    "popup": { "enabled": false },
    "options": { "enabled": false },
    "sidepanel": { "enabled": false },
    "offscreen": { "enabled": false },
    "contentScripts": {
      "enabled": true,
      "matches": ["https://*/*"],
      "runAt": "document_idle"
    }
  }
}
```

### Full-Featured Extension
```json
{
  "features": {
    "popup": { "enabled": true },
    "options": { "enabled": true },
    "sidepanel": { "enabled": true },
    "offscreen": { "enabled": true },
    "contentScripts": {
      "enabled": true,
      "matches": ["*://*/*"],
      "runAt": "document_idle"
    }
  }
}
```

**Note**: Remember to manually configure permissions and host permissions in `manifest.json` as needed for your extension's functionality.

## Troubleshooting

### Feature Not Working
1. Check if the feature is enabled in `features.json`
2. Rebuild the extension: `npm run build:dev`
3. Check the generated manifest.json in the dist folder
4. Verify that the feature files exist in the build output

### Permission Denied Errors
1. Ensure the required permission is manually added to `manifest.json`
2. Check if the permission requires user consent
3. For development, try reloading the extension in Chrome
4. Note: Permissions are not controlled by the feature system

### Existing Manifest Entries Not Updated
This is expected behavior! The feature system:
- Only adds missing entries for enabled features
- Never overrides existing manifest configurations
- Preserves your manual customizations

### Build Errors
1. Verify `features.json` syntax is valid JSON
2. Check that enabled features have corresponding source files
3. Use `npm run clean` and rebuild if issues persist
4. Ensure only the 5 supported components are configured in features.json

## Advanced Usage

### Custom Features
You can extend the feature system by:
1. Adding new feature definitions to the configuration
2. Updating the webpack configuration to handle new entry points
3. Modifying the manifest generation script to handle custom permissions

### Conditional Features
Use environment variables or build flags to conditionally enable features:
```javascript
// In your build scripts
const isDev = process.env.NODE_ENV === 'development';
const features = require('./src/manifest/features.json');
if (isDev) {
  features.features.debugTools = { enabled: true };
}
```

This feature customization system provides maximum flexibility while maintaining simplicity for common use cases.
