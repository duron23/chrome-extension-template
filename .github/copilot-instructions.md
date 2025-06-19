I’m building a robust Chrome Extension “development kitchen” using modern web toolchains:

- Webpack for bundling  
- TypeScript for all extension logic and React component code  
- React for popup, background, options UI  
- Tailwind CSS for styling  
- ESLint for linting  
- Vitest for unit testing  
- Puppeteer for end‑to‑end testing

The build config files (like webpack) use plain JS. 
All actual extension source under `src/` is TS, leverages Chrome Extension APIs, and uses best-practice structure and typings.

# Copilot Instructions for Chrome Extension Development Kitchen
## General Guidelines
- All suggestions should be relevant to Chrome Extensions and the specified tech stack, not suggestion for toolchains
- Use modern TypeScript features (ES6+)
- Follow best practices for Chrome Extensions
- Keep code modular and reusable
- Use descriptive names for variables, functions, and components
- Write clear, concise comments where necessary
- Use consistent code formatting (Prettier)
- Use version control (Git) for all code changes
- Write unit tests for all new features
- Use end-to-end tests for critical user flows
- Document public APIs and complex logic

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