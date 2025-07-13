import path from "path";
import fs from "fs";

// Import puppeteer properly
import puppeteer, { type Browser, type Page } from "puppeteer";

// Helper function to get the parent folder name (matches webpack logic)
const getParentFolderName = (): string => {
  return path.basename(path.resolve(__dirname, "..", ".."));
};

// Configuration
const extensionBuild = process.env.EXTENSION_BUILD || "dev";
const extensionName = getParentFolderName();
const extensionPath = path.resolve(
  __dirname,
  `../../dist/${extensionBuild}/${extensionName}-${extensionBuild}`
);
const pageUrl =
  "data:text/html,<html><head><title>Test Page</title></head><body><h1>E2E Test Page</h1></body></html>";
const isHeadless = process.env.HEADLESS === "true";

async function runE2ETest(): Promise<void> {
  let browser: Browser | null = null;

  try {
    console.log("🚀 Starting E2E test...");
    console.log(`📁 Extension name: ${extensionName}`);
    console.log(`🏗️  Build environment: ${extensionBuild}`);
    console.log(`📁 Extension path: ${extensionPath}`);
    console.log(`🎯 Headless mode: ${isHeadless}`);

    // Check if extension build exists
    if (!fs.existsSync(extensionPath)) {
      throw new Error(
        `Extension build not found at: ${extensionPath}. Please run 'npm run build:${extensionBuild}' first.`
      );
    }

    const manifestPath = path.join(extensionPath, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
      throw new Error(
        `Extension manifest not found at: ${manifestPath}. Extension build might be incomplete.`
      );
    }

    console.log("✅ Extension build verified");

    browser = await puppeteer.launch({
      headless: isHeadless,
      defaultViewport: null,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    console.log("🌐 Browser launched successfully");

    const page: Page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    console.log(`🔗 Navigating to: ${pageUrl}`);
    const response = await page.goto(pageUrl, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Failed to load page: ${response?.status()} ${response?.statusText()}`
      );
    }

    console.log("✅ Page loaded successfully");

    // Test: Check if page loaded correctly
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);

    if (!title || title.trim() === "") {
      throw new Error(
        "Page title is empty - page might not have loaded correctly"
      );
    }
    // Test: Check if extension is loaded
    const extensions = await page.evaluate(() => {
      try {
        const win = window as unknown as { chrome?: { runtime?: unknown } };
        return !!(win.chrome && win.chrome.runtime);
      } catch {
        return false;
      }
    });

    if (extensions) {
      console.log("✅ Chrome extension runtime is available");
    } else {
      console.log("❌ Chrome extension runtime not found");
    }

    // Test: Wait for body element
    try {
      await page.waitForSelector("body", { timeout: 5000 });
      console.log("✅ Page body element found");
    } catch (error) {
      console.log("❌ Could not find body element:", error);
      throw error;
    } // Test: Take a screenshot (for debugging)
    if (!isHeadless) {
      const screenshotPath = path.join(
        __dirname,
        "screenshot.png"
      ) as `${string}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`📸 Screenshot saved to: ${screenshotPath}`);
    }

    console.log("✅ E2E test completed successfully");
  } catch (error) {
    console.error("❌ E2E test failed:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔒 Browser closed");
    }
  }
}

// Helper function to wait for elements (keeping for potential future use)
async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<void> {
  await page.waitForSelector(selector, { timeout });
}

// Execute the test when run directly
if (require.main === module) {
  console.log("🧪 Chrome Extension E2E Test Runner");
  console.log("====================================");

  runE2ETest()
    .then(() => {
      console.log("🎉 All tests passed!");
      process.exit(0);
    })
    .catch((error: Error) => {
      console.error("💥 Test execution failed:", error.message);
      process.exit(1);
    });
}

export { runE2ETest, waitForElement };
