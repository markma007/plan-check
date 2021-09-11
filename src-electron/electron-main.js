import { app, session, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import path from 'path'
import os from 'os'
const { setupMenu } = require('./menu');
const {
    ToolsOpenCheckFile,
    ToolsSaveCheckAsFile,
    ToolsReadTemplateIndex,
    ToolsSaveTemplateIndex,
    ToolsReadTemplateFile,
    ToolsSaveTemplateFile,
    ToolsCopyTemplateFile,
    ToolsDeleteTemplateFile,
    ToolsNaviPlanFolder
} = require("./tools");

let mainWindow

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/////////////////////////////////////////////////////////////////////////
function loadDevTool() {
  const vueDevPath = path.join(os.homedir(),
    '/AppData/Local/Google/Chrome/User Data/Default/Extensions',
    '/ljjemllljcmogpfapbkkighbhhppjdbg/6.0.0.15_0')
  session.defaultSession.loadExtension(vueDevPath)
}

ipcMain.on('check-crt-plan', (_, msg) => {
  const {patientId, MRN,  SetupInstruction, PtLastName, PlanName} = msg;
  console.log({patientId, MRN,  SetupInstruction, PtLastName, PlanName})
  // console.log(p3plan)
})

ipcMain.on('open-plan-folder', (_, msg) => {
  ToolsNaviPlanFolder(notifyPlanFolder)
})

function notifyPlanFolder ({planPath, RcData, MqData, Plan}) {
  console.log({planPath, RcData, MqData, Plan})
  mainWindow.webContents.send('plan-data-loaded', {planPath, RcData, MqData, Plan});
}
/////////////////////////////////////////////////////////////////////////

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    x: 0,
    y: 0,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('ready', loadDevTool)
// app.whenReady().then(loadDevTool) // same as above

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('ready', () => {
  console.log('##########', app.getPath('userData'));
})
