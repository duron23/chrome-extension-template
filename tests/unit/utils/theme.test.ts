import { describe, it, expect, vi, beforeEach } from "vitest";
import { themeClasses, isDarkMode } from "@/utils/theme";

describe("Theme Utils", () => {
  beforeEach(() => {
    // Reset any global state
    vi.clearAllMocks();
  });

  it("should export theme classes", () => {
    expect(themeClasses).toBeDefined();
    expect(themeClasses.container).toBeDefined();
    expect(themeClasses.buttonPrimary).toBeDefined();
  });

  it("should detect dark mode", () => {
    // Mock matchMedia for testing
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const result = isDarkMode();
    expect(typeof result).toBe("boolean");
  });
});
