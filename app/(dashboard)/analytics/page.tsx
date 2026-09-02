import { createServerSupabase } from '@/lib/supabase-server'
import AnalyticsClient from './AnalyticsClient'
import { Marketplace } from '@/types'
import { WifiOff } from 'lucide-react'

export const revalidate = 0

const OFFLINE = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

// Tipe persis yang dikembalikan Supabase dari query join
interface RawClickEvent {
  clicked_at:  string
  product_id:  string | null
  source:      string
}

interface RawTopProduct {
  product_id: string | null
  products: {
    id:          string
    name:        string
    image_url:   string | null
    marketplace: string
    slug:        string
  } | {
    id:          string
    name:        string
    image_url:   string | null
    marketplace: string
    slug:        string
  }[] | null
}

export default async function AnalyticsPage() {
  if (OFFLINE) {
    return (
      <div className="p-8">
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center max-w-lg mx-auto">
          <WifiOff size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Analytics tidak tersedia di Mode Offline</p>
          <p className="text-gray-400 text-sm mt-1">
            QR di overlay OBS langsung mengarah ke link affiliate tanpa lewat server,
            jadi tidak ada data klik yang bisa dilacak.
          </p>
        </div>
      </div>
    )
  }

  const supabase      = createServerSupabase()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    { data: clicksRaw },
    { data: topProductsRaw },
    { count: totalClicks },
    { count: clicksToday },
    { count: clicksWeek },
  ] = await Promise.all([
    supabase
      .from('click_events')
      .select('clicked_at, product_id, source')
      .gte('clicked_at', thirtyDaysAgo.toISOString())
      .order('clicked_at', { ascending: true }),

    supabase
      .from('click_events')
      .select('product_id, products(id, name, image_url, marketplace, slug)')
      .not('product_id', 'is', null)
      .gte('clicked_at', thirtyDaysAgo.toISOString()),

    supabase.from('click_events').select('*', { count: 'exact', head: true }),

    supabase.from('click_events').select('*', { count: 'exact', head: true })
      .gte('clicked_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),

    supabase.from('click_events').select('*', { count: 'exact', head: true })
      .gte('clicked_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // Normalisasi data — Supabase kadang return array, kadang object
  // Kita flatten agar selalu { product_id, products: object | null }
  const normalized = (topProductsRaw || []).map((row: any) => {
    const prod = Array.isArray(row.products) ? row.products[0] ?? null : row.products
    return {
      product_id: row.product_id as string,
      products: prod ? {
        id:          prod.id          as string,
        name:        prod.name        as string,
        image_url:   prod.image_url   as string | null,
        marketplace: prod.marketplace as Marketplace,
        slug:        prod.slug        as string,
      } : null,
    }
  })

  return (
    <AnalyticsClient
      clicksRaw={clicksRaw || []}
      topProductsRaw={normalized}
      totalClicks={totalClicks || 0}
      clicksToday={clicksToday || 0}
      clicksWeek={clicksWeek || 0}
    />
  )
}
