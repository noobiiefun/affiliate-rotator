// Script ini membaca NEXT_PUBLIC_BASE_URL dari .env.local
// lalu mengekstrak port-nya dan menjalankan Next.js di port tersebut

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function getPortFromEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return 3000

  const content = fs.readFileSync(envPath, 'utf-8')
  const match = content.match(/NEXT_PUBLIC_BASE_URL=https?:\/\/[^:]+:(\d+)/)
  if (match) return parseInt(match[1])

  // Kalau tidak ada port di URL (misal http://localhost tanpa port), default 3000
  return 3000
}

const port = getPortFromEnv()
console.log(`▶ Menjalankan di port: ${port}`)

try {
  execSync(`npx next dev -p ${port}`, { stdio: 'inherit' })
} catch {}
