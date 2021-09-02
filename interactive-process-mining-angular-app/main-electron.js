const {app, BrowserWindow, dialog} = require('electron')
const nativeImage = require('electron').nativeImage
const url = require("url");
const path = require("path");
const ChildProcess = require('child_process');
const abspath = app.getPath('exe');
const executablePath = abspath;
const indexForFileNameStart = executablePath.lastIndexOf("\\");
const backendExecutablePath = executablePath.substring(0, indexForFileNameStart) + "\\cortado-backend\\cortado-backend.exe";
//const ipc = require('electron').ipcRenderer;

let mainCortadoWin;
let backendProcess;
let licenseAccepted = false;

//ipc.on('licenseAccepted', decision => licenseAccepted = decision);

function startBackend() {
  return ChildProcess.spawn(backendExecutablePath, {shell: true, detached: true, windowsHide: false});
}

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
  //mainCortadoWin.loadURL('data:text/html;charset=utf-8,' + backendExecutablePath);
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
  const appIcon = nativeImage.createFromPath(path.join(__dirname, '/icon/cortado_icon_colorful_transparent.ico'))
  const promiseLicense = dialog.showMessageBox(null, {
    title: "End User License Agreement (EULA) - Cortado",
    buttons: ["I accept the terms in the End User License Agreement (EULA)", "Cancel"],
    defaultId: 0,
    message: 'You must accept the End User License Agreement (EULA) before continuing.',
    detail: licenseText,
    icon: appIcon,
    type: "question"
  });
  promiseLicense.then(function (decision) {
    if (decision.response === 0) {
      //license has been accepted by the user
      backendProcess = startBackend();
      setTimeout(function () {
        createMainApplicationWindow();
      }, 1000);
    } else {
      app.quit();
    }
  });

});

app.on("quit", function () {
  backendProcess.kill('SIGINT');
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

//TODO put text into external file and load it from there
const licenseText = "TERMS AND CONDITIONS FOR USE, COPYING, DISTRIBUTION AND MODIFICATION\n" +
  "\n" +
  "Definitions\n" +
  "\n" +
  "“Program” means a copy of Fraunhofer FIT’s Cortado, which is said to be distributed under this " +
  "Academic Public License in Object Code form only.\n" +
  "\n" +
  "“Using the Program” means any act of using executables that contain or directly use libraries that are " +
  "part of the Program or running any of the tools that are part of the Program.\n" +
  "\n" +
  "Each licensee is addressed as “you”.\n" +
  "\n" +
  "§1. Permission is hereby granted to use the Program free of charge for any noncommercial purpose, " +
  "including teaching and research at universities, colleges and other educational institutions, research " +
  "at non-profit research institutions, and personal non-profit purposes. For using the Program for " +
  "commercial purposes, including but not restricted to consulting activities, design of commercial " +
  "hardware or software networking products, and a commercial entity participating in research " +
  "projects, you have to contact Fraunhofer FIT (cortado@fit.fraunhofer.de) for an appropriate license.\n" +
  "Permission is also granted to use the Program for a reasonably limited period of time for the purpose " +
  "of evaluating its usefulness for a particular purpose.\n" +
  "\n" +
  "§2. You may not copy and distribute verbatim copies of the Program.\n" +
  "\n" +
  "§3. You may not copy, modify, sublicense, or distribute the Program except as expressly provided " +
  "under this License. Any attempt otherwise to copy, modify, sublicense, or distribute the Program is " +
  "void, and will automatically terminate your rights under this License. You may not decompile the " +
  "Object Code or attempt to get access to the Source Code in any other way.\n" +
  "\n" +
  "§4. You are not required to accept this License since you have not signed it. Nothing else grants you " +
  "permission to use the Program or its derivative works; law prohibits these actions if you do no t" +
  "accept this License. Therefore, by using or distributing the Program, you indicate your acceptance of" +
  "this License and all its terms and conditions for copying, distributing, or using the Program, to do so.\n" +
  "\n" +
  "§5. If, as a consequence of a court judgment or allegation of patent infringement or for any other " +
  "reason (not limited to patent issues), conditions are imposed on you (whether by court order, " +
  "agreement or otherwise) that contradict the conditions of this License, they do not excuse you from " +
  "the conditions of this License.\n" +
  "\n" +
  "If any portion of this section is held invalid or unenforceable under any particular circumstance, the " +
  "balance of the section is intended to apply, and the section as a whole is intended to apply in other " +
  "circumstances.\n" +
  "\n" +
  "§7. If the use of the Program is restricted in certain countries either by patents or by copyrighted " +
  "interfaces, the original copyright holder who places the Program under this License may add an " +
  "explicit geographical distribution limitation excluding those countries, so that usage is permitted only " +
  "in or among countries not thus excluded. In such case, this License incorporates the limitation as if " +
  "written in the body of this License.\n" +
  "\n" +
  "§8. NO OTHER IP THAN THE „PROGRAM“, ESPECIALLY NO PATENTS, TRADEMARKS, KNOW-HOW, OR " +
  "OTHER INTELLECTUAL PROPERTY RIGHTS ARE SUBJECT TO THIS LICENSE.\n" +
  "\n" +
  "NO WARRANTY\n" +
  "§9. BECAUSE THE PROGRAM IS LICENSED FREE OF CHARGE, THERE IS NO WARRANTY FOR THE " +
  "PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW. EXCEPT WHEN OTHERWISE STATED IN " +
  "WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM “AS IS” " +
  "WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED" +
  "TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. " +
  "THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU. SHOULD " +
  "THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING, REPAIR " +
  "OR CORRECTION.\n" +
  "§10. IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED ON IN WRITING WILL ANY" +
  "COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY MODIFY AND/OR REDISTRIBUTE THE " +
  "PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY GENERAL, " +
  "SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE " +
  "THE PROGRAM INCLUDING BUT NOT LIMITED TO LOSS OF DATA OR DATA BEING RENDERED " +
  "INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD PARTIES OR A FAILURE OF THE PROGRAM TO " +
  "OPERATE WITH ANY OTHER PROGRAMS), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN " +
  "ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.\n" +
  "END OF TERMS AND CONDITIONS\n"
