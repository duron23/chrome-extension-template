# Chrome Extension PEM Key Files (Maintainer Guide)

This guide covers PEM key management for Chrome Extension Template maintainers. This documentation focuses on template maintenance concerns rather than end-user extension development.

## Overview for Maintainers

PEM (Privacy-Enhanced Mail) files contain RSA private keys that template maintainers use to:
- Maintain consistent extension IDs across template distributions
- Test template functionality with stable extension IDs
- Manage template signing during development and distribution
- Ensure template reset script works correctly with key management

## Maintainer File Structure

PEM files are stored with environment-specific naming:
- `chrome-extension-template-dev.pem` - Development environment
- `chrome-extension-template-uat.pem` - UAT environment  
- `chrome-extension-template-prod.pem` - Production environment

**Maintainer Concern**: These files are reset/removed by the maintainer reset script to ensure clean template distribution.

## Template Reset Integration

### Reset Script Behavior
The maintainer reset script (`maintainer/reset-extension.js`) handles PEM files:

1. **Removes all PEM files** to ensure clean template state
2. **Clears extension IDs** from configuration files
3. **Resets keys directory** to template defaults
4. **Ensures reproducible template state** for distribution

### Testing PEM Management
When testing template functionality:

```bash
# Test PEM file generation from clean state
node maintainer/reset-extension.js --auto
npm run build:dev  # Should generate new PEM files

# Verify extension ID calculation works
npm run show:ids

# Test key management scripts
npm run ensure-pem
```

## Maintainer Security Considerations

### Template Distribution
- **Never include actual PEM files** in template distributions
- **Reset script removes all keys** before commits (if git hooks enabled)
- **Template should generate fresh keys** for each user
- **No pre-existing extension IDs** in clean template

### Version Control Strategy for Maintainers
- **Development**: May keep PEM files for consistent template testing
- **Distribution**: Always exclude PEM files from releases
- **Git hooks**: Automatically clean keys before commits
- **Manual reset**: Available for preparing clean distributions

## Maintainer Workflows

### Preparing Clean Template Distribution

```bash
# Method 1: Automatic reset (if git hooks enabled)
git add .
git commit -m "Update template"  # Hooks auto-clean

# Method 2: Manual reset
node maintainer/reset-extension.js
# Follow prompts to clean template state

# Method 3: Automatic reset
node maintainer/reset-extension.js --auto
```

### Testing Template Key Generation

```bash
# Start from clean slate
node maintainer/reset-extension.js --auto

# Test that users can generate keys
npm run ensure-pem
npm run build:dev

# Verify everything works
npm run show:ids
npm test
```

### Validating Template State

```bash
# Check if template is in clean state
ls keys/  # Should be empty or contain only .gitkeep

# Verify no hardcoded extension IDs
grep -r "extension_id" config/
grep -r "appid" config/

# Test template from user perspective
npm run customize  # Should work without errors
```

## Advanced Maintainer Tasks

### Multi-Environment Testing
Test that template works correctly across environments:

```bash
# Test dev environment
npm run build:dev
npm run show:ids

# Test UAT environment  
npm run build:uat
npm run show:ids

# Test production environment
npm run build:prod
npm run show:ids

# Verify all environments have unique IDs
```

### Cross-Platform Validation
Ensure template works on all platforms:

```bash
# Test key generation cross-platform
node scripts/ensure-pem.js

# Test reset script cross-platform
node maintainer/reset-extension.js --auto

# Validate on Windows/Mac/Linux
npm run build:dev
```

### Template Integrity Checks

```bash
# Verify template structure
node maintainer/test-git-hooks.js

# Check for maintainer artifacts
git status  # Should be clean after reset

# Validate configuration files
node scripts/validate-extension-id.js
```

## Troubleshooting for Maintainers

### Reset Script Issues
If reset script doesn't clean keys properly:

```bash
# Manual cleanup
rm -rf keys/*.pem
rm -rf keys/chrome-extension-template-*.pem

# Verify config files reset
git diff config/

# Test from clean state
npm run ensure-pem
```

### Git Hooks Not Cleaning
If git hooks aren't cleaning keys:

```bash
# Test hook configuration
node maintainer/test-git-hooks.js

# Re-setup hooks
node maintainer/setup-git-hooks.js

# Manual hook test
.githooks/pre-commit
```

### Template Distribution Issues
If distributed template has pre-existing keys:

```bash
# Check distribution files
git archive HEAD | tar -tf - | grep -E "\\.pem$"
# Should return no results

# Verify .gitattributes excludes properly
git archive HEAD | tar -tf - | grep "maintainer/"
# Should return no results
```

## Template Quality Assurance

### Pre-Distribution Checklist
Before distributing template:

- [ ] Reset script runs successfully
- [ ] No PEM files in distribution
- [ ] Extension IDs cleared from config
- [ ] Fresh keys generate correctly
- [ ] All environments build successfully
- [ ] Git hooks work properly

### Automated Testing
```bash
# Run full template test suite
npm test

# Test maintainer tools
node maintainer/test-git-hooks.js

# Validate clean state
node maintainer/reset-extension.js --auto
git status  # Should be clean
```

This maintainer guide ensures template distributions are clean, functional, and ready for end users to customize with their own extension IDs and keys.
