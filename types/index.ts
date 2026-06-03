// ============================================================
// Types untuk seluruh project Affiliate Rotator
// ============================================================

export type Marketplace =
  | 'tokopedia'
  | 'shopee'
  | 'lazada'
  | 'tiktok'
  | 'blibli'
  | 'other'

export interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  affiliate_url: string
  marketplace: Marketplace
  slug: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Rotator {
  id: string
  name: string
  description: string | null
  interval_sec: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RotatorItem {
  id: string
  rotator_id: string
  product_id: string
  position: number
  is_active: boolean
  created_at: string
  // joined
  product?: Product
}

export interface RotatorWithItems extends Rotator {
  rotator_items: (RotatorItem & { product: Product })[]
}

export interface ClickEvent {
  id: string
  product_id: string | null
  rotator_id: string | null
  source: 'qr' | 'direct' | 'share'
  clicked_at: string
}

// Dashboard analytics summary
export interface AnalyticsSummary {
  total_products: number
  active_products: number
  total_rotators: number
  total_clicks_today: number
  total_clicks_week: number
  top_products: {
    product: Product
    click_count: number
  }[]
}

export interface MarketplaceInfo {
  id: Marketplace
  label: string
  color: string
  icon: string
}

export const MARKETPLACE_INFO: Record<Marketplace, MarketplaceInfo> = {
  tokopedia: { id: 'tokopedia', label: 'Tokopedia', color: '#42B549', icon: '🟢' },
  shopee:    { id: 'shopee',    label: 'Shopee',    color: '#FF6B35', icon: '🟠' },
  lazada:    { id: 'lazada',    label: 'Lazada',    color: '#0F146D', icon: '🔵' },
  tiktok:    { id: 'tiktok',   label: 'TikTok Shop', color: '#010101', icon: '⚫' },
  blibli:    { id: 'blibli',   label: 'Blibli',    color: '#0095DA', icon: '🔷' },
  other:     { id: 'other',    label: 'Lainnya',   color: '#6B7280', icon: '🔗' },
}
