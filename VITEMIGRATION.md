### Why Switch to Vite for Chrome Extension Packaging

Modern Chrome extensions demand multiple packaging targets—ES-module service workers, IIFE content scripts, and self-contained UI pages—all of which Vite handles more cleanly and with less config than Webpack.

1. **Truly Native ES-Modules for Service Workers**  
   Chrome MV3 requires your background script to be an ES module (`"type": "module"`), with `import`/`export` support built in. Vite’s default output is ESNext, so you get zero-bundle, side-by-side `.js` files that map 1:1 to your `.ts` sources. No more wrestling with `experiments.outputModule` or custom `libraryTarget` settings.

2. **Out-of-the-Box IIFE for Content Scripts**  
   Content scripts must run as classic scripts (no module loader) and avoid leaking globals. Vite’s Rollup engine lets you build content-script entries with `format: 'iife'` and even insert a small wrapper banner/footer automatically—without maintaining separate Webpack configs just to tweak `output.library` or `libraryTarget`.

3. **Self-Contained Popup/Options/Offscreen UI**  
   Popups, options pages, and offscreen documents are just tiny web apps. Vite treats each HTML + its JS/TS entry as a “mini build,” bundling in React, Tailwind, or whatever you choose. You get hot-reload in dev, minimal config, and lean production bundles—no more hand-rolling multiple Webpack entrypoints and HTML plugins for every UI page.

4. **One Config, Multiple Builds**  
   Using Vite’s “modes” (or multiple `--config` files) you can define a **service-worker build** (ESM + `preserveModules`) and a **content-script build** (IIFE) in one tidy `vite.config.ts`. Changes to shared TS settings live in your `tsconfig.json`; you won’t need two separate `ts-loader` rules or duplicate `resolve.extensions` blocks.

5. **Blazing-Fast Dev & Incremental Builds**  
   Vite’s dev server leverages native ESM imports and esbuild under the hood, so startup times and rebuilds are orders of magnitude faster than Webpack’s. You’ll spend far less time waiting for “compile” and more time iterating on your extension.

6. **Stable, Minimal Plugin Surface**  
   Rather than dozens of Webpack plugins (HTMLWebpackPlugin, CopyWebpackPlugin, ModuleFederation, etc.), Vite’s plugin ecosystem is lean and focused. Chrome-extension-specific plugins like `@extend-chrome/vite-plugin` handle manifest transforms automatically, keeping you out of the weeds.

---

By using Vite, you retain:

- **1:1 file structure** (TS → JS) for easy debugging.  
- **Correct module formats** for each extension component without custom loader hacks.  
- **Lightning-fast dev experience** with built-in HMR and esbuild speed.  

All that with far fewer lines of config than a comparable Webpack setup.
