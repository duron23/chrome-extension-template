import { connectMqtt } from "./mqttClient";

console.log("Extension Started");

connectMqtt();

const activeDownloads: Map<number, chrome.downloads.DownloadDelta> = new Map();

setupListeners();
console.log("Listeners setup completed");

function setupListeners() {
  // Ensure the onCreated and onChanged listeners are added only once
  chrome.downloads.onCreated.addListener(onFileCreate);
  chrome.downloads.onChanged.addListener(onFileUpdate);
}

function onFileCreate(downloadItem: chrome.downloads.DownloadItem): void {
  try {
    console.log("Download created:", JSON.stringify(downloadItem));
    activeDownloads.set(downloadItem.id, {
      id: downloadItem.id,
      startTime: { current: downloadItem.startTime }, // Ensure startTime is properly typed
    });
  } catch (error) {
    console.error("Error in onFileCreate:", error);
  }
}

function onFileUpdate(downloadDelta: chrome.downloads.DownloadDelta): void {
  try {
    if (downloadDelta.id && activeDownloads.has(downloadDelta.id)) {
      updateActiveDownloads(downloadDelta);

      if (downloadDelta.state && downloadDelta.state.current === "complete") {
        console.log(
          "Download complete:",
          JSON.stringify(activeDownloads.get(downloadDelta.id))
        );
        // Defer processing to ensure it doesn't block the event listener
        setTimeout(() => processCompletedDownload(downloadDelta.id), 0);
        activeDownloads.delete(downloadDelta.id);
      } else {
        console.log(
          "Download updated:",
          JSON.stringify(activeDownloads.get(downloadDelta.id))
        );
      }
    }
  } catch (error) {
    console.error("Error in onFileUpdate:", error);
  }
}

function updateActiveDownloads(
  downloadDelta: chrome.downloads.DownloadDelta
): void {
  const existingDelta = activeDownloads.get(downloadDelta.id);
  activeDownloads.set(downloadDelta.id, {
    ...existingDelta,
    ...downloadDelta,
  });
}

function processCompletedDownload(downloadId: number): void {
  // Fetch details of the completed download
  chrome.downloads.search({ id: downloadId }, (results) => {
    if (results && results.length > 0) {
      const downloadItem = results[0];
      console.log("Processing completed download:", downloadItem);

      // Example: Move the downloaded file to a specific location
      // Note: File system operations require additional permissions and handling

      // Example function call to process the file
      processFile(downloadItem);
    }
  });
}

// Example function to demonstrate processing of the file
async function processFile(
  downloadItem: chrome.downloads.DownloadItem
): Promise<void> {
  // Perform necessary file processing here
  console.log(`Processing file: ${downloadItem.filename}`);
  // Example: Move the file, read content, etc.
}
