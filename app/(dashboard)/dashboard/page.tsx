import { Package, RotateCcw, MousePointerClick, TrendingUp, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import * as offlineDb from '@/lib/offline-db'

export const revalidate = 0

const OFFLINE = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

export default async function DashboardPage() {
  let totalProducts = 0, activeProducts = 0, totalRotators = 0, clicksToday: number | null = null

  if (OFFLINE) {
    const stats = offlineDb.getStats()
    totalProducts  = stats.totalProducts
    activeProducts = stats.activeProducts
    totalRotators  = stats.totalRotators
  } else {
    const [
      { count: tp }, { count: ap }, { count: tr }, { count: ct },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('rotators').select('*', { count: 'exact', head: true }),
      supabase.from('click_events').select('*', { count: 'exact', head: true })
        .gte('clicked_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    ])
    totalProducts = tp ?? 0; activeProducts = ap ?? 0; totalRotators = tr ?? 0; clicksToday = ct ?? 0
  }

  const stats = [
    { label: 'Total Produk',  value: totalProducts,  icon: Package,           color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Produk Aktif',  value: activeProducts, icon: TrendingUp,        color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Total Rotator', value: totalRotators,  icon: RotateCcw,         color: 'text-purple-600', bg: 'bg-purple-50' },
    ...(clicksToday !== null
      ? [{ label: 'Klik Hari Ini', value: clicksToday, icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-50' }]
      : []),
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Selamat datang di dashboard Affiliate Rotator</p>
        </div>
        {OFFLINE && (
          <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
            <WifiOff size={13} /> Mode Offline
          </span>
        )}
      </div>

      {/* Stats */}
      <div className={`grid gap-4 mb-8 ${stats.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`${bg} ${color} p-2 rounded-lg`}><Icon size={16} /></div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-medium text-gray-900 mb-1">Tambah Produk</h2>
          <p className="text-sm text-gray-500 mb-4">Tambahkan produk affiliate baru dari marketplace manapun</p>
          <Link href="/products/new" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            <Package size={15} /> Tambah Produk
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-medium text-gray-900 mb-1">Kelola Rotator</h2>
          <p className="text-sm text-gray-500 mb-4">Atur produk yang tampil di OBS overlay livestreaming Anda</p>
          <Link href="/rotator" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            <RotateCcw size={15} /> Kelola Rotator
          </Link>
        </div>
      </div>
    </div>
  )
}
