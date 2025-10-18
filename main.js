const { app, Tray, Menu, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');

class PortMaster {
  constructor() {
    this.tray = null;
    this.refreshInterval = null;
    this.autoRefreshSeconds = 10;
    this.isRefreshing = false;
  }

  createTrayIcon() {
    const fs = require('fs');
    const iconPath = path.join(__dirname, 'assets', 'main.png');
    
    if (fs.existsSync(iconPath)) {
      this.tray = new Tray(iconPath);
      this.tray.setToolTip('PortMaster - Professional Port Manager');
      this.tray.on('click', () => this.tray.popUpContextMenu());
    }
  }

  initialize() {
    this.createTrayIcon();
    if (!this.tray) return;
    
    this.updateMenu();
    this.startAutoRefresh();
  }

  executeCommand(command) {
    return new Promise((resolve) => {
      exec(command, (error, stdout) => {
        resolve({ error, stdout });
      });
    });
  }

  async getOpenPorts() {
    const { error, stdout } = await this.executeCommand("lsof -i -P -n | grep LISTEN");
    return error && error.code !== 1 ? [] : this.parsePorts(stdout);
  }

  parsePorts(output) {
    if (!output || !output.trim()) return [];
    
    return output.trim().split('\n')
      .filter(line => line.trim())
      .map(line => this.parsePortLine(line))
      .filter(Boolean)
      .sort((a, b) => a.port - b.port);
  }

  parsePortLine(line) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 9) return null;
    
    const command = parts[0];
    const pid = parts[1];
    const user = parts[2];
    const name = parts[8];
    const port = parseInt(name.match(/:(\d+)$/)?.[1] || 0);
    
    return { command, pid, user, name, port };
  }

  async updateMenu() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    const ports = await this.getOpenPorts();
    const menuItems = this.buildMenuItems(ports);
    this.tray.setContextMenu(Menu.buildFromTemplate(menuItems));
    this.updateTooltip(ports.length);
    this.isRefreshing = false;
  }

  updateTooltip(portCount) {
    const portText = portCount === 1 ? 'port' : 'ports';
    this.tray.setToolTip(`PortMaster - ${portCount} listening ${portText}`);
  }

  buildMenuItems(ports) {
    const items = [
      { label: 'PortMaster', enabled: false },
      { type: 'separator' }
    ];

    if (ports.length === 0) {
      items.push(
        { label: 'No listening ports found', enabled: false },
        { type: 'separator' }
      );
    } else {
      items.push({ label: 'Open Ports', enabled: false });
      
      ports.forEach(port => {
        const portLabel = `${port.command} (PID ${port.pid}) — ${port.name}`;
        items.push({
          label: portLabel,
          submenu: [
            { label: 'Kill Process', click: () => this.killProcess(port.pid, port.command) },
            { label: 'Show Details', click: () => this.showProcessDetails(port) }
          ]
        });
      });
      
      items.push({ type: 'separator' });
    }

    items.push(
      { label: 'Refresh', click: () => this.updateMenu(), accelerator: 'Cmd+R' },
      { 
        label: `Auto-refresh: ${this.autoRefreshSeconds}s`, 
        submenu: [
          { label: '5 seconds', click: () => this.setAutoRefresh(5) },
          { label: '10 seconds', click: () => this.setAutoRefresh(10) },
          { label: '30 seconds', click: () => this.setAutoRefresh(30) },
          { label: 'Disable', click: () => this.setAutoRefresh(0) }
        ]
      },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    );

    return items;
  }

  async killProcess(pid, command) {
    const { error } = await this.executeCommand(`kill -9 ${pid}`);
    
    if (error) {
      const { error: psError } = await this.executeCommand(`ps -p ${pid}`);
      
      if (psError) {
        this.showSuccessNotification(`Killed ${command} (PID ${pid}) successfully.`);
        this.updateMenu();
      } else {
        this.showPermissionError(`${command} (PID ${pid})`);
      }
    } else {
      this.showSuccessNotification(`Killed ${command} (PID ${pid}) successfully.`);
      this.updateMenu();
    }
  }

  showProcessDetails(port) {
    const details = `Process: ${port.command}\nPID: ${port.pid}\nUser: ${port.user}\nPort: ${port.name}`;
    dialog.showMessageBox({
      type: 'info',
      title: 'Process Details',
      message: 'Process Information',
      detail: details,
      buttons: ['OK']
    });
  }

  showSuccessNotification(message) {
    dialog.showMessageBox({
      type: 'info',
      title: 'Success',
      message: message,
      buttons: ['OK']
    });
  }

  showPermissionError(processInfo) {
    dialog.showMessageBox({
      type: 'warning',
      title: 'Permission Denied',
      message: `Failed to kill ${processInfo}. Try: sudo kill -9 ${processInfo.split(' ')[2]}`,
      buttons: ['OK']
    });
  }

  setAutoRefresh(seconds) {
    this.autoRefreshSeconds = seconds;
    this.startAutoRefresh();
  }

  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (this.autoRefreshSeconds > 0) {
      this.refreshInterval = setInterval(() => {
        this.updateMenu();
      }, this.autoRefreshSeconds * 1000);
    }
  }

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// App initialization
let portMaster;

app.whenReady().then(() => {
  app.dock?.hide();
  
  portMaster = new PortMaster();
  portMaster.initialize();
});

app.on('before-quit', () => {
  if (portMaster) {
    portMaster.cleanup();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (portMaster && portMaster.tray) {
      portMaster.tray.popUpContextMenu();
    }
  });
}