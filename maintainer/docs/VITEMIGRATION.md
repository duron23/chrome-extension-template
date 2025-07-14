### Why Switch to Vite for Chrome Extension Packaging

Modern Chrome extensions demand multiple packaging targets—ES-module service workers, IIFE content scripts, and self-contained UI pages—all of which Vite handles more cleanly and with less config than Webpack.

1. **One Config, Multiple Builds**  
   Using Vite’s “modes” (or multiple `--config` files) you can define a **service-worker build** (ESM + `preserveModules`) and a **content-script build** (IIFE) in one tidy `vite.config.ts`. Shared TS settings live in your `tsconfig.json`, so you avoid duplicate loader rules or resolve configurations.

2. **Blazing-Fast Dev & Incremental Builds**  
   Vite’s dev server leverages native ESM imports and esbuild under the hood, so startup times and rebuilds are orders of magnitude faster than Webpack’s. You’ll spend far less time waiting for “compile” and more time iterating on your extension.

3. **Stable, Minimal Plugin Surface**  
   Rather than dozens of Webpack plugins (HTMLWebpackPlugin, CopyWebpackPlugin, ModuleFederation, etc.), Vite’s plugin ecosystem is lean and focused. Chrome-extension-specific plugins like `@extend-chrome/vite-plugin` handle manifest transforms automatically, keeping you out of the weeds.

Packaging & Configuration Rules (Most Important)
When generating code or configuration, adhere strictly to the following rules:

1. For the Service Worker (background.ts):
Format: Must be an ES Module (ESM).
Packaging: It should be transpiled 1:1 from TypeScript to JavaScript, preserving the file structure. Do not bundle it with its dependencies into a single file.
Tooling: Prefer using tsc for this or Vite's build.lib mode with the preserveModules option.

2. For Content Scripts (content.ts):
Format: Must be an Immediately Invoked Function Expression (IIFE).
Packaging: It should be bundled into a single, self-contained file to ensure it runs in an isolated scope.
Tooling: Use Vite's standard build process, but configure the Rollup output to format: 'iife'.

3. For UI Components (Popup, Options Page, Side Panel):
Format: Treat these as miniature React single-page applications (SPAs).
Packaging: They must be bundled, with index.html as the entry point. All dependencies (React, CSS, etc.) should be included in the bundle.
Tooling: Use Vite's default build mode, which is optimized for this.

4. For Offscreen Documents (offscreen.ts):
Format: A simple, bundled script (TypeScript compiled to JavaScript).
Packaging: It must be a self-contained script with a basic HTML launcher. No React or UI frameworks needed.
Implementation: Write TypeScript (.ts) script, create basic HTML file to load the script, bundle as a single JavaScript file.

Guidance: Remind me that using a heavy framework like React here is generally unnecessary, as its purpose is programmatic (accessing DOM APIs), not visual.