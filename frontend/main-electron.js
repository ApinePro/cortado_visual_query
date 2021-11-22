const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const nativeImage = require('electron').nativeImage
const url = require("url");
const path = require("path");
const kill = require("tree-kill")
const ChildProcess = require('child_process');
const Store = require('electron-store');
const executablePath = app.getPath('exe');
const backendExecutablePathWindows = executablePath.substring(0, executablePath.lastIndexOf("\\")) +
  "\\cortado-backend\\cortado-backend.exe";
const backendExecutablePathLinux = executablePath.substring(0, executablePath.lastIndexOf("/")) +
  "/cortado-backend/cortado-backend";
const lastAcceptedVersionKey = "lastAcceptedVersion";

//const ipc = require('electron').ipcRenderer;

let mainCortadoWin;
let backendProcess;
let licenseDialog;
let licenseAccepted = false;

//ipc.on('licenseAccepted', decision => licenseAccepted = decision);

function startBackend() {
  switch (process.platform) {
    case 'linux':
      return ChildProcess.spawn(backendExecutablePathLinux, {shell: true, detached: true, windowsHide: false});
    case 'win32':
      return ChildProcess.spawn(backendExecutablePathWindows, {shell: true, detached: true, windowsHide: false});
    default:
      return;
  }
}

function createLicenseDialog(){
  licenseDialog = new BrowserWindow({
    //parent: mainCortadoWin,
    modal: true,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  licenseDialog.removeMenu();
  licenseDialog.loadFile("license-dialog.html");
}

ipcMain.on('license-dialog', (event, arg) => {
  if (arg === 'accepted'){ // Refer to license-dialog.js
    store.set(lastAcceptedVersionKey, app.getVersion());
    backendProcess = startBackend();
    createMainApplicationWindow();
    licenseDialog.close();
    ipcMain.removeAllListeners('license-dialog');
  } else if (arg === 'denied') {
    app.quit()
  }
})

function createMainApplicationWindow() {
  mainCortadoWin = new BrowserWindow({
    minHeight: 600,
    minWidth: 1280,
    width: 1280,
    height: 800,
    frame: true,
    webPreferences: {
      nodeIntegration: false
    },
    iconUrl: "./icon/cortado_icon_colorful_transparent.png",
    darkTheme: true
  });
  mainCortadoWin.removeMenu();
  //mainCortadoWin.webContents.openDevTools()
  //mainCortadoWin.loadURL('data:text/html;charset=utf-8,' + backendExecutablePathWindows);
  mainCortadoWin.loadURL(url.format({
    pathname: path.join(__dirname, `/dist/index.html`),
    protocol: "file:",
    slashes: true
  }));
  mainCortadoWin.on('closed', function () {
    mainCortadoWin = null;
    app.quit();
  });

  // prevent external links from being opened in an electron window
  mainCortadoWin.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
}

//app.on('ready', createWindow);
app.whenReady().then(function () {
  const lastAcceptedVersion = store.get(lastAcceptedVersionKey);
  if (lastAcceptedVersion === app.getVersion()) {
    backendProcess = startBackend();
    createMainApplicationWindow();
    return;
  }

  createLicenseDialog(); // ipcMain handles opening the frontend and backend
});

app.on("quit", function () {
  if (backendProcess){
    if (process.platform !== 'linux'){
      kill(backendProcess.pid);
    } else {
      ChildProcess.execSync("pkill cortado-backend", {shell: '/bin/sh'});
    }
  }
});

app.on('window-all-closed', function () {
  //On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
    //macOS specific
    if (mainCortadoWin === null) {
      createMainApplicationWindow();
    }
  }
);
