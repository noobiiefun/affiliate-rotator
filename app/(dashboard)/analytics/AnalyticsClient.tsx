'use client'

import { useMemo } from 'react'
import { MousePointerClick, TrendingUp, Calendar, BarChart2, ExternalLink } from 'lucide-react'
import { MARKETPLACE_INFO, Marketplace, MarketplaceInfo } from '@/types'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────
interface ClickRaw { clicked_at: string; product_id: string | null; source: string }

interface TopProduct {
  id:          string
  name:        string
  image_url:   string | null
  marketplace: Marketplace
  slug:        string
}

interface TopRaw { product_id: string; products: TopProduct | null }

interface ProductCount { product: TopProduct; count: number }

interface Props {
  clicksRaw:      ClickRaw[]
  topProductsRaw: TopRaw[]
  totalClicks:    number
  clicksToday:    number
  clicksWeek:     number
}

// ── Component ─────────────────────────────────────────────
export default function AnalyticsClient({
  clicksRaw, topProductsRaw, totalClicks, clicksToday, clicksWeek
}: Props) {

  // Klik per hari (30 hari terakhir)
  const dailyClicks = useMemo(() => {
    const map: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      map[d.toISOString().split('T')[0]] = 0
    }
    clicksRaw.forEach(c => {
      const key = c.clicked_at.split('T')[0]
      if (key in map) map[key]++
    })
    return Object.entries(map).map(([date, count]) => ({ date, count }))
  }, [clicksRaw])

  const maxDaily = Math.max(...dailyClicks.map(d => d.count), 1)

  // Top produk — dengan tipe eksplisit
  const topProductsMap = useMemo<ProductCount[]>(() => {
    const map: Record<string, ProductCount> = {}
    topProductsRaw.forEach(({ product_id, products }) => {
      if (!product_id || !products) return
      if (!map[product_id]) map[product_id] = { product: products, count: 0 }
      map[product_id].count++
    })
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [topProductsRaw])

  const maxTop = Math.max(...topProductsMap.map(p => p.count), 1)

  // Source breakdown
  const sourceMap = useMemo(() => {
    const map: Record<string, number> = { qr: 0, direct: 0, share: 0 }
    clicksRaw.forEach(c => { if (c.source in map) map[c.source]++ })
    return map
  }, [clicksRaw])

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Data klik dan performa produk affiliate</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Semua Klik', value: totalClicks,  icon: MousePointerClick, color: 'text-blue-600',   bg: 'bg-blue-50',   sub: 'Sejak awal' },
          { label: 'Klik Hari Ini',    value: clicksToday,  icon: Calendar,          color: 'text-green-600',  bg: 'bg-green-50',  sub: 'Hari ini' },
          { label: 'Klik 7 Hari',      value: clicksWeek,   icon: TrendingUp,        color: 'text-purple-600', bg: 'bg-purple-50', sub: '7 hari terakhir' },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`${bg} ${color} p-2 rounded-lg`}><Icon size={16} /></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Grafik klik harian */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-medium text-gray-900">Klik per Hari</h2>
              <p className="text-xs text-gray-400 mt-0.5">30 hari terakhir</p>
            </div>
            <BarChart2 size={16} className="text-gray-300" />
          </div>

          {clicksRaw.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
              Belum ada data klik
            </div>
          ) : (
            <div className="flex items-end gap-[3px] h-40">
              {dailyClicks.map(({ date, count }, i) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-t transition-all group-hover:opacity-80"
                      style={{
                        height: count === 0 ? 2 : `${Math.max((count / maxDaily) * 100, 4)}%`,
                        background: count === 0 ? '#f3f4f6' : 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
                        minHeight: 2,
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                      {formatDate(date)}: {count} klik
                    </div>
                  </div>
                  {i % 5 === 0 && (
                    <span className="text-gray-400" style={{ fontSize: 9 }}>{formatDate(date)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-medium text-gray-900 mb-1">Sumber Klik</h2>
          <p className="text-xs text-gray-400 mb-5">30 hari terakhir</p>
          <div className="space-y-4">
            {[
              { key: 'qr',     label: 'Scan QR',    color: '#8b5cf6', emoji: '📱' },
              { key: 'direct', label: 'Direct Link', color: '#3b82f6', emoji: '🔗' },
              { key: 'share',  label: 'Share',       color: '#10b981', emoji: '📤' },
            ].map(({ key, label, color, emoji }) => {
              const total = Object.values(sourceMap).reduce((a, b) => a + b, 0) || 1
              const count = sourceMap[key] || 0
              const pct   = Math.round((count / total) * 100)
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600">{emoji} {label}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 text-right">{pct}%</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top produk */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-medium text-gray-900">Produk Terpopuler</h2>
              <p className="text-xs text-gray-400 mt-0.5">Berdasarkan jumlah klik (30 hari)</p>
            </div>
            <Link href="/products" className="text-xs text-purple-600 hover:underline">Lihat semua →</Link>
          </div>

          {topProductsMap.length === 0 ? (
            <div className="text-center py-8 text-gray-300 text-sm">Belum ada data klik produk</div>
          ) : (
            <div className="space-y-3">
              {topProductsMap.map(({ product, count }: ProductCount, idx: number) => {
                const mp: MarketplaceInfo | null = MARKETPLACE_INFO[product.marketplace] ?? null
                const pct = Math.round((count / maxTop) * 100)
                return (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700'
                      : idx === 1 ? 'bg-gray-100 text-gray-600'
                      : idx === 2 ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-50 text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.image_url
                        ? <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        {mp && <span className="text-xs text-gray-400 flex-shrink-0">{mp.icon} {mp.label}</span>}
                        <Link href={`/p/${product.slug}`} target="_blank"
                          className="text-gray-300 hover:text-purple-500 flex-shrink-0 transition-colors">
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${pct}%`,
                            background: idx === 0
                              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                              : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right flex-shrink-0">
                          {count} klik
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
