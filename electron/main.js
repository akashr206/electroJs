const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the Next.js app
  // In production, load the built files; in development, load from the dev server
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:3000'); // Assumes Next.js dev server is running
  } else {
    win.loadFile(path.join(__dirname, 'frontend', '.next', 'index.html')); // Load the built Next.js app
  }

  // Open DevTools in development mode
  if (isDev) {
    win.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});