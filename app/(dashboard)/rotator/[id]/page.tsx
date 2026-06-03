'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Trash2, GripVertical, Copy, Check,
  Tv2, Settings, Clock, Package, ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product, Rotator, RotatorItem, MARKETPLACE_INFO } from '@/types'
import { getBaseUrl, formatRupiah } from '@/lib/utils'

interface RotatorItemWithProduct extends RotatorItem {
  product: Product
}

export default function RotatorDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = params.id as string

  const [rotator,       setRotator]       = useState<Rotator | null>(null)
  const [items,         setItems]         = useState<RotatorItemWithProduct[]>([])
  const [allProducts,   setAllProducts]   = useState<Product[]>([])
  const [showAddPanel,  setShowAddPanel]  = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [copied,        setCopied]        = useState(false)
  const [dragIdx,       setDragIdx]       = useState<number | null>(null)
  const [dragOverIdx,   setDragOverIdx]   = useState<number | null>(null)

  const obsUrl = `${getBaseUrl()}/obs/${id}`

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    setLoading(true)
    const [{ data: rot }, { data: its }, { data: prods }] = await Promise.all([
      supabase.from('rotators').select('*').eq('id', id).single(),
      supabase.from('rotator_items').select('*, product:products(*)').eq('rotator_id', id).order('position'),
      supabase.from('products').select('*').eq('is_active', true).order('name'),
    ])
    setRotator(rot)
    setItems((its as any) || [])
    setAllProducts(prods || [])
    setLoading(false)
  }

  // Produk yang belum ada di rotator
  const availableProducts = allProducts.filter(
    p => !items.find(i => i.product_id === p.id)
  )

  async function addProduct(product: Product) {
    const position = items.length
    await supabase.from('rotator_items').insert({
      rotator_id: id,
      product_id: product.id,
      position,
      is_active: true,
    })
    fetchAll()
  }

  async function removeItem(itemId: string) {
    await supabase.from('rotator_items').delete().eq('id', itemId)
    fetchAll()
  }

  // Drag & drop reorder
  function handleDragStart(idx: number) { setDragIdx(idx) }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIdx(idx)
  }
  async function handleDrop(e: React.DragEvent, dropIdx: number) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setDragOverIdx(null); return }

    const reordered = [...items]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    setItems(reordered)
    setDragIdx(null)
    setDragOverIdx(null)

    // Update positions in DB
    await Promise.all(
      reordered.map((item, pos) =>
        supabase.from('rotator_items').update({ position: pos }).eq('id', item.id)
      )
    )
  }

  function copyObsUrl() {
    navigator.clipboard.writeText(obsUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Memuat...</div>
  if (!rotator) return <div className="p-8 text-gray-400 text-sm">Rotator tidak ditemukan.</div>

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Link href="/rotator" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors mt-0.5">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{rotator.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${rotator.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {rotator.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            {rotator.description && <p className="text-gray-500 text-sm mt-0.5">{rotator.description}</p>}
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Clock size={12} /> Interval: {rotator.interval_sec} detik • {items.length} produk
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/rotator/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings size={14} /> Pengaturan
          </Link>
        </div>
      </div>

      {/* OBS URL box */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-medium text-purple-700 mb-1">🎬 URL OBS Overlay</p>
            <p className="text-xs text-purple-500 mb-2">Paste URL ini di OBS → Add Source → Browser</p>
            <code className="text-xs bg-white border border-purple-200 rounded px-2 py-1 text-purple-800 break-all">
              {obsUrl}
            </code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyObsUrl}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
            >
              {copied ? <><Check size={13} /> Disalin!</> : <><Copy size={13} /> Copy URL</>}
            </button>
            <a
              href={obsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-purple-300 text-purple-700 hover:bg-purple-100 text-xs px-3 py-2 rounded-lg transition-colors"
            >
              <ExternalLink size={13} /> Preview
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Produk dalam rotator */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-900 text-sm">Produk dalam Rotator</h2>
            <button
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={13} /> Tambah
            </button>
          </div>

          {items.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <Package size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Belum ada produk</p>
              <p className="text-gray-300 text-xs mt-1">Klik "+ Tambah" untuk memilih produk</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => {
                const mp = MARKETPLACE_INFO[item.product.marketplace]
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    className={`bg-white border rounded-xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all ${
                      dragOverIdx === idx ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                    <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.product.image_url
                        ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{mp.icon} {mp.label}</span>
                        {item.product.price && (
                          <span className="text-xs text-gray-400">{formatRupiah(item.product.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-300 w-5 text-center">{idx + 1}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-gray-400 text-center pt-1">
                Drag ↕ untuk mengubah urutan
              </p>
            </div>
          )}
        </div>

        {/* Panel tambah produk */}
        {showAddPanel && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-gray-900 text-sm">Pilih Produk</h2>
              <button onClick={() => setShowAddPanel(false)} className="text-xs text-gray-400 hover:text-gray-600">Tutup</button>
            </div>

            {availableProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <p className="text-gray-400 text-sm">Semua produk aktif sudah masuk rotator</p>
                <Link href="/products/new" className="text-purple-600 text-xs hover:underline mt-1 block">
                  + Tambah produk baru
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {availableProducts.map(product => {
                  const mp = MARKETPLACE_INFO[product.marketplace]
                  return (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="w-full bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl p-3 flex items-center gap-3 text-left transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image_url
                          ? <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{mp.icon} {mp.label}</span>
                          {product.price && <span className="text-xs text-gray-400">{formatRupiah(product.price)}</span>}
                        </div>
                      </div>
                      <Plus size={15} className="text-gray-300 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
