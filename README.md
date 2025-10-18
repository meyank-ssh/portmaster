# PortMaster

**Professional Port Manager for macOS**

Created by [meyank-ssh](https://github.com/meyank-ssh)

PortMaster is a sleek macOS menu bar application that helps you manage and monitor network ports on your Mac. View all listening ports, identify processes, and kill unwanted connections with ease.

## Features

- **Real-time Port Monitoring**: View all listening ports and their associated processes
- **Process Management**: Kill processes directly from the menu bar
- **Auto-refresh**: Automatically updates port information every 5 seconds
- **Clean Interface**: Minimalist design that stays out of your way
- **Professional**: Built for developers and power users

## Quick Installation

Install PortMaster with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/meyank-ssh/portmaster/main/install.sh | bash
```

## Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/meyank-ssh/portmaster/releases)
2. Download the appropriate DMG for your Mac:
   - **Intel Macs**: `PortMaster-1.0.0.dmg`
   - **Apple Silicon**: `PortMaster-1.0.0-arm64.dmg`
3. Open the DMG file
4. Drag PortMaster to your Applications folder
5. Launch from Applications or Spotlight

## Usage

1. **Launch PortMaster** from Applications
2. **Look for the icon** in your menu bar (top-right area)
3. **Click the icon** to see all listening ports
4. **Kill processes** by clicking the kill button next to any port
5. **Auto-refresh** happens every 5 seconds automatically

## First Time Setup

On first launch, macOS may block the app due to security settings:

1. **Right-click** the PortMaster app in Applications
2. Select **"Open"** from the context menu
3. Click **"Open"** in the security dialog
4. The app will now launch normally

## Building from Source

### Prerequisites

- Node.js 18+ 
- npm
- macOS (for building)

### Build Steps

```bash
# Clone the repository
git clone https://github.com/meyank-ssh/portmaster.git
cd portmaster

# Install dependencies
npm install

# Development mode
npm run dev

# Build for macOS (Intel + Apple Silicon)
npm run build-mac

# Build all platforms
npm run build-all
```

### Build Output

Built applications will be in the `dist/` folder:
- `PortMaster-1.0.0.dmg` - Intel Macs
- `PortMaster-1.0.0-arm64.dmg` - Apple Silicon Macs
- ZIP files for both architectures

## Development

### Project Structure

```
portmaster/
├── main.js              # Main Electron process
├── package.json         # Dependencies and build config
├── install.sh           # One-command installer
├── assets/
│   ├── logo.png         # App icon (512x512)
│   └── main.png         # Tray icon (small)
└── dist/                # Build output
```

### Key Technologies

- **Electron**: Cross-platform desktop app framework
- **Node.js**: Backend process management
- **macOS APIs**: Tray, Menu, and system integration

### Port Detection

PortMaster uses the `lsof` command to detect listening ports:

```bash
lsof -i -P -n | grep LISTEN
```

This provides:
- Process ID (PID)
- Process name
- Port number
- Protocol (TCP/UDP)
- IP address

## Distribution

### GitHub Releases

1. **Build the app**: `npm run build-mac`
2. **Create a release** on GitHub
3. **Upload DMG files** to the release
4. **Users install** with: `curl -fsSL https://raw.githubusercontent.com/meyank-ssh/portmaster/main/install.sh | bash`

### Installation Script

The `install.sh` script:
- Detects the latest GitHub release
- Downloads the appropriate DMG for your Mac
- Mounts and installs the app
- Cleans up temporary files

## Security

PortMaster requires no special permissions beyond:
- **Network access**: To detect listening ports
- **Process management**: To kill processes (requires user confirmation)

All operations are performed using standard macOS commands (`lsof`, `kill`).

## Troubleshooting

### App Not Showing in Menu Bar

1. Check if PortMaster is running in Activity Monitor
2. Try launching from Applications folder
3. Check Console.app for error messages

### Cannot Kill Processes

- Some system processes require administrator privileges
- PortMaster will show an error for protected processes
- Use Terminal with `sudo` for system-level processes

### Installation Issues

- Ensure you have an internet connection
- Check that GitHub releases are accessible
- Verify DMG file downloaded completely

## License

MIT License - see LICENSE file for details.

## Author

**meyank-ssh** - [GitHub](https://github.com/meyank-ssh)

Professional developer tools and utilities for macOS.

---

**PortMaster** - Professional Port Manager for macOS