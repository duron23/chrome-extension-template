"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
var xml2js_1 = require("xml2js");
// Determine the environment (development or production)
var env = process.env.NODE_ENV || "development";
// Load the common .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });
// Load the appropriate .env file
dotenv.config({ path: path.resolve(__dirname, ".env.".concat(env)) });
var manifestVersion = process.env.MANIFEST_VERSION === "2" ? "2" : "3";
// Paths to the manifest and XML files
var manifestPath = path.resolve(__dirname, "src", "manifest/v".concat(manifestVersion, "/manifest.json"));
var xmlFilePath = path.resolve(__dirname, "src", "manifest/v".concat(manifestVersion, "/manifest.xml"));
var configFilePath = path.resolve(__dirname, "src", "manifest/config.json");
// Read the existing manifest file
var manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
var config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
console.log("Config", config);
manifest.version = getIncreamentedVersion();
if (process.env.EXTENSION_BUILD !== "prod") {
    // Modify the description based on the environment
    manifest.name = "".concat(env, " : ").concat(process.env.NAME);
    manifest.description = "".concat(env, " : ").concat(process.env.DESC);
}
else {
    // Modify the description based on the environment
    manifest.name = "".concat(process.env.NAME);
    manifest.description = "".concat(process.env.DESC);
}
// Write the updated manifest back to the file
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf8");
console.log("Manifest file updated for ".concat(env, ":"), manifest);
// Update the XML file
fs.readFile(xmlFilePath, "utf8", function (err, data) {
    if (err)
        throw err;
    (0, xml2js_1.parseString)(data, function (err, result) {
        if (err)
            throw err;
        // Modify the XML structure
        result.gupdate.app[0].updatecheck[0].$.version = manifest.version;
        result.gupdate.app[0].updatecheck[0].$.appid = getExtensionId();
        // Write the updated XML back to the file
        var builder = new xml2js_1.Builder();
        var updatedXml = builder.buildObject(result);
        fs.writeFileSync(xmlFilePath, updatedXml, "utf8");
        console.log("XML file updated with version: ".concat(manifest.version));
    });
});
// Function to get the version
function getIncreamentedVersion() {
    var versionKey = "v".concat(manifestVersion);
    var envKey = env;
    console.log("Version Key: ".concat(versionKey, ", Environment Key: ").concat(envKey));
    if (config[versionKey] && config[versionKey][envKey]) {
        var currentVersion = config[versionKey][envKey].version;
        var versionParts = currentVersion.split(".");
        versionParts[2] = (parseInt(versionParts[2], 10) + 1).toString();
        config[versionKey][envKey].version = versionParts.join(".");
        return config[versionKey][envKey].version;
    }
    else {
        throw new Error("Invalid version or environment: ".concat(versionKey, ", ").concat(envKey));
    }
}
function getExtensionId() {
    var versionKey = "v".concat(manifestVersion);
    var envKey = env;
    if (config[versionKey] && config[versionKey][envKey]) {
        return config[versionKey][envKey].extensionId;
    }
    else {
        throw new Error("Invalid extensionId or environment");
    }
}
