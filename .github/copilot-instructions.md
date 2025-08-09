# Chrome Extension Development with GitHub Copilot

This guide prioritizes high-quality Chrome Extension Manifest V3 patterns, TypeScript, and the global theme system. Keep suggestions MV3-first and UX-secure; use the toolchain to improve developer experience.

## Copilot authoring guardrails (MV3-first)

- Always target Manifest V3 APIs (service worker background, chrome.scripting, sidePanel, offscreen, storage).
- Use TypeScript with strict types and discriminated unions for messages. Prefer async/await.
- Keep event listeners at top-level in background (service worker requirement); return `true` for async `sendResponse`.
- Enforce least-privilege: minimal `permissions` and scoped `host_permissions`. Don’t suggest wildcards unless necessary.
- Prefer content scripts for DOM work; call background for privileged APIs via typed messages.
- Use the global theme: no hard-coded colors or inline styles. Use `applyComponentTheme(component)` and `themeClasses`.
- Accessibility by default: keyboard navigation, ARIA roles, focus management, and theme-friendly contrast.
- Performance: avoid polling; use events/MutationObserver; keep content scripts light; offload heavy work to background/offscreen.
- Security: no inline scripts/eval; sanitize any HTML; validate URLs; use chrome.scripting for injections.
- Storage: batch reads/writes; handle quota; listen for `chrome.storage.onChanged`.
- Always fix lint errors and keep tests passing (Vitest). Add unit tests for new logic.

## Manifest V3 best practices

- Use a service worker background: `background.service_worker` with minimal persistent state; rebuild state on startup.
- Keep `permissions` minimal: add only when a feature truly needs it.
- Keep `host_permissions` scoped: precise origins; avoid `*://*/*`.
- Only expose `web_accessible_resources` that your pages actually load (e.g., images/fonts). Avoid broad matches.
- Use `action` only if popup exists; otherwise rely on commands/context menus.
- Content scripts: narrow `matches`; defer heavy logic to background via messaging; avoid injecting large bundles everywhere.
- Side panel: set path on install; open selectively.
- Offscreen: create on demand with clear `reasons` and `justification`; close when done.

Example snippets to keep in mind (augment, don’t overwrite existing manifest fields):

```jsonc
// permissions
"permissions": ["storage", "scripting"],
"host_permissions": ["https://example.com/*"],
// background
"background": { "service_worker": "background/background.js", "type": "module" },
// side panel (when used)
"side_panel": { "default_path": "sidepanel/sidepanel.html" }
```

## Global theme guidelines (use the already setup theme)

- Call `applyComponentTheme("popup" | "options" | "sidepanel" | "offscreen")` once per UI root (useEffect in React).
- Compose UI with `themeClasses` (buttons, inputs, container, card, header, text). Don’t hard-code styles.
- Prefer CSS variables (`var(--background-primary)`, etc.) or provided Tailwind tokens that map to theme vars.
- Listen for theme changes with `watchThemeChanges` and update local state if needed.

## Extension Architecture Guidance

### Chrome Extension Components

\*\*Background Service Worker (`src/background/`)

- Event-driven, stateless JavaScript that runs in the background
- Handles extension lifecycle, API calls, and cross-tab communication
- Use for: alarms, notifications, storage management, tab interactions
- Note: service workers are ephemeral. Re-create state on `chrome.runtime.onInstalled` and `chrome.runtime.onStartup`.

\*\*Content Scripts (`src/content/`)

- JavaScript that runs in the context of web pages
- Can access and modify DOM but runs in isolated environment
- Use for: page manipulation, data extraction, user interface injection
- Prefer messaging to call background-only APIs.

\*\*Popup (`src/popup/`)

- React-based UI that appears when clicking extension icon
- Temporary interface - state doesn't persist when closed
- Use for: quick actions, settings, status display

\*\*Options Page (`src/options/`)

- React-based full-page interface for extension settings
- Persistent configuration interface
- Use for: detailed preferences, account management, advanced settings

\*\*Side Panel (`src/sidepanel/`)

- React-based persistent panel interface (Chrome 114+)
- Stays open alongside web pages
- Use for: continuous monitoring, persistent tools, ongoing tasks
- Register panel path on install; optionally open per-tab/programmatically.

\*\*Offscreen Document (`src/offscreen/`)

- React-based hidden document for APIs requiring DOM context
- Use for: audio processing, canvas operations, third-party libraries requiring DOM

## Copilot Development Patterns

- Use descriptive names for components and functions
- Keep component logic separate from UI
- Use hooks for state and lifecycle management
- Always clean up side effects
- Always fix all lint errors.
- Keep top-level event listeners at module scope (service worker requirement).
- Use discriminated unions for message types and return `true` in listeners when responding asynchronously.

### Permission Management

When Copilot suggests new Chrome APIs, ensure you add required permissions in the manifest. For components supported by toggles, prefer `config/features.json` so the build system augments the manifest without clobbering existing fields.

```javascript
// If using chrome.storage
"permissions": ["storage"]

// If accessing specific websites
"host_permissions": ["https://example.com/*"]

// If using scripting API
"permissions": ["scripting", "activeTab"]

// Side panel (Chrome 114+)
"permissions": ["sidePanel"]

// Offscreen documents
"permissions": ["offscreen"]
```

### Message Passing Between Components

Chrome extensions use message passing for component communication. Prefer typed messages and return `true` when responding asynchronously.

```typescript
// Shared types (e.g., src/types/messaging.ts)
export type Msg =
  | { type: "GET_DATA"; query: string }
  | { type: "SET_BADGE"; count: number };

export type MsgResp =
  | { ok: true; data?: unknown }
  | { ok: false; error: string };

// Send from content/popup/options
chrome.runtime
  .sendMessage<Msg, MsgResp>({ type: "GET_DATA", query: "abc" })
  .then((resp) => {
    if (!resp.ok) console.error(resp.error);
  });

// Background listener (must be top-level)
chrome.runtime.onMessage.addListener((msg: Msg, _sender, sendResponse) => {
  (async () => {
    try {
      switch (msg.type) {
        case "GET_DATA": {
          const data = await fetchSomeData(msg.query);
          sendResponse({ ok: true, data });
          break;
        }
        case "SET_BADGE": {
          await chrome.action.setBadgeText({ text: String(msg.count) });
          sendResponse({ ok: true });
          break;
        }
      }
    } catch (e: any) {
      sendResponse({ ok: false, error: e?.message ?? String(e) });
    }
  })();
  return true; // keep the message channel open for async sendResponse
});

// Long-lived connection example
const port = chrome.runtime.connect({ name: "my-port" });
port.postMessage({ hello: "world" });
port.onMessage.addListener((msg) => {
  /* ... */
});
```

### Storage Patterns

Use Chrome's storage API for persistence:

```javascript
// Store data
await chrome.storage.local.set({ userPreferences: preferences });

// Retrieve data
const result = await chrome.storage.local.get(["userPreferences"]);
const preferences = result.userPreferences;

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" changed from "${oldValue}" to "${newValue}"`
    );
  }
});
```

### Content Script Injection

Use the scripting API for dynamic content script injection:

```javascript
// Inject script into active tab
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  function: injectedFunction,
});

// Inject CSS
await chrome.scripting.insertCSS({
  target: { tabId: tab.id },
  css: "body { background-color: red; }",
});

// Optional: inject a file bundled by Vite (ensure it exists in dist)
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ["content/content.bundle.js"],
});
```

## React Component Patterns for Extensions

### Popup Components

Keep popup components lightweight and responsive:

```typescript
// Popup should handle its own data fetching
const Popup: React.FC = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    chrome.storage.local.get(["appData"]).then((result) => {
      setData(result.appData);
    });
  }, []);

  return <div>{/* UI components */}</div>;
};
```

### Background Script Event Handlers

Structure background scripts with clear event handling:

```typescript
// Service worker event listeners must be at top level
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // First install logic
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  // Extension icon click handler
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // Tab finished loading
  }
});

// Side panel registration example
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setOptions) {
    chrome.sidePanel.setOptions({ path: "sidepanel/sidepanel.html" });
  }
});

// Optionally open side panel for specific sites
chrome.tabs.onUpdated.addListener(async (_id, info, tab) => {
  if (info.status === "complete" && tab.url?.includes("example.com")) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id! });
    } catch {}
  }
});
```

## TypeScript Best Practices

### Chrome API Types

This template includes `@types/chrome` for full TypeScript support:

```typescript
// Properly typed Chrome APIs
const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({ active: true });
const storage: { [key: string]: any } = await chrome.storage.local.get();

// Type your message interfaces
interface BackgroundMessage {
  type: "GET_TABS" | "SET_BADGE" | "UPDATE_STORAGE";
  payload?: any;
}
```

Tip: store shared interfaces (e.g., messages, storage schema) in a `src/types/` folder so Copilot can reuse them across components.

## Common Extension Patterns

### Badge Updates

Update extension badge to show status:

```javascript
// Set badge text
chrome.action.setBadgeText({ text: "5" });

// Set badge color
chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });

// Clear badge
chrome.action.setBadgeText({ text: "" });
```

### Context Menus

Add right-click context menu items:

```javascript
// Create context menu (in background script)
chrome.contextMenus.create({
  id: "myExtensionAction",
  title: "Process with My Extension",
  contexts: ["selection", "page"],
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "myExtensionAction") {
    // Handle the action
  }
});
```

### Alarm Management

Use alarms for periodic tasks:

```javascript
// Create alarm
chrome.alarms.create("periodicTask", { periodInMinutes: 5 });

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "periodicTask") {
    // Perform periodic task
  }
});
```

### Offscreen Document

Use offscreen for tasks requiring DOM/canvas/audio in the background.

```typescript
// Background: create on demand
await chrome.offscreen.createDocument({
  url: "offscreen/offscreen.html",
  reasons: [chrome.offscreen.Reason.DOM_PARSER],
  justification: "Parse DOM safely in background",
});

// Later, when done
await chrome.offscreen.closeDocument();
```

## Testing Patterns

### Unit Testing Extension Components

Test React components and utility functions:

```typescript
// Test popup component
import { render, screen } from "@testing-library/react";
import Popup from "../popup/popup";

test("renders popup correctly", () => {
  render(<Popup />);
  expect(screen.getByText("Extension Popup")).toBeInTheDocument();
});
```

### Background Script Testing

Mock Chrome APIs with Vitest (already configured in `tests/setup.ts`):

```typescript
// tests/setup.ts (excerpt)
import { vi } from "vitest";

global.chrome = {
  runtime: {
    getURL: vi.fn((p) => `chrome-extension://mock/${p}`),
    sendMessage: vi.fn(() => Promise.resolve()),
    onMessage: { addListener: vi.fn() },
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
} as any;
```

Run: `npm run test:unit` or `npm run test:ui`. For E2E: `npm run test:e2e` (set `HEADLESS=true` for headless mode).

## Security Best Practices

### Content Security Policy

Follow CSP guidelines for extension security:

```javascript
// Use chrome.scripting instead of inline scripts
// Store sensitive data in chrome.storage, not localStorage
// Validate all external data before use
// Use HTTPS for external API calls
// Avoid eval/new Function; MV3 forbids remote code execution
// Sanitize any HTML you inject and prefer textContent where possible
```

### Safe Data Handling

```javascript
// Sanitize user input
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, "");
};

// Validate URLs before navigation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

## Dev experience nudges (toolchain)

- Builds: `npm run build:dev|uat|prod`. Use `npm run watch` for live iteration (or `watch:*` scripts per bundle).
- Manifest generation is automated: version bump, name/description prefixing, PEM-derived key/ID, optional feature toggles from `config/features.json`, and `config/manifest.xml` updates. Don’t hand-edit `version`/`key`.
- Prefer enabling components via `config/features.json` over directly mutating `src/manifest/manifest.json`.
- Quality gates: `npm run ci` (typecheck, lint:check, test:unit). Always fix all lint errors.

## Template Customization

### Feature Configuration

Use the interactive tool to enable/disable extension components:

```bash
npm run customize
```

This allows you to configure:

- Popup interface
- Options page
- Side panel
- Offscreen document
- Content scripts with URL patterns

### Build Commands

```bash
# Development build with source maps
npm run build:dev

# UAT build
npm run build:uat

# Production build with optimizations
npm run build:prod

# Watch mode (build all bundles on change)
npm run watch

# Targeted watch (optional)
npm run watch:background
npm run watch:content
npm run watch:ui

# Lint / typecheck / tests
npm run lint
npm run lint:check
npm run typecheck
npm run test:unit
npm run coverage

# View current extension IDs
npm run show:ids
```

This template provides the foundation for building modern Chrome extensions with TypeScript, React, and comprehensive tooling. Use these patterns with GitHub Copilot to accelerate your extension development while following Chrome extension best practices.

Tip: When using watch mode, reload the extension in chrome://extensions after a rebuild to pick up service worker changes.

## Theme System Integration

This template includes a comprehensive theme system for consistent styling across all extension components.

### Using the Theme System

Apply component-specific theming and use pre-built theme classes:

```typescript
import { applyComponentTheme, themeClasses } from "../utils/theme";

const MyComponent: React.FC = () => {
  useEffect(() => {
    // Apply component-specific theme (popup, options, sidepanel, offscreen)
    applyComponentTheme("popup");
  }, []);

  return (
    <div className={themeClasses.container}>
      <h1 className={themeClasses.header}>My Extension</h1>
      <button className={themeClasses.buttonPrimary}>Primary Action</button>
      <input className={themeClasses.inputField} placeholder="Enter text..." />
    </div>
  );
};
```

### Dark Mode Support

The theme automatically adapts to system preferences:

```typescript
import { isDarkMode, watchThemeChanges } from "../utils/theme";

const Component: React.FC = () => {
  const [darkMode, setDarkMode] = useState(isDarkMode());

  useEffect(() => {
    const cleanup = watchThemeChanges((isDark) => {
      setDarkMode(isDark);
    });

    return cleanup;
  }, []);

  return <div>Current mode: {darkMode ? "Dark" : "Light"}</div>;
};
```

### Available Theme Classes

Use these pre-built classes for consistent styling:

- Buttons: `themeClasses.buttonPrimary`, `themeClasses.buttonSecondary`
- Inputs: `themeClasses.inputField`
- Layout: `themeClasses.container`, `themeClasses.card`
- Typography: `themeClasses.header`, `themeClasses.text`
- Animations: `themeClasses.animations.fadeIn`, `themeClasses.animations.slideIn`

### CSS Custom Properties

Access theme variables directly in CSS or Tailwind:

```css
/* Using CSS custom properties */
.my-element {
  background-color: var(--background-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

```tsx
/* Using Tailwind classes with theme variables */
<div className="bg-background-primary text-text-primary border border-border rounded-theme-lg p-4">
  Themed content
</div>
```

### Component-Specific Sizing

The theme system automatically applies appropriate sizing for each component type:

- Popup: Fit-content sizing with min/max width constraints
- Options: Centered layout with responsive padding
- Sidepanel: Full height with overflow handling
- Offscreen: Hidden by default

## Copilot prompt tips

- “Create a typed background message handler that returns true for async responses and uses discriminated unions for message types.”
- “Add side panel support with registration on install and open for specific URLs. Ensure permission is present.”
- “Refactor content script DOM logic into pure functions; keep Chrome API calls at the edges.”
- “Use the global theme classes instead of hard-coded styles and call applyComponentTheme for the current component.”
- “Write Vitest unit tests using the existing global chrome mock from tests/setup.ts; add at least a happy path and one failure case.”
- “Enable features via config/features.json and avoid overwriting existing manifest fields.”
