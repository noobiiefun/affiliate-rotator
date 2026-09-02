const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveSetup:      cfg => ipcRenderer.invoke('save-setup', cfg),
  getConfig:      ()  => ipcRenderer.invoke('get-config'),
  startServer:    ()  => ipcRenderer.invoke('start-server'),
  stopServer:     ()  => ipcRenderer.invoke('stop-server'),
  openExternal:   url => ipcRenderer.invoke('open-external', url),
  resetConfig:    ()  => ipcRenderer.invoke('reset-config'),
  getStatus:      ()  => ipcRenderer.invoke('get-status'),
  testConnection: cfg => ipcRenderer.invoke('test-connection', cfg),
  getPaths:       ()  => ipcRenderer.invoke('get-paths'),
  getMode:        ()  => ipcRenderer.invoke('get-mode'),
  resetOfflineData: () => ipcRenderer.invoke('reset-offline-data'),
  onStatus: cb => ipcRenderer.on('status', (_, d) => cb(d)),
  onError:  cb => ipcRenderer.on('error',  (_, d) => cb(d)),
})
