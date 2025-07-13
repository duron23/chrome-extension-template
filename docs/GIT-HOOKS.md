# Git Hooks Integration (Maintainer Tool)

⚠️ **WARNING: This is a MAINTAINER-ONLY tool!** 

This document explains how template maintainers can set up Git hooks to automatically run the reset script before commits. **End users should NOT use this** as it will reset their extension to template defaults before every commit.

## Overview

The Chrome Extension Template includes Git hook integration for **template maintainers only**. This automatically runs the maintainer reset script before each commit to ensure that the template always stays in a clean, distribution-ready state.

**This tool is designed for:**
- Template maintainers preparing clean distributions
- Ensuring template consistency before sharing
- Automated cleanup during template development

**This tool is NOT for:**
- End users developing their own extensions
- Regular extension development workflow
- Production extension projects

## Setup (Maintainer Only)

### Automatic Setup

Run the setup script from the maintainer directory:

```bash
node maintainer/setup-git-hooks.js
```

This will:
1. Configure Git to use the `.githooks` directory
2. Set up the pre-commit hook
3. Make the hook executable (on Unix/Linux/macOS)

### Manual Setup

If you prefer to set up hooks manually:

1. **Configure Git hooks directory:**
   ```bash
   git config core.hooksPath .githooks
   ```

2. **Make hooks executable (Unix/Linux/macOS only):**
   ```bash
   chmod +x .githooks/pre-commit
   ```

## How It Works

### Pre-Commit Hook

When you run `git commit`, the pre-commit hook automatically:

1. **Runs the reset script** in automatic mode (`--auto` flag)
2. **Resets the template** to clean defaults:
   - Clears extension IDs
   - Resets versions to 0.0.0
   - Removes PEM keys
   - Resets name/description to template defaults
   - Clears manifest.xml appid and version
3. **Stages any changes** made by the reset script
4. **Continues with the commit** if reset succeeds
5. **Aborts the commit** if reset fails

### Cross-Platform Support

The system includes hooks for both Unix/Linux/macOS and Windows:
- `.githooks/pre-commit` - Shell script for Unix/Linux/macOS
- `.githooks/pre-commit.bat` - Batch file for Windows

Git automatically uses the appropriate hook for your platform.

## Usage

### Normal Workflow

Once set up, the hooks work automatically:

```bash
# Make your changes
git add .

# Commit - reset script runs automatically
git commit -m "Your commit message"
```

### Manual Reset (Maintainer)

You can also run the reset script manually:

```bash
# Interactive mode (with prompts)
node maintainer/reset-extension.js

# Automatic mode (no prompts)
node maintainer/reset-extension.js --auto
```

## Disabling Hooks

If you need to temporarily disable the hooks:

```bash
# Disable custom hooks (reverts to default .git/hooks)
git config --unset core.hooksPath

# Skip hooks for a single commit
git commit --no-verify -m "Your message"
```

To re-enable:

```bash
npm run setup-hooks
```

## Troubleshooting

### Hook Not Running

If the pre-commit hook isn't running:

1. **Test the hook configuration:**
   ```bash
   node maintainer/test-git-hooks.js
   ```

2. **Check Git configuration:**
   ```bash
   git config core.hooksPath
   ```
   Should output: `.githooks`

3. **Verify hook files exist:**
   - `.githooks/pre-commit` (Unix/Linux/macOS)
   - `.githooks/pre-commit.bat` (Windows)

4. **Re-run setup:**
   ```bash
   node maintainer/setup-git-hooks.js
   ```

### Permission Errors (Unix/Linux/macOS)

If you get permission errors:

```bash
chmod +x .githooks/pre-commit
```

### Reset Script Errors

If the reset script fails:

1. **Check Node.js version** (requires Node.js 18+)
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run reset manually** to see detailed errors:
   ```bash
   node maintainer/reset-extension.js --auto
   ```

## Benefits

### For Template Distribution
- Ensures clean state before sharing
- Removes development artifacts
- Consistent template versions

### For Development
- Automatic cleanup on commits
- No manual reset needed
- Prevents accidentally committing development IDs/keys

### For Collaboration
- Team members always get clean templates
- Consistent development environment
- Reduced manual maintenance

## Configuration

### Customizing the Hook

You can modify the hook behavior by editing:
- `.githooks/pre-commit` (Unix/Linux/macOS)
- `.githooks/pre-commit.bat` (Windows)

### Reset Script Options

The reset script supports these command line arguments:
- `--auto` or `-a`: Run in automatic mode (no prompts)

Example hook customization:
```bash
# Run reset but keep dist directory
node maintainer/reset-extension.js --auto --keep-dist
```

Note: Additional flags would need to be implemented in the reset script.

### Testing Hook Configuration

To verify your git hooks are properly configured:

```bash
node maintainer/test-git-hooks.js
```

This will check:
- Git hooks path configuration
- Hook file existence and permissions
- Reset script availability
- Git repository status
