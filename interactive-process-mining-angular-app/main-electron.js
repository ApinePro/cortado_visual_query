const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    minHeight: 600,
    minWidth: 800,

    width: 1280,
    height: 800,

    frame: true

  })

  win.removeMenu();

/*  win.loadURL(url.format({
    pathname: path.join(__dirname, `/dist/index.html`),
    protocol: "file:",
    slashes: true
  }))*/

  win.loadURL('http://localhost:4444')

  win.webContents.openDevTools()

  win.on('closed', function () {
    win = null
  })
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
