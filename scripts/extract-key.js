/**
 * Helper module to extract public key from PEM file
 * and convert it to the format required for the Chrome extension manifest.
 * 
 * This is used to ensure consistent extension IDs when loading an unpacked extension.
 * The public key in the manifest must match the private key (PEM) that would be used
 * to package the extension.
 */
const fs = require('fs');
const crypto = require('crypto');

/**
 * Extract the public key from a PEM file for use in Chrome extension manifest.
 * This conversion is necessary because Chrome expects the public key in a specific format.
 * 
 * When this key is added to the manifest, it ensures the unpacked extension will have
 * the same extension ID as the packed version created with the corresponding PEM file.
 * 
 * @param {string} pemFilePath - Path to the PEM file
 * @returns {string} Base64 encoded public key for use in manifest
 */
function extractPublicKeyForManifest(pemFilePath) {
  try {
    if (!fs.existsSync(pemFilePath)) {
      return '';
    }

    // Read the PEM file
    const pemData = fs.readFileSync(pemFilePath, 'utf8');

    // Create public key from PEM data
    const publicKey = crypto.createPublicKey({
      key: pemData,
      format: 'pem'
    });

    // Convert to the DER format
    const derBuffer = publicKey.export({
      format: 'der',
      type: 'spki'
    });

    // Base64 encode the DER format key for use in manifest
    return derBuffer.toString('base64');
  } catch (error) {
    console.error(`Error extracting public key from PEM file: ${error.message}`);
    return '';
  }
}

/**
 * Calculate the Chrome extension ID from a public key
 * Chrome extension IDs are derived from the public key using a specific algorithm
 * Based on Chrome's actual implementation in components/crx_file/id_util.cc
 * 
 * @param {string} publicKeyBase64 - The base64-encoded public key
 * @returns {string} The calculated extension ID
 */
function calculateExtensionId(publicKeyBase64) {
  try {
    if (!publicKeyBase64) {
      return '';
    }

    // Decode the base64 public key
    const buffer = Buffer.from(publicKeyBase64, 'base64');
    
    // Create SHA256 hash of the public key
    const hash = crypto.createHash('sha256').update(buffer).digest();
    
    // The actual Chrome algorithm maps the first 128 bits (16 bytes) of the SHA-256 hash
    // using a specific character set: a-p (replacing 0-9a-f)
    // This is a direct port of Chrome's algorithm from components/crx_file/id_util.cc
    
    const chars = 'abcdefghijklmnop';
    let id = '';
    
    // Use only the first 16 bytes (128 bits) of the hash
    for (let i = 0; i < 16; i++) {
      // Each byte becomes two characters in the ID
      // First character is the high nibble (4 bits)
      id += chars[(hash[i] >> 4) & 0xf];
      // Second character is the low nibble (4 bits)
      id += chars[hash[i] & 0xf];
    }
    
    return id;
  } catch (error) {
    console.error(`Error calculating extension ID: ${error.message}`);
    return '';
  }
}

module.exports = {
  extractPublicKeyForManifest,
  calculateExtensionId
};
