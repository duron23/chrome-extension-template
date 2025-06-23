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
    console.error(`Error calculating extension ID: ${error.message}`);
    return '';
  }
}

module.exports = {
  extractPublicKeyForManifest,
  calculateExtensionId
};
