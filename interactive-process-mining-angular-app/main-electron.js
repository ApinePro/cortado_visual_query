const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");
const child = require('child_process').spawn;
const abspath = app.getPath('exe');

const executablePath = abspath;
const indexForFileNameStart = executablePath.lastIndexOf("\\");
const backendExecutablePath = executablePath.substring(0, indexForFileNameStart) + "\\cortado-backend\\main\\main.exe";

let win;

function startBackend() {
  child(backendExecutablePath);
}

function createWindow() {
  win = new BrowserWindow({
    minHeight: 600,
    minWidth: 1280,
    width: 1280,
    height: 800,
    frame: true,
    webPreferences: {
      nodeIntegration: false
    },
    icon: "./icon/cortado_icon_colorful_transparent.png"
  });

  win.removeMenu();
  //win.loadURL('data:text/html;charset=utf-8,' + backendExecutablePath);
  win.loadURL(url.format({
    pathname: path.join(__dirname, `/dist/index.html`),
    protocol: "file:",
    slashes: true
  }));

  win.on('closed', function () {
    win = null
  })
}

app.on('ready', createWindow)
app.whenReady().then(startBackend);

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
