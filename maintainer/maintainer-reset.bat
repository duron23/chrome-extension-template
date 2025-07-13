@echo off
echo 🔧 Chrome Extension Template - Maintainer Reset
echo ==============================================
echo.
echo This will reset the template to distribution-ready state:
echo   ✓ Reset name/description to defaults
echo   ✓ Clear all extension IDs and versions
echo   ✓ Remove generated PEM keys
echo   ✓ Optionally clear build artifacts
echo.

cd /d "%~dp0"
node reset-extension.js
pause
