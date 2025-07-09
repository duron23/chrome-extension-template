/**
 * Extension ID Validation Tool
 * 
 * This script validates that our extension ID calculation algorithm matches Chrome's implementation.
 * It compares calculated IDs from various sources to ensure consistency.
 */
const fs = require('fs');
const path = require('path');
const { extractPublicKeyForManifest, calculateExtensionId } = require('./extract-key');

// Path to the PEM file and manifest file
const manifestPath = path.join(__dirname, 'src', 'manifest', 'manifest.json');
const distManifestPath = path.join(__dirname, 'dist', 'dev', 'chrome-extension-templatedev', 'manifest.json');

console.log('🔍 Extension ID Validation');
console.log('═══════════════════════════');

// Read the manifest file to get the public key
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const publicKey = manifest.key;
  
  if (!publicKey) {
    console.error('❌ No public key found in manifest.json');
    console.log('💡 Run "npm run build:dev" to generate a key');
    process.exit(1);
  }
  
  // Calculate the extension ID using our algorithm
  const calculatedId = calculateExtensionId(publicKey);
  console.log(`\n📋 Source Manifest Analysis:`);
  console.log(`   Public key: ${publicKey.substring(0, 40)}...`);
  console.log(`   Calculated ID: ${calculatedId}`);
  
  // Also try to read the extension ID from Chrome's perspective (from a .crx file if available)
  const pemPath = path.join(__dirname, 'keys', 'chrome-extension-template-dev.pem');
  
  if (fs.existsSync(pemPath)) {
    console.log(`\n🔑 PEM File Analysis:`);
    const pemPublicKey = extractPublicKeyForManifest(pemPath);
    const pemCalculatedId = calculateExtensionId(pemPublicKey);
    console.log(`   PEM location: ${path.basename(pemPath)}`);
    console.log(`   Calculated ID: ${pemCalculatedId}`);
    
    if (calculatedId === pemCalculatedId) {
      console.log('   ✅ Manifest and PEM IDs match');
    } else {
      console.log('   ❌ Manifest and PEM IDs differ');
    }
  }

  // Check if there's a dist manifest with the same key
  if (fs.existsSync(distManifestPath)) {
    console.log(`\n📦 Build Output Analysis:`);
    const distManifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
    if (distManifest.key) {
      const distCalculatedId = calculateExtensionId(distManifest.key);
      console.log(`   Build manifest ID: ${distCalculatedId}`);
      
      if (calculatedId === distCalculatedId) {
        console.log('   ✅ Source and build IDs match');
      } else {
        console.log('   ❌ Source and build IDs differ');
      }
    }
  }
  
  // Output the current config settings
  const configPath = path.join(__dirname, 'src', 'manifest', 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('\n⚙️ Config file extension IDs:');
    if (config.dev && config.dev.extensionId) {
      console.log(`   dev.extensionId: ${config.dev.extensionId}`);
    }
    if (config.uat && config.uat.extensionId) {
      console.log(`   uat.extensionId: ${config.uat.extensionId}`);
    }
    if (config.prod && config.prod.extensionId) {
      console.log(`   prod.extensionId: ${config.prod.extensionId}`);
    }
  }

  // Output the manifest.xml appid
  const xmlPath = path.join(__dirname, 'src', 'manifest', 'manifest.xml');
  if (fs.existsSync(xmlPath)) {
    const xml = fs.readFileSync(xmlPath, 'utf8');
    const match = xml.match(/<app appid="([^"]+)"/);
    if (match && match[1]) {
      console.log(`\n📋 manifest.xml appid: ${match[1]}`);
    }
  }

  // Compare with Chrome's expected ID (if provided as argument)
  if (process.argv.length > 2) {
    const chromeId = process.argv[2];
    console.log(`\n🌐 Chrome's actual extension ID: ${chromeId}`);
    console.log(`   Match with our calculation: ${chromeId === calculatedId ? 'YES ✅' : 'NO ❌'}`);
    
    if (chromeId !== calculatedId) {
      console.log('\n⚠️  WARNING: Our calculation does not match Chrome\'s extension ID!');
      console.log('   This may cause issues with extension updates and consistency.');
    }
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}
