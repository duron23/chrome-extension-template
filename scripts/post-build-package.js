#!/usr/bin/env node

/**
 * Post-build packaging script
 * Runs extension packaging after all Vite builds are complete
 */

const { exec } = require("child_process");

const packageExtension = () => {
  const env = process.env.NODE_ENV || "dev";
  const extensionBuild = process.env.EXTENSION_BUILD || env;

  // Validate environment
  const validEnvironments = ["dev", "uat", "prod"];
  if (!validEnvironments.includes(env)) {
    console.error(
      `❌ Invalid environment: ${env}. Valid environments are: ${validEnvironments.join(
        ", "
      )}`
    );
    process.exit(1);
  }

  console.log(
    `📦 Starting extension packaging for ${extensionBuild} environment...`
  );

  const childEnv = {
    ...process.env,
    NODE_ENV: env,
    EXTENSION_BUILD: extensionBuild,
  };

  const childProcess = exec(
    "node scripts/pack-extension.js",
    {
      env: childEnv,
      timeout: 60000, // Increased timeout to 60 seconds
      maxBuffer: 2 * 1024 * 1024, // Increased buffer to 2MB
    },
    (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Extension packaging failed: ${err.message}`);

        // Provide more specific error information
        if (err.code === "ETIMEDOUT") {
          console.error(
            "📋 Packaging timed out. This might indicate a hung process or very large extension."
          );
        } else if (err.code === "ENOENT") {
          console.error(
            "📋 pack-extension.js script not found. Check if the file exists."
          );
        } else if (err.code === "EACCES") {
          console.error("📋 Permission denied executing pack-extension.js");
        } else if (err.signal) {
          console.error(`📋 Process terminated by signal: ${err.signal}`);
        }

        if (stderr) {
          console.error(`📋 Error details: ${stderr}`);
        }
        process.exit(1);
      }

      // Forward all output from pack-extension.js
      if (stdout) {
        process.stdout.write(stdout);
      }
      if (stderr) {
        // Log stderr as warning instead of error if the process succeeded
        console.warn("⚠️  Packaging completed with warnings:");
        process.stderr.write(stderr);
      }

      console.log("✅ Extension packaging completed successfully");
    }
  );

  // Handle process errors
  childProcess.on("error", (error) => {
    console.error(`❌ Failed to start packaging process: ${error.message}`);
    if (error.code === "ENOENT") {
      console.error(
        "📋 Node.js not found in PATH or pack-extension.js doesn't exist"
      );
    } else if (error.code === "EACCES") {
      console.error("📋 Permission denied starting packaging process");
    }
    process.exit(1);
  });

  // Handle process interruption
  process.on("SIGINT", () => {
    console.log("\n🛑 Packaging interrupted by user");
    if (childProcess && !childProcess.killed) {
      childProcess.kill("SIGTERM");
    }
    process.exit(130);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Packaging terminated");
    if (childProcess && !childProcess.killed) {
      childProcess.kill("SIGTERM");
    }
    process.exit(143);
  });
};

try {
  packageExtension();
} catch (error) {
  console.error(`❌ Critical error in post-build packaging: ${error.message}`);
  process.exit(1);
}
