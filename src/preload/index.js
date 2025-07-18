import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getLoginQRCode: () => ipcRenderer.invoke('get-login-qrcode'),
  pollLoginStatus: (qrcodeKey) => ipcRenderer.invoke('poll-login-status', qrcodeKey),
  verifyLogin: (sessdata) => ipcRenderer.invoke('verify-login', sessdata),
  getRoomIdByUID: (uid) => ipcRenderer.invoke('get-room-id-by-uid', uid)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
