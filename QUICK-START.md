# 🚀 Quick Start Guide

Get your Chrome extension development environment up and running in under 5 minutes!

## ⚡ Prerequisites

- **Node.js 18+** (LTS recommended, Node.js 22+ for optimal performance) - [Download here](https://nodejs.org/)
- **Chrome/Chromium browser** for testing
- **Git** for version control
- **Code editor** (VS Code recommended)

## 🎯 5-Minute Setup

### 1. Clone and Install (1 minute)

```bash
# Clone the template
git clone https://github.com/your-repo/chrome-extension-template.git my-extension
cd my-extension

# Install dependencies
npm install
```

### 2. Customize Your Extension (1 minute)

```bash
# Run interactive setup to configure your extension
npm run customize
```

This will ask you:
- Extension name and description
- Which components you want (popup, options, sidepanel, etc.)
- Basic configuration

### 3. Build Your Extension (30 seconds)

```bash
# Build for development
npm run build:dev
```

Your extension will be built in `dist/dev/my-extension-dev/`

### 4. Load in Chrome (1 minute)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select your `dist/dev/my-extension-dev/` folder
5. Your extension is now loaded! 🎉

### 5. Start Developing (1 minute)

```bash
# Start development with auto-rebuild
npm run watch
```

Now make changes to your code and they'll automatically rebuild!

## 🛠️ Development Workflow

### Daily Development Commands

```bash
# Start development mode (rebuilds on file changes)
npm run watch

# Build for testing
npm run build:dev

# Run tests
npm run test:unit

# Check code quality
npm run lint
```

### Quick File Overview

```
src/
├── popup/          # Extension popup UI (when clicking icon)
├── options/        # Extension options page
├── sidepanel/      # Chrome sidepanel (persistent)
├── content/        # Scripts that run on web pages
├── background/     # Extension background service worker
└── utils/          # Shared utilities and theme system
```

## 🎨 Quick Theme Customization

The template includes a unified theme system. To use it in your components:

```tsx
import { applyComponentTheme, themeClasses } from "../utils/theme";

const MyComponent = () => {
  useEffect(() => {
    applyComponentTheme('popup'); // or 'options', 'sidepanel'
  }, []);

  return (
    <div className={themeClasses.container}>
      <h1 className={themeClasses.header}>My Extension</h1>
      <button className={themeClasses.buttonPrimary}>
        Action Button
      </button>
    </div>
  );
};
```

## ⚙️ Configure Extension Features

Enable/disable extension components anytime:

```bash
# Re-run customization
npm run customize

# Or manually edit config/features.json
```

```json
{
  "features": {
    "popup": { "enabled": true },
    "options": { "enabled": true },
    "sidepanel": { "enabled": false },
    "offscreen": { "enabled": false },
    "contentScripts": { "enabled": true }
  }
}
```

After changes, rebuild: `npm run build:dev`

## 🔍 Extension Development Tips

### 1. Chrome Extension Icon
- Replace icons in `src/static/` directory
- Update `src/manifest/manifest.json` icon references

### 2. Extension Permissions
- Add required permissions to `src/manifest/manifest.json`
- Rebuild after manifest changes

### 3. Debugging
- **Background scripts**: Chrome DevTools → Extensions → Inspect service worker
- **Popup**: Right-click extension icon → Inspect popup
- **Content scripts**: Regular page DevTools
- **Options page**: Right-click extension → Options, then inspect

### 4. Hot Reloading
- Use `npm run watch` for automatic rebuilds
- Reload extension in Chrome after builds
- Install [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) for automatic reload

## 📱 Building for Different Environments

```bash
# Development (with debugging)
npm run build:dev

# UAT/Testing
npm run build:uat

# Production (optimized)
npm run build:prod

# Analyze bundle size
npm run build:analyze
```

## 🧪 Testing Your Extension

```bash
# Run unit tests
npm run test:unit

# Run tests with coverage
npm run coverage

# Run end-to-end tests
npm run test:e2e

# Interactive test UI
npm run test:ui
```

## 📦 Packaging for Chrome Web Store

```bash
# Build production version
npm run build:prod

# Your packaged extension will be in:
# dist/prod/my-extension-prod.zip
```

Upload this ZIP file to the Chrome Web Store Developer Dashboard.

## 🆘 Common Issues & Solutions

### Extension Won't Load
- Check `dist/dev/` folder exists and contains `manifest.json`
- Verify Developer Mode is enabled in Chrome
- Look for errors in Chrome Extensions page

### Code Changes Not Updating
- Make sure `npm run watch` is running
- Reload extension in Chrome after changes
- Clear browser cache if needed

### Build Errors
- Run `npm run cleanup` to clear build cache
- Check Node.js version (need 18+)
- Reinstall dependencies: `rm -rf node_modules && npm install`

### TypeScript Errors
- Run `npm run typecheck` to see detailed errors
- Check imports and type definitions
- Ensure all dependencies are installed

## 📚 Next Steps

### Learn More
- **[Theme System](docs/THEME-SYSTEM.md)** - Complete styling guide
- **[Feature Customization](docs/FEATURE-CUSTOMIZATION.md)** - Advanced configuration
- **[Extension ID Management](docs/EXTENSION-ID-MANAGEMENT.md)** - Managing development IDs

### Development Resources
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

## 🎉 You're Ready!

Your Chrome extension development environment is now set up! Start building amazing extensions with modern tooling and best practices.

**Happy coding!** 🚀

---

*Need help? Check the [full documentation](docs/README.md) or open an issue on GitHub.*
