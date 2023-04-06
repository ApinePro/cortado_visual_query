const { contextBridge, ipcRenderer } = require('electron')

console.warn('Running Preload Script...')

contextBridge.exposeInMainWorld('electronAPI', {
  requestRestart: () => ipcRenderer.send('restartBackend'),
  showSaveDialog: (fileName, fileExtension, base64File, buttonLabel, title) =>
    ipcRenderer.invoke('showSaveDialog', fileName, fileExtension, base64File, buttonLabel, title),
  onSaveProject: (callback) => ipcRenderer.on('save-project', callback),
  onCheckUnsavedChanges: (callback) => ipcRenderer.on('check-unsaved-changes', callback)

})


document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    const $ = require('jquery'); // Make Jquery Aviable in the Window after load

  }
}
