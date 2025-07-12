# Extension Cleanup Script

This document explains how to use the cleanup script to reset your Chrome extension to a clean state, removing all generated IDs, keys, and version numbers.

## Overview

The `cleanup-extension.js` script provides a complete reset functionality for the Chrome extension template. This is useful when you want to start fresh with new extension IDs, share your codebase without exposing your extension keys, or prepare a clean template for distribution.

## What the Script Does

The cleanup script performs comprehensive cleanup across multiple areas:

### Version Management
- **Resets all version numbers** to `0.0.0` in:
  - `src/manifest/config.json` (all environments: dev, uat, prod)
  - `src/manifest/manifest.json` 
  - `src/manifest/manifest.xml`

### Extension ID Management
- **Clears extension IDs** from `config.json` for all environments
- **Removes calculated IDs** and related metadata
- **Clears the appid** in `manifest.xml`
- **Removes the key property** from `manifest.json`

### Cryptographic Keys
- **Deletes all PEM files** from the `keys/` directory:
  - `chrome-extension-template-dev.pem`
  - `chrome-extension-template-uat.pem`
  - `chrome-extension-template-prod.pem`
  - Any other environment-specific PEM files

### Build Artifacts (Optional)
- **Optionally clears** the `dist/` directory and all build outputs
- **Removes TypeScript build cache** (`.tsbuildinfo`)
- **Cleans up temporary files** and build artifacts

## When to Use This Script

### Development Scenarios
- **Starting Fresh**: Reset the entire project to initial state
- **Changing Project Name**: When renaming your extension project
- **Testing Build Process**: Verify the build system handles first-time setup
- **Version Reset**: Start version numbering from scratch

### Distribution Scenarios
- **Template Sharing**: Prepare the template for sharing without exposing your keys
- **Open Source**: Clean up before making repository public
- **Team Handoff**: Transfer project without sharing development extension IDs
- **Archive Creation**: Create clean backup of the template

### Troubleshooting Scenarios
- **Corrupted State**: When extension IDs or keys become inconsistent
- **Build Issues**: Clear all generated files to resolve build problems
- **ID Conflicts**: Resolve extension ID conflicts in development

## How to Use

### Interactive Mode (Recommended)

```bash
node cleanup-extension.js
```

The script will:
1. **Display Warning**: Show what will be cleaned up
2. **Confirm Action**: Ask for confirmation before proceeding
3. **Choose Scope**: Ask if you want to clean the `dist` directory too
4. **Execute Cleanup**: Perform the cleanup with progress indicators
5. **Report Results**: Show what was cleaned and any issues

### Command Line Options

```bash
# Skip confirmation prompts (use with caution)
node cleanup-extension.js --force

# Clean everything including dist directory
node cleanup-extension.js --full

# Dry run - show what would be cleaned without doing it
node cleanup-extension.js --dry-run
```

## Step-by-Step Process

### Before Running
1. **Backup Important Data**: Save any important extension data or settings
2. **Commit Changes**: Ensure your code changes are committed to version control
3. **Document Extension IDs**: Note current extension IDs if you need to reference them

### During Cleanup
1. **Version Reset**: All version numbers set to 0.0.0
2. **ID Removal**: Extension IDs cleared from all configuration files
3. **Key Deletion**: All PEM files removed from keys directory
4. **Manifest Cleanup**: Key property removed from manifest.json
5. **XML Update**: App ID cleared from manifest.xml
6. **Build Cleanup**: (Optional) All build artifacts removed

### After Cleanup
1. **Verification**: Check that all target files have been reset
2. **Fresh Build**: Run a fresh build to generate new IDs and keys
3. **Testing**: Verify the extension works with new IDs

## Post-Cleanup Steps

### Immediate Next Steps

1. **Rebuild the Extension**:
   ```bash
   npm run build:dev
   ```

2. **Verify New Extension IDs**:
   ```bash
   npm run show:ids
   ```

3. **Test Extension Loading**:
   - Load the extension in Chrome
   - Verify all features work correctly
   - Check that new extension ID is generated

### Optional Configuration

1. **Update Extension Metadata**:
   - Edit `src/manifest/config.json` to set new name/description
   - Update version numbers if desired
   - Configure features using `npm run customize`

2. **Team Coordination**:
   - Inform team members about the cleanup
   - Share new PEM files if needed for consistency
   - Update documentation with new extension IDs

## Important Notes

### Data Loss Warning
⚠️ **Warning**: This script permanently deletes files and cannot be undone. Always backup important data before running.

### Not Part of Normal Workflow
- This script is **not part of the regular development toolchain**
- It should **not be run automatically** or as part of build processes
- The script file should **not be committed** to version control in most cases

### Git Integration
- The cleanup script has been added to `.gitignore` to prevent accidental commits
- Consider the security implications before committing the script
- Document the cleanup process for team members

## Common Use Cases

### Template Distribution
```bash
# Clean everything for template sharing
node cleanup-extension.js --full --force

# Verify cleanup
npm run show:ids
# Should show "No extension IDs configured"

# Test fresh build
npm run build:dev
```

### Development Reset
```bash
# Interactive cleanup for development
node cleanup-extension.js

# Keep dist directory: choose "No" when prompted
# This preserves any test builds while resetting IDs
```

### CI/CD Testing
```bash
# Automated cleanup for testing build process
node cleanup-extension.js --force --full

# Verify fresh build works
npm run build:dev
npm run test:unit
npm run test:e2e
```

## Troubleshooting

### Script Fails to Run
```bash
# Ensure Node.js is available
node --version

# Check script permissions
chmod +x cleanup-extension.js

# Run with explicit node
node cleanup-extension.js
```

### Partial Cleanup
If the script only partially completes:
```bash
# Check what files still exist
ls -la keys/
cat src/manifest/config.json

# Run again with force flag
node cleanup-extension.js --force
```

### Permission Errors
```bash
# Fix file permissions
chmod 644 src/manifest/*.json
chmod 644 src/manifest/*.xml
chmod -R 755 keys/

# Re-run cleanup
node cleanup-extension.js
```

## Recovery from Cleanup

### If You Need Old Extension IDs
1. **Check Version Control**: Look for committed PEM files in git history
2. **Team Members**: Copy PEM files from other team members
3. **Backup Restoration**: Restore from any backups you created

### If Build Fails After Cleanup
1. **Clean Install**: Remove node_modules and reinstall dependencies
2. **Clear Caches**: Run `npm run clean` to clear build caches
3. **Fresh Build**: Run complete build process from scratch

## Security Considerations

### PEM File Handling
- PEM files contain private keys and should be handled securely
- Don't share production PEM files through insecure channels
- Consider the implications of cleanup on production extensions

### Extension ID Impact
- New extension IDs mean loss of stored data for users
- APIs that reference the old extension ID will need updates
- Chrome Web Store listings are tied to specific extension IDs

### Team Coordination
- Coordinate cleanup with team members to avoid conflicts
- Document the cleanup process and new extension IDs
- Update any external systems that reference the extension ID

This cleanup script provides a powerful way to reset your Chrome extension template to a pristine state while maintaining the ability to quickly rebuild with new, consistent extension IDs.
