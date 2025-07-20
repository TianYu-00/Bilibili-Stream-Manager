import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import {
  GetLoginQRCode,
  PollLoginStatus,
  VerifyLogin,
  GetRoomIdByUID,
  GetAreaList,
  ZBJVersionInfo,
  StartLiveStream,
  UpdateStreamInfo,
  EndLiveStream,
  GetRoomInfo,
  LogOut
} from './api'

function createWindow() {
  let iconPath = null
  if (process.platform === 'win32') {
    iconPath = join(__dirname, '../../resources/icons/bilibili_logo_icon.ico')
  } else if (process.platform === 'darwin') {
    iconPath = join(__dirname, '../../resources/icons/bilibili_logo_icon.icns')
  } else if (process.platform === 'linux') {
    iconPath = join(__dirname, '../../resources/icons/bilibili_logo_icon.png')
  }
  // console.log(iconPath, process.platform)
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1050,
    height: 750,
    minWidth: 1050,
    minHeight: 120,
    icon: iconPath,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  //
  ipcMain.handle('get-login-qrcode', async () => {
    return await GetLoginQRCode()
  })

  //
  ipcMain.handle('poll-login-status', async (_, qrcodeKey) => {
    return await PollLoginStatus(qrcodeKey)
  })

  ipcMain.handle('verify-login', async (_, sessdata) => {
    return await VerifyLogin(sessdata)
  })

  ipcMain.handle('get-room-id-by-uid', async (_, uid) => {
    return await GetRoomIdByUID(uid)
  })

  ipcMain.handle('get-area-list', async () => {
    return await GetAreaList()
  })

  ipcMain.handle('update-stream-info', async (_, { room_id, title, area_id, sessdata, csrf }) => {
    return await UpdateStreamInfo({ room_id, title, area_id, sessdata, csrf })
  })

  ipcMain.handle(
    'start-live-stream',
    async (_, { room_id, area_v2, platform, sessdata, csrf, zbj_version, zbj_build }) => {
      return await StartLiveStream({
        room_id,
        area_v2,
        platform,
        sessdata,
        csrf,
        zbj_version,
        zbj_build
      })
    }
  )

  ipcMain.handle('end-live-stream', async (_, { room_id, platform, sessdata, csrf }) => {
    return await EndLiveStream({ room_id, platform, sessdata, csrf })
  })

  ipcMain.handle('get-room-info', async (_, room_id) => {
    return await GetRoomInfo(room_id)
  })

  ipcMain.handle('log-out', async (_, { sessdata, csrf, dedeuserid }) => {
    return await LogOut({ sessdata, csrf, dedeuserid })
  })

  ipcMain.handle('zbj-version-info', async () => {
    return await ZBJVersionInfo()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
