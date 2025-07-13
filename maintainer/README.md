# Maintainer Tools

This directory contains tools that are only used by the template maintainer and are not intended for end users of the Chrome Extension Template.

## Contents

### `reset-extension.js`
The main reset script that returns the template to a clean state for distribution.

**Purpose:**
- Reset extension name and description to template defaults
- Clear all extension IDs and versions
- Remove generated PEM keys
- Optionally clear build artifacts

**Usage:**
```bash
# From project root
node maintainer/reset-extension.js
```

### `maintainer-reset.bat` / `maintainer-reset.sh`
Convenient wrapper scripts that provide a clear maintainer interface.

**Features:**
- Clear branding as maintainer tools
- Helpful context about what will be reset
- Automatically runs from correct directory
- Cross-platform support

**Usage:**
```bash
# Windows
maintainer/maintainer-reset.bat

# Linux/Unix/macOS
chmod +x maintainer/maintainer-reset.sh
maintainer/maintainer-reset.sh
```

### `setup-git-hooks.js`
Sets up Git hooks for template maintainers to automatically run the reset script before commits.

**Purpose:**
- Configure Git to use `.githooks` directory
- Make hooks executable on Unix systems
- Verify hook and reset script configuration
- Provide interactive confirmation for maintainer-only use

**Usage:**
```bash
# From project root
node maintainer/setup-git-hooks.js
```

**⚠️ WARNING:** This is for template maintainers only! It will reset the extension to defaults before every commit.

### `test-git-hooks.js`
Tests whether Git hooks are properly configured and working.

**Purpose:**
- Verify Git hooks path configuration
- Check hook file existence and permissions
- Validate reset script availability
- Confirm Git repository status

**Usage:**
```bash
# From project root
node maintainer/test-git-hooks.js
```

## Clean Distribution with .gitattributes

The template uses `.gitattributes` with `export-ignore` to automatically exclude maintainer tools from release distributions:

### What Gets Excluded
- `maintainer/` directory (all maintainer tools)
- `.githooks/` directory (Git hooks setup)
- `.github/` directory (GitHub workflows)
- `docs/GIT-HOOKS.md` (maintainer-specific documentation)
- Temporary and development files

### Creating Clean Archives
```bash
# Create a clean distribution archive (excludes maintainer tools)
npm run archive

# Or manually with git archive
git archive --format=zip --output=chrome-extension-template.zip HEAD
```

This ensures end users receive only the files they need without maintainer-specific tools.

## When to Use

These tools should be used by the template maintainer when:

1. **Preparing for GitHub Release**: Clean the template before pushing updates
2. **Creating Distribution Packages**: Ensure no development artifacts are included
3. **Testing Fresh Installations**: Verify the template works from a clean state
4. **Maintaining Template State**: Keep the repository in a pristine condition

## Why Separate from User Tools?

- **User Confusion Prevention**: End users don't need to reset the template
- **Workflow Clarity**: Clear separation between user tools and maintainer tools
- **Git History**: Maintainer actions don't clutter user-facing documentation
- **Reduced Complexity**: Simpler package.json scripts for end users

## Security Note

These scripts permanently delete PEM keys and reset configurations. Use with caution and ensure you have backups if needed.
