# Troubleshooting Guide

This guide helps you resolve common issues when developing Chrome extensions with this template.

## 🚀 Quick Fixes

### Extension Won't Load in Chrome
1. **Check manifest syntax**: Look for JSON syntax errors in `src/manifest/manifest.json`
2. **Verify permissions**: Ensure required permissions are declared
3. **Build the extension**: Run `npm run build:dev` to generate fresh files
4. **Try developer mode**: Enable "Developer mode" in Chrome's Extensions page

### Build Failures
```bash
# Clear everything and rebuild
rm -rf node_modules dist
npm install
npm run build:dev
```

### Extension ID Issues
```bash
# Check current IDs
npm run show:ids

# Generate fresh IDs if needed
rm keys/*.pem
npm run build:dev
```

## 🔧 Build & Development Issues

### Node.js Version Problems

**Problem**: Build fails with Node.js version errors
```bash
# Check your Node.js version
node --version
# Requires: Node.js 18.0.0 or higher
```

**Solution**: 
- Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- Consider using a Node.js version manager (nvm, fnm)

### Dependency Installation Issues

**Problem**: `npm install` fails or has warnings
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Peer dependency warnings
```bash
# Install peer dependencies manually
npm install --save-dev @types/chrome
```

### TypeScript Compilation Errors

**Problem**: TypeScript build errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clear TypeScript cache
rm -f tsconfig.tsbuildinfo
```

**Common TypeScript fixes**:
- Ensure `@types/chrome` is installed
- Check import/export syntax
- Verify file extensions (.ts, .tsx)

### Webpack Build Issues

**Problem**: Webpack build fails
```bash
# Check webpack configuration
npm run build:dev -- --verbose

# Clear webpack cache
rm -rf .webpack-cache dist
```

**Problem**: Hot reload not working
- Restart the watch process: `npm run watch`
- Check file permissions in the project directory
- Ensure no antivirus software is blocking file changes

## 🎨 Theme & Styling Issues

### Theme Not Applied

**Problem**: Components don't show theme styling

**Solution**:
1. **Check theme import**: Ensure components import theme utilities
```typescript
import { applyComponentTheme, themeClasses } from '../utils/theme';
```

2. **Apply component theme**: Call in useEffect
```typescript
useEffect(() => {
  applyComponentTheme('popup'); // or 'options', 'sidepanel', 'offscreen'
}, []);
```

3. **Use theme classes**: Apply predefined theme classes
```typescript
<div className={themeClasses.container}>
  <button className={themeClasses.buttonPrimary}>Click me</button>
</div>
```

### Dark Mode Not Working

**Problem**: Dark mode doesn't activate

**Solution**:
1. **Check system settings**: Ensure system dark mode is enabled
2. **Verify CSS variables**: Check browser dev tools for CSS custom properties
3. **Test theme detection**:
```typescript
import { isDarkMode, watchThemeChanges } from '../utils/theme';
console.log('Dark mode:', isDarkMode());
```

### Tailwind Classes Not Working

**Problem**: Tailwind CSS classes don't apply

**Solution**:
1. **Check Tailwind configuration**: Verify `tailwind.config.js` includes all component files
2. **Rebuild**: Run `npm run build:dev` to regenerate CSS
3. **Check PostCSS**: Ensure `postcss.config.js` is properly configured

## 🔒 Extension Loading Issues

### Extension Not Appearing in Chrome

**Problem**: Extension doesn't show up after loading

**Solution**:
1. **Check Chrome Extensions page**: Navigate to `chrome://extensions/`
2. **Enable Developer mode**: Toggle the developer mode switch
3. **Load unpacked**: Click "Load unpacked" and select the `dist/dev` folder
4. **Check for errors**: Look for error messages in the Extensions page

### Manifest Errors

**Problem**: "Invalid manifest" error

**Solution**:
1. **Validate JSON**: Check `src/manifest/manifest.json` for syntax errors
2. **Check required fields**: Ensure name, version, manifest_version are present
3. **Verify permissions**: Check that all required permissions are declared
4. **Rebuild manifest**: Run `npm run build:dev` to regenerate

### Content Script Issues

**Problem**: Content scripts not injecting

**Solution**:
1. **Check matches pattern**: Verify URL patterns in manifest.json
2. **Test on correct pages**: Ensure you're testing on matching URLs
3. **Check permissions**: Verify host permissions are granted
4. **Debug console**: Check browser console for injection errors

## 🔑 Extension ID & Key Issues

### Inconsistent Extension IDs

**Problem**: Extension ID changes between loads

**Solution**:
```bash
# Generate consistent PEM keys
npm run ensure-pem

# Check current IDs
npm run show:ids

# If needed, share PEM keys with team
# Copy keys/ directory to team members
```

### Missing Extension IDs

**Problem**: `npm run show:ids` shows no IDs

**Solution**:
```bash
# Build to generate IDs
npm run build:dev

# If still missing, check config
cat config/config.json
```

### PEM Key Errors

**Problem**: Invalid or corrupted PEM files

**Solution**:
```bash
# Remove corrupted keys
rm keys/*.pem

# Regenerate fresh keys
npm run ensure-pem
npm run build:dev
```

## ⚙️ Feature Configuration Issues

### Customization Tool Not Working

**Problem**: `npm run customize` fails or hangs

**Solution**:
1. **Check Node.js version**: Requires Node.js 18+
2. **Clear cache**: Remove any cached configuration
3. **Manual configuration**: Edit `config/features.json` directly

### Feature Not Building

**Problem**: Enabled feature doesn't appear in build

**Solution**:
1. **Check feature configuration**: Verify in `config/features.json`
2. **Rebuild**: Run `npm run build:dev` after configuration changes
3. **Check webpack entries**: Verify feature is included in webpack config

## 🧪 Testing Issues

### Unit Tests Failing

**Problem**: Test suite fails

**Solution**:
```bash
# Run tests with verbose output
npm run test:unit -- --verbose

# Run specific test file
npm run test:unit background.test.ts

# Update snapshots if needed
npm run test:unit -- --updateSnapshot
```

### E2E Tests Failing

**Problem**: End-to-end tests fail

**Solution**:
```bash
# Check Chrome installation
which google-chrome || which chromium

# Run with headed mode for debugging
npm run test:e2e -- --headed

# Update browser binaries
npx playwright install chromium
```

## 🌐 Chrome Web Store Issues

### Upload Errors

**Problem**: Can't upload to Chrome Web Store

**Solution**:
1. **Use production build**: Upload `dist/prod` folder
2. **Check manifest version**: Increment version in `config/config.json`
3. **Verify permissions**: Ensure no unnecessary permissions
4. **Test locally**: Load production build in Chrome first

### Review Rejection

**Common reasons and fixes**:
- **Permissions**: Remove unused permissions from manifest
- **Privacy policy**: Add if collecting user data
- **Screenshots**: Provide clear, representative screenshots
- **Description**: Write clear, detailed store description

## 🛠️ Advanced Troubleshooting

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Build with debug information
DEBUG=* npm run build:dev

# Run with webpack stats
npm run build:dev -- --stats verbose
```

### Clear Everything

When all else fails, complete reset:

```bash
# Clear all build artifacts and dependencies
rm -rf node_modules dist .webpack-cache tsconfig.tsbuildinfo
npm cache clean --force
npm install
npm run build:dev
```

### Check Template Updates

Ensure you have the latest template features:

```bash
# Check for template updates (if using git)
git fetch origin
git log --oneline HEAD..origin/main

# Review changelog
cat CHANGELOG.md  # If available
```

## 📞 Getting Help

### Community Support
- Check existing GitHub issues in the template repository
- Search for similar problems in Chrome extension documentation
- Ask questions in relevant developer communities

### Debug Information
When reporting issues, include:
- Node.js version (`node --version`)
- NPM version (`npm --version`)
- Operating system
- Chrome version
- Complete error messages
- Steps to reproduce

### Useful Chrome URLs
- Extensions page: `chrome://extensions/`
- Extension details: `chrome://extensions/?id=YOUR_EXTENSION_ID`
- Extension console: Right-click extension icon → "Inspect popup"

This troubleshooting guide covers the most common issues. For complex problems, consider debugging step-by-step or seeking community support.
