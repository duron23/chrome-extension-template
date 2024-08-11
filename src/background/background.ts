console.log("Extension Started");

chrome.downloads.onCreated.addListener(
  (downloadItem: chrome.downloads.DownloadItem) => {
    console.log("", downloadItem.id);
  }
);
