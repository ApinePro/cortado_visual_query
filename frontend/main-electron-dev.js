const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");
const customTitlebar = require('custom-electron-titlebar');


let win;

function createWindow() {
  win = new BrowserWindow({
    minHeight: 600,
    minWidth: 800,
    width: 1280,
    height: 800,
    frame: true,
    webPreferences: {
      nodeIntegration: false
    },
    icon: "./icon/cortado_icon_colorful_transparent.png"
  })

  win.removeMenu();

  win.loadURL('http://localhost:4444')

  win.webContents.openDevTools()

  win.on('closed', function () {
    win = null
  })

  // prevent external links from being opened in an electron window
  win.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  //On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
    //macOS specific
    if (win === null) {
      createWindow()
    }
  }
)
