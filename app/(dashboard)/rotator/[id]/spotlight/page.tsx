'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Zap, Clock, Play, StopCircle,
  AlertTriangle, CheckCircle2, Timer
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product, Rotator, SpotlightEvent } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { MARKETPLACE_INFO } from '@/types'

const OFFLINE = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

interface RotatorItemFull {
  id: string; position: number
  spotlight_duration: number | null
  product: Product
}

const DURATION_PRESETS = [
  { label: '1 menit',   seconds: 60 },
  { label: '5 menit',   seconds: 300 },
  { label: '10 menit',  seconds: 600 },
  { label: '15 menit',  seconds: 900 },
  { label: '30 menit',  seconds: 1800 },
  { label: '1 jam',     seconds: 3600 },
]

export default function SpotlightPage() {
  const { id: rotatorId } = useParams() as { id: string }
  const router = useRouter()

  const [rotator,   setRotator]   = useState<Rotator | null>(null)
  const [items,     setItems]     = useState<RotatorItemFull[]>([])
  const [active,    setActive]    = useState<SpotlightEvent | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [countdown, setCountdown] = useState('')
  const [starting,  setStarting]  = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [rotatorId])

  // Countdown timer
  useEffect(() => {
    if (!active) return
    const tick = () => {
      const diff = new Date(active.ends_at).getTime() - Date.now()
      if (diff <= 0) { setActive(null); setCountdown(''); fetchAll(); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [active])

  async function fetchAll() {
    if (OFFLINE) { setLoading(false); return } // fitur spotlight tidak tersedia di mode offline
    setLoading(true)
    const [{ data: rot }, { data: its }, { data: spotlights }] = await Promise.all([
      supabase.from('rotators').select('*').eq('id', rotatorId).single(),
      supabase.from('rotator_items')
        .select('id, position, spotlight_duration, product:products(*)')
        .eq('rotator_id', rotatorId)
        .eq('is_active', true)
        .order('position'),
      supabase.from('spotlight_events')
        .select('*, product:products(name, image_url)')
        .eq('rotator_id', rotatorId)
        .eq('is_active', true)
        .gte('ends_at', new Date().toISOString())
        .order('started_at', { ascending: false })
        .limit(1),
    ])
    setRotator(rot)
    setItems((its as any) || [])
    setActive(spotlights?.[0] || null)
    setLoading(false)
  }

  async function startSpotlight(item: RotatorItemFull, durationSec: number) {
    setStarting(item.id)
    // Nonaktifkan spotlight yang sedang jalan
    await supabase.from('spotlight_events')
      .update({ is_active: false })
      .eq('rotator_id', rotatorId)
      .eq('is_active', true)

    // Update rotator_item
    await supabase.from('rotator_items')
      .update({ spotlight_active: true, spotlight_duration: durationSec })
      .eq('id', item.id)

    // Reset spotlight_active untuk item lain
    items.forEach(async i => {
      if (i.id !== item.id) {
        await supabase.from('rotator_items')
          .update({ spotlight_active: false })
          .eq('id', i.id)
      }
    })

    // Buat spotlight event
    const endsAt = new Date(Date.now() + durationSec * 1000).toISOString()
    await supabase.from('spotlight_events').insert({
      rotator_id: rotatorId,
      product_id: item.product.id,
      ends_at:    endsAt,
      is_active:  true,
    })

    await fetchAll()
    setStarting(null)
  }

  async function stopSpotlight() {
    await supabase.from('spotlight_events')
      .update({ is_active: false })
      .eq('rotator_id', rotatorId)
      .eq('is_active', true)

    await supabase.from('rotator_items')
      .update({ spotlight_active: false })
      .eq('rotator_id', rotatorId)

    setActive(null)
    setCountdown('')
    await fetchAll()
  }

  async function setItemDuration(itemId: string, seconds: number | null) {
    await supabase.from('rotator_items')
      .update({ spotlight_duration: seconds })
      .eq('id', itemId)
    fetchAll()
  }

  if (OFFLINE) return (
    <div className="p-8">
      <Link href={`/rotator/${rotatorId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center max-w-lg">
        <Zap size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Fitur Spotlight belum tersedia di Mode Offline</p>
        <p className="text-gray-400 text-sm mt-1">
          Rotasi normal, tema, dan kecepatan tetap berjalan seperti biasa — hanya highlight
          flash-sale sementara ini yang perlu mode online (Supabase).
        </p>
      </div>
    </div>
  )
  if (loading) return <div className="p-8 text-gray-400 text-sm">Memuat...</div>
  if (!rotator) return <div className="p-8 text-gray-400 text-sm">Rotator tidak ditemukan.</div>

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/rotator/${rotatorId}`}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Spotlight</h1>
            <span className="text-sm text-gray-400">— {rotator.name}</span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Pajang satu produk lebih lama dengan efek khusus di OBS
          </p>
        </div>
      </div>

      {/* Status spotlight aktif */}
      {active && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center animate-pulse">
                <Zap size={20} className="text-yellow-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">Spotlight Aktif</p>
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {(active as any).product?.name || 'Produk spotlight'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-orange-600">{countdown}</p>
                <p className="text-xs text-gray-400">tersisa</p>
              </div>
              <button onClick={stopSpotlight}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-lg transition-colors">
                <StopCircle size={15} /> Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daftar produk */}
      <div className="space-y-3">
        <h2 className="font-medium text-gray-700 text-sm">Pilih produk untuk di-spotlight:</h2>
        {items.map(item => {
          const mp        = MARKETPLACE_INFO[item.product.marketplace]
          const isActive  = active?.product_id === item.product.id
          const isLoading = starting === item.id
          const [showDur, setShowDur] = useState(false)

          return (
            <div key={item.id}
              className={`bg-white border rounded-xl p-4 transition-all ${
                isActive ? 'border-yellow-400 shadow-yellow-100 shadow-md' : 'border-gray-200'
              }`}>
              <div className="flex items-start gap-3">
                {/* Gambar */}
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.product.image_url
                    ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                    {isActive && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        ⚡ SPOTLIGHT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {mp.icon} {mp.label}
                    {item.product.price && ` · ${formatRupiah(item.product.price)}`}
                  </p>

                  {/* Default duration setting */}
                  <div className="flex items-center gap-2 mt-2">
                    <Timer size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Durasi spotlight default:</span>
                    <button onClick={() => setShowDur(!showDur)}
                      className="text-xs text-purple-600 hover:underline">
                      {item.spotlight_duration
                        ? item.spotlight_duration >= 3600
                          ? `${item.spotlight_duration/3600}j`
                          : item.spotlight_duration >= 60
                          ? `${item.spotlight_duration/60}m`
                          : `${item.spotlight_duration}d`
                        : 'Set durasi'
                      }
                    </button>
                  </div>

                  {showDur && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {DURATION_PRESETS.map(d => (
                        <button key={d.seconds}
                          onClick={() => { setItemDuration(item.id, d.seconds); setShowDur(false) }}
                          className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                            item.spotlight_duration === d.seconds
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-200 text-gray-600 hover:border-purple-400'
                          }`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tombol spotlight */}
                <div className="flex-shrink-0">
                  {isActive ? (
                    <button onClick={stopSpotlight}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg transition-colors">
                      <StopCircle size={13} /> Stop
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {/* Quick start dengan preset */}
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {[5, 15, 30].map(min => (
                          <button key={min}
                            disabled={!!isLoading}
                            onClick={() => startSpotlight(item, min * 60)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 transition-colors disabled:opacity-50">
                            <Zap size={11} /> {min}m
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={!!isLoading}
                        onClick={() => item.spotlight_duration
                          ? startSpotlight(item, item.spotlight_duration)
                          : startSpotlight(item, 600)
                        }
                        className="flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white text-xs px-3 py-2 rounded-lg transition-colors font-medium">
                        {isLoading
                          ? <><span className="animate-spin">⏳</span> Memulai...</>
                          : <><Play size={12} /> Spotlight</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400 text-sm">
          Belum ada produk di rotator ini.
          <br />
          <Link href={`/rotator/${rotatorId}`} className="text-purple-600 hover:underline mt-2 block">
            ← Tambah produk dulu
          </Link>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">ℹ️ Cara kerja Spotlight:</p>
        <p>• Produk yang di-spotlight akan tampil di OBS dengan efek glow + badge FEATURED + warna berbeda</p>
        <p>• Sound alert akan muncul di OBS saat spotlight dimulai</p>
        <p>• Setelah waktu habis, rotator kembali ke urutan normal otomatis</p>
        <p>• Anda bisa stop spotlight kapan saja lewat tombol Stop</p>
      </div>
    </div>
  )
}
