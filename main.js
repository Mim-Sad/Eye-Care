const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let settingsWindow;

// Simple in-memory store for settings
let appSettings = {
  timerDuration: 20, // default duration in minutes
  selectedSound: 'beep.mp3' // default sound
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use a preload script for security
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false, // Disable Node.js integration in renderer for security
    },
  });

  mainWindow.loadFile('index.html');

  // Open DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'settingsPreload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  settingsWindow.loadFile('settings.html');

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('open-settings-window', () => {
  createSettingsWindow();
});

// IPC handler for saving settings
ipcMain.on('save-settings', (event, settings) => {
  console.log('Main: Received settings to save:', settings);
  appSettings = { ...appSettings, ...settings };
  // Notify the main window's renderer process about the timer duration update
  if (mainWindow && settings.timerDuration) {
    mainWindow.webContents.send('timer-update', settings.timerDuration);
  }
  // Optionally, could save to a file here using fs or electron-store
  console.log('Main: Settings updated:', appSettings);
});

// IPC handler for loading settings
ipcMain.handle('load-settings', async () => {
  console.log('Main: Loading settings for renderer:', appSettings);
  // Optionally, could load from a file here
  return appSettings;
});

// IPC handler for getting sounds
ipcMain.handle('get-sounds', async () => {
  const fs = require('fs').promises;
  const soundsDir = path.join(__dirname, 'sounds');
  try {
    const files = await fs.readdir(soundsDir);
    return files.filter(file => file.endsWith('.mp3'));
  } catch (error) {
    console.error('Failed to read sounds directory:', error);
    return [];
  }
});

// IPC handler for playing a sound (used for preview in settings)
ipcMain.on('play-sound', (event, soundFile) => {
  // This is a simplified way to play sound. For more robust audio playback,
  // consider using a library or the HTML5 Audio API in the renderer process
  // if the sound files are accessible via HTTP or file URI.
  // For this example, we'll just log it. Actual playback should be handled in renderer.
  // We can, however, notify the appropriate renderer to play the sound.
  console.log(`Main: Request to play sound: ${soundFile}`);
  // If settings window is active and requests preview, it should handle it.
  // If main window timer goes off, it should handle it.
  // This IPC is more for 'settings' to tell main *which* sound, 
  // and for main to tell 'renderer' to play *its* configured sound.

  // For preview from settings, settings.js will use its own audio context or ask main.
  // For timer beep, renderer.js will play the configured sound.
  // This 'play-sound' IPC from preload might be better if it's renderer-specific.
  // Let's assume for now that 'renderer.js' will play the sound when its timer elapses,
  // and 'settings.js' will play the sound for preview.
  // The 'selectedSound' from appSettings will be used by renderer.js.
});