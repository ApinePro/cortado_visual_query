const { contextBridge, ipcRenderer } = require('electron')

console.warn('Running Preload Script...')

contextBridge.exposeInMainWorld('electronAPI', {
    requestRestart: () => ipcRenderer.send('restartBackend')
})

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    const $ = require('jquery'); // Make Jquery Aviable in the Window after load

  }
}
