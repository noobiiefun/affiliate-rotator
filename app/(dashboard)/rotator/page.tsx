'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Pencil, Trash2, Tv2, Copy, Check,
  ToggleLeft, ToggleRight, Clock, FolderOpen, ChevronDown, ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Rotator, RotatorGroup } from '@/types'
import { getBaseUrl } from '@/lib/utils'

interface RotatorWithGroup extends Rotator { group?: RotatorGroup }

export default function RotatorPage() {
  const [rotators,   setRotators]   = useState<RotatorWithGroup[]>([])
  const [groups,     setGroups]     = useState<RotatorGroup[]>([])
  const [loading,    setLoading]    = useState(true)
  const [copied,     setCopied]     = useState<string | null>(null)
  const [collapsed,  setCollapsed]  = useState<Record<string, boolean>>({})

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: rots }, { data: grps }] = await Promise.all([
      supabase.from('rotators').select('*, group:rotator_groups(*)').order('created_at', { ascending: false }),
      supabase.from('rotator_groups').select('*').order('name'),
    ])
    setRotators((rots as any) || [])
    setGroups(grps || [])
    setLoading(false)
  }

  async function toggleActive(r: RotatorWithGroup) {
    await supabase.from('rotators').update({ is_active: !r.is_active }).eq('id', r.id)
    fetchAll()
  }

  async function deleteRotator(id: string) {
    if (!confirm('Hapus rotator ini? Semua produk di dalamnya juga akan dihapus.')) return
    await supabase.from('rotators').delete().eq('id', id)
    fetchAll()
  }

  async function deleteGroup(id: string) {
    if (!confirm('Hapus grup ini? Rotator di dalamnya tidak akan dihapus, hanya grupnya.')) return
    await supabase.from('rotator_groups').delete().eq('id', id)
    fetchAll()
  }

  function copyObsUrl(slug: string) {
    const url = `${getBaseUrl()}/obs/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  function toggleCollapse(key: string) {
    setCollapsed(c => ({ ...c, [key]: !c[key] }))
  }

  // Kelompokkan rotator berdasarkan grup
  const grouped: Record<string, RotatorWithGroup[]> = { ungrouped: [] }
  groups.forEach(g => { grouped[g.id] = [] })
  rotators.forEach(r => {
    if (r.group_id && grouped[r.group_id]) grouped[r.group_id].push(r)
    else grouped['ungrouped'].push(r)
  })

  const RotatorCard = ({ r }: { r: RotatorWithGroup }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${r.theme_config?.accent_color || '#8b5cf6'}22` }}>
            <Tv2 size={16} style={{ color: r.theme_config?.accent_color || '#8b5cf6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-gray-900 text-sm">{r.name}</h3>
              <code className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">/obs/{r.slug}</code>
              <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {r.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            {r.description && <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={11} /> {r.interval_sec}s / produk
              </span>
              {/* Color preview */}
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ background: r.theme_config?.bg_color || '#0f0f23' }} />
                <div className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ background: r.theme_config?.accent_color || '#8b5cf6' }} />
                <span className="text-xs text-gray-400">tema</span>
              </div>
            </div>
            {/* OBS URL */}
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-500 truncate max-w-xs">
                {getBaseUrl()}/obs/{r.slug}
              </code>
              <button onClick={() => copyObsUrl(r.slug)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors flex-shrink-0">
                {copied === r.slug
                  ? <><Check size={11} className="text-green-600" /> Disalin</>
                  : <><Copy size={11} /> Copy</>}
              </button>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => toggleActive(r)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            {r.is_active
              ? <ToggleRight size={17} className="text-green-600" />
              : <ToggleLeft size={17} />}
          </button>
          <Link href={`/rotator/${r.id}`}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Kelola produk">
            <Pencil size={14} />
          </Link>
          <button onClick={() => deleteRotator(r.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rotator</h1>
          <p className="text-gray-500 text-sm mt-1">{rotators.length} rotator • {groups.length} grup</p>
        </div>
        <div className="flex gap-2">
          <Link href="/rotator/groups/new"
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <FolderOpen size={15} /> Buat Grup
          </Link>
          <Link href="/rotator/new"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> Buat Rotator
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">Memuat...</div>
      ) : rotators.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
          <Tv2 size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Belum ada rotator</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Buat rotator pertama untuk mulai live streaming</p>
          <Link href="/rotator/new"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> Buat Rotator Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Grup-grup */}
          {groups.map(group => {
            const groupRotators = grouped[group.id] || []
            if (groupRotators.length === 0) return (
              <div key={group.id} className="border border-dashed border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: group.color }} />
                    <span className="font-medium text-sm text-gray-500">{group.name}</span>
                    <span className="text-xs text-gray-300">— kosong</span>
                  </div>
                  <button onClick={() => deleteGroup(group.id)}
                    className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
            const isCollapsed = collapsed[group.id]
            return (
              <div key={group.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCollapse(group.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    {isCollapsed ? <ChevronRight size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: group.color }} />
                    <span className="font-medium text-sm text-gray-700">{group.name}</span>
                    {group.description && <span className="text-xs text-gray-400">— {group.description}</span>}
                    <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                      {groupRotators.length} rotator
                    </span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteGroup(group.id) }}
                    className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </button>
                {!isCollapsed && (
                  <div className="p-3 space-y-2">
                    {groupRotators.map(r => <RotatorCard key={r.id} r={r} />)}
                  </div>
                )}
              </div>
            )
          })}

          {/* Rotator tanpa grup */}
          {grouped['ungrouped'].length > 0 && (
            <div>
              {groups.length > 0 && (
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-1">Tanpa Grup</p>
              )}
              <div className="space-y-2">
                {grouped['ungrouped'].map(r => <RotatorCard key={r.id} r={r} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
