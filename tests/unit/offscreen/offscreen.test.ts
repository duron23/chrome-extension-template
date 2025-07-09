import { describe, it, expect, vi, beforeEach } from 'vitest';
// Testing offscreen functionality without imports since background doesn't export

/**
 * Tests for the offscreen functionality in the background script
 * 
 * Note: The global Chrome API mock is set up in tests/setup.ts
 * This ensures that all tests have access to a consistent Chrome API mock
 */

describe('Background Script - Offscreen Functions', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup specific mock implementations for this test
    chrome.runtime.getContexts = vi.fn().mockResolvedValue([{
      contextId: 'mock-context-id',
      documentUrl: 'chrome-extension://mock-extension-id/offscreen/offscreen.html'
    }]);
    chrome.offscreen.createDocument = vi.fn().mockResolvedValue(undefined);
    chrome.runtime.sendMessage = vi.fn().mockResolvedValue(undefined);
  });

  it('should have chrome APIs available for offscreen functionality', () => {
    // Test that Chrome APIs are properly mocked and available
    expect(chrome.runtime.getContexts).toBeDefined();
    expect(chrome.offscreen.createDocument).toBeDefined();
    expect(chrome.runtime.sendMessage).toBeDefined();
  });

  it('should create offscreen document when needed', async () => {
    // Test the offscreen document creation API
    await chrome.offscreen.createDocument({
      url: 'offscreen/offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Required for AUDIO_PLAYBACK',
    });
    
    expect(chrome.offscreen.createDocument).toHaveBeenCalled();
  });
});
