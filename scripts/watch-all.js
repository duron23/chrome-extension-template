#!/usr/bin/env node

/**
 * Cross-platform watch script that runs UI, background, and content script builds concurrently
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Process coordination to prevent multiple watch instances
const lockFile = path.resolve(__dirname, "..", ".watch.lock");
const processId = process.pid;
const startTime = Date.now();

/**
 * Create a lock file to prevent multiple watch instances
 */
const createWatchLock = () => {
  try {
    if (fs.existsSync(lockFile)) {
      const lockData = fs.readFileSync(lockFile, "utf8");
      const lock = JSON.parse(lockData);

      // Check if the process is still running
      try {
        process.kill(lock.pid, 0); // Check if process exists
        console.error(
          `❌ Another watch process is already running (PID: ${lock.pid})`
        );
        console.error(
          `⚠️  If you're sure no other watch is running, delete ${lockFile} and try again`
        );
        process.exit(1);
      } catch (e) {
        // Process doesn't exist, remove stale lock
        console.log("🧹 Removing stale watch lock file");
        fs.unlinkSync(lockFile);
      }
    }

    const lockData = {
      pid: processId,
      startTime: startTime,
      timestamp: Date.now(),
    };

    fs.writeFileSync(lockFile, JSON.stringify(lockData, null, 2));
    console.log(`🔒 Created watch lock (PID: ${processId})`);
  } catch (error) {
    console.error(`❌ Failed to create watch lock: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Remove the lock file
 */
const removeWatchLock = () => {
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
      console.log("🔓 Removed watch lock");
    }
  } catch (error) {
    console.warn(`⚠️  Failed to remove watch lock: ${error.message}`);
  }
};

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
        const errorMsg = `Manifest preparation failed with code ${code}`;
        console.error(errorOutput.trim() || errorMsg);
        reject(new Error(errorMsg));
      }
    });

    prepareProcess.on("error", (error) => {
      console.error(`Failed to start manifest preparation: ${error.message}`);
      reject(error);
    });

    // Handle timeout for manifest preparation
    const timeout = setTimeout(() => {
      prepareProcess.kill("SIGTERM");
      reject(new Error("Manifest preparation timed out after 30 seconds"));
    }, 30000);

    prepareProcess.on("close", () => {
      clearTimeout(timeout);
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

// Function to spawn a Vite process with enhanced error handling
const spawnViteProcess = (configPath, mode, label, color) => {
  const vitePath = getVitePath();
  const useDirectPath = !vitePath.includes("npx");

  const args = useDirectPath
    ? ["build", "--config", configPath, "--mode", mode, "--watch"]
    : ["vite", "build", "--config", configPath, "--mode", mode, "--watch"];

  console.log(`${color}🚀 Starting ${label} watcher...${"\x1b[0m"}`);

  try {
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
        // Don't treat all stderr as errors - some are just warnings
        if (
          output.toLowerCase().includes("error") ||
          output.toLowerCase().includes("failed")
        ) {
          console.error(`${color}[${label}]${"\x1b[0m"} ❌ ${output}`);
        } else {
          console.warn(`${color}[${label}]${"\x1b[0m"} ⚠️  ${output}`);
        }
      }
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(
          `${color}[${label}]${"\x1b[0m"} ✅ Process completed successfully`
        );
      } else {
        console.error(
          `${color}[${label}]${"\x1b[0m"} ❌ Process exited with code ${code}`
        );
      }
    });

    child.on("error", (error) => {
      if (error.code === "ENOENT") {
        console.error(
          `${color}[${label}]${"\x1b[0m"} ❌ Vite executable not found: ${vitePath}`
        );
      } else if (error.code === "EACCES") {
        console.error(
          `${color}[${label}]${"\x1b[0m"} ❌ Permission denied executing: ${vitePath}`
        );
      } else {
        console.error(
          `${color}[${label}]${"\x1b[0m"} ❌ Error: ${error.message}`
        );
      }
    });

    // Handle unexpected process exit
    child.on("exit", (code, signal) => {
      if (signal) {
        console.log(
          `${color}[${label}]${"\x1b[0m"} 🛑 Process terminated by signal: ${signal}`
        );
      } else if (code !== 0 && code !== null) {
        console.error(
          `${color}[${label}]${"\x1b[0m"} ❌ Process failed with exit code: ${code}`
        );
      }
    });

    return child;
  } catch (spawnError) {
    console.error(
      `${color}[${label}]${"\x1b[0m"} ❌ Failed to spawn process: ${
        spawnError.message
      }`
    );
    throw spawnError;
  }
};

// Start all three watch processes with error handling
const startWatchProcesses = () => {
  try {
    const configs = [
      {
        config: "vite/vite.watch.config.mjs",
        mode: "development",
        label: "UI Components",
        color: "\x1b[36m", // Cyan
      },
      {
        config: "vite/vite.background.config.mjs",
        mode: "development",
        label: "Background",
        color: "\x1b[33m", // Yellow
      },
      {
        config: "vite/vite.content.config.mjs",
        mode: "development",
        label: "Content Scripts",
        color: "\x1b[35m", // Magenta
      },
    ];

    let successfullyStarted = 0;

    configs.forEach(({ config, mode, label, color }) => {
      try {
        const process = spawnViteProcess(config, mode, label, color);
        processes.push(process);
        successfullyStarted++;
      } catch (error) {
        console.error(`❌ Failed to start ${label} watcher: ${error.message}`);
      }
    });

    if (successfullyStarted === 0) {
      throw new Error("Failed to start any watch processes");
    } else if (successfullyStarted < configs.length) {
      console.warn(
        `⚠️  Only ${successfullyStarted} out of ${configs.length} watch processes started successfully`
      );
    } else {
      console.log("\n✅ All watch processes started!");
    }

    console.log("💡 Press Ctrl+C to stop all watchers");
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (error) {
    console.error(
      `❌ Critical error starting watch processes: ${error.message}`
    );
    throw error;
  }
};

// Main execution with race condition protection
const main = async () => {
  try {
    // Create lock to prevent multiple instances
    createWatchLock();

    await prepareWatchManifest();
    startWatchProcesses();
  } catch (error) {
    console.error("❌ Failed to start watch mode:", error.message);
    removeWatchLock();
    process.exit(1);
  }
};

// Execute main function
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});

// Handle graceful shutdown with lock cleanup
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

  // Remove watch lock
  removeWatchLock();

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
