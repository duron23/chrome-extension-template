# Documentation Index

This directory contains comprehensive documentation for the Chrome Extension Template. Here's a guide to help you find what you need:

## 📖 Documentation Files

### 🎨 **THEME-SYSTEM.md**
**Complete guide to the unified theme system**
- CSS custom properties and design tokens
- Dark mode support and theming utilities
- Component styling and layout guidelines
- TypeScript integration and theme utilities
- Examples and best practices

**Use when:** Setting up consistent styling, implementing dark mode, or creating new UI components.

### ⚙️ **FEATURE-CUSTOMIZATION.md**
**Guide to configuring extension components**
- Enable/disable extension features (popup, options, sidepanel, etc.)
- Interactive CLI customization tool
- Feature configuration file structure
- Build system integration

**Use when:** Customizing which extension components to include in your project.

### 🔧 **EXTENSION-ID-MANAGEMENT.md**
**PEM key and extension ID management**
- Extension ID consistency across environments
- PEM key generation and management
- Development vs production ID handling
- Chrome Web Store packaging

**Use when:** Setting up extension IDs, preparing for Chrome Web Store, or managing development keys.

### 🔗 **GIT-HOOKS.md**
**Git hooks for template maintainers**
- Automatic reset before commits (maintainer-only)
- Setup and configuration guide
- Troubleshooting hook issues
- Cross-platform support

**Use when:** You're maintaining the template itself (not for regular extension development).

### 🔄 **RESET-SCRIPT.md** (in `maintainer/` directory)
**Template reset and cleanup utilities**
- Maintainer-only reset script documentation
- Cleaning extension state for distribution
- Cross-platform reset tools

**Use when:** Preparing clean template distributions (maintainer-only).

## 🚀 Quick Start Guides

### For Extension Developers
1. **Start here:** Main `README.md` for setup and building
2. **Customize features:** `FEATURE-CUSTOMIZATION.md`
3. **Style your extension:** `THEME-SYSTEM.md`
4. **Manage extension IDs:** `EXTENSION-ID-MANAGEMENT.md`

### For Template Maintainers
1. **Regular development:** Main `README.md`
2. **Set up git hooks:** `GIT-HOOKS.md`
3. **Reset for distribution:** `maintainer/RESET-SCRIPT.md`
4. **All maintainer tools:** `maintainer/README.md`

## 📁 Related Files

### Configuration Files
- `config/config.json` - Extension identity and settings
- `config/features.json` - Feature toggles and component configuration
- `src/utils/theme.ts` - Theme utilities and design system
- `tailwind.config.js` - Tailwind CSS configuration with theme integration

### Scripts and Tools
- `scripts/customize-features.js` - Interactive feature customization
- `scripts/show-extension-ids.js` - Display current extension IDs
- `maintainer/setup-git-hooks.js` - Git hooks setup (maintainer-only)
- `maintainer/test-git-hooks.js` - Git hooks testing utility

## 🆘 Need Help?

1. **Check the main README.md** for general setup and build instructions
2. **Use the appropriate guide above** based on what you're trying to do
3. **Look at the example components** in `src/` directories
4. **Check package.json scripts** for available commands

## 📝 Contributing to Documentation

When adding new features or tools:
1. Update the relevant documentation file
2. Add entries to this index if needed
3. Update the main README.md file structure section
4. Consider adding examples to GitHub Copilot instructions

---

**Last Updated:** July 2025  
**Template Version:** 1.2.0
