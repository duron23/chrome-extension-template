#!/usr/bin/env node

/**
 * Cross-platform watch script that runs UI, background, and content script builds concurrently
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🔄 Starting concurrent watch mode for all components...");
console.log("💡 Watch mode compiles code for development environment only");
console.log("═══════════════════════════════════════════════════════");

// Prepare manifest for watch mode (check dev PEM and update key property)
const prepareWatchManifest = () => {
  return new Promise((resolve, reject) => {
    console.log("🔧 Preparing development manifest...");

    const isWindows = process.platform === "win32";
    const nodeCmd = isWindows ? "node.exe" : "node";

    const prepareProcess = spawn(
      nodeCmd,
      ["scripts/prepare-watch-manifest.js"],
      {
        cwd: path.resolve(__dirname, ".."),
        stdio: "pipe",
        shell: true,
      }
    );

    let output = "";
    let errorOutput = "";

    prepareProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    prepareProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    prepareProcess.on("close", (code) => {
      if (code === 0) {
        console.log(output.trim());
        resolve();
      } else {
        console.error(errorOutput.trim());
        reject(new Error(`Manifest preparation failed with code ${code}`));
      }
    });
  });
};

const processes = [];

// Get the correct vite executable path
const getVitePath = () => {
  const isWindows = process.platform === "win32";
  const viteExecutable = isWindows ? "vite.cmd" : "vite";
  const vitePath = path.resolve(
    __dirname,
    "..",
    "node_modules",
    ".bin",
    viteExecutable
  );

  if (fs.existsSync(vitePath)) {
    return vitePath;
  }

  // Fallback to npx
  return isWindows ? "npx.cmd" : "npx";
};

// Function to spawn a Vite process
const spawnViteProcess = (configPath, mode, label, color) => {
  const vitePath = getVitePath();
  const useDirectPath = !vitePath.includes("npx");

  const args = useDirectPath
    ? ["build", "--config", configPath, "--mode", mode, "--watch"]
    : ["vite", "build", "--config", configPath, "--mode", mode, "--watch"];

  console.log(`${color}🚀 Starting ${label} watcher...${"\x1b[0m"}`);

  const child = spawn(vitePath, args, {
    cwd: path.resolve(__dirname, ".."),
    stdio: "pipe",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "dev",
    },
  });

  // Prefix output with component name
  child.stdout.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`${color}[${label}]${"\x1b[0m"} ${output}`);
    }
  });

  child.stderr.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      console.error(`${color}[${label}]${"\x1b[0m"} ${output}`);
    }
  });

  child.on("close", (code) => {
    console.log(
      `${color}[${label}]${"\x1b[0m"} Process exited with code ${code}`
    );
  });

  child.on("error", (error) => {
    console.error(`${color}[${label}]${"\x1b[0m"} Error: ${error.message}`);
  });

  return child;
};

// Start all three watch processes
const startWatchProcesses = () => {
  const uiProcess = spawnViteProcess(
    "vite/vite.watch.config.mjs",
    "development",
    "UI Components",
    "\x1b[36m" // Cyan
  );

  const backgroundProcess = spawnViteProcess(
    "vite/vite.background.config.mjs",
    "development",
    "Background",
    "\x1b[33m" // Yellow
  );

  const contentProcess = spawnViteProcess(
    "vite/vite.content.config.mjs",
    "development",
    "Content Scripts",
    "\x1b[35m" // Magenta
  );

  processes.push(uiProcess, backgroundProcess, contentProcess);

  console.log("\n✅ All watch processes started!");
  console.log("💡 Press Ctrl+C to stop all watchers");
  console.log("═══════════════════════════════════════════════════════\n");
};

// Main execution
const main = async () => {
  try {
    await prepareWatchManifest();
    startWatchProcesses();
  } catch (error) {
    console.error("❌ Failed to start watch mode:", error.message);
    process.exit(1);
  }
};

// Execute main function
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});

// Handle graceful shutdown
const cleanup = () => {
  console.log("\n🛑 Stopping all watch processes...");

  processes.forEach((child, index) => {
    const labels = ["UI Components", "Background", "Content Scripts"];
    console.log(`⏹️  Stopping ${labels[index]}...`);

    if (!child.killed) {
      child.kill("SIGTERM");

      // Force kill after 5 seconds if process doesn't terminate
      setTimeout(() => {
        if (!child.killed) {
          child.kill("SIGKILL");
        }
      }, 5000);
    }
  });

  setTimeout(() => {
    console.log("✅ All processes stopped. Goodbye!");
    process.exit(0);
  }, 1000);
};

// Handle different exit signals
process.on("SIGINT", cleanup); // Ctrl+C
process.on("SIGTERM", cleanup); // Termination signal
process.on("exit", cleanup); // Process exit

// Keep the script running
process.stdin.resume();
