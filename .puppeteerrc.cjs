//const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Allow Puppeteer to download the browser (Chrome for Testing)
  // This enables a reliable fallback when system Chrome isn't found
  skipDownload: false,
  defaultProduct: "chrome",

  // If you need to download, you can uncomment and specify a cache directory
  // cacheDirectory: join(__dirname, '.cache', 'puppeteer'),

  // For extension testing, e2e will prefer system Chrome when available and
  // otherwise use Puppeteer's downloaded Chrome for Testing
};
