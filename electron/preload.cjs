const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),

  onFileOpened: (callback) => {
    const handler = (_event, fileData) => callback(fileData);
    ipcRenderer.on('file:opened', handler);
    return () => ipcRenderer.removeListener('file:opened', handler);
  },

  onMenuOpenFile: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('menu:openFile', handler);
    return () => ipcRenderer.removeListener('menu:openFile', handler);
  },

  onMenuToggleTheme: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('menu:toggleTheme', handler);
    return () => ipcRenderer.removeListener('menu:toggleTheme', handler);
  },

  onMenuIncreaseFontSize: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('menu:increaseFontSize', handler);
    return () => ipcRenderer.removeListener('menu:increaseFontSize', handler);
  },

  onMenuDecreaseFontSize: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('menu:decreaseFontSize', handler);
    return () => ipcRenderer.removeListener('menu:decreaseFontSize', handler);
  },

  onMenuToggleEditor: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('menu:toggleEditor', handler);
    return () => ipcRenderer.removeListener('menu:toggleEditor', handler);
  },

  onMenuNewFile: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('menu:newFile', handler);
    return () => ipcRenderer.removeListener('menu:newFile', handler);
  },
});
