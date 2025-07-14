#!/usr/bin/env node

/**
 * Post-build packaging script
 * Runs extension packaging after all Vite builds are complete
 */

const { exec } = require("child_process");

const packageExtension = () => {
  const env = process.env.NODE_ENV || "dev";
  const extensionBuild = process.env.EXTENSION_BUILD || env;

  const childEnv = {
    ...process.env,
    NODE_ENV: env,
    EXTENSION_BUILD: extensionBuild,
  };

  exec(
    "node scripts/pack-extension.js",
    {
      env: childEnv,
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    },
    (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Extension packaging failed: ${err.message}`);
        if (stderr) {
          console.error(`📋 Details: ${stderr}`);
        }
        process.exit(1);
      }

      // Forward all output from pack-extension.js
      if (stdout) {
        process.stdout.write(stdout);
      }
      if (stderr) {
        process.stderr.write(stderr);
      }
    }
  );
};

packageExtension();
