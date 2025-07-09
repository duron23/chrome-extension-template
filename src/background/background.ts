console.log("Background Service Worker Initialized");

// Track if offscreen document is ready
let offscreenReady = false;

// Simple function to create offscreen document
async function createOffscreenDocument() {
  try {
    console.log('Checking for existing offscreen documents...');
    
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    
    console.log('Existing offscreen contexts:', existingContexts.length);
    
    if (existingContexts.length > 0) {
      console.log('Offscreen document already exists');
      return;
    }

    console.log('Creating new offscreen document...');
    
    await chrome.offscreen.createDocument({
      url: 'offscreen/offscreen.html',
      reasons: ['WORKERS'],
      justification: 'Create web workers for background tasks'
    });
    
    console.log('Offscreen document created successfully');
    
    // Wait for offscreen to signal it's ready
    await waitForOffscreenReady();
  } catch (error) {
    console.error('Error creating offscreen document:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

// Wait for offscreen document to be ready
async function waitForOffscreenReady(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (offscreenReady) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Offscreen document ready timeout'));
    }, timeout);

    const checkReady = () => {
      if (offscreenReady) {
        clearTimeout(timeoutId);
        resolve();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    
    checkReady();
  });
}

// Simple function to create a web worker via offscreen
async function createWebWorker(scriptUrl: string) {
  try {
    // Ensure offscreen document exists and is ready
    await createOffscreenDocument();
    
    // Send message to offscreen to create worker
    const response = await chrome.runtime.sendMessage({
      target: "offscreen",
      action: "createWorker",
      data: { scriptUrl }
    });
    
    console.log('Worker creation response:', response);
    return response;
  } catch (error) {
    console.error('Failed to create worker:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  // Handle offscreen ready signal
  if (message.target === "background" && message.action === "offscreenReady") {
    console.log('Offscreen document is ready');
    offscreenReady = true;
    sendResponse({ success: true });
    return;
  }
  
  // Handle different message types
  if (message.action === "createWorker") {
    createWebWorker(message.scriptUrl)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
    return true; // Async response
  }
  
  sendResponse({ success: true });
});

// Example: Create a worker when extension is installed (with delay)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed - will create example worker after delay');
  // Add delay to ensure everything is set up
  setTimeout(() => {
    createWebWorker('worker.js').catch(console.error);
  }, 2000);
});
