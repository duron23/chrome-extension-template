/**
 * Utility script to display information about extension IDs for different environments.
 * This can be used to check what extension IDs are currently configured and 
 * whether they are being managed via PEM keys.
 */
const fs = require('fs');
const path = require('path');
const { extractPublicKeyForManifest } = require('./extract-key');
const crypto = require('crypto');

// Path to the config file
const configFilePath = path.resolve(__dirname, 'src', 'manifest/config.json');

// Check if the config file exists
if (!fs.existsSync(configFilePath)) {
  console.error('Config file not found:', configFilePath);
  process.exit(1);
}

// Read the config file
const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

// Get the project directory name
const projectDir = path.basename(__dirname);

// Function to calculate the extension ID from a public key
function calculateExtensionId(publicKey) {
  if (!publicKey) return null;
  
  try {
    // Decode the base64 public key
    const buffer = Buffer.from(publicKey, 'base64');
    
    // Create SHA256 hash of the public key
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Chrome uses the first 32 chars of the hash, with some character replacements
    // to create the extension ID
    const id = hash.substring(0, 32)
      .replace(/0/g, 'a')
      .replace(/1/g, 'b')
      .replace(/2/g, 'c')
      .replace(/3/g, 'd')
      .replace(/4/g, 'e')
      .replace(/5/g, 'f')
      .replace(/6/g, 'g')
      .replace(/7/g, 'h')
      .replace(/8/g, 'i')
      .replace(/9/g, 'j');
    
    return id;
  } catch (error) {
    console.error('Error calculating extension ID:', error.message);
    return null;
  }
}

console.log('Extension ID Information:');
console.log('--------------------------');

// Process each environment
['dev', 'uat', 'prod'].forEach(env => {
  console.log(`\n[${env.toUpperCase()} Environment]`);
  
  // Get the configured extension ID
  const configuredId = config[env]?.extensionId || 'Not configured';
  console.log(`Configured ID: ${configuredId}`);
  
  // Check if we have a PEM file for this environment
  const pemPath = path.join(__dirname, 'keys', `${projectDir}-${env}.pem`);
  const hasPem = fs.existsSync(pemPath);
  
  if (hasPem) {
    const publicKey = extractPublicKeyForManifest(pemPath);
    const calculatedId = calculateExtensionId(publicKey);
    
    console.log('PEM Status: Found');
    console.log(`Calculated ID: ${calculatedId || 'Could not calculate'}`);
    
    // Check if the ID matches what's in config
    if (configuredId !== 'managed-by-pem' && configuredId !== calculatedId) {
      console.log('WARNING: The configured ID does not match the PEM-derived ID!');
    }
  } else {
    console.log('PEM Status: Not found');
    console.log('ID will be generated when packaging for this environment.');
  }
});

console.log('\n--------------------------');
console.log('Usage Information:');
console.log('1. To ensure consistent extension IDs, build your extension using:');
console.log('   npm run build:dev   # For development build (includes packaging)');
console.log('   npm run build:uat   # For UAT build (includes packaging)');
console.log('   npm run build:prod  # For production build (includes packaging)');
console.log('2. This will automatically create and manage PEM files in the keys/ directory');
console.log('3. The extension will have the same ID when loaded unpacked or installed via CRX');
