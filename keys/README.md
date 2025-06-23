# Chrome Extension PEM Key Files

This directory contains the private key (PEM) files for each build environment of the Chrome extension. These files are used to ensure the extension ID remains consistent across builds.

## Important Notes

- **Do not delete or modify the PEM files** unless you intentionally want to change your extension ID
- PEM files will be automatically created here when you first package the extension
- Each environment (dev, uat, prod) has its own PEM file to maintain separate IDs
- The files follow the naming pattern: `[project-name]-[environment].pem`
- These files should be included in source control if you want to maintain consistent extension IDs across team members

## How It Works

1. When packaging the extension, the system first checks for an existing PEM file
2. If found, it uses that PEM file to maintain the same extension ID
3. If not found, a new PEM is generated and stored here
4. The manifest.json file is updated with the public key derived from the PEM file
5. This ensures the extension has the same ID when loaded unpacked as when packed

## Usage

You don't need to interact with these files directly. The build scripts handle packaging automatically:

```
npm run build:dev   # Build and package the dev build with consistent ID
npm run build:uat   # Build and package the UAT build with consistent ID
npm run build:prod  # Build and package the prod build with consistent ID
```
