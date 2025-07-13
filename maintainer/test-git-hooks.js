#!/usr/bin/env node

/**
 * Test Git Hooks
 *
 * Simple script to test if git hooks are properly configured and working
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🧪 Testing Git Hooks Configuration...\n");

try {
  // Test 1: Check if git hooks path is configured
  console.log("1. Checking Git hooks path configuration...");
  const hooksPath = execSync("git config core.hooksPath", {
    encoding: "utf8",
  }).trim();

  if (hooksPath === ".githooks") {
    console.log("✅ Git hooks path correctly configured to .githooks");
  } else if (hooksPath === "") {
    console.log(
      "❌ Git hooks path not configured. Run: node maintainer/setup-git-hooks.js"
    );
    process.exit(1);
  } else {
    console.log(
      `⚠️  Git hooks path configured to: ${hooksPath} (expected: .githooks)`
    );
  }

  // Test 2: Check if pre-commit hook exists
  console.log("\n2. Checking pre-commit hook existence...");
  const preCommitHook = path.join(process.cwd(), ".githooks", "pre-commit");

  if (fs.existsSync(preCommitHook)) {
    console.log("✅ Pre-commit hook exists at .githooks/pre-commit");
  } else {
    console.log("❌ Pre-commit hook not found at .githooks/pre-commit");
    process.exit(1);
  }

  // Test 3: Check if reset script exists
  console.log("\n3. Checking reset script existence...");
  const resetScript = path.join(
    process.cwd(),
    "maintainer",
    "reset-extension.js"
  );

  if (fs.existsSync(resetScript)) {
    console.log("✅ Reset script exists at maintainer/reset-extension.js");
  } else {
    console.log("❌ Reset script not found at maintainer/reset-extension.js");
    process.exit(1);
  }

  // Test 4: Check if we're in a git repository
  console.log("\n4. Checking Git repository status...");
  try {
    execSync("git rev-parse --git-dir", { stdio: "pipe" });
    console.log("✅ Currently in a Git repository");
  } catch (error) {
    console.log("❌ Not in a Git repository");
    process.exit(1);
  }

  // Test 5: Check hook permissions (Unix only)
  if (process.platform !== "win32") {
    console.log("\n5. Checking hook permissions...");
    try {
      const stats = fs.statSync(preCommitHook);
      const isExecutable = !!(stats.mode & parseInt("111", 8));

      if (isExecutable) {
        console.log("✅ Pre-commit hook is executable");
      } else {
        console.log(
          "⚠️  Pre-commit hook is not executable. Run: chmod +x .githooks/pre-commit"
        );
      }
    } catch (error) {
      console.log("⚠️  Could not check hook permissions");
    }
  }

  console.log("\n🎉 Git hooks configuration test completed!");
  console.log(
    "\nHooks are properly configured and should work on your next commit."
  );
  console.log(
    'To test manually, try: git add . && git commit -m "test commit"'
  );
  console.log("(The commit will be cancelled after the reset runs)");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  console.log("\nTo set up git hooks, run: node maintainer/setup-git-hooks.js");
  process.exit(1);
}
