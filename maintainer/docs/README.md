# Maintainer Documentation

This directory contains documentation specifically for **Chrome Extension Template maintainers**. These guides cover template maintenance, distribution preparation, and maintainer-specific tooling.

⚠️ **Note**: This documentation is excluded from user distributions via `.gitattributes` and is only relevant for template maintainers.

## 🔧 Template Maintenance

### **[Git Hooks](GIT-HOOKS.md)**
**Automated template reset before commits**
- Pre-commit hook setup for maintainers
- Automatic template cleaning workflow
- Cross-platform git hook configuration
- Troubleshooting hook issues

**Use when:** Setting up maintainer workflow or troubleshooting git hooks.

### **[Reset Script](RESET-SCRIPT.md)**
**Template cleanup and distribution preparation**
- Complete template reset functionality
- Cleaning extension IDs, keys, and artifacts
- Preparing clean distributions
- Interactive and automated reset modes

**Use when:** Preparing template for distribution or resetting to clean state.

### **[Cross-Platform Reset](CROSS-PLATFORM-RESET.md)**
**Platform-specific reset considerations**
- Windows batch file usage
- Unix/Linux shell script execution
- Cross-platform compatibility notes
- Platform-specific troubleshooting

**Use when:** Working with reset scripts across different operating systems.

## 📦 Distribution & Key Management

### **[Key Management](keys-README.md)**
**PEM key handling for template maintainers**
- Template key lifecycle management
- Reset script integration with keys
- Security considerations for maintainers
- Template distribution without keys

**Use when:** Managing PEM keys during template maintenance or distribution.

### **[Distribution Guide](DISTRIBUTION.md)**
**Preparing clean template releases**
- Release preparation checklist
- Version control considerations
- Clean distribution validation
- User onboarding preparation

**Use when:** Preparing template releases or validating distribution quality.

## 🛠️ Quick Reference

### Common Maintainer Tasks

```bash
# Setup git hooks for automatic template cleaning
node maintainer/setup-git-hooks.js

# Test git hooks configuration
node maintainer/test-git-hooks.js

# Reset template to clean state (interactive)
node maintainer/reset-extension.js

# Reset template automatically (no prompts)
node maintainer/reset-extension.js --auto

# Cross-platform reset (Windows)
maintainer/maintainer-reset.bat

# Cross-platform reset (Unix/Linux/macOS)
maintainer/maintainer-reset.sh
```

### Maintainer Workflow

1. **Setup**: Configure git hooks for automatic cleaning
2. **Develop**: Make template improvements 
3. **Test**: Validate changes work correctly
4. **Clean**: Use reset script or git hooks to clean template
5. **Distribute**: Share clean template with users

## 📋 Documentation Categories

### Template Development
- Git hooks for automated cleaning
- Reset scripts for manual cleaning
- Cross-platform compatibility

### Distribution Management
- Key management and security
- Clean release preparation
- User onboarding considerations

### Quality Assurance
- Template validation processes
- Cross-platform testing
- Distribution verification

This maintainer documentation ensures template quality and provides the tools needed for effective template maintenance and distribution.

**Last Updated:** July 19, 2025
