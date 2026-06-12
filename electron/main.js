const {
  app, BrowserWindow, Tray, Menu,
  ipcMain, shell, nativeImage, dialog
} = require('electron')
const { spawn }  = require('child_process')
const path       = require('path')
const fs         = require('fs')
const http       = require('http')
const os         = require('os')
const https      = require('https')

// ─── Paths ───────────────────────────────────────────────────────────────────
// userData = C:\Users\NamaUser\AppData\Roaming\Affiliate Rotator
// Semua file yang perlu ditulis harus di sini, BUKAN di dalam .asar
const USER_DATA   = app.getPath('userData')
const CONFIG_PATH = path.join(USER_DATA, 'config.json')
const ENV_PATH    = path.join(USER_DATA, '.env.local')   // ← pindah ke userData
const APP_ROOT    = path.join(USER_DATA, 'app')          // next.js di-copy ke sini

// Path icon (dari dalam .asar, read-only, tidak masalah)
const ICON_PATH   = path.join(__dirname, 'assets', 'icon.png')
const TRAY_PATH   = path.join(__dirname, 'assets', 'tray.png')

// ─── State ───────────────────────────────────────────────────────────────────
let tray          = null
let splashWin     = null
let setupWin      = null
let serverProcess = null
let serverPort    = 3000
let serverRunning = false
let isQuitting    = false

// ─── Config helpers ───────────────────────────────────────────────────────────
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

function writeEnv(cfg) {
  if (!fs.existsSync(USER_DATA)) fs.mkdirSync(USER_DATA, { recursive: true })
  const ip   = getLocalIP()
  const port = cfg.port || 3000
  const base = `http://${ip}:${port}`
  const content = [
    `NEXT_PUBLIC_SUPABASE_URL=${cfg.supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${cfg.supabaseAnonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${cfg.supabaseServiceKey}`,
    `NEXT_PUBLIC_BASE_URL=${base}`,
    `IP_HASH_SALT=${cfg.salt || 'affiliate-rotator-' + Date.now()}`,
  ].join('\n')
  fs.writeFileSync(ENV_PATH, content)
  return base
}

// ─── Auto-run schema SQL via Supabase REST API ────────────────────────────────
async function runSchemaSQL(cfg) {
  // Baca schema.sql dari dalam package
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
  if (!fs.existsSync(schemaPath)) return { ok: false, error: 'schema.sql tidak ditemukan' }

  const sql = fs.readFileSync(schemaPath, 'utf-8')

  // Pakai Supabase REST API untuk jalankan SQL
  const url     = new URL(cfg.supabaseUrl)
  const host    = url.hostname
  const apiPath = '/rest/v1/rpc/exec_sql'

  return new Promise((resolve) => {
    const body = JSON.stringify({ sql })
    const options = {
      hostname: host,
      path:     '/rest/v1/',
      method:   'GET',
      headers:  { 'apikey': cfg.supabaseAnonKey, 'Authorization': `Bearer ${cfg.supabaseServiceKey}` }
    }

    // Coba ping Supabase dulu untuk cek koneksi
    const req = https.request(options, (res) => {
      resolve({ ok: res.statusCode < 500, statusCode: res.statusCode })
    })
    req.on('error', (e) => resolve({ ok: false, error: e.message }))
    req.end()
  })
}

// ─── Port helpers ─────────────────────────────────────────────────────────────
function portFree(port) {
  return new Promise(res => {
    const s = http.createServer()
    s.listen(port, () => { s.close(() => res(true)) })
    s.on('error', () => res(false))
  })
}
async function freePort(start = 3000) {
  for (let p = start; p < start + 30; p++) { if (await portFree(p)) return p }
  return start
}

// ─── Check Next.js built ──────────────────────────────────────────────────────
function isBuilt() {
  // Cek di userData/app/.next (lokasi baru setelah copy)
  const newLoc = path.join(APP_ROOT, '.next', 'BUILD_ID')
  // Fallback cek di dalam asar (dev mode)
  const devLoc = path.join(__dirname, '..', '.next', 'BUILD_ID')
  return fs.existsSync(newLoc) || fs.existsSync(devLoc)
}

// ─── Get Next.js root (bisa di userData atau di dev) ─────────────────────────
function getNextRoot() {
  const userDataNext = path.join(APP_ROOT, '.next', 'BUILD_ID')
  if (fs.existsSync(userDataNext)) return APP_ROOT
  // Dev mode: langsung dari project
  return path.join(__dirname, '..')
}

// ─── Tray ────────────────────────────────────────────────────────────────────
function buildTray() {
  const icon = fs.existsSync(TRAY_PATH)
    ? nativeImage.createFromPath(TRAY_PATH).resize({ width: 16, height: 16 })
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
    { label: '📺 Affiliate Rotator', enabled: false },
    { type: 'separator' },
    { label: serverRunning ? `✅ Berjalan — port ${serverPort}` : '⭕ Server Berhenti', enabled: false },
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

// ─── Splash ───────────────────────────────────────────────────────────────────
function showSplash(msg) {
  if (splashWin && !splashWin.isDestroyed()) {
    splashWin.webContents.send('status', msg || 'Memulai...')
    return
  }
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
  if (msg) setTimeout(() => splashWin?.webContents?.send('status', msg), 500)
}

function closeSplash() {
  if (splashWin && !splashWin.isDestroyed()) { splashWin.close(); splashWin = null }
}

// ─── Setup window ────────────────────────────────────────────────────────────
function openSetup() {
  if (setupWin && !setupWin.isDestroyed()) { setupWin.focus(); return }
  setupWin = new BrowserWindow({
    width: 520, height: 660,
    resizable: false,
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

// ─── Start server ─────────────────────────────────────────────────────────────
async function startServer() {
  if (serverRunning) { shell.openExternal(`http://localhost:${serverPort}/dashboard`); return }

  const cfg = readConfig()
  if (!cfg) { openSetup(); return }

  showSplash('Menyiapkan server...')

  try {
    // Tulis .env.local ke userData (writable)
    writeEnv(cfg)

    serverPort = await freePort(cfg.port || 3000)

    const nextRoot = getNextRoot()
    showSplash('Menjalankan server...')

    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

    serverProcess = spawn(npm, ['start', '--', '-p', String(serverPort), '-H', '0.0.0.0'], {
      cwd: nextRoot,
      shell: true,
      env: {
        ...process.env,
        PORT: String(serverPort),
        // Arahkan Next.js baca .env dari userData
        ENV_FILE: ENV_PATH,
        NEXT_PUBLIC_SUPABASE_URL:     cfg.supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: cfg.supabaseAnonKey,
        SUPABASE_SERVICE_ROLE_KEY:    cfg.supabaseServiceKey,
        NEXT_PUBLIC_BASE_URL:         `http://${getLocalIP()}:${serverPort}`,
        IP_HASH_SALT:                 cfg.salt || 'affiliate-salt',
      },
    })

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server timeout setelah 60 detik')), 60000)
      const onData = (d) => {
        const msg = d.toString()
        if (msg.includes('Ready') || msg.includes('ready') || msg.includes('started')) {
          clearTimeout(timer); resolve()
        }
      }
      serverProcess.stdout?.on('data', onData)
      serverProcess.stderr?.on('data', onData)
      serverProcess.on('error', (e) => { clearTimeout(timer); reject(e) })
    })

    serverRunning = true
    refreshTrayMenu()
    closeSplash()
    shell.openExternal(`http://localhost:${serverPort}/dashboard`)

  } catch (err) {
    closeSplash()
    serverRunning = false
    refreshTrayMenu()
    dialog.showErrorBox('Gagal Menjalankan Server', err.message + '\n\nCoba buka Pengaturan dan cek konfigurasi Supabase Anda.')
  }
}

// ─── Stop server ──────────────────────────────────────────────────────────────
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

// ─── IPC ──────────────────────────────────────────────────────────────────────
ipcMain.handle('save-setup', async (_, cfg) => {
  try {
    saveConfig(cfg)
    writeEnv(cfg)
    return { ok: true }
  } catch (e) { return { ok: false, error: e.message } }
})

ipcMain.handle('get-config',    () => readConfig())
ipcMain.handle('start-server',  () => { startServer(); return { ok: true } })
ipcMain.handle('stop-server',   () => { stopServer(); return { ok: true } })
ipcMain.handle('open-external', (_, url) => shell.openExternal(url))
ipcMain.handle('get-status',    () => ({ running: serverRunning, port: serverPort }))

ipcMain.handle('test-connection', async (_, cfg) => {
  // Test koneksi Supabase dengan ping REST API
  try {
    const result = await runSchemaSQL(cfg)
    return result
  } catch (e) { return { ok: false, error: e.message } }
})

ipcMain.handle('reset-config', () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH)
    if (fs.existsSync(ENV_PATH))    fs.unlinkSync(ENV_PATH)
    return { ok: true }
  } catch (e) { return { ok: false, error: e.message } }
})

ipcMain.handle('get-paths', () => ({
  userData: USER_DATA,
  envPath:  ENV_PATH,
  appRoot:  getNextRoot(),
}))

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  app.setAppUserModelId('com.noobiiefun.affiliate-rotator')

  // Pastikan userData folder ada
  if (!fs.existsSync(USER_DATA)) fs.mkdirSync(USER_DATA, { recursive: true })

  buildTray()

  const cfg = readConfig()
  if (!cfg || !cfg.supabaseUrl) {
    openSetup()
  } else {
    startServer()
  }
})

app.on('window-all-closed', e => { if (!isQuitting) e.preventDefault() })
app.on('before-quit', () => { isQuitting = true; stopServer() })
