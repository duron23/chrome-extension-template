@echo off
REM Pre-commit hook that automatically runs the maintainer reset script
REM This ensures the extension template is always in a clean state before commits

echo 🔧 Running maintainer reset before commit...

REM Change to the project root directory
cd /d "%~dp0\.."

REM Run the maintainer reset script
node maintainer/reset-extension.js --auto

REM Check if the reset script succeeded
if %ERRORLEVEL% neq 0 (
    echo ❌ Maintainer reset failed! Commit aborted.
    exit /b 1
)

echo ✅ Maintainer reset completed successfully

REM Stage any changes made by the reset script
git add .

echo ✅ Pre-commit hook completed successfully
