/**
 * This script validates that our extension ID calculation matches what Chrome actually uses.
 * It takes the public key from an existing manifest and calculates the ID that Chrome would generate.
 */
const fs = require('fs');
const path = require('path');
const { extractPublicKeyForManifest, calculateExtensionId } = require('./extract-key');

// Path to the PEM file and manifest file
const manifestPath = path.join(__dirname, 'src', 'manifest', 'manifest.json');
const distManifestPath = path.join(__dirname, 'dist', 'dev', 'chrome-extension-templatedev', 'manifest.json');

// Read the manifest file to get the public key
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const publicKey = manifest.key;
  
  if (!publicKey) {
    console.error('No public key found in manifest.json');
    process.exit(1);
  }
  
  // Calculate the extension ID using our algorithm
  const calculatedId = calculateExtensionId(publicKey);
  console.log(`Public key: ${publicKey.substring(0, 40)}...`);
  console.log(`Calculated extension ID: ${calculatedId}`);
  
  // Also try to read the extension ID from Chrome's perspective (from a .crx file if available)
  const pemPath = path.join(__dirname, 'keys', 'chrome-extension-template-dev.pem');
  
  if (fs.existsSync(pemPath)) {
    console.log(`\nFound existing PEM file: ${pemPath}`);
    const pemPublicKey = extractPublicKeyForManifest(pemPath);
    const pemCalculatedId = calculateExtensionId(pemPublicKey);
    console.log(`PEM calculated extension ID: ${pemCalculatedId}`);
  }

  // Check if there's a dist manifest with the same key
  if (fs.existsSync(distManifestPath)) {
    console.log(`\nFound dist manifest: ${distManifestPath}`);
    const distManifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
    if (distManifest.key) {
      const distCalculatedId = calculateExtensionId(distManifest.key);
      console.log(`Dist manifest calculated extension ID: ${distCalculatedId}`);
    }
  }
  
  // Output the current config settings
  const configPath = path.join(__dirname, 'src', 'manifest', 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('\nConfig file extension IDs:');
    console.log(`dev.extensionId: ${config.dev.extensionId}`);
    if (config.dev.calculatedId) {
      console.log(`dev.calculatedId: ${config.dev.calculatedId}`);
    }
  }

  // Output the manifest.xml appid
  const xmlPath = path.join(__dirname, 'src', 'manifest', 'manifest.xml');
  if (fs.existsSync(xmlPath)) {
    const xml = fs.readFileSync(xmlPath, 'utf8');
    const match = xml.match(/<app appid="([^"]+)"/);
    if (match && match[1]) {
      console.log(`\nmanifest.xml appid: ${match[1]}`);
    }
  }

  // Compare with Chrome's expected ID (if provided as argument)
  if (process.argv.length > 2) {
    const chromeId = process.argv[2];
    console.log(`\nChrome's actual extension ID: ${chromeId}`);
    console.log(`Match with our calculation: ${chromeId === calculatedId ? 'YES ✅' : 'NO ❌'}`);
    
    if (chromeId !== calculatedId) {
      console.log('\nWARNING: Our calculation does not match Chrome\'s extension ID!');
      console.log('This may cause issues with extension updates and consistency.');
    }
  }

} catch (error) {
  console.error('Error:', error.message);
}
