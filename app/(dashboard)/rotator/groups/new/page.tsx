'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createGroup } from '@/lib/data'

const PRESET_COLORS = [
  '#8b5cf6','#6366f1','#3b82f6','#06b6d4',
  '#10b981','#f59e0b','#ef4444','#ec4899',
  '#f97316','#84cc16','#14b8a6','#64748b',
]

export default function NewGroupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '', color: '#8b5cf6' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nama grup wajib diisi'); return }
    setSaving(true)
    const { error: err } = await createGroup({
      name: form.name.trim(),
      description: form.description.trim() || null,
      color: form.color,
    })
    if (err) { setError(err); setSaving(false); return }
    router.push('/rotator')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-md">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/rotator" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Buat Grup</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelompokkan rotator berdasarkan acara atau kategori</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Grup <span className="text-red-500">*</span></label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Flash Sale, Event Lebaran, Elektronik..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Opsional"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Warna Label</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
            <span className="text-xs text-gray-400">Atau pilih warna custom</span>
            <div className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200"
              style={{ borderColor: form.color }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: form.color }} />
              <span className="text-xs font-medium" style={{ color: form.color }}>{form.name || 'Preview Grup'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Save size={15} /> {saving ? 'Menyimpan...' : 'Buat Grup'}
        </button>
        <Link href="/rotator" className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
          Batal
        </Link>
      </div>
    </form>
  )
}
