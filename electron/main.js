const {
  app, BrowserWindow, Tray, Menu,
  ipcMain, shell, nativeImage
} = require('electron')
const { spawn }  = require('child_process')
const path       = require('fs').existsSync ? require('path') : require('path')
const fs         = require('fs')
const http       = require('http')
const os         = require('os')

// ─── Paths ───────────────────────────────────────────────
const ROOT        = path.join(__dirname, '..')
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json')
const ENV_PATH    = path.join(ROOT, '.env.local')
const ICON_PATH   = path.join(__dirname, 'assets', 'icon.png')
const TRAY_PATH   = path.join(__dirname, 'assets', 'tray.png')

// ─── State ───────────────────────────────────────────────
let tray          = null
let splashWin     = null
let setupWin      = null
let serverProcess = null
let serverPort    = 3000
let serverRunning = false
let isQuitting    = false

// ─── Config helpers ──────────────────────────────────────
function readConfig() {
  try { if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH,'utf-8')) } catch {}
  return null
}
function saveConfig(cfg) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)) }

function writeEnv(cfg) {
  const ip   = getLocalIP()
  const port = cfg.port || 3000
  const base = `http://${ip}:${port}`
  const txt  = [
    `NEXT_PUBLIC_SUPABASE_URL=${cfg.supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${cfg.supabaseAnonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${cfg.supabaseServiceKey}`,
    `NEXT_PUBLIC_BASE_URL=${base}`,
    `IP_HASH_SALT=${cfg.salt || 'affiliate-rotator-' + Date.now()}`,
  ].join('\n')
  fs.writeFileSync(ENV_PATH, txt)
  return base
}

function getLocalIP() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return '127.0.0.1'
}

function isBuilt() { return fs.existsSync(path.join(ROOT, '.next', 'BUILD_ID')) }

// ─── Port check ──────────────────────────────────────────
function portFree(port) {
  return new Promise(res => {
    const s = http.createServer()
    s.listen(port, () => { s.close(() => res(true)) })
    s.on('error', () => res(false))
  })
}
async function freePort(start=3000) {
  for (let p = start; p < start+30; p++) { if (await portFree(p)) return p }
  return start
}

// ─── Tray builder ────────────────────────────────────────
function buildTray() {
  const icon = fs.existsSync(TRAY_PATH)
    ? nativeImage.createFromPath(TRAY_PATH).resize({ width:16, height:16 })
    : nativeImage.createEmpty()

  tray = new Tray(icon)
  tray.setToolTip('Affiliate Rotator')
  refreshTrayMenu()

  tray.on('double-click', () => {
    if (serverRunning) shell.openExternal(`http://localhost:${serverPort}/dashboard`)
    else startServer()
  })
}

function refreshTrayMenu() {
  if (!tray) return
  const menu = Menu.buildFromTemplate([
    {
      label: '📺 Affiliate Rotator',
      enabled: false
    },
    { type: 'separator' },
    {
      label: serverRunning ? '✅ Server Berjalan' : '⭕ Server Berhenti',
      enabled: false
    },
    serverRunning
      ? { label: '🌐 Buka Dashboard', click: () => shell.openExternal(`http://localhost:${serverPort}/dashboard`) }
      : { label: '▶ Jalankan Server', click: startServer },
    { type: 'separator' },
    serverRunning
      ? { label: '⏹ Stop Server', click: stopServer }
      : { label: '▶ Start Server',  click: startServer },
    { label: '⚙️ Pengaturan', click: openSetup },
    { type: 'separator' },
    { label: '❌ Keluar', click: () => { isQuitting = true; app.quit() } },
  ])
  tray.setContextMenu(menu)
}

// ─── Splash screen ───────────────────────────────────────
function showSplash() {
  splashWin = new BrowserWindow({
    width: 460, height: 280,
    frame: false, transparent: true,
    resizable: false, alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: { contextIsolation: true },
    icon: ICON_PATH,
  })
  splashWin.loadFile(path.join(__dirname, 'splash.html'))
  splashWin.center()
}

function closeSplash() {
  if (splashWin && !splashWin.isDestroyed()) {
    splashWin.close()
    splashWin = null
  }
}

// ─── Setup window ────────────────────────────────────────
function openSetup() {
  if (setupWin && !setupWin.isDestroyed()) { setupWin.focus(); return }
  setupWin = new BrowserWindow({
    width: 520, height: 640,
    resizable: false, frame: true,
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

// ─── Build Next.js ───────────────────────────────────────
function buildNext() {
  return new Promise((resolve, reject) => {
    if (splashWin) splashWin.webContents.send('status', 'Membangun aplikasi (1-3 menit)...')
    const npm  = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    const proc = spawn(npm, ['run', 'build'], { cwd: ROOT, shell: true, env: { ...process.env } })
    proc.on('close', code => code === 0 ? resolve() : reject(new Error('Build gagal')))
  })
}

// ─── Start server ────────────────────────────────────────
async function startServer() {
  if (serverRunning) {
    shell.openExternal(`http://localhost:${serverPort}/dashboard`)
    return
  }

  const cfg = readConfig()
  if (!cfg) { openSetup(); return }

  showSplash()

  try {
    writeEnv(cfg)
    serverPort = await freePort(cfg.port || 3000)

    if (!isBuilt()) {
      if (splashWin) splashWin.webContents.send('status', 'Build pertama kali (~3 menit)...')
      await buildNext()
    }

    if (splashWin) splashWin.webContents.send('status', 'Menjalankan server...')

    const npm  = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    serverProcess = spawn(npm, ['start', '--', '-p', String(serverPort), '-H', '0.0.0.0'], {
      cwd: ROOT, shell: true,
      env: { ...process.env, PORT: String(serverPort) },
    })

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), 40000)
      serverProcess.stdout.on('data', d => {
        const msg = d.toString()
        if (msg.includes('Ready') || msg.includes('ready') || msg.includes('started')) {
          clearTimeout(timer)
          resolve()
        }
      })
      serverProcess.stderr.on('data', d => {
        const msg = d.toString()
        if (msg.includes('Ready') || msg.includes('ready')) { clearTimeout(timer); resolve() }
      })
      serverProcess.on('error', err => { clearTimeout(timer); reject(err) })
    })

    serverRunning = true
    refreshTrayMenu()
    closeSplash()

    // Buka dashboard di browser default
    shell.openExternal(`http://localhost:${serverPort}/dashboard`)

  } catch (err) {
    closeSplash()
    serverRunning = false
    refreshTrayMenu()
    if (splashWin) splashWin.webContents.send('error', err.message)
    console.error('Start server error:', err)
  }
}

// ─── Stop server ─────────────────────────────────────────
function stopServer() {
  if (serverProcess) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t'], { shell: true })
      } else {
        serverProcess.kill('SIGTERM')
      }
    } catch {}
    serverProcess = null
  }
  serverRunning = false
  refreshTrayMenu()
}

// ─── IPC handlers ────────────────────────────────────────
ipcMain.handle('save-setup', async (_, cfg) => {
  try { saveConfig(cfg); writeEnv(cfg); return { ok: true } }
  catch (e) { return { ok: false, error: e.message } }
})
ipcMain.handle('get-config',    () => readConfig())
ipcMain.handle('start-server',  async () => { startServer(); return { ok: true } })
ipcMain.handle('stop-server',   () => { stopServer(); return { ok: true } })
ipcMain.handle('open-external', (_, url) => shell.openExternal(url))
ipcMain.handle('reset-config',  () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH)
    if (fs.existsSync(ENV_PATH))    fs.unlinkSync(ENV_PATH)
    return { ok: true }
  } catch (e) { return { ok: false, error: e.message } }
})
ipcMain.handle('get-status', () => ({ running: serverRunning, port: serverPort }))

// ─── App lifecycle ───────────────────────────────────────
app.whenReady().then(() => {
  app.setAppUserModelId('com.noobiiefun.affiliate-rotator')

  buildTray()

  const cfg = readConfig()
  if (!cfg || !cfg.supabaseUrl) {
    openSetup()
  } else {
    startServer()
  }
})

// Jangan quit saat semua window ditutup — tetap di tray
app.on('window-all-closed', e => { if (!isQuitting) e.preventDefault() })

app.on('before-quit', () => {
  isQuitting = true
  stopServer()
})
