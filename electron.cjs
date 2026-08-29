const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// Request single instance lock
const gotTheLock = app.requestSingleInstanceLock()
let mainWindow = null
let isForceQuit = false

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  function getIconPath() {
    const devIcon = path.join(__dirname, 'public/logobaru.png')
    const distIcon = path.join(__dirname, 'dist/logobaru.png')
    if (fs.existsSync(devIcon)) return devIcon
    if (fs.existsSync(distIcon)) return distIcon
    return undefined
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1366,
      height: 850,
      minWidth: 1024,
      minHeight: 700,
      title: 'Kavio Edu - Management & Invoice Generator',
      icon: getIconPath(),
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.cjs'),
        spellcheck: false
      }
    })

    // Remove default menu bar for clean app UI
    mainWindow.setMenu(null)

    // Open external links in the default system browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        shell.openExternal(url)
        return { action: 'deny' }
      }
      return { action: 'allow' }
    })

    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173')
    } else {
      const indexPath = path.join(__dirname, 'dist/index.html')
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath)
      } else {
        mainWindow.loadURL('http://localhost:5173')
      }
    }

    // Intercept window close to trigger custom in-app confirmation modal
    mainWindow.on('close', (e) => {
      if (!isForceQuit) {
        e.preventDefault()
        if (mainWindow && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
          mainWindow.webContents.send('close-requested')
        } else {
          isForceQuit = true
          if (mainWindow) mainWindow.destroy()
          app.quit()
        }
      }
    })

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  // Handle IPC confirm close from React renderer
  ipcMain.on('confirm-close', () => {
    isForceQuit = true
    if (mainWindow) {
      mainWindow.destroy()
    }
    app.quit()
  })

  app.on('before-quit', () => {
    isForceQuit = true
  })

  app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}


