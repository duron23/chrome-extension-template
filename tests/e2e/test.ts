import puppeteer, { Browser } from "puppeteer";

//const puppeteer = require("puppeteer");

(async () => {
  const browser: Browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-extensions-except=C:\\Users\\faroo\\Documents\\Projects\\chrome-extensions\\chrome-extension-template\\dist\\dev\\chrome-extension-templatedev",
      "--load-extension=C:\\Users\\faroo\\Documents\\Projects\\chrome-extensions\\chrome-extension-template\\dist\\dev\\chrome-extension-templatedev",
    ],
  });
  const page = await browser.newPage();
  await page.goto("http://10.5.1.6/share");

  const element = await page.waitForSelector(
    "body > table > tbody > tr:nth-child(10) > td:nth-child(2) > a"
  );

  // Do something with element...
  await element?.click(); // Just an example.

  // Dispose of handle.
  await element?.dispose();

  //await browser.close();
})();
