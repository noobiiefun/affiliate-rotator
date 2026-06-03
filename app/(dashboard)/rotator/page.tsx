'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Tv2, Copy, Check, ToggleLeft, ToggleRight, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Rotator } from '@/types'
import { getBaseUrl } from '@/lib/utils'

export default function RotatorPage() {
  const [rotators, setRotators] = useState<Rotator[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => { fetchRotators() }, [])

  async function fetchRotators() {
    setLoading(true)
    const { data } = await supabase
      .from('rotators')
      .select('*')
      .order('created_at', { ascending: false })
    setRotators(data || [])
    setLoading(false)
  }

  async function toggleActive(r: Rotator) {
    await supabase.from('rotators').update({ is_active: !r.is_active }).eq('id', r.id)
    fetchRotators()
  }

  async function deleteRotator(id: string) {
    if (!confirm('Hapus rotator ini? Semua produk di dalamnya juga akan dihapus.')) return
    await supabase.from('rotators').delete().eq('id', id)
    fetchRotators()
  }

  function copyObsUrl(id: string) {
    const url = `${getBaseUrl()}/obs/${id}`
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rotator</h1>
          <p className="text-gray-500 text-sm mt-1">{rotators.length} rotator terdaftar</p>
        </div>
        <Link
          href="/rotator/new"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Buat Rotator
        </Link>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
          Memuat rotator...
        </div>
      ) : rotators.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Tv2 size={24} className="text-purple-600" />
          </div>
          <p className="text-gray-700 font-medium">Belum ada rotator</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Buat rotator untuk mulai menampilkan produk di OBS</p>
          <Link href="/rotator/new" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> Buat Rotator Pertama
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {rotators.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Tv2 size={18} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900">{r.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    {r.description && <p className="text-sm text-gray-500 mt-0.5">{r.description}</p>}
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                      <Clock size={12} />
                      Interval: {r.interval_sec} detik per produk
                    </div>
                    {/* OBS URL */}
                    <div className="flex items-center gap-2 mt-3">
                      <code className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600 truncate max-w-xs">
                        {getBaseUrl()}/obs/{r.id}
                      </code>
                      <button
                        onClick={() => copyObsUrl(r.id)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors flex-shrink-0"
                      >
                        {copied === r.id ? <><Check size={12} className="text-green-600" /> Disalin</> : <><Copy size={12} /> Copy URL OBS</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(r)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="Toggle aktif">
                    {r.is_active ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} />}
                  </button>
                  <Link href={`/rotator/${r.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors" title="Kelola produk">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => deleteRotator(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors" title="Hapus">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
