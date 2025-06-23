console.log("Background Service Worker Initialized");

// Define types for message communication
// This interface is used for type checking our message objects
interface ExtensionMessage {
  target: string;
  action: string;
  data?: unknown;
}

// Define types for offscreen document reasons
type OffscreenDocumentReason = 'AUDIO_PLAYBACK' | 'CLIPBOARD' | 'DOM_SCRAPING';

/**
 * Checks if an offscreen document is already open
 * @returns Promise that resolves to boolean indicating if document exists
 */
async function hasOffscreenDocument(): Promise<boolean> {
  // Create a path to offscreen.html
  const offscreenUrl = chrome.runtime.getURL('offscreen/offscreen.html');
  
  // Use the offscreen API to check if document exists
  try {
    // In MV3, we can use this method
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'] as chrome.runtime.ContextType[],
      documentUrls: [offscreenUrl]
    });
    return existingContexts.length > 0;
  } catch (error) {
    console.error("Error checking for offscreen document:", error);
    return false;
  }
}

/**
 * Creates an offscreen document for tasks that require DOM access
 * @param reason The purpose of creating the offscreen document
 */
async function createOffscreenDocument(reason: OffscreenDocumentReason): Promise<void> {
  // Check if we already have an offscreen document
  if (await hasOffscreenDocument()) {
    return;
  }

  // Create the offscreen document
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('offscreen/offscreen.html'),
    reasons: [reason],
    justification: `Required for ${reason}`,
  });
}

/**
 * Closes the offscreen document if it exists
 */
// Utility function to close offscreen document if needed
export async function closeOffscreenDocument(): Promise<void> {
  if (await hasOffscreenDocument()) {
    await chrome.offscreen.closeDocument();
  }
}

/**
 * Sends a message to the offscreen document
 */
async function sendMessageToOffscreen(message: ExtensionMessage): Promise<void> {
  // Ensure offscreen document exists before sending messages
  await createOffscreenDocument('AUDIO_PLAYBACK');
  await chrome.runtime.sendMessage(message);
}

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  sender,
  sendResponse
) => {
  if (message.target === 'background') {
    console.log('Background received message:', message);
    if (message.action === 'offscreenReady') {
      console.log('Offscreen document is ready');
      sendResponse({ success: true });
    }
    // Return true to indicate async response
    return true;
  }
});

// Example helper function to play audio via offscreen document
export async function playAudio(audioSrc: string): Promise<void> {
  await sendMessageToOffscreen({
    target: 'offscreen',
    action: 'playAudio',
    data: { src: audioSrc },
  } as ExtensionMessage);
}

// Example helper function to copy text to clipboard via offscreen document
export async function copyToClipboard(text: string): Promise<void> {
  await sendMessageToOffscreen({
    target: 'offscreen',
    action: 'copyToClipboard',
    data: { text },
  } as ExtensionMessage);
}
