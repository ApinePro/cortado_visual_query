const {app, BrowserWindow, dialog, ipcMain} = require('electron')
var fs = require('fs');
const {
  showSaveDialog,
  saveToUserFolder,
  readFromUserFolder,
} = require("./util");
const nativeImage = require('electron').nativeImage
const url = require("url");
const path = require("path");
const kill = require("tree-kill")
const ChildProcess = require('child_process');
const Store = require('electron-store');
const executablePath = app.getPath('exe');
const downloadFolder = app.getPath('downloads')
const backendWorkDirWindows = executablePath.substring(0, executablePath.lastIndexOf("\\")) +
"\\cortado-backend";
const backendWorkDirLinux = executablePath.substring(0, executablePath.lastIndexOf("/")) +
  "/cortado-backend";
let backendWorkDirMac = executablePath.substring(0, executablePath.lastIndexOf("/"))
backendWorkDirMac = backendWorkDirMac.substring(0, backendWorkDirMac.lastIndexOf("/")) +
  "/cortado-backend";
const backendExecutablePathWindows = '"' + executablePath.substring(0, executablePath.lastIndexOf("\\")) +
  "\\cortado-backend\\cortado-backend.exe" + '"';
const backendExecutablePathLinux = executablePath.substring(0, executablePath.lastIndexOf("/")) +
  "/cortado-backend/cortado-backend";
const backendExecutablePathMac = backendWorkDirMac +
  "/cortado-backend";
const lastAcceptedVersionKey = "lastAcceptedVersion";

let mainCortadoWin;
let backendProcess;

function startBackend() {
  switch (process.platform) {
    case 'linux':
      return ChildProcess.spawn(backendExecutablePathLinux, {shell: true, detached: true, windowsHide: false, cwd: backendWorkDirLinux});
    case 'win32':
      return ChildProcess.spawn(backendExecutablePathWindows, {shell: true, detached: true, windowsHide: false, cwd: backendWorkDirWindows});
    default:
      return ChildProcess.spawn(backendExecutablePathMac, [], {shell: true, detached: true, windowsHide: false, cwd: backendWorkDirMac});
  }
}

ipcMain.on('restartBackend', () => {
  console.log('Restarting Backend')
  killBackendProcess();
  backendProcess = startBackend();
})

ipcMain.handle(
  "showSaveDialog",
  (
    _,
    fileName,
    fileExtension,
    base64File,
    buttonLabel,
    title
  ) =>
    showSaveDialog(
      downloadFolder,
      dialog,
      fs,
      mainCortadoWin,
      fileName,
      fileExtension,
      base64File,
      buttonLabel,
      title
    )
);

function createMainApplicationWindow() {
  mainCortadoWin = new BrowserWindow({
    minHeight: 600,
    minWidth: 1280,
    width: 1280,
    height: 800,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
    iconUrl: "./icon/cortado_icon_colorful_transparent.png",
    darkTheme: true
  });
  mainCortadoWin.removeMenu();
  //mainCortadoWin.webContents.openDevTools()
  //mainCortadoWin.loadURL('data:text/html;charset=utf-8,' + backendExecutablePathWindows);
  mainCortadoWin.loadFile('dist/index.html');
  mainCortadoWin.on('closed', function () {
    mainCortadoWin = null;
    app.quit();
  });

  mainCortadoWin.on("close", async (e) => {
    e.preventDefault();

    // ask projectService for unsaved Changes
    // response on "unsaved-changes"
    mainCortadoWin.webContents.send('check-unsaved-changes')
  });

  // prevent external links from being opened in an electron window
  mainCortadoWin.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
}

function killBackendProcess() {
  if (backendProcess){
    if (process.platform == 'win32'){
      kill(backendProcess.pid);
    }
    else {
      ChildProcess.execSync("killall -9 cortado-backend", {shell: '/bin/sh'});
    }
  }
}

//app.on('ready', createWindow);
app.whenReady().then(function () {
  backendProcess = startBackend();
  createMainApplicationWindow();
});

app.on("quit", function () {
  killBackendProcess();
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

ipcMain.on("unsaved-changes", async (_event, res) => {
  if(!res) mainCortadoWin.destroy();
  else {
    const { response } = await dialog.showMessageBox(mainCortadoWin, {
      type: "warning",
      title: "Save Project?",
      message: "Save Cortado project before closing?",
      detail: "All progress will be lost if you don't save it.",
      buttons: ["Don't Save", "Cancel", "Save"],
      defaultId: 2,
    });

    if (response === 0) mainCortadoWin.destroy();
    else if (response === 2){
      mainCortadoWin.webContents.send('save-project')
    }
  }
})

ipcMain.on("saveToUserFolder", (_, fileName, fileExtension, data) =>
  saveToUserFolder(app.getPath("userData"), fileName, fileExtension, data)
);

ipcMain.handle("readFromUserFolder", (_, fileName, fileExtension) =>
  readFromUserFolder(app.getPath("userData"), fileName, fileExtension)
);

ipcMain.on("quit", ()=>{
  mainCortadoWin.destroy();
})
