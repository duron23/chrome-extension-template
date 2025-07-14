/**
 * Offscreen Document Script
 *
 * This is a simple TypeScript script for offscreen document functionality.
 * It's designed for programmatic tasks (accessing DOM APIs) rather than visual UI.
 *
 * Purpose: Provides access to DOM APIs that are not available in service workers
 * or content scripts, such as:
 * - Canvas API for image processing
 * - Audio API for audio processing
 * - Crypto API for cryptographic operations
 * - IndexedDB for client-side storage
 */

console.log("Offscreen document initialized");

// Example: DOM API access that's not available in service workers
if (typeof window !== "undefined") {
  console.log("Window object available for DOM APIs");

  // Example: Canvas API usage
  const setupCanvas = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      console.log("Canvas context available for image processing");
      // Canvas operations can be performed here
    }
  };

  // Example: Audio API usage
  const setupAudio = () => {
    if (typeof AudioContext !== "undefined") {
      console.log("AudioContext available for audio processing");
      // Audio processing can be performed here
    }
  };

  // Example: IndexedDB usage
  const setupIndexedDB = () => {
    if (typeof indexedDB !== "undefined") {
      console.log("IndexedDB available for client-side storage");
      // Database operations can be performed here
    }
  };

  // Initialize APIs when document is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupCanvas();
      setupAudio();
      setupIndexedDB();
    });
  } else {
    setupCanvas();
    setupAudio();
    setupIndexedDB();
  }
}

// Listen for messages from background script or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Offscreen document received message:", message);

  // Handle different message types
  switch (message.type) {
    case "PROCESS_IMAGE":
      // Handle image processing using Canvas API
      console.log("Processing image in offscreen document");
      sendResponse({ success: true, result: "Image processed" });
      break;

    case "PROCESS_AUDIO":
      // Handle audio processing using Audio API
      console.log("Processing audio in offscreen document");
      sendResponse({ success: true, result: "Audio processed" });
      break;

    case "DATABASE_OPERATION":
      // Handle database operations using IndexedDB
      console.log("Performing database operation in offscreen document");
      sendResponse({ success: true, result: "Database operation completed" });
      break;

    default:
      console.log("Unknown message type:", message.type);
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return true; // Keep message channel open for async response
});

// Export functions for potential use by other scripts
export const processImage = (imageData: ImageData) => {
  // Image processing logic using Canvas API
  console.log("Processing image data:", imageData);
  return imageData;
};

export const processAudio = (audioBuffer: ArrayBuffer) => {
  // Audio processing logic using Audio API
  console.log("Processing audio buffer:", audioBuffer);
  return audioBuffer;
};

export const performDatabaseOperation = async (
  operation: string,
  data?: any
) => {
  // Database operation logic using IndexedDB
  console.log("Performing database operation:", operation, data);
  return { success: true, operation, data };
};
