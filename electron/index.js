const path = require('path')
const { app, BrowserWindow } = require('electron')
const isDevelopment = process.env.NODE_ENV !== 'production'

let win

function createWindow () {
  win = new BrowserWindow({
    width: 860,
    height: 760,
    backgroundColor: '#F0F4F8',
    title: 'Liquality Wallet'
  })

  win.loadFile(path.join('dist', 'index.html'))

  win.on('closed', () => {
    win = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('ready', async () => {
  createWindow()
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
