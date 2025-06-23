Chrome Extension “development toolchain” using modern web techniques and best practices.:

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

# Copilot Instructions for Chrome Extension Development Toolchain

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

## General Guidelines
- Use modern TypeScript features (ES2023)
- Follow best practices for Chrome Extensions
- Keep code modular and reusable
- Use descriptive names for variables, functions, and components
- Write clear, concise comments where necessary
- Use consistent code formatting (Prettier)
- Use version control (Git) for all code changes
- Write unit tests for all new features
- Use end-to-end tests for critical user flows
- Document public APIs and complex logic
- Service worker, popup, options page, side panel run in their own contexts, use messaging for communication, and avoid shared state between them.
- No floating promises, always handle async operations properly

## Service Worker Guidelines
- Remember Service Workers are single-threaded and event-driven
- Service worker are stateless
- Service workers cannot have await call on the top.
- Event listeners should registered on the top level of the service worker.

## Content Scripts
- Content scripts are JavaScript files that run in the context of web pages.
- They can read and modify the DOM of the page.
- Content scripts can communicate with the service worker using message passing.
- Use content scripts for tasks that require direct interaction with web pages.
- Isolated Worlds: Understand that content scripts run in an "isolated world." This means they can access and manipulate the DOM of the web page, but they do not share the same JavaScript environment as the page itself. This prevents conflicts with the page's own scripts.

## TypeScript Guidelines
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators
- Use enums for fixed sets of values
- Use type guards for runtime type checking
- Refer to ESLint best practices

## React Guidelines
- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Use React.FC type for components with children
- Keep components small and focused
- Use TailwindCSS for component styling
