//import path from "path";
//import puppeteer, { Browser } from "puppeteer";
//import fs from "fs";

//const puppeteer = require("puppeteer");
//const extensionPath = "";
//const pageUrl = "";

/* (async () => {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
  const page = await browser.newPage();

  const downloadPath = path.resolve(__dirname, "downloads");
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });

  await page.goto("pageUrl");

  const element = await page.waitForSelector(
    "body > table > tbody > tr:nth-child(10) > td:nth-child(2) > a"
  );

  // Do something with element...
  await element?.click(); // Just an example.

  const filename = await waitForFile(downloadPath);

  console.log("", filename);

  // Dispose of handle.
  await element?.dispose();

  await browser.close();
})(); 

// Helper function to wait for the file to be downloaded
function waitForFile(downloadPath: string) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      fs.readdir(downloadPath, (err, files) => {
        if (err) {
          clearInterval(interval);
          reject(err);
        }
        const downloadedFile = files.find((file) => file.endsWith(".csv")); // Adjust extension if necessary
        if (downloadedFile) {
          clearInterval(interval);
          resolve(downloadedFile);
        }
      });
    }, 100);
  });
}*/
