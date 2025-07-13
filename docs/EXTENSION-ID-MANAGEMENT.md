# Chrome Extension ID Management

This document explains the comprehensive extension ID management system that ensures consistent extension IDs across different build environments and installation methods.

## Overview

Chrome extension IDs are crucial for maintaining consistency during development and across different environments. This template provides a robust system for managing extension IDs that works for both packed (.crx) and unpacked installations.

## How Extension IDs Work

Chrome extension IDs are generated differently depending on the installation method:

1. **Packed Extensions (.crx)**: The ID is derived from the public key embedded in the extension package
2. **Unpacked Extensions**: By default, Chrome generates a random ID each time the extension is loaded
3. **Extensions with Explicit Key**: When a public key is specified in manifest.json, the same ID is used for both packed and unpacked installations

## Our Solution

This template ensures consistent extension IDs through:

1. **Environment-Specific PEM Files**: Separate private keys for dev, UAT, and production
2. **Automatic Key Management**: PEM files are created and managed automatically
3. **Public Key Extraction**: Public keys are extracted and embedded in manifest.json
4. **ID Calculation**: Extension IDs are calculated using Chrome's exact algorithm
5. **Configuration Storage**: IDs are stored in config.json for reference and tooling

## Implementation Details

### 1. PEM Key Storage

Private keys are stored in the `keys/` directory with environment-specific naming:
- `keys/chrome-extension-template-dev.pem` (development environment)
- `keys/chrome-extension-template-uat.pem` (UAT environment)
- `keys/chrome-extension-template-prod.pem` (production environment)

### 2. Automatic Key Generation

The `ensure-pem.js` script automatically:
- Creates PEM files if they don't exist
- Uses existing PEM files to maintain consistency
- Generates strong RSA-2048 private keys
- Handles file locking to prevent race conditions

### 3. Public Key Extraction

The `extract-key.js` module:
- Extracts the public key from PEM files
- Converts to Chrome's required DER format
- Base64 encodes for manifest.json inclusion
- Calculates the extension ID using Chrome's algorithm

### 4. Extension ID Calculation

Extension IDs are calculated using Chrome's exact method:
- SHA-256 hash of the DER-encoded public key
- First 16 bytes of the hash
- Each nibble (4 bits) mapped to characters a-p
- Results in a 32-character lowercase string

### 5. Configuration Management

Extension IDs are stored in `src/manifest/config.json`:
```json
{
  "dev": {
    "extensionId": "calculated-from-dev-pem",
    "calculatedId": "reference-id-for-validation"
  },
  "uat": {
    "extensionId": "calculated-from-uat-pem",
    "calculatedId": "reference-id-for-validation"
  },
  "prod": {
    "extensionId": "calculated-from-prod-pem", 
    "calculatedId": "reference-id-for-validation"
  }
}
```

## Build Process Integration

### Pre-build Steps

1. **Environment Detection**: Build scripts detect the target environment (dev/uat/prod)
2. **PEM Verification**: `ensure-pem.js` ensures the required PEM file exists
3. **Key Extraction**: Public key is extracted and extension ID calculated
4. **Config Update**: `config.json` is updated with the current extension ID

### Manifest Generation

The `generate-manifest.js` script:
- Reads the environment-specific extension ID from config.json
- Extracts the public key from the corresponding PEM file
- Embeds the public key in manifest.json as the `key` property
- Updates manifest.xml with the extension ID for Chrome Web Store

### Build Output

Each environment produces a separate build with its own extension ID:
- `dist/dev/` - Development build with dev extension ID
- `dist/uat/` - UAT build with UAT extension ID  
- `dist/prod/` - Production build with production extension ID
## Usage

### Building with Consistent Extension IDs

The build system automatically handles extension ID management:

```bash
# Development build with dev extension ID
npm run build:dev

# UAT build with UAT extension ID  
npm run build:uat

# Production build with production extension ID
npm run build:prod
```

### Checking Extension IDs

View all configured extension IDs:

```bash
npm run show:ids
```

This displays:
- Current extension ID for each environment
- PEM file status (exists/missing)
- Calculated vs stored ID validation

### Manual PEM Management

Force PEM file generation for all environments:

```bash
npm run ensure-pem
```

This is automatically run during pre-build, but can be run manually if needed.

## Key Benefits

### Development Benefits
1. **Consistent Testing**: Same extension ID across development sessions
2. **Storage Persistence**: Extension data persists between loads
3. **API Consistency**: External APIs can reference a stable extension ID
4. **Team Collaboration**: Shared PEM files ensure team-wide ID consistency

### Deployment Benefits
1. **Environment Isolation**: Each environment has its own unique extension ID
2. **Update Continuity**: Users maintain their settings when updating
3. **Chrome Web Store**: Production ID remains consistent for store updates
4. **A/B Testing**: Different environments can run simultaneously

### Security Benefits
1. **Key Isolation**: Each environment uses separate cryptographic keys
2. **Access Control**: Production keys can be managed separately from development
3. **Audit Trail**: Changes to extension IDs are tracked in version control

## Advanced Usage

### Custom Environment

To add a new environment (e.g., staging):

1. **Add Environment Config**: Update `config.json` with staging configuration
2. **Create Environment File**: Add `.env.staging` with environment variables
3. **Add Build Script**: Create webpack config and npm script for staging
4. **Generate PEM**: The system will automatically create `keys/chrome-extension-template-staging.pem`

### Team Workflow

**For Teams Using Shared Extension IDs:**
1. Commit PEM files to version control
2. All team members use the same extension IDs
3. Shared development environment with consistent behavior

**For Teams Using Individual Extension IDs:**
1. Add `keys/` directory to `.gitignore`
2. Each developer gets unique extension IDs
3. Production PEM file managed separately for deployment

### CI/CD Integration

For continuous integration:

```bash
# Ensure PEM files exist before building
npm run ensure-pem

# Build all environments
npm run build:dev
npm run build:uat  
npm run build:prod

# Validate extension IDs
npm run show:ids
```

## Troubleshooting

### Extension ID Changed Unexpectedly

If your extension ID has changed:

1. **Check PEM File**: Verify the PEM file exists in `keys/` directory
2. **Validate Config**: Run `npm run show:ids` to check stored vs calculated IDs
3. **Regenerate if Needed**: Delete the PEM file and run `npm run ensure-pem`

### Build Failures

Common build issues and solutions:

```bash
# Permission errors with PEM files
chmod 600 keys/*.pem

# Corrupted PEM file
rm keys/chrome-extension-template-[env].pem
npm run ensure-pem

# Config/calculation mismatch
node validate-extension-id.js [extension-id]
```

### Different Extension IDs in Team

If team members have different extension IDs:

1. **Share PEM Files**: Commit the `keys/` directory to version control
2. **Sync Keys**: Copy PEM files from another team member
3. **Reset and Rebuild**: Delete local PEM files and rebuild

## Security Considerations

### PEM File Security
- PEM files contain private keys and should be treated as sensitive
- For production, consider secure key management systems
- Rotate production keys periodically for security

### Version Control
- Development/UAT PEM files can be safely committed
- Production PEM files should be managed through secure deployment processes
- Consider using different repositories for different security levels

### Access Control
- Limit access to production PEM files
- Use separate developer accounts for different environments
- Implement approval processes for production key changes

## Validation Tools

### Extension ID Validator

Verify extension ID calculations:

```bash
node validate-extension-id.js [extension-id]
```

This tool:
- Validates the extension ID format
- Checks if it matches the calculated ID from PEM files
- Provides debugging information for mismatches

### PEM File Inspector

Check PEM file details:

```bash
openssl rsa -in keys/chrome-extension-template-dev.pem -text -noout
```

This shows:
- Key size and algorithm
- Public key details
- Key validation status
