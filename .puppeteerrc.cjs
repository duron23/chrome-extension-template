const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Skip downloading Chrome/Chromium since we'll use the system Chrome for extension testing
  skipDownload: true,

  // If you need to download, you can uncomment and specify a cache directory
  // cacheDirectory: join(__dirname, '.cache', 'puppeteer'),

  // For extension testing, we'll use the system Chrome with extension flags
  // This configuration will be used by the e2e tests
};
