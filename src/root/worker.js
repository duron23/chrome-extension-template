// Simple test worker - Enhanced version
console.log('Worker script loaded and starting...');

try {
  // Listen for messages from the main thread
  self.onmessage = function(event) {
    console.log('Worker received message:', event.data);
    
    try {
      // Echo back the message
      self.postMessage({
        type: 'response',
        data: `Worker processed: ${event.data}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in worker message handler:', error);
      self.postMessage({
        type: 'error',
        data: 'Failed to process message',
        error: error.message
      });
    }
  };

  // Handle errors
  self.onerror = function(error) {
    console.error('Worker global error:', error);
  };

  // Send initial message to confirm worker is ready
  self.postMessage({
    type: 'ready',
    data: 'Worker is ready and operational',
    timestamp: new Date().toISOString()
  });

  console.log('Worker initialized successfully');

} catch (error) {
  console.error('Worker initialization error:', error);
  // Try to send error message if possible
  try {
    self.postMessage({
      type: 'init_error',
      data: 'Worker failed to initialize',
      error: error.message
    });
  } catch (sendError) {
    console.error('Failed to send error message:', sendError);
  }
}
