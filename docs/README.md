# Developer Documentation

This directory contains comprehensive documentation for **Chrome Extension developers** using this template. Here's a guide to help you find what you need:

## 📖 Documentation Files

### ⚡ **VITE-BUILD-SYSTEM.md**
**Comprehensive guide to the modern Vite-based build system**
- Multi-configuration setup for UI, background, and content scripts
- Build environments (dev, UAT, production) and optimizations
- Bundle analysis and performance monitoring
- React 19 compatibility and JSX runtime configuration
- Watch mode, CSS inlining, and Chrome extension-specific optimizations

**Use when:** Understanding the build process, debugging build issues, or optimizing bundle performance.

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

### 🆘 **TROUBLESHOOTING.md**
**Common development issues and solutions**
- Build and dependency problems
- Extension loading issues
- Theme and styling troubleshooting
- Development workflow problems

**Use when:** Encountering issues during extension development or deployment.

## 🚀 Quick Start Guides

### For Extension Developers
1. **Start here:** [🚀 Quick Start Guide](../QUICK-START.md) for 5-minute setup
2. **Understand the build system:** [Vite Build System](VITE-BUILD-SYSTEM.md) for modern toolchain
3. **Customize features:** [Feature Customization](FEATURE-CUSTOMIZATION.md)
4. **Style your extension:** [Theme System](THEME-SYSTEM.md)
5. **Manage extension IDs:** [Extension ID Management](EXTENSION-ID-MANAGEMENT.md)
6. **Troubleshoot issues:** [Troubleshooting Guide](TROUBLESHOOTING.md)

### For Template Maintainers
📁 **See:** [`maintainer/docs/`](../maintainer/docs/) for maintainer-specific documentation

## 📁 Related Files

### Configuration Files
- `vite/vite.config.mjs` - Main Vite build configuration for UI components
- `vite/vite.uat.config.mjs` - UAT environment build configuration  
- `vite/vite.prod.config.mjs` - Production build configuration
- `config/config.json` - Extension identity and settings
- `config/features.json` - Feature toggles and component configuration
- `src/utils/theme.ts` - Theme utilities and design system
- `tailwind.config.js` - Tailwind CSS configuration with theme integration

### Scripts and Tools
- `scripts/customize-features.js` - Interactive feature customization
- `scripts/show-extension-ids.js` - Display current extension IDs
- `scripts/generate-manifest.js` - Generate manifests for different environments
- `scripts/pack-extension.js` - Create extension packages for distribution
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
