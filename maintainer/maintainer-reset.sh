#!/bin/bash

# Maintainer Reset Script
# This is a convenience script for the template maintainer

echo "🔧 Chrome Extension Template - Maintainer Reset"
echo "=============================================="
echo ""
echo "This will reset the template to distribution-ready state:"
echo "  ✓ Reset name/description to defaults"
echo "  ✓ Clear all extension IDs and versions"
echo "  ✓ Remove generated PEM keys"
echo "  ✓ Optionally clear build artifacts"
echo ""

# Run from project root
cd "$(dirname "$0")/.."
node "$(dirname "$0")/reset-extension.js"
