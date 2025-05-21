const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('settingsAPI', {
  getSounds: () => ipcRenderer.invoke('get-sounds'),
  playSound: (soundFile) => ipcRenderer.send('play-sound', soundFile),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings')
});

console.log('Preload script for settings window loaded.');