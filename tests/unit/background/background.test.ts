import { describe, it, expect, vi, beforeEach } from "vitest";
import { playAudio, copyToClipboard, closeOffscreenDocument } from "../../../src/background/background";

/**
 * Tests for background service worker functionality
 * 
 * Note: The global Chrome API mock is set up in tests/setup.ts
 */
describe('Background Service Worker', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  it("should have playAudio function", () => {
    expect(playAudio).toBeTypeOf('function');
  });
  
  it("should have copyToClipboard function", () => {
    expect(copyToClipboard).toBeTypeOf('function');
  });
  
  it("should have closeOffscreenDocument function", () => {
    expect(closeOffscreenDocument).toBeTypeOf('function');
  });
});
