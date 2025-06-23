# Chrome Extension Template

This repository serves as a powerful and flexible template for building Chrome Extensions. It integrates modern web technologies and optimizations to streamline development, ensuring your extension is robust, scalable, and maintainable.

## 🛠 Tech Stack

- **Webpack**: Efficiently bundles and transpiles your code with advanced optimizations including code splitting, tree shaking, and production minification.
- **React 19**: Latest React version for building modern Popup, Options, and SidePanel interfaces with enhanced performance.
- **TypeScript 5.8**: Provides strict type safety with ES2023 target and enhanced development features with incremental compilation.
- **Tailwind CSS v4**: Next-generation utility-first CSS framework with advanced production optimizations and CSS minification.
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
- **Clean Builds**: Remove build artifacts with `npm run clean`
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

## 🚀 Getting Started

### 1. Setup

To get started, clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/your-repo/chrome-extension-template.git
cd chrome-extension-template
npm install
```

**System Requirements:**
- Node.js 22+ (recommended for optimal performance)
- npm 10+ or yarn 4+
- Chrome/Chromium browser for extension testing

**Quick Start:**
```bash
# Build the extension for development
npm run build:dev

# Start development with file watching
npm run watch

# Run all tests
npm run ci
```

### 2. Configure

Before building and running the extension, customize it by editing the `.env` file. Changes in the `.env` file automatically reflect in the extension's manifest, making it easy to update key details like:

- **Extension Name**: `EXTENSION_NAME=YourExtensionName`
- **Extension Description**: `EXTENSION_DESCRIPTION=A brief description of your extension.`
- **Manifest Version**: This template exclusively uses Manifest V3, which is the latest version of the Chrome Extension manifest format. The manifest file is located at `src/manifest/manifest.json`.

#### Webpack Configuration

- **webpack.common.config.ts**: Use this file to select which parts of the extension you want to include (e.g., Popup, SidePanel, etc.). Ensure that the manifest file under `src/manifest/manifest.json` is updated accordingly.

### 3. Development

Use the following scripts to manage different environments and development processes:

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
  - Clean Build: `npm run clean` - Removes all build artifacts and caches

- **Watch**: Start a watch mode to rebuild the extension automatically on code changes.
  ```bash
  npm run watch
  ```

- **Code Quality**:
  - Type Check: `npm run typecheck` - Standalone TypeScript type checking
  - Lint Fix: `npm run lint` - Automatically fix code style issues
  - Lint Check: `npm run lint:check` - Check for linting issues (zero-warning enforcement)
  - CI Pipeline: `npm run ci` - Complete validation (typecheck + lint + tests)

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

## 📁 Project Structure

```
chrome-extension-template/
├── src/                          # Source code
│   ├── background/              # Service worker scripts
│   ├── content/                 # Content scripts
│   ├── popup/                   # Popup interface (React)
│   ├── options/                 # Options page (React)
│   ├── sidepanel/              # Side panel interface (React)
│   ├── static/                  # Static assets
│   ├── style/                   # Global styles and CSS
│   ├── manifest/                # Extension manifest
│   │   ├── config.json         # Extension configuration file
│   │   ├── manifest.json       # The manifest file (Manifest V3)
│   │   └── manifest.xml        # Update manifest for the Chrome Web Store
│   └── index.html              # HTML template
├── tests/                       # Test files
│   ├── setup.ts                # Test setup and configuration
│   ├── unit/                   # Unit tests (TypeScript + Vitest)
│   │   ├── background/         # Background script tests
│   │   ├── content/            # Content script tests
│   │   └── sidepanel/         # React component tests
│   └── e2e/                    # End-to-end tests (TypeScript + Puppeteer)
│       ├── test.ts            # Main E2E test suite
│       ├── debug.ts           # E2E debugging utilities
│       └── downloads/         # Test download artifacts
├── webpack.*.config.js         # Webpack configurations (optimized JS)
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vitest.config.js          # Vitest testing configuration
└── package.json              # Dependencies and scripts
```

## 🔧 Configuration Files

### Build System
- **webpack.common.config.js**: Shared webpack configuration with performance optimizations
- **webpack.prod.config.js**: Production-specific optimizations (code splitting, minification)
- **webpack.dev.config.js**: Development configuration with source maps
- **tsconfig.json**: TypeScript configuration with incremental compilation

### Code Quality
- **eslint.config.mjs**: Modern flat config ESLint setup for TypeScript and React with comprehensive async/await rules
- **vitest.config.js**: Testing framework configuration with TypeScript support and jsdom environment
- **tests/setup.ts**: Centralized test setup with @testing-library/jest-dom integration

### Styling
- **tailwind.config.js**: Tailwind CSS with production optimizations
- **postcss.config.js**: PostCSS configuration with autoprefixer and cssnano

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
2. **Modern ES Targets**: ES2023 compilation for modern Chrome versions
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
- **ES2023 Target**: Latest JavaScript features for modern Chrome compatibility
- **Incremental Compilation**: Faster builds with TypeScript build caching
- **Strict Type Safety**: Enhanced type checking with comprehensive compiler options
- **Chrome API Integration**: Perfect integration with @types/chrome for extension development

### Developer Experience
- **Cross-platform Compatibility**: Enhanced Windows, macOS, and Linux support
- **Node.js 22 Support**: Latest Node.js LTS compatibility
- **Dependency Optimization**: Streamlined dependencies for faster installs and smaller bundles

## 🔧 Troubleshooting

### Common Issues

**E2E Tests Failing:**
```bash
# Ensure extension is built first
npm run build:dev
npm run test:e2e
```

**TypeScript Compilation Errors:**
```bash
# Clear TypeScript cache and rebuild
npm run clean
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

### Build Performance
- Use `npm run clean` to clear build cache if experiencing issues
- The `.tsbuildinfo` file enables incremental TypeScript compilation
- Watch mode (`npm run watch`) provides fastest development rebuilds
