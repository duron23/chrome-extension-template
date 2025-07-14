# Extension ID Management - Watch Mode Fix

## Issue Description
The user reported that "watch is updating all build extensionId to same, whereas it should not."

## Root Cause Analysis

The problem was that the watch mode was using whatever manifest configuration existed from the last build. For example:
1. Run `npm run build:uat` - this updates the source manifest with UAT key and naming
2. Run `npm run watch` - this would use the UAT configuration instead of DEV

## Solution Implemented

### Simple and Clean Approach
Watch mode now:
1. **Only compiles code** - no config updates, no version increments
2. **Uses dev environment only** - as intended for development
3. **Validates dev PEM exists** - fails with clear error if not
4. **Restores dev manifest** - ensures consistent dev environment

### How It Works

1. **Pre-check**: `prepare-watch-manifest.js` runs before watch starts
2. **PEM validation**: Checks if dev PEM exists, fails if not
3. **Manifest restoration**: Updates source manifest with dev key and naming
4. **Clean compilation**: Watch mode only compiles, no other modifications

### Key Benefits
✅ **Predictable**: Watch always uses dev environment  
✅ **Safe**: No config modifications during watch  
✅ **Clear errors**: Tells user to run build:dev if PEM missing  
✅ **Consistent**: Same key/naming as build:dev  

## File Changes

### New File: `scripts/prepare-watch-manifest.js`
- Validates dev PEM exists
- Updates manifest with dev key and naming
- Does NOT update config files or version numbers

### Modified File: `scripts/watch-all.js`
- Calls prepare-watch-manifest before starting watch
- Clear messaging about watch mode purpose

## Usage

### Before Watch Mode
Must have dev environment set up first:
```bash
npm run build:dev  # Creates dev PEM and extension ID
```

### Watch Mode
```bash
npm run watch  # Now safely uses dev environment
```

### Error Handling
If dev PEM doesn't exist:
```
❌ Dev PEM key not found!
💡 Please run 'npm run build:dev' first to generate the development environment
```

## Verification

### Test Scenario 1: Watch without dev environment
```bash
# Clean state - no PEM files
npm run watch
# Result: Clear error message, tells user to run build:dev
```

### Test Scenario 2: Watch after different environment build
```bash
npm run build:uat    # Sets manifest to UAT configuration
npm run watch        # Correctly restores DEV configuration
```

### Test Scenario 3: Normal development workflow
```bash
npm run build:dev    # Set up dev environment
npm run watch        # Works correctly with dev configuration
```

## Key Differences from Build Mode

| Aspect | Build Mode | Watch Mode |
|--------|------------|------------|
| **Environment** | Any (dev/uat/prod) | DEV only |
| **Version Update** | ✅ Increments version | ❌ No version changes |
| **Config Update** | ✅ Updates config.json | ❌ No config changes |
| **Manifest Update** | ✅ Adds key, name, version | ✅ Adds key, name (no version) |
| **PEM Creation** | ✅ Creates if missing | ❌ Fails if missing |

This ensures watch mode is purely for development compilation while maintaining the correct extension identity.
