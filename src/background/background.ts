console.log("Extension Started");

chrome.runtime.onStartup.addListener(() => {
  console.log("Extension loaded");
});

chrome.downloads.onCreated.addListener(
  (downloadItem: chrome.downloads.DownloadItem) => {
    console.log("download creaed");
  }
);
