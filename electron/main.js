const {
  app, BrowserWindow, Tray, Menu,
  ipcMain, shell, nativeImage, dialog
} = require('electron')
const path  = require('path')
const fs    = require('fs')
const http  = require('http')
const https = require('https')
const os    = require('os')
const net   = require('net')

// ─── Paths ────────────────────────────────────────────────
const USER_DATA   = app.getPath('userData')
const CONFIG_PATH = path.join(USER_DATA, 'config.json')
const ENV_PATH    = path.join(USER_DATA, '.env.local')

// Root Next.js app (di dalam asar, read-only, tapi .next sudah pre-built)
const NEXT_DIR    = path.join(__dirname, '..')

const ICON_PATH   = path.join(__dirname, 'assets', 'icon.png')
const TRAY_PATH   = path.join(__dirname, 'assets', 'tray.png')

// ─── State ────────────────────────────────────────────────
let tray          = null
let splashWin     = null
let setupWin      = null
let nextServer    = null   // Next.js server instance
let serverPort    = 3000
let serverRunning = false
let isQuitting    = false

// ─── Config ───────────────────────────────────────────────
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {}
  return null
}

function saveConfig(cfg) {
  if (!fs.existsSync(USER_DATA)) fs.mkdirSync(USER_DATA, { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2))
}

function getLocalIP() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return '127.0.0.1'
}

function writeEnv(cfg, port) {
  if (!fs.existsSync(USER_DATA)) fs.mkdirSync(USER_DATA, { recursive: true })
  const ip   = getLocalIP()
  const base = `http://${ip}:${port}`
  const content = [
    `NEXT_PUBLIC_SUPABASE_URL=${cfg.supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${cfg.supabaseAnonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${cfg.supabaseServiceKey}`,
    `NEXT_PUBLIC_BASE_URL=${base}`,
    `IP_HASH_SALT=${cfg.salt || 'affiliate-salt-' + Date.now()}`,
  ].join('\n')
  fs.writeFileSync(ENV_PATH, content)
  return base
}

// ─── Port ─────────────────────────────────────────────────
function checkPort(port) {
  return new Promise(resolve => {
    const s = net.createServer()
    s.once('error', () => resolve(false))
    s.once('listening', () => { s.close(); resolve(true) })
    s.listen(port)
  })
}

async function findFreePort(start = 3000) {
  for (let p = start; p < start + 20; p++) {
    if (await checkPort(p)) return p
  }
  return start
}

// ─── Start Next.js menggunakan Node API langsung ───────────
// Ini yang benar untuk Electron — tidak pakai spawn npm
async function startNextServer(cfg, port) {
  // Set env vars sebelum load next
  process.env.NEXT_PUBLIC_SUPABASE_URL      = cfg.supabaseUrl
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = cfg.supabaseAnonKey
  process.env.SUPABASE_SERVICE_ROLE_KEY     = cfg.supabaseServiceKey
  process.env.NEXT_PUBLIC_BASE_URL          = `http://${getLocalIP()}:${port}`
  process.env.IP_HASH_SALT                  = cfg.salt || 'affiliate-salt'
  process.env.PORT                          = String(port)
  process.env.HOSTNAME                      = '0.0.0.0'

  // Load Next.js server langsung
  const nextPath = path.join(NEXT_DIR, 'node_modules', 'next')
  const next = require(nextPath)

  const nextApp = next({
    dev: false,
    dir: NEXT_DIR,
    hostname: '0.0.0.0',
    port: port,
  })

  const handle = nextApp.getRequestHandler()

  await nextApp.prepare()

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => handle(req, res))
    server.listen(port, '0.0.0.0', () => {
      nextServer = server
      resolve(server)
    })
    server.on('error', reject)
  })
}

// ─── Tray ─────────────────────────────────────────────────
function buildTray() {
  const img = fs.existsSync(TRAY_PATH)
    ? nativeImage.createFromPath(TRAY_PATH).resize({ width: 16, height: 16 })
    : nativeImage.createEmpty()
  tray = new Tray(img)
  tray.setToolTip('Affiliate Rotator')
  refreshTrayMenu()
  tray.on('double-click', () => {
    if (serverRunning) shell.openExternal(`http://localhost:${serverPort}/dashboard`)
    else startServer()
  })
}

function refreshTrayMenu() {
  if (!tray) return
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '📺 Affiliate Rotator', enabled: false },
    { type: 'separator' },
    { label: serverRunning ? `✅ Berjalan — port ${serverPort}` : '⭕ Berhenti', enabled: false },
    serverRunning
      ? { label: '🌐 Buka Dashboard', click: () => shell.openExternal(`http://localhost:${serverPort}/dashboard`) }
      : { label: '▶ Start Server', click: startServer },
    { type: 'separator' },
    serverRunning
      ? { label: '⏹ Stop Server',  click: stopServer }
      : { label: '▶ Start Server', click: startServer },
    { label: '⚙️ Pengaturan', click: openSetup },
    { type: 'separator' },
    { label: '❌ Keluar', click: () => { isQuitting = true; app.quit() } },
  ]))
}

// ─── Splash ───────────────────────────────────────────────
function showSplash(msg) {
  if (!splashWin || splashWin.isDestroyed()) {
    splashWin = new BrowserWindow({
      width: 460, height: 280,
      frame: false, transparent: true,
      resizable: false, alwaysOnTop: true, skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
      },
      icon: ICON_PATH,
    })
    splashWin.loadFile(path.join(__dirname, 'splash.html'))
    splashWin.center()
  }
  if (msg) {
    setTimeout(() => {
      if (splashWin && !splashWin.isDestroyed())
        splashWin.webContents.send('status', msg)
    }, 600)
  }
}

function closeSplash() {
  if (splashWin && !splashWin.isDestroyed()) { splashWin.close(); splashWin = null }
}

// ─── Setup Window ─────────────────────────────────────────
function openSetup() {
  if (setupWin && !setupWin.isDestroyed()) { setupWin.focus(); return }
  setupWin = new BrowserWindow({
    width: 520, height: 660, resizable: false,
    title: 'Affiliate Rotator — Pengaturan',
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  })
  setupWin.loadFile(path.join(__dirname, 'setup.html'))
  setupWin.setMenuBarVisibility(false)
}

// ─── Start Server ─────────────────────────────────────────
async function startServer() {
  if (serverRunning) {
    shell.openExternal(`http://localhost:${serverPort}/dashboard`)
    return
  }

  const cfg = readConfig()
  if (!cfg || !cfg.supabaseUrl) { openSetup(); return }

  showSplash('Menyiapkan server...')

  try {
    serverPort = await findFreePort(cfg.port || 3000)
    writeEnv(cfg, serverPort)

    sendSplashStatus('Memuat Next.js...')
    await startNextServer(cfg, serverPort)

    serverRunning = true
    refreshTrayMenu()
    closeSplash()
    shell.openExternal(`http://localhost:${serverPort}/dashboard`)

  } catch (err) {
    console.error('Start server error:', err)
    closeSplash()
    serverRunning = false
    refreshTrayMenu()
    dialog.showErrorBox(
      'Gagal Menjalankan Server',
      err.message + '\n\nPastikan:\n1. Credentials Supabase sudah benar\n2. Coba restart aplikasi'
    )
  }
}

function sendSplashStatus(msg) {
  if (splashWin && !splashWin.isDestroyed())
    splashWin.webContents.send('status', msg)
}

// ─── Stop Server ──────────────────────────────────────────
function stopServer() {
  if (nextServer) {
    try { nextServer.close() } catch {}
    nextServer = null
  }
  serverRunning = false
  refreshTrayMenu()
}

// ─── Test Koneksi Supabase ────────────────────────────────
async function testSupabaseConnection(cfg) {
  return new Promise(resolve => {
    try {
      const url  = new URL(cfg.supabaseUrl)
      const opts = {
        hostname: url.hostname,
        path: '/rest/v1/',
        method: 'GET',
        headers: {
          'apikey': cfg.supabaseAnonKey,
          'Authorization': `Bearer ${cfg.supabaseAnonKey}`,
        },
        timeout: 8000,
      }
      const req = https.request(opts, res => {
        resolve({ ok: res.statusCode < 500, statusCode: res.statusCode })
      })
      req.on('error', e => resolve({ ok: false, error: e.message }))
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout — cek koneksi internet' }) })
      req.end()
    } catch (e) {
      resolve({ ok: false, error: e.message })
    }
  })
}

// ─── IPC Handlers ─────────────────────────────────────────
ipcMain.handle('save-setup', async (_, cfg) => {
  try { saveConfig(cfg); return { ok: true } }
  catch (e) { return { ok: false, error: e.message } }
})
ipcMain.handle('get-config',      () => readConfig())
ipcMain.handle('start-server',    () => { startServer(); return { ok: true } })
ipcMain.handle('stop-server',     () => { stopServer(); return { ok: true } })
ipcMain.handle('open-external',   (_, url) => shell.openExternal(url))
ipcMain.handle('reset-config',    () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH)
    if (fs.existsSync(ENV_PATH))    fs.unlinkSync(ENV_PATH)
    return { ok: true }
  } catch (e) { return { ok: false, error: e.message } }
})
ipcMain.handle('get-status',      () => ({ running: serverRunning, port: serverPort }))
ipcMain.handle('test-connection', (_, cfg) => testSupabaseConnection(cfg))
ipcMain.handle('get-paths',       () => ({
  userData: USER_DATA,
  envPath:  ENV_PATH,
  nextDir:  NEXT_DIR,
}))

// ─── App Lifecycle ────────────────────────────────────────
app.whenReady().then(() => {
  app.setAppUserModelId('com.noobiiefun.affiliate-rotator')
  if (!fs.existsSync(USER_DATA)) fs.mkdirSync(USER_DATA, { recursive: true })

  buildTray()

  const cfg = readConfig()
  if (!cfg || !cfg.supabaseUrl) openSetup()
  else startServer()
})

app.on('window-all-closed', e => { if (!isQuitting) e.preventDefault() })
app.on('before-quit', () => { isQuitting = true; stopServer() })
