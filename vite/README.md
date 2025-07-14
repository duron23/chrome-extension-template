# Vite Configuration Files

This directory contains all Vite configuration files for the Chrome extension build system.

## Why JavaScript instead of TypeScript?

We use JavaScript (`.js`) instead of TypeScript (`.ts`) for Vite configs because:

1. **⚡ Faster startup** - No TypeScript compilation step when Vite loads the config
2. **🔧 Simpler debugging** - Direct execution without transpilation layer  
3. **📝 Better IDE support** - Some IDEs handle JS configs more reliably
4. **🎯 Reduced complexity** - No need for TypeScript-specific config handling
5. **📚 Standard practice** - Most Vite projects use `.js` configs

## File Structure

```
📁 vite/
├── 📄 vite.config.js              # Main config - UI components (React SPAs)
├── 📄 vite.background.config.js   # Background script (ESM, 1:1 transpilation)
├── 📄 vite.content.config.js      # Content scripts (IIFE, bundled)
├── 📄 vite.dev.config.js          # Development environment
├── 📄 vite.uat.config.js          # UAT environment  
├── 📄 vite.prod.config.js         # Production environment
└── 📄 vite.watch.config.js        # Watch mode for development
```

## Configuration Purpose

### Core Configurations

- **`vite.config.js`** - Handles all UI components (popup, options, sidepanel, offscreen)
  - React plugin for JSX compilation
  - HTML generation for each component
  - Static file copying (manifest, assets)
  - Full bundling with shared chunks

- **`vite.background.config.js`** - Service worker background script
  - 1:1 TypeScript → JavaScript transpilation
  - ESM format with `preserveModules: true`
  - No dependency bundling (per Chrome extension rules)

- **`vite.content.config.js`** - Content scripts
  - IIFE format for isolated scope
  - Single bundled file per content script
  - Chrome API externalization

### Environment Configurations

- **`vite.dev.config.js`** - Development mode with source maps
- **`vite.uat.config.js`** - UAT environment configuration
- **`vite.prod.config.js`** - Production mode with minification
- **`vite.watch.config.js`** - Development with file watching

## Build Process

The build process runs three separate Vite builds in sequence:

1. **UI Components** → React SPAs with HTML generation
2. **Background Script** → ESM with 1:1 transpilation  
3. **Content Scripts** → IIFE format with isolated scope
4. **Extension Packaging** → Final .crx/.zip generation

Each configuration is optimized for its specific Chrome extension component type, ensuring compliance with Manifest V3 requirements.

## Chrome Extension Compliance

✅ **Service Worker**: ES Module format with preserved file structure  
✅ **Content Scripts**: IIFE format in isolated scope  
✅ **UI Components**: Bundled React SPAs with HTML entry points  
✅ **Static Assets**: Proper manifest and file copying

## Usage

Configurations are used via package.json scripts:

```bash
npm run build:dev    # Development build
npm run build:uat    # UAT build  
npm run build:prod   # Production build
npm run watch        # Development with file watching
```

All configurations automatically handle environment variables, feature flags, and extension-specific requirements.
