# Chrome Extension Development with GitHub Copilot

This guide helps you use GitHub Copilot effectively when developing Chrome extensions using this template.

## Extension Architecture Guidance

### Chrome Extension Components

**Background Service Worker (`src/background/`)**

- Event-driven, stateless JavaScript that runs in the background
- Handles extension lifecycle, API calls, and cross-tab communication
- Use for: alarms, notifications, storage management, tab interactions

**Content Scripts (`src/content/`)**

- JavaScript that runs in the context of web pages
- Can access and modify DOM but runs in isolated environment
- Use for: page manipulation, data extraction, user interface injection

**Popup (`src/popup/`)**

- React-based UI that appears when clicking extension icon
- Temporary interface - state doesn't persist when closed
- Use for: quick actions, settings, status display

**Options Page (`src/options/`)**

- React-based full-page interface for extension settings
- Persistent configuration interface
- Use for: detailed preferences, account management, advanced settings

**Side Panel (`src/sidepanel/`)**

- React-based persistent panel interface (Chrome 114+)
- Stays open alongside web pages
- Use for: continuous monitoring, persistent tools, ongoing tasks

**Offscreen Document (`src/offscreen/`)**

- React-based hidden document for APIs requiring DOM context
- Use for: audio processing, canvas operations, third-party libraries requiring DOM

## Copilot Development Patterns

### Permission Management

When Copilot suggests new Chrome APIs, ensure you add required permissions to `src/manifest/manifest.json`:

```javascript
// If using chrome.storage
"permissions": ["storage"]

// If accessing specific websites
"host_permissions": ["https://example.com/*"]

// If using scripting API
"permissions": ["scripting", "activeTab"]
```

### Message Passing Between Components

Chrome extensions use message passing for component communication:

```javascript
// From content script to background
chrome.runtime.sendMessage({ type: "GET_DATA", payload: data });

// From popup to background
chrome.runtime.sendMessage({ action: "updateBadge", count: 5 });

// Background script listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_DATA") {
    // Handle message
    sendResponse({ success: true, data: result });
  }
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

### Extension Context Types

Define types for different extension contexts:

```typescript
// Content script context
interface ContentScriptContext {
  url: string;
  title: string;
  selectedText?: string;
}

// Background script context
interface BackgroundContext {
  tabId: number;
  windowId: number;
  extensionId: string;
}
```

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

Mock Chrome APIs for testing:

```typescript
// Mock chrome API
const mockChrome = {
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
    },
  },
};

global.chrome = mockChrome as any;
```

## Security Best Practices

### Content Security Policy

Follow CSP guidelines for extension security:

```javascript
// Use chrome.scripting instead of inline scripts
// Store sensitive data in chrome.storage, not localStorage
// Validate all external data before use
// Use HTTPS for external API calls
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

# Production build with optimizations
npm run build:prod

# Watch mode for development
npm run watch

# View current extension IDs
npm run show:ids
```

### File Structure

```
src/
├── background/     # Service worker
├── content/        # Content scripts
├── popup/          # Popup React app
├── options/        # Options React app
├── sidepanel/      # Side panel React app
├── offscreen/      # Offscreen document React app
├── style/          # CSS and Tailwind
└── manifest/       # Extension manifest
```

This template provides the foundation for building modern Chrome extensions with TypeScript, React, and comprehensive tooling. Use these patterns with GitHub Copilot to accelerate your extension development while following Chrome extension best practices.
