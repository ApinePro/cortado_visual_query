const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
var fs = require("fs");
// const mainRemote = require("@electron/remote/main");
const url = require("url");
const path = require("path");
const {
  showSaveDialog,
  saveToUserFolder,
  readFromUserFolder,
} = require("./util");
const downloadFolder = app.getPath("downloads");

let win;

function createWindow() {
  win = new BrowserWindow({
    minHeight: 600,
    minWidth: 800,
    width: 1280,
    height: 800,
    frame: true,
    titleBarStyle: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
    icon: "./icon/cortado_icon_colorful_transparent.png",
  });

  win.removeMenu();

  win.loadURL("http://localhost:4444");

  win.webContents.openDevTools();

  win.on("closed", function () {
    win = null;
  });

  win.on("close", async (e) => {
    e.preventDefault();

    // ask projectService for unsaved Changes
    // response on "unsaved-changes"
    win.webContents.send("check-unsaved-changes");
  });

  // prevent external links from being opened in an electron window
  win.webContents.on("new-window", function (e, url) {
    e.preventDefault();

    require("electron").shell.openExternal(url);
  });

  // mainRemote.initialize();
  // mainRemote.enable(win.webContents);
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  //On macOS specific close process
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("restartBackend", () => {
  console.log("DEV: Restarting Backend");
});

app.on("activate", function () {
  //macOS specific
  if (win === null) {
    createWindow();
  }
});

ipcMain.handle(
  "showSaveDialog",
  (_, fileName, fileExtension, base64File, buttonLabel, title) =>
    showSaveDialog(
      downloadFolder,
      dialog,
      fs,
      win,
      fileName,
      fileExtension,
      base64File,
      buttonLabel,
      title,
    ),
);

ipcMain.on("unsaved-changes", async (_event, res) => {
  if (!res) win.destroy();
  else {
    const { response } = await dialog.showMessageBox(win, {
      type: "warning",
      title: "Save Project?",
      message: "Save Cortado project before closing?",
      detail: "All progress will be lost if you don't save it.",
      buttons: ["Don't Save", "Cancel", "Save"],
      defaultId: 2,
    });

    if (response === 0) win.destroy();
    else if (response === 2) {
      win.webContents.send("save-project");
    }
  }
});

ipcMain.on("saveToUserFolder", (_, fileName, fileExtension, data) =>
  saveToUserFolder(app.getPath("userData"), fileName, fileExtension, data),
);

ipcMain.handle("readFromUserFolder", (_, fileName, fileExtension) =>
  readFromUserFolder(app.getPath("userData"), fileName, fileExtension),
);

ipcMain.on("quit", () => {
  win.destroy();
});
