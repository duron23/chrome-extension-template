const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { parseString, Builder } = require("xml2js");

// Determine the environment (development or production)
const env = process.env.NODE_ENV || "development";
// Load the common .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });
// Load the appropriate .env file
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

// Paths to the manifest and XML files
const manifestPath = path.resolve(
  __dirname,
  "src",
  "manifest/manifest.json"
);
const xmlFilePath = path.resolve(
  __dirname,
  "src",
  "manifest/manifest.xml"
);
const configFilePath = path.resolve(__dirname, "src", "manifest/config.json");

// Read the existing manifest file
const manifest = JSON.parse(
  fs.readFileSync(manifestPath, "utf8")
);

const config = JSON.parse(
  fs.readFileSync(configFilePath, "utf8")
);

console.log("Config", config);

manifest.version = getIncreamentedVersion();

if (process.env.EXTENSION_BUILD !== "prod") {
  // Modify the description based on the environment
  manifest.name = `${env} : ${process.env.NAME}`;
  manifest.description = `${env} : ${process.env.DESC}`;
} else {
  // Modify the description based on the environment
  manifest.name = `${process.env.NAME}`;
  manifest.description = `${process.env.DESC}`;
}

// Write the updated manifest back to the file
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf8");

console.log(`Manifest file updated for ${env}:`, manifest);

// Update the XML file
fs.readFile(xmlFilePath, "utf8", (err, data) => {
  if (err) throw err;

  parseString(data, (err, result) => {
    if (err) throw err;

    // Modify the XML structure
    result.gupdate.app[0].updatecheck[0].$.version = manifest.version;
    result.gupdate.app[0].updatecheck[0].$.appid = getExtensionId();

    // Write the updated XML back to the file
    const builder = new Builder();
    const updatedXml = builder.buildObject(result);
    fs.writeFileSync(xmlFilePath, updatedXml, "utf8");

    console.log(`XML file updated with version: ${manifest.version}`);
  });
});

// Function to get the version
function getIncreamentedVersion() {
  const envKey = env;

  console.log(`Environment Key: ${envKey}`);
  if (config[envKey]) {
    const currentVersion = config[envKey].version;
    const versionParts = currentVersion.split(".");
    versionParts[2] = (parseInt(versionParts[2], 10) + 1).toString();
    config[envKey].version = versionParts.join(".");
    return config[envKey].version;
  } else {
    throw new Error(`Invalid environment: ${envKey}`);
  }
}

function getExtensionId() {
  const envKey = env;
  if (config[envKey]) {
    return config[envKey].extensionId;
  } else {
    throw new Error("Invalid extensionId or environment");
  }
}
