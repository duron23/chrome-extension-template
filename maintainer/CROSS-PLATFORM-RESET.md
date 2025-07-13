# Cross-Platform Reset Script Implementation

## Summary

Added cross-platform support for the reset script to ensure the Chrome Extension Template works seamlessly on both Windows and Linux/Unix systems.

## Files Added

### `reset-extension.sh`
- Linux/Unix/macOS shell script equivalent of the Windows batch file
- Provides same functionality as `reset-extension.bat`
- Includes proper shebang (`#!/bin/bash`) for Unix systems
- Uses `read -p` for user input (equivalent to Windows `pause`)

## Files Updated

### `package.json`
- Added `"reset": "node scripts/reset-extension.js"` npm script
- Provides cross-platform reset via `npm run reset`

### `README.md`
- Updated project structure to reflect new organization
- Added cross-platform reset instructions
- Removed outdated `.env` file references
- Updated configuration section to reflect current `config/config.json` approach
- Added npm script as primary cross-platform option

### `docs/RESET-SCRIPT.md`
- Added cross-platform script documentation
- Explained usage for both Windows and Linux/Unix systems
- Updated script paths to reflect new `scripts/` directory structure

## Usage Options

Users now have multiple ways to run the reset script:

1. **NPM Script (Recommended - Cross-platform)**:
   ```bash
   npm run reset
   ```

2. **Windows Batch File**:
   ```batch
   reset-extension.bat
   ```

3. **Linux/Unix Shell Script**:
   ```bash
   chmod +x reset-extension.sh
   ./reset-extension.sh
   ```

4. **Direct Node.js Execution**:
   ```bash
   node scripts/reset-extension.js
   ```

## Benefits

- **Cross-Platform Compatibility**: Template works seamlessly on Windows, Linux, macOS
- **Consistent User Experience**: Same functionality across all platforms
- **Developer Friendly**: Multiple options to suit different workflows
- **Documentation Complete**: All usage methods clearly documented

## Technical Details

### Shell Script Features
- Proper Unix shebang for shell identification
- Echo commands for user feedback
- Interactive pause equivalent to Windows `pause`
- Same error handling as batch script

### Integration
- Maintained consistency with existing Windows batch script
- No breaking changes to existing workflows
- Added npm script for package.json-based workflows
- Updated all documentation to reflect cross-platform support

This implementation ensures the Chrome Extension Template is truly cross-platform and can be used effectively in any development environment.
