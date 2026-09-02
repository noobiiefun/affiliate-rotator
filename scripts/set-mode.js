// Menyalakan/mematikan flag NEXT_PUBLIC_OFFLINE_MODE SEBELUM `next build`.
// Next.js "membakar" nilai env NEXT_PUBLIC_* ke dalam kode saat build,
// jadi mode offline/online harus ditentukan di titik ini, bukan saat aplikasi
// sudah jadi .exe. Dipakai otomatis oleh script npm run dist:offline:*.
//
// Usage: node scripts/set-mode.js offline|online
const fs   = require('fs')
const path = require('path')

const mode = process.argv[2]
const file = path.join(__dirname, '..', '.env.production.local')

if (mode === 'offline') {
  fs.writeFileSync(file, 'NEXT_PUBLIC_OFFLINE_MODE=true\n')
  console.log('[set-mode] Mode Offline diaktifkan untuk build ini →', file)
} else if (mode === 'online') {
  if (fs.existsSync(file)) fs.unlinkSync(file)
  console.log('[set-mode] Mode Offline dimatikan (kembali ke build online biasa)')
} else {
  console.error('Usage: node scripts/set-mode.js offline|online')
  process.exit(1)
}
