import React, { useEffect, useState } from "react";

// Define minimal types for web worker creation
interface WorkerMessage {
  target: string;
  action: string;
  data: {
    scriptUrl: string;
  };
}

/**
 * Minimal Offscreen Component for Web Worker creation
 */
const Offscreen: React.FC = () => {
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    // Listen for worker creation requests
    chrome.runtime.onMessage.addListener((message: WorkerMessage, sender, sendResponse) => {
      if (message.target === "offscreen" && message.action === "createWorker") {
        createWorker(message.data.scriptUrl);
        sendResponse({ success: true });
      }
    });

    console.log("Offscreen page ready for worker creation");
    
    // Signal to background that offscreen is ready
    chrome.runtime.sendMessage({
      target: "background",
      action: "offscreenReady"
    }).catch(error => {
      console.error("Failed to signal offscreen ready:", error);
    });
  }, []);

  /**
   * Creates a Web Worker
   */
  const createWorker = (scriptUrl: string) => {
    try {
      console.log("Creating worker with script URL:", scriptUrl);
      
      // Terminate existing worker if any
      if (worker) {
        console.log("Terminating existing worker");
        worker.terminate();
      }

      // Create new worker
      const newWorker = new Worker(scriptUrl);
      
      // Enhanced message handling
      newWorker.onmessage = (event) => {
        console.log("Worker message received:", event.data);
      };

      // Enhanced error handling
      newWorker.onerror = (error) => {
        console.error("Worker error occurred:");
        console.error("Error event:", error);
        console.error("Error details:", {
          message: error.message,
          filename: error.filename,
          lineno: error.lineno,
          colno: error.colno,
          error: error.error
        });
        
        // Also log the worker state
        console.error("Worker state when error occurred:", {
          scriptUrl: scriptUrl,
          workerExists: !!newWorker
        });
      };

      // Handle worker termination
      newWorker.onmessageerror = (error) => {
        console.error("Worker message error:", error);
      };

      setWorker(newWorker);
      console.log("Web Worker created successfully with URL:", scriptUrl);
      
      // Test the worker with a simple message
      setTimeout(() => {
        if (newWorker) {
          console.log("Sending test message to worker");
          newWorker.postMessage("Hello from offscreen");
        }
      }, 100);
      
    } catch (error) {
      console.error("Failed to create worker:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
  };

  return (
    <div>
      <div>Offscreen: {worker ? "Worker active" : "No worker"}</div>
    </div>
  );
};

export default Offscreen;
