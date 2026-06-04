import { createServerSupabase } from '@/lib/supabase-server'
import AnalyticsClient from './AnalyticsClient'

export const revalidate = 0

export default async function AnalyticsPage() {
  const supabase = createServerSupabase()

  // Klik 30 hari terakhir per hari
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    { data: clicksRaw },
    { data: topProducts },
    { count: totalClicks },
    { count: clicksToday },
    { count: clicksWeek },
  ] = await Promise.all([
    // Semua klik 30 hari
    supabase
      .from('click_events')
      .select('clicked_at, product_id, rotator_id, source')
      .gte('clicked_at', thirtyDaysAgo.toISOString())
      .order('clicked_at', { ascending: true }),

    // Top produk (join manual — ambil semua klik lalu group di client)
    supabase
      .from('click_events')
      .select('product_id, products(id, name, image_url, marketplace, slug)')
      .not('product_id', 'is', null)
      .gte('clicked_at', thirtyDaysAgo.toISOString()),

    // Total semua klik
    supabase.from('click_events').select('*', { count: 'exact', head: true }),

    // Klik hari ini
    supabase.from('click_events').select('*', { count: 'exact', head: true })
      .gte('clicked_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),

    // Klik 7 hari
    supabase.from('click_events').select('*', { count: 'exact', head: true })
      .gte('clicked_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  return (
    <AnalyticsClient
      clicksRaw={clicksRaw || []}
      topProductsRaw={topProducts || []}
      totalClicks={totalClicks || 0}
      clicksToday={clicksToday || 0}
      clicksWeek={clicksWeek || 0}
    />
  )
}
