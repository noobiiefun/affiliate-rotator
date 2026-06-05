const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveSetup:    cfg  => ipcRenderer.invoke('save-setup', cfg),
  getConfig:    ()   => ipcRenderer.invoke('get-config'),
  startServer:  ()   => ipcRenderer.invoke('start-server'),
  stopServer:   ()   => ipcRenderer.invoke('stop-server'),
  openExternal: url  => ipcRenderer.invoke('open-external', url),
  resetConfig:  ()   => ipcRenderer.invoke('reset-config'),
  getStatus:    ()   => ipcRenderer.invoke('get-status'),
  onStatus: cb => ipcRenderer.on('status', (_, d) => cb(d)),
  onError:  cb => ipcRenderer.on('error',  (_, d) => cb(d)),
})
