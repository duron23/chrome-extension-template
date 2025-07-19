# Vite Build System

This document describes the modern Vite-based build system used by this Chrome Extension Template.

## Overview

The template has been fully migrated from Webpack to Vite 7.0.4, providing:
- ⚡ **Lightning-fast builds** with native ES modules
- 🔥 **Hot Module Replacement (HMR)** for rapid development
- 📦 **Optimized bundling** with Rollup under the hood
- 🎯 **Chrome Extension optimizations** with specialized configurations

## Architecture

### Multi-Configuration Setup

The build system uses separate Vite configurations for different Chrome extension components:

```
vite/
├── vite.config.mjs         # Main UI components (popup, options, sidepanel, offscreen)
├── vite.background.config.mjs  # Background service worker
├── vite.content.config.mjs     # Content scripts
├── vite.dev.config.mjs         # Development environment
├── vite.uat.config.mjs         # UAT environment
├── vite.prod.config.mjs        # Production environment
└── vite.watch.config.mjs       # Watch mode
```

### Component-Specific Optimizations

#### UI Components (`vite.config.mjs`)
- **Output Format**: ES modules for modern Chrome extension support
- **React Integration**: React 19.1 with automatic JSX runtime (dev) / classic JSX runtime (prod)
- **Tailwind CSS v4**: Native Vite plugin with CSS inlining for extension compatibility
- **Code Splitting**: Automatic vendor chunks for React libraries
- **Bundle Analysis**: Rollup visualizer integration with `ANALYZE=true`

#### Background Script (`vite.background.config.mjs`)
- **Output Format**: ES modules with service worker compatibility
- **Transpilation**: 1:1 TypeScript to JavaScript for optimal debugging
- **Target**: ES2024 for modern Chrome features
- **Minification**: Terser in production builds

#### Content Scripts (`vite.content.config.mjs`)
- **Output Format**: IIFE (Immediately Invoked Function Expression)
- **Isolation**: Prevents conflicts with page scripts
- **Compatibility**: Works across all web environments

## Build Environments

### Development (`npm run build:dev`)
```bash
# UI Components
vite build --config vite/vite.dev.config.mjs

# Background Script  
vite build --config vite/vite.background.config.mjs --mode development

# Content Scripts
vite build --config vite/vite.content.config.mjs --mode development
```

**Features:**
- Source maps for debugging
- Fast rebuilds with caching
- Unminified output for readability
- React development tools support

### UAT (`npm run build:uat`)
```bash
# UI Components
vite build --config vite/vite.uat.config.mjs

# Background Script
vite build --config vite/vite.background.config.mjs --mode uat

# Content Scripts  
vite build --config vite/vite.content.config.mjs --mode uat
```

**Features:**
- Production-like optimizations
- Staging environment configuration
- Performance profiling ready

### Production (`npm run build:prod`)
```bash
# UI Components
vite build --config vite/vite.prod.config.mjs

# Background Script
vite build --config vite/vite.background.config.mjs --mode production

# Content Scripts
vite build --config vite/vite.content.config.mjs --mode production
```

**Features:**
- Full minification with Terser
- Tree shaking for optimal bundle size
- Console statement removal
- Gzip/Brotli compression analysis

## Special Features

### CSS Inlining Plugin

Chrome extensions require CSS to be injected rather than linked. Our custom plugin automatically:
1. Extracts CSS from Vite bundles
2. Injects CSS as JavaScript code into each bundle
3. Removes separate CSS files from output

```javascript
// CSS is automatically injected as:
const style = document.createElement('style');
style.textContent = `/* Your CSS here */`;
document.head.appendChild(style);
```

### Bundle Analysis

Generate detailed bundle analysis reports:

```bash
npm run build:analyze
```

This creates an interactive HTML report at `dist/prod/your-extension-name-prod/stats.html` showing:
- Module dependencies and sizes
- Tree shaking effectiveness  
- Compression ratios (Gzip/Brotli)
- Code splitting opportunities

### Dynamic Feature Building

The build system automatically includes/excludes components based on `config/features.json`:

```json
{
  "features": {
    "popup": { "enabled": true },
    "options": { "enabled": true },
    "sidepanel": { "enabled": true },
    "offscreen": { "enabled": true },
    "contentScripts": { "enabled": true }
  }
}
```

Only enabled features are built, reducing bundle size and complexity.

## Watch Mode

Development watch mode with automatic rebuilds:

```bash
npm run watch
```

Features:
- **Fast incremental builds** with Vite's dependency pre-bundling
- **File watching** across all configuration files
- **Parallel building** of UI, background, and content scripts
- **Error reporting** with clear stack traces

## React 19 Compatibility

### JSX Runtime Workaround

Due to a compatibility issue between React 19 and @vitejs/plugin-react@4.6.0, the template uses:

- **Development**: Automatic JSX runtime for better DX
- **Production**: Classic JSX runtime (`React.createElement`) for stability

```javascript
react({
  jsxRuntime: isProd ? "classic" : "automatic",
  development: isDev,
})
```

**Required imports** for classic JSX runtime:
```typescript
import React from "react"; // Required for production builds
import { createRoot } from "react-dom/client";
```

### Future Migration

Once @vitejs/plugin-react is updated to properly handle React 19's automatic JSX runtime in production:
1. Remove the `jsxRuntime` configuration
2. Remove explicit `React` imports from index files
3. Use automatic JSX runtime in all environments

## Performance Optimizations

### Dependency Pre-bundling

Vite automatically pre-bundles dependencies for optimal performance:
- **React/ReactDOM**: Pre-bundled for fast startup
- **Tailwind CSS**: Processed at build time
- **TypeScript**: Fast incremental compilation

### Build Caching

- **TypeScript**: Incremental builds with `.tsbuildinfo`
- **Vite**: Dependency caching in `node_modules/.vite`
- **ESLint**: Cache files for faster linting

### Bundle Splitting

Automatic code splitting creates optimized chunks:
- **Vendor libraries**: Separate chunk for React, ReactDOM
- **Common utilities**: Shared code across components
- **Route-based splitting**: Each extension page as separate entry

## Migration Benefits

Compared to the previous Webpack setup:

| Aspect | Webpack | Vite |
|--------|---------|------|
| **Build Speed** | ~15-30s | ~1-3s |
| **Watch Mode** | ~5-10s rebuilds | ~100-500ms rebuilds |
| **Bundle Size** | Larger with unused code | Smaller with tree shaking |
| **Developer Experience** | Complex config | Simple, intuitive config |
| **Modern Features** | Manual setup | Built-in ES modules, HMR |
| **Debugging** | Source maps complex | Native source map support |

## Troubleshooting

### Common Issues

1. **"jsxDEV is not a function"** in production
   - Ensure React imports are present in index files
   - Verify classic JSX runtime is configured for production

2. **CSS not loading**
   - Check that CSS inlining plugin is working
   - Verify CSS imports in component files

3. **Bundle analysis not generating**
   - Ensure `ANALYZE=true` environment variable is set
   - Check that rollup-plugin-visualizer is installed

4. **Watch mode not rebuilding**
   - Restart watch mode if file changes aren't detected
   - Check that file paths are not excluded in .gitignore

### Debug Mode

Enable verbose Vite logging:
```bash
DEBUG=vite:* npm run build:dev
```

This provides detailed information about:
- Dependency resolution
- Plugin execution
- Bundle generation
- File watching

## Future Enhancements

Planned improvements for the build system:

1. **Vite 6 Migration**: When available, upgrade for better performance
2. **React Plugin Update**: Remove JSX runtime workaround when fixed
3. **Tailwind CSS v5**: Upgrade when stable
4. **Advanced Code Splitting**: Implement more granular chunk splitting
5. **Build Performance Metrics**: Add build time and size tracking
