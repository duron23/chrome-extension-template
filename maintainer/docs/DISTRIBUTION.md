# Template Distribution Guide

This guide covers how to prepare and distribute clean versions of the Chrome Extension Template. This documentation is specifically for template maintainers who need to prepare releases for public distribution.

## Overview

Template distribution involves preparing a clean, ready-to-use version of the Chrome Extension Template that:
- Contains no development artifacts or personal data
- Has consistent default configurations
- Provides a smooth onboarding experience for new users
- Maintains template quality and security standards

## Pre-Distribution Checklist

### 🔍 Template State Validation

Before distributing, ensure the template is in a clean state:

```bash
# Check current template state
git status  # Should be clean
npm run show:ids  # Should show no configured extension IDs

# Validate configuration files
cat config/config.json  # Should have template defaults
cat package.json  # Should show "chrome-extension-template" name

# Check for leftover keys
ls keys/  # Should be empty or contain only .gitkeep
```

### 🧹 Template Cleaning

If template needs cleaning:

```bash
# Interactive reset (recommended for manual distribution)
node maintainer/reset-extension.js

# Automatic reset (for automated distribution)
node maintainer/reset-extension.js --auto

# Cross-platform reset scripts are also available
# Windows: maintainer/maintainer-reset.bat
# Unix/Linux/macOS: maintainer/maintainer-reset.sh
```

### ✅ Quality Assurance Tests

Validate template functionality from user perspective:

```bash
# Test fresh setup workflow
npm run customize  # Should work without errors
npm run build:dev  # Should generate new keys and IDs
npm run show:ids   # Should show newly generated IDs

# Test all build targets
npm run build:uat
npm run build:prod

# Run test suite
npm test

# Test extension loading
# Load dist/dev/ in Chrome and verify functionality
```

## Git Distribution Methods

### Method 1: Git Archive (Recommended)

Use git archive to create clean distributions that respect `.gitattributes`:

```bash
# Create clean zip distribution
git archive --format=zip --output=chrome-extension-template.zip HEAD

# Create clean tar.gz distribution
git archive --format=tar.gz --output=chrome-extension-template.tar.gz HEAD

# Verify exclusions work
unzip -l chrome-extension-template.zip | grep "maintainer/"
# Should return no results (maintainer/ excluded)
```

### Method 2: Git Clone with Cleanup

For repositories that will be forked or cloned:

```bash
# Ensure clean state before pushing
node maintainer/reset-extension.js --auto
git add .
git commit -m "Prepare clean template for distribution"
git push

# Users can then:
# git clone <your-repo>
# npm install
# npm run customize
```

### Method 3: Release Preparation

For GitHub releases or similar platforms:

```bash
# 1. Clean the template
node maintainer/reset-extension.js --auto

# 2. Update version in package.json if needed
npm version patch  # or minor/major

# 3. Commit clean state
git add .
git commit -m "Release: Clean template v$(npm run show:version)"

# 4. Create release tag
git tag -a v$(npm run show:version) -m "Chrome Extension Template v$(npm run show:version)"

# 5. Push to repository
git push && git push --tags
```

## Distribution Validation

### Automated Validation Script

Create a script to validate distribution quality:

```bash
# Test distribution in temporary directory
mkdir -p /tmp/template-test
cd /tmp/template-test

# Extract distribution
unzip /path/to/chrome-extension-template.zip

# Validate clean state
cd chrome-extension-template
npm install
npm run customize  # Should work
npm run build:dev  # Should generate fresh IDs
npm run show:ids   # Should show new extension IDs
npm test          # Should pass
```

### Manual Validation Checklist

- [ ] No PEM files in distribution
- [ ] Extension IDs cleared from config.json
- [ ] Package.json has template defaults
- [ ] No maintainer/ directory in distribution
- [ ] All builds work from clean state
- [ ] Tests pass on fresh installation
- [ ] Documentation is up to date

## User Onboarding Considerations

### Documentation Alignment

Ensure user-facing documentation matches distributed template:

```bash
# Check that QUICK-START.md reflects current template state
# Verify README.md has accurate setup instructions
# Ensure all referenced commands work in clean template
```

### Feature Configuration

Validate that feature customization works:

```bash
# Test interactive customization
npm run customize

# Test that generated configurations build correctly
npm run build:dev
npm run build:uat
npm run build:prod
```

### Common User Issues

Prepare for common issues users might encounter:

1. **Node.js Version**: Ensure template works with supported Node.js versions
2. **Permission Issues**: Test on different platforms
3. **Build Failures**: Validate all dependencies are properly specified
4. **Extension Loading**: Test unpacked extension loading in Chrome

## Security Considerations

### Key Management

- **Never include PEM keys** in distributions
- **Verify .gitattributes** excludes sensitive files
- **Test archive contents** to ensure no leakage

### Template Security

- **Review all code** for hardcoded values or secrets
- **Validate dependencies** for security vulnerabilities
- **Check for development URLs** or API keys

## Distribution Channels

### GitHub Releases

1. Create clean release with git archive
2. Upload as release asset
3. Provide clear release notes
4. Tag with semantic version

### NPM Package (Future Consideration)

For npm distribution:
```bash
# Ensure package.json is properly configured
npm publish --dry-run  # Test packaging
# Review what files would be included
```

### Template Repositories

For template repositories:
1. Keep main branch clean
2. Use git hooks for automatic cleaning
3. Provide clear contribution guidelines

## Troubleshooting Distribution Issues

### Common Problems

**Distribution includes maintainer files:**
- Check `.gitattributes` configuration
- Use `git archive` instead of zip/tar manually
- Verify export-ignore directives

**Template doesn't build for users:**
- Test from completely clean state
- Check all dependencies are in package.json
- Validate Node.js version requirements

**Documentation is outdated:**
- Review all README files
- Test all documented commands
- Update any changed workflows

### Recovery Procedures

**If bad distribution is released:**
1. Identify the issue
2. Fix in repository
3. Create new clean distribution
4. Update release/documentation
5. Notify users if necessary

## Continuous Distribution

### Automated Distribution

Consider setting up automated distribution:

```bash
# GitHub Actions example workflow
# .github/workflows/release.yml
# - Reset template on release branch
# - Run quality tests
# - Create clean archive
# - Publish as release asset
```

### Quality Gates

Implement checks before distribution:
- All tests must pass
- Template must build cleanly
- Reset script must complete successfully
- No sensitive data in distribution

This distribution guide ensures that users receive high-quality, clean template distributions that provide an excellent getting-started experience.
