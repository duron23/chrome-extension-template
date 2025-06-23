import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playAudio, copyToClipboard } from '../../../src/background/background';

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

  it('should send message to play audio', async () => {
    await playAudio('test-audio.mp3');
    
    // Check if chrome APIs were called correctly
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      target: 'offscreen',
      action: 'playAudio',
      data: { src: 'test-audio.mp3' },
    });
  });

  it('should send message to copy text to clipboard', async () => {
    await copyToClipboard('test text');
    
    // Check if chrome APIs were called correctly
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      target: 'offscreen',
      action: 'copyToClipboard',
      data: { text: 'test text' },
    });
  });
});
