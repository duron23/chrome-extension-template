import React, { useEffect, useState } from "react";

// Define types for message structure
interface OffscreenMessage {
  target: string;
  action: string;
  data: unknown;
}

interface AudioData {
  src: string;
}

interface ClipboardData {
  text: string;
}

/**
 * Offscreen Component for handling tasks that require a DOM but no visible UI
 * Examples include audio playback, clipboard access, etc.
 */
const Offscreen: React.FC = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message: OffscreenMessage, sender, sendResponse) => {
      if (message.target === "offscreen") {
        console.log("Offscreen received message:", message);
        
        // Handle different offscreen tasks
        switch (message.action) {
          case "playAudio":
            handlePlayAudio(message.data as AudioData);
            break;
          case "copyToClipboard":
            handleCopyToClipboard(message.data as ClipboardData);
            break;
          // Add other offscreen tasks as needed
          default:
            console.warn("Unknown offscreen action:", message.action);
        }
        
        // Always send a response to avoid "The message port closed" error
        sendResponse({ success: true });
        return true; // Important: indicates async response
      }
    });

    setInitialized(true);
    console.log("Offscreen page initialized");
    
    // Notify background script that offscreen is ready
    chrome.runtime.sendMessage({
      target: "background",
      action: "offscreenReady"
    }).catch(err => {
      // Handle potential errors when background is not available
      console.error("Failed to notify background:", err);
    });

    // Cleanup function
    return () => {
      console.log("Offscreen page cleanup");
    };
  }, []);

  /**
   * Handles playing audio via offscreen document
   */
  const handlePlayAudio = (data: { src: string }) => {
    try {
      const audio = new Audio(data.src);
      audio.play().catch(error => {
        console.error("Failed to play audio:", error);
      });
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  /**
   * Handles copying text to clipboard
   */
  const handleCopyToClipboard = (data: { text: string }) => {
    try {
      navigator.clipboard.writeText(data.text).then(() => {
        console.log("Text copied to clipboard");
      }).catch(err => {
        console.error("Failed to copy text:", err);
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <div className="offscreen-container">
      {/* This is an invisible page, no visible UI needed */}
      <div id="status">{initialized ? "Offscreen page ready" : "Initializing..."}</div>
    </div>
  );
};

export default Offscreen;
