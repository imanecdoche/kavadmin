const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Kavio Edu - Dashboard & Invoice Generator',
    icon: path.join(__dirname, 'public/logobaru.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Remove default menu bar for clean app UI
  win.setMenu(null)

  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
