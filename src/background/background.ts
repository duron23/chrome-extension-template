import { ExtensionMessage, MESSAGE_TARGETS, MESSAGE_ACTIONS } from './types';
import { playAudio, copyToClipboard } from './messaging';

console.log("Background Service Worker Initialized");

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  sender,
  sendResponse
) => {
  if (message.target === MESSAGE_TARGETS.BACKGROUND) {
    console.log('Background received message:', message);
    if (message.action === MESSAGE_ACTIONS.OFFSCREEN_READY) {
      console.log('Offscreen document is ready');
      sendResponse({ success: true });
    }
    // Return true to indicate async response
    return true;
  }
});

// Make functions available globally if needed
// (Optional: only if you need to call these from other parts of the extension)
(globalThis as any).playAudio = playAudio;
(globalThis as any).copyToClipboard = copyToClipboard;
