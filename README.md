# Chrome Extension Template

This repository serves as a powerful and flexible template for building Chrome Extensions. It integrates modern web technologies and optimizations to streamline development, ensuring your extension is robust, scalable, and maintainable.

## 🛠 Tech Stack

- **Webpack**: Efficiently bundles and tran- **Webpack**: Efficiently bundles and transforms your code with advanced optimizations including code splitting, tree shaking, and production minification.
- **React 19**: Latest React version for building modern Popup, Options, and SidePanel interfaces with enhanced performance.
- **TypeScript 5.8**: Provides strict type safety with ES2024 target and enhanced development features with incremental compilation.
- **Tailwind CSS v3**: Utility-first CSS framework with advanced production optimizations and CSS minification.
- **Vitest**: Fast and lightweight testing framework with comprehensive TypeScript support and coverage reporting.
- **Puppeteer**: Modern E2E testing with TypeScript support for Chrome extension testing.
- **ESLint 9**: Latest flat config system with comprehensive TypeScript and React rules including async/await best practices.
- **Chrome Types**: Built-in TypeScript support for Chrome's extension APIs with latest @types/chrome.

## ✨ Optimization Features

This template includes several performance and development optimizations:

### Build Optimizations
- **Code Splitting**: Automatic vendor and React library separation for better caching
- **Tree Shaking**: Removes unused code to reduce bundle size
- **CSS Minification**: Production builds include optimized CSS with cssnano
- **Console Removal**: Automatically removes console.log statements in production
- **Incremental TypeScript**: Faster rebuilds with TypeScript build caching

### Development Features
- **Bundle Analysis**: Analyze bundle size and dependencies with `npm run build:analyze`
- **Type Checking**: Standalone TypeScript type checking with `npm run typecheck`
- **Linting**: Zero-warning enforcement with comprehensive async/await rules via `npm run lint:check`
- **E2E Testing**: Modern Puppeteer-based end-to-end testing with TypeScript support
- **CI Pipeline**: Complete validation pipeline with `npm run ci`
- **Clean Builds**: Remove build artifacts with `npm run cleanup`
- **Watch Mode**: Automatic rebuilds during development with `npm run watch`

### Testing Framework
- **Unit Tests**: Vitest with jsdom environment and React Testing Library
- **E2E Tests**: TypeScript-powered Puppeteer tests with headless and GUI modes
- **Test Coverage**: Comprehensive coverage reporting with @vitest/coverage-v8
- **Test UI**: Interactive test interface with `npm run test:ui`

### Dependency Management
- **Latest Versions**: All dependencies updated to latest stable versions
- **Optimized Dependencies**: Removed unnecessary packages to reduce bundle size
- **Compatibility**: Ensured version compatibility across TypeScript toolchain
- **Security**: No security vulnerabilities with regular dependency audits

### Security Enhancements
- **Minimal Permissions**: Template uses only essential Chrome extension permissions
- **Modern Configuration**: Uses latest webpack and TypeScript configurations
- **Strict TypeScript**: Enhanced type safety with strict mode and comprehensive rules
- **Async/await Best Practices**: ESLint rules enforce proper Promise handling and error management

## 🚀 Latest Features (2025)

### New Tools & Scripts
- **Interactive Feature Customization**: Run `npm run customize` to configure extension components via CLI
- **Extension ID Management**: Comprehensive tooling for consistent IDs across builds and environments
- **Show Extension IDs**: Display configured extension IDs with `npm run show:ids`
- **Unified Theme System**: Complete design system with CSS custom properties, dark mode support, and component utilities
- **Cleanup Script**: Reset extension state and IDs for fresh starts
- **Maintainer Git Hooks**: Template maintainer tools for automatic reset before commits (maintainer-only)

### Enhanced Build System
- **Environment-Specific Builds**: Separate dev, UAT, and production configurations
- **Automatic PEM Management**: Seamless extension ID consistency across packed and unpacked installations
- **Improved Manifest Generation**: Dynamic manifest creation based on enabled features
- **Better Error Handling**: Enhanced build process with comprehensive error reporting
- **Clean Distribution**: `.gitattributes` ensures maintainer tools are excluded from releases

### Modern Dependencies (2025)
- **React 19.1**: Latest React with improved performance and new features
- **TypeScript 5.8**: Enhanced type safety and ES2024 support
- **Puppeteer 24**: Modern E2E testing with built-in TypeScript support
- **ESLint 9**: Flat config system with comprehensive TypeScript rules
- **Vitest 3.2**: Fast unit testing with improved coverage reporting

## 🚀 Getting Started

### ⚡ Quick Start (5 minutes)

**New to Chrome extensions?** Follow our [**📋 Quick Start Guide**](QUICK-START.md) to go from zero to developing in under 5 minutes!

### 1. Clone and Setup

```bash
git clone https://github.com/your-repo/chrome-extension-template.git my-extension
cd my-extension
npm install
```

### 2. Customize Your Extension

```bash
# Interactive setup - configure name, description, and features
npm run customize
```

### 3. Build and Load

```bash
# Build for development
npm run build:dev

# Start development with file watching
npm run watch
```

Load `dist/dev/my-extension-dev/` as an unpacked extension in Chrome.

**System Requirements:**
- Node.js 18+ (LTS) or Node.js 22+ (recommended for optimal performance)
- npm 9+ or yarn 4+
- Chrome/Chromium browser for extension testing
npm run watch

# Run all tests
npm run ci
```

### 2. Configure

Before building and running the extension, you can customize it using several configuration options:

#### Extension Customization
Use the interactive customization tool to configure your extension:

```bash
npm run customize
```

This allows you to:
- **Set Extension Name & Description**: Update project identity across all files
- **Enable/Disable Components**: Toggle popup, options, sidepanel, offscreen, and content scripts
- **Configure Content Script Patterns**: Set URL patterns for content script injection

#### Environment Configuration
Configure different environments through `config/config.json`:
- **Extension Name**: Shared across all environments
- **Extension Description**: Shared across all environments  
- **Version Management**: Automatic version incrementing per environment (dev/uat/prod)
- **Extension IDs**: Managed automatically for consistency with PEM keys

### 3. Development

Use the following scripts to manage different environments and development processes:

**Note:** The `maintainer/` directory contains tools used only by the template maintainer for preparing clean distributions. End users can ignore this directory.

- **Generate Manifest**: Customize the manifest based on the environment.
  - Development: `npm run prebuild:dev`
  - UAT: `npm run prebuild:uat`
  - Production: `npm run prebuild:prod`

- **Build**: Compile and optimize the extension for different environments.
  - Development: `npm run build:dev`
  - UAT: `npm run build:uat`
  - Production: `npm run build:prod`

- **Advanced Build Options**:
  - Bundle Analysis: `npm run build:analyze` - Generates detailed bundle size reports
  - Clean Build: `npm run cleanup` - Removes all build artifacts and caches

- **Watch**: Start a watch mode to rebuild the extension automatically on code changes.
  ```bash
  npm run watch
  ```

- **Code Quality**:
  - Type Check: `npm run typecheck` - Standalone TypeScript type checking
  - Lint Fix: `npm run lint` - Automatically fix code style issues
  - Lint Check: `npm run lint:check` - Check for linting issues (zero-warning enforcement)
  - CI Pipeline: `npm run ci` - Complete validation (typecheck + lint + tests)
  - Archive: `npm run archive` - Create clean distribution archive (excludes maintainer tools)

### 4. Testing

Run tests using ViTest with comprehensive TypeScript support:

- **Test Watch**: Continuously run unit tests during development.
  ```bash
  npm run test:watch
  ```

- **Test UI**: Run tests with a user interface.
  ```bash
  npm run test:ui
  ```

- **Unit Tests**: Run all unit tests.
  ```bash
  npm run test:unit
  ```

- **End-to-End Tests**: Run TypeScript-based end-to-end tests with Puppeteer.
  ```bash
  npm run test:e2e
  ```

- **E2E Headless Mode**: Run E2E tests in headless mode for CI/CD.  ```bash
  npm run test:e2e:headless
  ```

- **Test Coverage**: Generate a comprehensive test coverage report.
  ```bash
  npm run coverage
  ```

**Note**: E2E tests require a built extension. Run `npm run build:dev` before executing E2E tests.

### 5. Load the Extension

To load the extension into Chrome for testing:

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" at the top-right corner.
3. Click "Load unpacked" and select the `dist/` directory generated by the build process.

## 🧩 Feature Customization

This template includes a powerful feature customization system that allows you to easily enable or disable extension components based on your needs.

### Interactive Customization

Run the interactive customization tool to configure your extension features:

```bash
npm run customize
```

This tool provides a user-friendly CLI interface to configure:

1. **Extension Components**
   - Background Service Worker
   - Popup UI
   - Options Page
   - Side Panel
   - Offscreen Document
   - Content Scripts (with URL pattern configuration)

2. **Permissions**
   - Enable/disable standard Chrome extension permissions
   - Add custom permissions as needed

3. **Host Permissions**
   - Configure which URLs your extension can access
   - Add new host permission patterns

### Manual Configuration

You can also manually edit the feature configuration file:

```json
// config/features.json
{
  "features": {
    "popup": { "enabled": true },
    "options": { "enabled": false },
    "sidepanel": { "enabled": true },
    "offscreen": { "enabled": false },
    "contentScripts": { 
      "enabled": true,
      "matches": ["http://*/*"]
    }
  }
}
```

After updating the features configuration, rebuild your extension to apply the changes:

```bash
npm run build:dev
```

The build process will automatically update the manifest.json by adding only the missing entries for enabled features. Existing manifest entries are preserved, ensuring your manual customizations are not overridden.

## 📁 Project Structure

```
chrome-extension-template/
├── QUICK-START.md               # 🚀 5-minute setup guide for new users
├── README.md                    # Main documentation and overview
├── src/                          # Source code
│   ├── background/              # Service worker scripts
│   ├── content/                 # Content scripts
│   ├── popup/                   # Popup interface (React)
│   ├── options/                 # Options page (React)
│   ├── sidepanel/              # Side panel interface (React)
│   ├── offscreen/              # Offscreen document (React)
│   ├── utils/                   # Utility functions and theme system
│   │   └── theme.ts            # Theme utilities and design system
│   ├── style/                   # Global styles and CSS
│   ├── manifest/                # Extension manifest files
│   │   └── manifest.json       # Generated manifest file (Manifest V3)
│   └── index.html              # HTML template for React components
├── config/                      # Configuration files
│   ├── config.json             # Extension identity and environment settings
│   ├── features.json           # Feature toggles and component configuration
│   └── manifest.xml            # Update manifest for Chrome Web Store
├── .githooks/                   # Git hooks for automatic reset before commits
│   ├── pre-commit              # Unix/Linux/macOS pre-commit hook
│   └── pre-commit.bat          # Windows pre-commit hook
├── docs/                        # 📖 Developer documentation
│   ├── README.md               # Documentation index for developers
│   ├── THEME-SYSTEM.md         # Complete theme system guide
│   ├── FEATURE-CUSTOMIZATION.md # Feature configuration guide
│   ├── EXTENSION-ID-MANAGEMENT.md # PEM keys & Chrome Web Store
│   └── TROUBLESHOOTING.md      # Common issues & solutions
├── .github/                     # GitHub integration
│   └── copilot-instructions.md # GitHub Copilot guidance for Chrome extension development
├── maintainer/                  # 🔧 Maintainer-only tools (not for end users)
│   ├── README.md               # Maintainer tools documentation
│   ├── docs/                   # 📋 Maintainer-specific documentation
│   │   ├── README.md           # Maintainer documentation index
│   │   ├── GIT-HOOKS.md        # Git hooks setup & troubleshooting
│   │   ├── RESET-SCRIPT.md     # Reset script documentation
│   │   ├── CROSS-PLATFORM-RESET.md # Cross-platform considerations
│   │   ├── DISTRIBUTION.md     # Template distribution guide
│   │   └── keys-README.md      # PEM key management for maintainers
│   ├── reset-extension.js      # Template reset script
│   ├── setup-git-hooks.js      # Git hooks setup (maintainer-only)
│   ├── test-git-hooks.js       # Git hooks testing utility
│   ├── maintainer-reset.bat    # Windows reset wrapper
│   └── maintainer-reset.sh     # Linux/Unix reset wrapper
├── scripts/                     # Build and utility scripts
│   ├── customize-features.js   # Interactive feature customization
│   ├── generate-manifest.js    # Dynamic manifest generation
│   ├── ensure-pem.js          # PEM key management
│   └── show-extension-ids.js  # Display current extension IDs
├── webpack/                     # Webpack configurations
│   ├── webpack.common.config.js    # Shared webpack configuration
│   ├── webpack.dev.config.js      # Development builds
│   ├── webpack.uat.config.js      # UAT builds
│   ├── webpack.prod.config.js     # Production builds
│   └── webpack.watch.config.js    # Watch mode configuration
├── keys/                        # PEM files for consistent extension IDs
├── tests/                       # Test files
│   ├── setup.ts                # Test setup and configuration
│   ├── unit/                   # Unit tests (TypeScript + Vitest)
│   │   ├── background/         # Background script tests
│   │   ├── content/            # Content script tests
│   │   ├── offscreen/          # Offscreen document tests
│   │   └── sidepanel/         # React component tests
│   └── e2e/                    # End-to-end tests (TypeScript + Puppeteer)
│       └── test.ts            # Main E2E test suite
├── dist/                        # Build output (generated)
│   ├── dev/                    # Development builds
│   ├── uat/                    # UAT builds
│   └── prod/                   # Production builds
├── eslint.config.mjs           # Modern ESLint flat configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vitest.config.js          # Vitest testing configuration
├── postcss.config.js         # PostCSS configuration
├── .gitattributes            # Git export attributes (excludes maintainer tools from releases)
└── package.json              # Dependencies and scripts
```

## 🔧 Configuration Files

### Build System
- **webpack.common.config.js**: Shared webpack configuration with performance optimizations
- **webpack.prod.config.js**: Production-specific optimizations (code splitting, minification)
- **webpack.dev.config.js**: Development configuration with source maps
- **webpack.uat.config.js**: UAT-specific build configuration
- **webpack.watch.config.js**: Watch mode configuration for development
- **tsconfig.json**: TypeScript configuration with incremental compilation

### Extension Configuration
- **config/config.json**: Environment-specific extension settings and metadata
- **config/features.json**: Feature toggles for components and permissions
- **src/manifest/manifest.json**: Generated Manifest V3 file (auto-generated)
- **config/manifest.xml**: Chrome Web Store update manifest

### Code Quality
- **eslint.config.mjs**: Modern flat config ESLint setup for TypeScript and React with comprehensive async/await rules
- **vitest.config.js**: Testing framework configuration with TypeScript support and jsdom environment
- **tests/setup.ts**: Centralized test setup with @testing-library/jest-dom integration

### Styling
- **tailwind.config.js**: Tailwind CSS with production optimizations
- **postcss.config.js**: PostCSS configuration with autoprefixer and cssnano

### Development Tools
- **scripts/customize-features.js**: Interactive CLI tool for feature configuration
- **scripts/generate-manifest.js**: Dynamic manifest generation based on features and environment
- **scripts/pack-extension.js**: Extension packaging with consistent ID management
- **scripts/ensure-pem.js**: Automatic PEM key generation and management
- **scripts/show-extension-ids.js**: Display current extension IDs for all environments

## 🎯 Performance Optimizations

### Production Build Features
1. **Code Splitting**: Separates vendor libraries and React chunks for better caching
2. **Tree Shaking**: Removes unused code with `sideEffects: false` configuration
3. **Minification**: CSS minification with cssnano, JS minification with Terser
4. **Console Removal**: Automatically strips console.log and debugger statements
5. **Bundle Analysis**: Optional bundle size analysis with webpack-bundle-analyzer

### Development Features
1. **Incremental Compilation**: TypeScript builds only changed files
2. **Source Maps**: Detailed debugging information in development
3. **Hot Reloading**: Watch mode for automatic rebuilds
4. **Type Checking**: Standalone TypeScript validation

### Security & Best Practices
1. **Minimal Permissions**: Only essential Chrome extension permissions
2. **Modern ES Targets**: ES2024 compilation for modern Chrome versions
3. **Strict TypeScript**: Enhanced type safety and error catching
4. **Async/await Excellence**: Comprehensive ESLint rules for Promise handling and error management

## 🆕 Recent Improvements

This template has been enhanced with several cutting-edge features:

### Enhanced Testing Infrastructure
- **Modern Puppeteer Integration**: Latest Puppeteer v24 with built-in TypeScript support
- **Comprehensive E2E Testing**: Chrome extension-specific testing with proper extension loading
- **Dual Test Modes**: Both headless and GUI modes for different testing scenarios
- **Screenshot Capabilities**: Automated screenshot capture for visual debugging

### Advanced ESLint Configuration
- **Flat Config System**: Modern ESLint 9 configuration with enhanced performance
- **Async/await Best Practices**: Industry-standard rules for Promise handling
- **React Hooks Validation**: Comprehensive hooks linting with latest eslint-plugin-react-hooks
- **Zero-warning Policy**: Strict enforcement for production-ready code quality

### TypeScript Excellence
- **ES2024 Target**: Latest JavaScript features for modern Chrome compatibility
- **Incremental Compilation**: Faster builds with TypeScript build caching
- **Strict Type Safety**: Enhanced type checking with comprehensive compiler options
- **Chrome API Integration**: Perfect integration with @types/chrome for extension development

### Developer Experience
- **Cross-platform Compatibility**: Enhanced Windows, macOS, and Linux support
- **Node.js 18-22 Support**: Compatible with Node.js LTS versions from 18 to latest 22
- **Dependency Optimization**: Streamlined dependencies for faster installs and smaller bundles
- **Feature Customization**: Interactive CLI tool for enabling/disabling extension features
- **Extension ID Management**: Comprehensive system for managing consistent extension IDs across environments

## 📦 Extension ID Management

This template includes a comprehensive system for managing Chrome Extension IDs across different environments:

### Consistent Extension IDs

- **Persistent PEM Keys**: Private keys (PEM files) are stored in the `keys/` directory
- **Environment-Specific IDs**: Separate PEM files for dev, UAT, and production builds
- **Automatic Key Management**: PEM files are automatically created and reused when packaging
- **Public Key Insertion**: The public key is extracted and inserted into the manifest.json

### Key Benefits

1. **Development Consistency**: Extension ID remains the same during development across builds
2. **Cross-Machine Compatibility**: Store PEM files in version control for team consistency
3. **Environment Isolation**: Each build environment (dev, UAT, prod) maintains its own unique ID
4. **Unpacked Loading Support**: Same ID when loading unpacked or installing via CRX

### Usage

```bash
# Build and package the extension with consistent IDs
npm run build:dev   # Development build
npm run build:uat   # UAT build
npm run build:prod  # Production build

# Show information about configured extension IDs
npm run show:ids
```

The packaging script (integrated into the build process):
1. Checks for an existing PEM file in the `keys/` directory
2. Uses it if found, or generates a new one if not
3. Updates the manifest with the public key
4. Ensures consistent extension IDs across builds

## 🔧 Troubleshooting

### Common Issues

**Extension ID Changes:**
```bash
# Check current extension IDs
npm run show:ids

# Ensure PEM files exist for consistent IDs
npm run ensure-pem
```

**E2E Tests Failing:**
```bash
# Ensure extension is built first
npm run build:dev
npm run test:e2e

# Run in headless mode for CI
npm run test:e2e:headless
```

**Feature Configuration Issues:**
```bash
# Use interactive tool to reconfigure features
npm run customize

# Rebuild after feature changes
npm run build:dev
```

**TypeScript Compilation Errors:**
```bash
# Clear TypeScript cache and rebuild
npm run cleanup
npm run typecheck
```

**ESLint Configuration Issues:**
```bash
# Check ESLint configuration
npm run lint:check
# Auto-fix issues
npm run lint
```

**Extension Loading Problems:**
1. Verify the extension build exists in `dist/dev/` directory
2. Check Chrome Developer Mode is enabled
3. Ensure manifest.json is present in the built extension
4. Verify extension ID consistency if updating an existing extension

**Build Performance Issues:**
- Use `npm run cleanup` to clear build cache if experiencing issues
- The `.tsbuildinfo` file enables incremental TypeScript compilation
- Watch mode (`npm run watch`) provides fastest development rebuilds
- Consider using `npm run build:analyze` to identify bundle size issues

**Dependency Issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for security vulnerabilities
npm audit

# Update dependencies (be careful with breaking changes)
npm update
```

### Clean Distribution
- **.gitattributes**: Defines export-ignore patterns to exclude maintainer tools from release archives
  - Excludes `maintainer/` directory from git archive
  - Excludes `.githooks/` directory from distributions
  - Removes development-only documentation and temp files
  - Ensures end users get clean, focused template files

## 📚 Documentation

**Getting Started:**
- **[🚀 Quick Start Guide](QUICK-START.md)** - 5-minute setup for new users
- **[📖 Documentation Index](docs/README.md)** - Complete guide to all documentation

**Development Guides:**
- **[🎨 Theme System](docs/THEME-SYSTEM.md)** - Unified design system and styling guide
- **[⚙️ Feature Customization](docs/FEATURE-CUSTOMIZATION.md)** - Configure extension components
- **[🔧 Extension ID Management](docs/EXTENSION-ID-MANAGEMENT.md)** - PEM keys and extension IDs

**Advanced:**
- **[🔗 Git Hooks](docs/GIT-HOOKS.md)** - Maintainer tools for automatic reset (maintainer-only)
