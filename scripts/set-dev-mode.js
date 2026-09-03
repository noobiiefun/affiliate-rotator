// Menyalakan/mematikan Mode Offline untuk `npm run dev` (bukan untuk build).
// next dev membaca .env.local (bukan .env.production.local), jadi script ini
// pakai file yang berbeda dari scripts/set-mode.js (yang dipakai saat build .exe).
//
// Usage: node scripts/set-dev-mode.js offline|online
const fs   = require('fs')
const path = require('path')

const mode = process.argv[2]
const file = path.join(__dirname, '..', '.env.local')

function readLines() {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf-8').split('\n').filter(Boolean)
}

// Pertahankan baris lain (mis. kredensial Supabase kalau ada), cuma ganti baris flag-nya.
let lines = readLines().filter(l => !l.trim().startsWith('NEXT_PUBLIC_OFFLINE_MODE'))

if (mode === 'offline') {
  lines.push('NEXT_PUBLIC_OFFLINE_MODE=true')
  fs.writeFileSync(file, lines.join('\n') + '\n')
  console.log('[dev-mode] Mode Offline AKTIF untuk `next dev` → .env.local')
  console.log('[dev-mode] Restart dev server kalau masih berjalan, lalu buka /dashboard langsung.')
} else if (mode === 'online') {
  fs.writeFileSync(file, lines.join('\n') + (lines.length ? '\n' : ''))
  console.log('[dev-mode] Mode Offline DIMATIKAN — kembali ke mode online (butuh Supabase + login).')
} else {
  console.error('Usage: node scripts/set-dev-mode.js offline|online')
  process.exit(1)
}
