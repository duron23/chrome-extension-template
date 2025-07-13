# Chrome Extension PEM Key Files

This directory contains the private key (PEM) files for each build environment of the Chrome extension. These files are crucial for ensuring consistent extension IDs across builds and installation methods.

## Overview

PEM (Privacy-Enhanced Mail) files contain RSA private keys that are used to:
- Generate consistent Chrome extension IDs
- Sign extension packages (.crx files)
- Ensure the same extension ID for both packed and unpacked installations
- Maintain extension identity across different environments

## File Structure

PEM files are stored with environment-specific naming:
- `chrome-extension-template-dev.pem` - Development environment
- `chrome-extension-template-uat.pem` - UAT environment  
- `chrome-extension-template-prod.pem` - Production environment

## Automatic Management

### PEM File Generation
- PEM files are automatically created when first needed
- Generated using RSA-2048 encryption for security
- Each environment gets its own unique private key
- Files are created by the `ensure-pem.js` script during build

### Build Integration
1. Pre-build scripts check for required PEM files
2. Generate missing PEM files automatically
3. Extract public keys for manifest.json embedding
4. Calculate extension IDs using Chrome's algorithm
5. Update configuration files with current IDs

## Usage

### Automatic Usage (Recommended)
The build system handles PEM files automatically:

```bash
# Build commands automatically manage PEM files
npm run build:dev   # Uses/creates dev PEM file
npm run build:uat   # Uses/creates UAT PEM file  
npm run build:prod  # Uses/creates prod PEM file

# Check current extension IDs derived from PEM files
npm run show:ids

# Manually ensure all PEM files exist
npm run ensure-pem
```

### Manual Management

If you need to manually work with PEM files:

```bash
# View PEM file details
openssl rsa -in chrome-extension-template-dev.pem -text -noout

# Extract public key
openssl rsa -in chrome-extension-template-dev.pem -pubout -out dev-public.pem

# Verify PEM file integrity
openssl rsa -in chrome-extension-template-dev.pem -check -noout
```

## Important Security Notes

### File Permissions
- PEM files contain private keys and are security-sensitive
- Set appropriate file permissions: `chmod 600 *.pem`
- Never share production PEM files through insecure channels

### Version Control Considerations

**Development/UAT Keys (Recommended to Commit):**
- Allows team members to share the same extension IDs
- Enables consistent development environment
- Simplifies testing and debugging across team

**Production Keys (Consider Security Requirements):**
- Evaluate whether to commit production keys to version control
- Consider using secure key management for production deployments
- May want separate repository or secure deployment process

### Key Rotation
- Consider periodic rotation of production keys
- Development keys can be rotated less frequently
- Coordinate key rotation with team members

## Benefits of This System

### Development Benefits
1. **Consistent Extension IDs**: Same ID whether loading unpacked or installing .crx
2. **Persistent Storage**: Extension data persists between development sessions
3. **Team Consistency**: All team members can use the same extension IDs
4. **API Integration**: External APIs can reference stable extension IDs

### Deployment Benefits
1. **Environment Isolation**: Each environment has unique extension ID
2. **Update Continuity**: Users keep settings when extension updates
3. **Parallel Deployment**: Multiple environments can run simultaneously
4. **Chrome Web Store**: Consistent production ID for store updates

## Troubleshooting

### Missing PEM Files
If PEM files are missing:
```bash
# Regenerate all PEM files
npm run ensure-pem

# Or run a build which will create them automatically
npm run build:dev
```

### Corrupted PEM Files
If a PEM file becomes corrupted:
```bash
# Test PEM file integrity
openssl rsa -in chrome-extension-template-dev.pem -check -noout

# If corrupted, delete and regenerate
rm chrome-extension-template-dev.pem
npm run ensure-pem
```

### Extension ID Mismatches
If extension IDs don't match expectations:
```bash
# Check all extension IDs
npm run show:ids

# Validate specific extension ID
node ../validate-extension-id.js [extension-id]

# Force regeneration of extension ID calculation
npm run ensure-pem
```

### Team Synchronization Issues
If team members have different extension IDs:

1. **Sync PEM Files**: Copy PEM files from another team member
2. **Use Version Control**: Commit PEM files and have team pull latest
3. **Reset All**: Delete all PEM files and rebuild together

## Advanced Usage

### Custom Environments
To add a new environment (e.g., staging):

1. The build system will automatically create `chrome-extension-template-staging.pem`
2. Update build scripts to handle the new environment
3. Add corresponding webpack configuration

### Multiple Projects
If using this template for multiple projects:
- PEM files are project-specific based on the parent directory name
- Each project will have its own set of environment-specific PEM files
- Extension IDs will be unique per project and environment

### Backup and Recovery
```bash
# Backup all PEM files
tar -czf pem-backup-$(date +%Y%m%d).tar.gz *.pem

# Restore from backup
tar -xzf pem-backup-20250112.tar.gz
```

## Technical Details

### PEM File Format
- RSA-2048 private keys
- PKCS#1 format
- Base64 encoded with PEM headers/footers
- Compatible with OpenSSL and Chrome extension packaging

### Extension ID Algorithm
Chrome calculates extension IDs using:
1. Extract public key from PEM file
2. Convert to DER (Distinguished Encoding Rules) format
3. Calculate SHA-256 hash of DER-encoded public key
4. Take first 16 bytes of hash
5. Convert each nibble to character in range a-p
6. Result: 32-character lowercase extension ID

### File Locking
The system uses file locking to prevent:
- Race conditions during parallel builds
- Corruption from simultaneous PEM generation
- Conflicts in team development environments
