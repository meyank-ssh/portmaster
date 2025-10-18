#!/bin/bash

# PortMaster - One-Command Installer
# Created by meyank-ssh

set -e

echo "Installing PortMaster..."

# Check macOS
[[ "$OSTYPE" == "darwin"* ]] || { echo "macOS required"; exit 1; }

# Get latest release
REPO="meyank-ssh/portmaster"
RELEASE=$(curl -s "https://api.github.com/repos/$REPO/releases/latest")

# Check if release exists
if echo "$RELEASE" | grep -q '"message": "Not Found"'; then
    echo "No releases found. Please create a release first."
    echo "Visit: https://github.com/$REPO/releases"
    exit 1
fi

# Detect architecture and choose appropriate DMG
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    DMG_URL=$(echo "$RELEASE" | grep -o '"browser_download_url": "[^"]*arm64\.dmg"' | cut -d'"' -f4)
else
    DMG_URL=$(echo "$RELEASE" | grep -o '"browser_download_url": "[^"]*\.dmg"' | grep -v arm64 | cut -d'"' -f4)
fi

if [ -z "$DMG_URL" ]; then
    echo "No DMG file found for your architecture ($ARCH)."
    exit 1
fi

# Download and install
TEMP_DIR="/tmp/portmaster-install"
mkdir -p "$TEMP_DIR" && cd "$TEMP_DIR"
curl -L -o "PortMaster.dmg" "$DMG_URL"

# Mount and copy
MOUNT_POINT=$(hdiutil attach "PortMaster.dmg" | grep -o '/Volumes/.*' | head -1)
[ -d "$MOUNT_POINT/PortMaster.app" ] || { echo "App not found in DMG"; exit 1; }

# Remove old installation
[ -d "/Applications/PortMaster.app" ] && rm -rf "/Applications/PortMaster.app"

# Install
cp -R "$MOUNT_POINT/PortMaster.app" "/Applications/"
hdiutil detach "$MOUNT_POINT" 2>/dev/null || true
rm -rf "$TEMP_DIR"

echo "PortMaster installed! Look for the icon in your menu bar."
echo "First time? Right-click the app and 'Open' to bypass security."