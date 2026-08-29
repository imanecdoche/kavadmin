const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const http = require('http')

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
}

function startLocalServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        let reqPath = decodeURIComponent(req.url.split('?')[0])
        if (reqPath === '/' || !reqPath) reqPath = '/index.html'

        let filePath = path.join(distDir, reqPath)

        if (!filePath.startsWith(distDir)) {
          res.writeHead(403)
          res.end('Forbidden')
          return
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, 'index.html')
        }

        const ext = path.extname(filePath).toLowerCase()
        const contentType = MIME_TYPES[ext] || 'application/octet-stream'

        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(500)
            res.end('Internal Server Error')
            return
          }
          res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          })
          res.end(content)
        })
      } catch (e) {
        res.writeHead(500)
        res.end('Server Error')
      }
    })

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      resolve({ server, port })
    })

    server.on('error', reject)
  })
}

// Request single instance lock
const gotTheLock = app.requestSingleInstanceLock()
let mainWindow = null
let localServer = null
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

  async function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1366,
      height: 850,
      minWidth: 1024,
      minHeight: 700,
      title: 'Kavio Edu - Management & Invoice Generator',
      icon: getIconPath(),
      autoHideMenuBar: true,
      backgroundColor: '#FFFFFF',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.cjs'),
        spellcheck: false
      }
    })

    mainWindow.setMenu(null)

    // Open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        shell.openExternal(url)
        return { action: 'deny' }
      }
      return { action: 'allow' }
    })

    const distDir = path.join(__dirname, 'dist')
    if (fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html'))) {
      try {
        const { server, port } = await startLocalServer(distDir)
        localServer = server
        await mainWindow.loadURL(`http://127.0.0.1:${port}`)
      } catch (err) {
        console.error('Local server error, fallback to file:', err)
        mainWindow.loadFile(path.join(distDir, 'index.html'))
      }
    } else {
      mainWindow.loadURL('http://localhost:5173')
    }

    // Intercept window close with safe fallback
    mainWindow.on('close', (e) => {
      if (!isForceQuit) {
        e.preventDefault()
        if (mainWindow && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
          mainWindow.webContents.send('close-requested')
          // Auto fallback if renderer is unresponsive
          setTimeout(() => {
            if (mainWindow) {
              isForceQuit = true
              mainWindow.destroy()
              app.quit()
            }
          }, 1500)
        } else {
          isForceQuit = true
          if (mainWindow) mainWindow.destroy()
          app.quit()
        }
      }
    })

    mainWindow.on('closed', () => {
      mainWindow = null
      if (localServer) {
        try {
          localServer.close()
        } catch (e) {}
        localServer = null
      }
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
    if (localServer) {
      try {
        localServer.close()
      } catch (e) {}
      localServer = null
    }
  })

  app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (localServer) {
      try {
        localServer.close()
      } catch (e) {}
      localServer = null
    }
    if (process.platform !== 'darwin') app.quit()
  })
}
