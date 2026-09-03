export type Marketplace =
  | 'tokopedia' | 'shopee' | 'lazada'
  | 'tiktok'    | 'blibli' | 'other'

export type OverlaySize     = 'small' | 'medium' | 'large'
export type OverlayPosition =
  | 'bottom-left' | 'bottom-right'
  | 'top-left'    | 'top-right'
  | 'center'

export interface ThemeConfig {
  bg_color:         string   // warna background kartu
  accent_color:     string   // warna aksen (progress bar, badge)
  text_color:       string   // warna teks utama
  size:             OverlaySize
  position:         OverlayPosition
  logo_url:         string | null  // URL logo/watermark
  show_price:       boolean
  show_marketplace: boolean
  border_radius:    number
  opacity:          number   // 0.0 - 1.0
  badge_label:      string   // teks badge di atas nama produk, default 'PROMO SEKARANG'
}

export const DEFAULT_THEME: ThemeConfig = {
  bg_color:         '#0f0f23',
  accent_color:     '#8b5cf6',
  text_color:       '#ffffff',
  size:             'medium',
  position:         'bottom-left',
  logo_url:         null,
  show_price:       true,
  show_marketplace: true,
  border_radius:    20,
  opacity:          0.95,
  badge_label:      'PROMO SEKARANG',
}

export interface Product {
  id:            string
  name:          string
  description:   string | null
  price:         number | null
  image_url:     string | null   // gambar utama (legacy, tetap dipakai di OBS)
  images:        string[]        // array semua gambar (untuk landing page)
  video_url:     string | null   // URL video YouTube/TikTok (opsional)
  coupon_code:   string | null   // kode kupon yang bisa dicopy penonton
  coupon_label:  string | null   // label kupon, misal 'DISKON20'
  sale_ends_at:  string | null   // waktu berakhir flash sale (ISO string)
  sale_label:    string | null   // label sale, misal 'Flash Sale!'
  affiliate_url: string
  marketplace:   Marketplace
  slug:          string
  is_active:     boolean
  created_at:    string
  updated_at:    string
}

// Helper: ambil semua gambar produk (gabung image_url + images, tanpa duplikat)
export function getProductImages(product: Product): string[] {
  const all: string[] = []
  if (product.image_url) all.push(product.image_url)
  if (product.images?.length) {
    product.images.forEach(img => { if (img && !all.includes(img)) all.push(img) })
  }
  return all
}

// Helper: detect video embed URL
export function getVideoEmbedUrl(url: string | null): string | null {
  if (!url) return null
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // YouTube Shorts
  const ytShorts = url.match(/youtube\.com\/shorts\/([\w-]+)/)
  if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}`
  // TikTok (embed tidak support semua, pakai link langsung)
  if (url.includes('tiktok.com')) return url
  return null
}

export interface RotatorGroup {
  id:          string
  name:        string
  description: string | null
  color:       string
  created_at:  string
  updated_at:  string
}

export interface Rotator {
  id:           string
  name:         string
  slug:         string          // URL custom: /obs/[slug]
  description:  string | null
  group_id:     string | null
  interval_sec: number
  is_active:    boolean
  theme_config: ThemeConfig
  // ── Siklus otomatis nyala/mati ──────────────────────────
  cycle_enabled: boolean  // kalau true, rotator otomatis mati-nyala berulang
  cycle_on_min:  number   // berapa menit rotator TAMPIL sebelum mati
  cycle_off_min: number   // berapa menit rotator MATI sebelum tampil lagi
  created_at:   string
  updated_at:   string
  // joined
  group?:       RotatorGroup
}

export interface RotatorItem {
  id:         string
  rotator_id: string
  product_id: string
  position:   number
  is_active:  boolean
  created_at: string
  product?:   Product
}

export interface ClickEvent {
  id:         string
  product_id: string | null
  rotator_id: string | null
  source:     'qr' | 'direct' | 'share'
  clicked_at: string
}

export interface MarketplaceInfo {
  id:    Marketplace
  label: string
  color: string
  icon:  string
}

export const MARKETPLACE_INFO: Record<Marketplace, MarketplaceInfo> = {
  tokopedia: { id: 'tokopedia', label: 'Tokopedia',   color: '#42B549', icon: '🟢' },
  shopee:    { id: 'shopee',    label: 'Shopee',      color: '#FF6B35', icon: '🟠' },
  lazada:    { id: 'lazada',    label: 'Lazada',      color: '#0F146D', icon: '🔵' },
  tiktok:    { id: 'tiktok',   label: 'TikTok Shop', color: '#010101', icon: '⚫' },
  blibli:    { id: 'blibli',   label: 'Blibli',      color: '#0095DA', icon: '🔷' },
  other:     { id: 'other',    label: 'Lainnya',     color: '#6B7280', icon: '🔗' },
}

export const OVERLAY_SIZE_LABELS: Record<OverlaySize, string> = {
  small:  'Kecil (200px)',
  medium: 'Sedang (260px)',
  large:  'Besar (320px)',
}

export const OVERLAY_POSITION_LABELS: Record<OverlayPosition, string> = {
  'bottom-left':  'Pojok Kiri Bawah',
  'bottom-right': 'Pojok Kanan Bawah',
  'top-left':     'Pojok Kiri Atas',
  'top-right':    'Pojok Kanan Atas',
  'center':       'Tengah',
}

// ── Spotlight & Flash Sale types ──────────────────────────

export interface SpotlightEvent {
  id:         string
  rotator_id: string
  product_id: string
  started_at: string
  ends_at:    string
  is_active:  boolean
  product?:   Product
}

// Extended RotatorItem dengan spotlight
export interface RotatorItemExtended extends RotatorItem {
  spotlight_duration: number | null  // detik, null = pakai interval rotator
  spotlight_active:   boolean
  product: Product
}
