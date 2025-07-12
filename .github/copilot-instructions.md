# Chrome Extension Development Toolchain

This is a modern Chrome Extension template with comprehensive tooling for development, testing, and deployment.

## Tech Stack
- **Toolchain**: JavaScript (to avoid circular dependencies with extension TypeScript code)
- **Webpack**: Module bundling with environment-specific optimizations
- **TypeScript 5.8**: All extension logic with ES2023 target
- **React 19**: Modern UI components for popup, options, and side panel
- **Tailwind CSS v3**: Utility-first styling framework
- **ESLint 9**: Flat config with comprehensive TypeScript and React rules
- **Vitest**: Fast unit testing with TypeScript support
- **Puppeteer**: End-to-end testing for Chrome extensions
- **Chrome Types**: Latest @types/chrome for API support

## Project Structure

- **Extension Source**: All extension code is under `src/`
- **Background Scripts**: `src/background/` - Service Worker implementation
- **Popup Interface**: `src/popup/` - React-based popup UI
- **Options Page**: `src/options/` - React-based settings page
- **Side Panel**: `src/sidepanel/` - React-based side panel UI  
- **Offscreen Document**: `src/offscreen/` - React-based offscreen document
- **Content Scripts**: `src/content/` - Page-level script injection
- **Manifest Configuration**: `src/manifest/` - Dynamic manifest generation
  - `config.json` - Environment-specific extension configuration
  - `features.json` - Feature toggles and component configuration
  - `manifest.json` - Generated Manifest V3 file
  - `manifest.xml` - Chrome Web Store update manifest
- **Styling**: `src/style/` - Global CSS and Tailwind configuration
- **HTML Templates**: `src/index.html` - React component entry point

## Build System

### Environments
- **Development**: `npm run build:dev` - Debug builds with source maps
- **UAT**: `npm run build:uat` - Testing builds with optimizations
- **Production**: `npm run build:prod` - Optimized builds for release

### Features
- **Code Splitting**: Automatic vendor and React library separation
- **Tree Shaking**: Removes unused code for smaller bundles
- **Extension ID Management**: Consistent IDs across environments using PEM keys
- **Feature Customization**: Interactive CLI tool (`npm run customize`)
- **Bundle Analysis**: Size analysis with `npm run build:analyze`ion “development toolchain” using modern web techniques and best practices.:

# Tech stack
- Toolchain is written in JavaScript, not TypeScript, to avoid circular dependencies with the extension code.
- Webpack for bundling
- TypeScript for all extension logic and React component code
- React for popup, sidepanel, options UI
- Tailwind CSS for styling
- ESLint for linting
- Vitest for unit testing
- Puppeteer for end‑to‑end testing
- Prettier for code formatting
- Chrome types for TypeScript support

## Copilot Development Guidelines

- All actual extension source code is under `src/`
- background script is under `src/background/`
- popup is under `src/popup/`
- options page is under `src/options/`
- side panel is under `src/sidepanel/`
- content scripts are under `src/content/`
- manifest is under `src/manifest/(version)/manifest.json`
- config.json under `src/manifest/` contains extension configuration and version information for various builds.
- index.html under `src/` is the entry point for the popup, options page, and side panel.
- static assets (images, fonts, etc.) are under `src/static/`

### Architecture Guidelines
- Extension components run in separate contexts (service worker, popup, options, side panel)
- Use Chrome messaging APIs for inter-component communication
- Avoid shared state between different extension contexts
- Service Workers are single-threaded, event-driven, and stateless
- Event listeners must be registered at the top level of service workers
- No top-level await calls in service workers
- Handle all async operations properly - no floating promises

### Feature System
- Use `npm run customize` to enable/disable the 5 core extension components
- Edit `src/manifest/features.json` for manual feature configuration
- Features control webpack entry points and add missing manifest entries (non-destructive)
- Background service worker is always included and cannot be disabled
- Permissions and host permissions must be managed manually in manifest.json
- Features only add missing entries - existing manifest configurations are preserved
- Rebuild after feature changes: `npm run build:dev`

### Extension ID Management
- PEM files in `keys/` directory ensure consistent extension IDs
- Each environment (dev/uat/prod) has its own extension ID
- Use `npm run show:ids` to view current extension IDs
- Extension IDs persist across packed and unpacked installations

### Content Scripts
- Run in isolated worlds - can access DOM but not page's JavaScript environment
- Communicate with service worker via Chrome messaging APIs
- Use for direct web page interaction and DOM manipulation
- Configure URL patterns in `features.json` for content script injection

### TypeScript Guidelines
- Use TypeScript 5.8 features with ES2023 target
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators
- Use enums for fixed sets of values
- Use type guards for runtime type checking
- Follow ESLint rules for async/await best practices

### React Guidelines (v19)
- Use functional components with hooks
- Follow React hooks rules (no conditional hooks)
- Use React.FC type for components with children
- Keep components small and focused
- Use Tailwind CSS for styling
- Components are used in popup, options, side panel, and offscreen contexts

### Testing
- **Unit Tests**: Vitest with jsdom environment (`npm run test:unit`)
- **E2E Tests**: Puppeteer with TypeScript support (`npm run test:e2e`)
- **Test UI**: Interactive testing interface (`npm run test:ui`)
- **Coverage**: Comprehensive reports (`npm run coverage`)
- Build extension before running E2E tests: `npm run build:dev`
