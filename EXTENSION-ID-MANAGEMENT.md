# Chrome Extension ID Management

This document explains how extension IDs are managed in this project to ensure consistency across both packed and unpacked installations.

## How Extension IDs Work

Chrome extension IDs are generated in different ways depending on how the extension is loaded:

1. **Packed Extensions:** The ID is derived from the public key in the `.crx` file
2. **Unpacked Extensions:** By default, the ID is generated randomly each time the extension is loaded

## Our Solution

To ensure the extension ID remains consistent for both packed and unpacked installations, we:

1. Store private key (PEM) files in the `keys/` directory
2. Extract the public key from the PEM and insert it into the manifest as the `key` property
3. Calculate the extension ID from the public key
4. Use the extension ID directly in `config.json` and `manifest.xml`

## How It Works

### 1. PEM Key Storage

PEM files are stored in the `keys/` directory with environment-specific names:
- `keys/chrome-extension-template-dev.pem` (for development)
- `keys/chrome-extension-template-uat.pem` (for UAT)
- `keys/chrome-extension-template-prod.pem` (for production)

### 2. Key Extraction and ID Calculation

The `extract-key.js` module:
- Extracts the public key from the PEM file
- Converts it to the format required by Chrome
- Calculates the actual extension ID using Chrome's algorithm

### 3. Configuration Management

The `config.json` file now stores the extension ID directly:
- The `extensionId` field contains the explicit ID value used in manifest.xml
- The `calculatedId` field stores the ID calculated from the PEM's public key

### 4. Build Process Improvements

We've added several safeguards to handle first-time builds:

1. **ensure-pem.js**: Pre-build script that:
   - Creates a PEM file if it doesn't exist
   - Extracts the public key and calculates the extension ID
   - Updates config.json with the extension ID

2. **Modified generate-manifest.js**: 
   - Now prioritizes the explicit extension ID in config.json
   - Falls back to calculated ID if needed
   - Updates both manifest.json and manifest.xml consistently

3. **Modified pack-extension.js**:
   - Ensures PEM exists before packaging
   - Uses the PEM to maintain consistent extension IDs

## How to Use

You don't need to manually manage extension IDs. The build system handles everything for you:

```
npm run build:dev   # Builds with consistent dev extension ID
npm run build:uat   # Builds with consistent UAT extension ID
npm run build:prod  # Builds with consistent production extension ID
```

Even when running after a clean, the system will automatically:
1. Generate a new PEM file if needed
2. Calculate the extension ID from the PEM
3. Update config.json, manifest.json, and manifest.xml
4. Ensure consistent IDs throughout the build process

## Understanding Config Files

The `config.json` file tracks extension IDs with these fields:
- `extensionId`: The explicit extension ID used in manifest.xml
- `calculatedId`: The ID calculated from the PEM's public key (for reference)
