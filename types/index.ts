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
}

export interface Product {
  id:            string
  name:          string
  description:   string | null
  price:         number | null
  image_url:     string | null
  affiliate_url: string
  marketplace:   Marketplace
  slug:          string
  is_active:     boolean
  created_at:    string
  updated_at:    string
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
