// Konversi nama produk ke slug URL-friendly
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // hapus karakter spesial
    .replace(/\s+/g, '-')            // spasi → strip
    .replace(/-+/g, '-')             // multiple strip → satu
    .trim()
}

// Format harga ke Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Mendapatkan base URL untuk QR code
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

// Hash IP untuk privacy analytics
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + process.env.IP_HASH_SALT || 'default-salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16)
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Generate slug khusus rotator (lebih permissive dari product slug)
export function generateRotatorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50)
}

// ── Siklus otomatis nyala/mati rotator ──────────────────────
// Dihitung murni dari waktu (anchor ke epoch 0), jadi konsisten di semua
// client tanpa perlu state server — kerja sama persis di mode online & offline.
export interface CycleState {
  isOff: boolean
  msUntilChange: number
}
export function getRotatorCycleState(
  rotator: { cycle_enabled: boolean; cycle_on_min: number; cycle_off_min: number },
  now: Date = new Date()
): CycleState {
  if (!rotator.cycle_enabled || rotator.cycle_on_min <= 0) {
    return { isOff: false, msUntilChange: Infinity }
  }
  const onMs    = Math.max(1, rotator.cycle_on_min)  * 60_000
  const offMs   = Math.max(0, rotator.cycle_off_min) * 60_000
  const cycleMs = onMs + offMs
  if (offMs <= 0) return { isOff: false, msUntilChange: Infinity }

  const t = now.getTime() % cycleMs
  const isOff = t >= onMs
  const msUntilChange = isOff ? (cycleMs - t) : (onMs - t)
  return { isOff, msUntilChange }
}
