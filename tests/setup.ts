/* 

Custom matchers, enable toBeInTheDocument.
also configured in vitest.config.ts > setupFiles property
also this setup file is run before each test file

*/

import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Create global chrome mock for all tests
// Using 'as any' to avoid TypeScript errors with the partial implementation
global.chrome = {
  runtime: {
    getURL: vi.fn(path => `chrome-extension://mock-extension-id/${path}`),
    sendMessage: vi.fn(() => Promise.resolve()),
    onMessage: {
      addListener: vi.fn(),
    },
    getContexts: vi.fn(() => Promise.resolve([])),
  },
  offscreen: {
    createDocument: vi.fn(() => Promise.resolve()),
    closeDocument: vi.fn(() => Promise.resolve()),
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
} as any; // Cast to any to avoid missing properties in the mock
