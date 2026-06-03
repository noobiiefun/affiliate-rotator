'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Rotator } from '@/types'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface RotatorFormProps {
  rotator?: Rotator
}

export default function RotatorForm({ rotator }: RotatorFormProps) {
  const router = useRouter()
  const isEdit = !!rotator

  const [form, setForm] = useState({
    name:         rotator?.name         || '',
    description:  rotator?.description  || '',
    interval_sec: rotator?.interval_sec ?? 10,
    is_active:    rotator?.is_active    ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      name:         form.name.trim(),
      description:  form.description.trim() || null,
      interval_sec: form.interval_sec,
      is_active:    form.is_active,
    }

    if (!payload.name) {
      setError('Nama rotator wajib diisi.')
      setSaving(false)
      return
    }

    const { data, error: err } = isEdit
      ? await supabase.from('rotators').update(payload).eq('id', rotator.id).select().single()
      : await supabase.from('rotators').insert(payload).select().single()

    if (err) { setError(err.message); setSaving(false); return }

    // Kalau baru dibuat, langsung ke halaman kelola produknya
    if (!isEdit && data) {
      router.push(`/rotator/${data.id}`)
    } else {
      router.push('/rotator')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/rotator" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? 'Edit Rotator' : 'Buat Rotator'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? 'Perbarui pengaturan rotator' : 'Buat rotator baru untuk OBS overlay'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        {/* Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nama Rotator <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Rotator Utama, Flash Sale, dll"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Opsional — catatan untuk diri sendiri"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Interval Tampil
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5} max={60} step={5}
              value={form.interval_sec}
              onChange={e => setForm(f => ({ ...f, interval_sec: parseInt(e.target.value) }))}
              className="flex-1 accent-purple-600"
            />
            <div className="w-20 text-center bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm font-medium text-purple-700">
              {form.interval_sec}s
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Setiap produk tampil selama {form.interval_sec} detik sebelum berganti ke produk berikutnya
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Status Aktif</p>
            <p className="text-xs text-gray-400">Rotator nonaktif tidak akan tampil di OBS</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-purple-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={15} />
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat & Kelola Produk →'}
        </button>
        <Link href="/rotator" className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
          Batal
        </Link>
      </div>
    </form>
  )
}
