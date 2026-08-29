const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  onCloseRequested: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('close-requested', handler)
    return () => ipcRenderer.removeListener('close-requested', handler)
  },
  confirmClose: () => {
    ipcRenderer.send('confirm-close')
  }
})
