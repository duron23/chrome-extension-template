#!/usr/bin/env node

/**
 * Git Hooks Setup Script (Maintainer Tool)
 *
 * This script sets up Git hooks for template maintainers to automatically
 * run the reset script before commits. This ensures the template stays in
 * a clean, distribution-ready state.
 *
 * ⚠️ WARNING: This is for MAINTAINERS ONLY! End users should NOT use this
 * as it will reset their extension to template defaults before every commit.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log(
  "🔧 Setting up Git hooks for Chrome Extension Template maintainers...\n"
);

// Warning for end users
console.log("⚠️  WARNING: This setup is for TEMPLATE MAINTAINERS ONLY!");
console.log(
  "   If you are developing your own extension, DO NOT run this script."
);
console.log(
  "   This will reset your extension to template defaults before every commit.\n"
);

// Get confirmation
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Are you a template maintainer setting up hooks? (yes/no): ",
  (answer) => {
    if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
      console.log(
        "❌ Setup cancelled. This is the correct choice for extension developers."
      );
      process.exit(0);
    }

    try {
      // Step 1: Configure Git to use .githooks directory
      console.log("📁 Configuring Git hooks directory...");
      execSync("git config core.hooksPath .githooks", { stdio: "pipe" });
      console.log("✅ Git hooks directory configured to .githooks");

      // Step 2: Check if hooks exist
      const projectRoot = process.cwd();
      const hooksDir = path.join(projectRoot, ".githooks");
      const preCommitHook = path.join(hooksDir, "pre-commit");
      const preCommitBat = path.join(hooksDir, "pre-commit.bat");

      if (!fs.existsSync(preCommitHook)) {
        console.log("❌ Pre-commit hook not found at .githooks/pre-commit");
        process.exit(1);
      }

      // Step 3: Make hooks executable on Unix systems
      if (process.platform !== "win32") {
        console.log("🔑 Making hooks executable...");
        try {
          execSync(`chmod +x "${preCommitHook}"`, { stdio: "pipe" });
          console.log("✅ Pre-commit hook made executable");
        } catch (error) {
          console.log(
            "⚠️  Could not make hook executable. You may need to run: chmod +x .githooks/pre-commit"
          );
        }
      }

      // Step 4: Test the configuration
      console.log("🧪 Testing Git hooks configuration...");
      const hooksPath = execSync("git config core.hooksPath", {
        encoding: "utf8",
      }).trim();
      if (hooksPath === ".githooks") {
        console.log("✅ Git hooks configuration verified");
      } else {
        console.log("❌ Git hooks configuration failed");
        process.exit(1);
      }

      // Step 5: Verify reset script exists
      const resetScript = path.join(
        projectRoot,
        "maintainer",
        "reset-extension.js"
      );
      if (!fs.existsSync(resetScript)) {
        console.log(
          "❌ Reset script not found at maintainer/reset-extension.js"
        );
        process.exit(1);
      }
      console.log("✅ Reset script found");

      console.log("\n🎉 Git hooks setup completed successfully!");
      console.log("\nNext steps:");
      console.log("1. Make your template changes");
      console.log("2. Run: git add .");
      console.log('3. Run: git commit -m "Your message"');
      console.log(
        "4. The reset script will run automatically before the commit"
      );
      console.log("\nTo disable hooks temporarily: git commit --no-verify");
      console.log("To remove hooks: git config --unset core.hooksPath");
    } catch (error) {
      console.error("❌ Setup failed:", error.message);
      process.exit(1);
    }

    rl.close();
  }
);
