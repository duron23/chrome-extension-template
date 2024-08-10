const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const xml2js = require("xml2js");

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
  `manifest/manifest${process.env.EXTENSION_BUILD}.json`
);
const xmlFilePath = path.resolve(
  __dirname,
  "src",
  `manifest/manifest${process.env.EXTENSION_BUILD}.xml`
);

// Read the existing manifest file
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// Increment the version number
const versionParts = manifest.version.split(".");
versionParts[2] = parseInt(versionParts[2], 10) + 1; // Increment the patch version
manifest.version = versionParts.join(".");

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

console.log(`Manifest file updated for ${env}:`, manifest);

// Update the XML file
const xmlParser = new xml2js.Parser();
const xmlBuilder = new xml2js.Builder();

fs.readFile(xmlFilePath, "utf8", (err, data) => {
  if (err) throw err;

  xmlParser.parseString(data, (err, result) => {
    if (err) throw err;

    // Modify the XML structure
    result.gupdate.app[0].updatecheck[0].$.version = manifest.version;

    // Write the updated XML back to the file
    const updatedXml = xmlBuilder.buildObject(result);
    fs.writeFileSync(xmlFilePath, updatedXml, "utf8");

    console.log(`XML file updated with version: ${manifest.version}`);
  });
});
