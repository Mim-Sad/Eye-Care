const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openSettings: () => ipcRenderer.send('open-settings-window'),
  getSounds: () => ipcRenderer.invoke('get-sounds'),
  playSound: (soundFile) => ipcRenderer.send('play-sound', soundFile), // This is more for main process to be aware, actual playback in renderer
  onTimerUpdate: (callback) => ipcRenderer.on('timer-update', (_event, value) => callback(value)),
  onStateChange: (callback) => ipcRenderer.on('state-change', (_event, value) => callback(value)),
  loadSettings: () => ipcRenderer.invoke('load-settings') // Added for main window to load settings
});

console.log('Preload script for main window loaded.');