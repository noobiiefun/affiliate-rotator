// Script ini:
// 1. Deteksi IP lokal otomatis
// 2. Update NEXT_PUBLIC_BASE_URL di .env.local dengan IP lokal
// 3. Jalankan Next.js server dengan -H 0.0.0.0 agar bisa diakses HP

const { execSync, spawn } = require('child_process')
const fs   = require('fs')
const path = require('path')
const os   = require('os')

const ENV_PATH = path.join(process.cwd(), '.env.local')

// Baca port dari .env.local
function getPort() {
  if (!fs.existsSync(ENV_PATH)) return 3000
  const content = fs.readFileSync(ENV_PATH, 'utf-8')
  const match = content.match(/NEXT_PUBLIC_BASE_URL=https?:\/\/[^:]+:(\d+)/)
  if (match) return parseInt(match[1])
  return 3000
}

// Deteksi IP lokal (WiFi/LAN)
function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // IPv4, bukan loopback, bukan virtual
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

// Update NEXT_PUBLIC_BASE_URL di .env.local
function updateEnvBaseUrl(ip, port) {
  if (!fs.existsSync(ENV_PATH)) return
  let content = fs.readFileSync(ENV_PATH, 'utf-8')
  const newUrl = `http://${ip}:${port}`
  // Ganti nilai NEXT_PUBLIC_BASE_URL
  if (content.includes('NEXT_PUBLIC_BASE_URL=')) {
    content = content.replace(/NEXT_PUBLIC_BASE_URL=.*/g, `NEXT_PUBLIC_BASE_URL=${newUrl}`)
  } else {
    content += `\nNEXT_PUBLIC_BASE_URL=${newUrl}`
  }
  fs.writeFileSync(ENV_PATH, content)
  return newUrl
}

const port    = getPort()
const localIP = getLocalIP()
const baseUrl = updateEnvBaseUrl(localIP, port)

console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  🚀 Affiliate Rotator — Dev Server')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`  💻 PC/Laptop  : http://localhost:${port}`)
console.log(`  📱 HP/Tablet  : ${baseUrl}`)
console.log(`  🎬 QR code akan pakai: ${baseUrl}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')

// Jalankan Next.js dengan -H 0.0.0.0 agar bisa diakses HP di jaringan yang sama
const next = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '-p', String(port)], {
  stdio: 'inherit',
  shell: true,
})

next.on('error', err => console.error('Error:', err.message))
