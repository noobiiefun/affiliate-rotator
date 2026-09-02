'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { listGroups, uploadLogo, saveRotator } from '@/lib/data'
import {
  Rotator, RotatorGroup, ThemeConfig, DEFAULT_THEME,
  OVERLAY_SIZE_LABELS, OVERLAY_POSITION_LABELS, OverlaySize, OverlayPosition
} from '@/types'
import { Save, ArrowLeft, Upload, X, Eye } from 'lucide-react'
import Link from 'next/link'
import { generateRotatorSlug, getBaseUrl } from '@/lib/utils'

interface Props { rotator?: Rotator }

const ACCENT_PRESETS = ['#8b5cf6','#6366f1','#3b82f6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899']
const BG_PRESETS     = ['#0f0f23','#1a1a2e','#0d1117','#1e1e1e','#0a0a0a','#1a0533','#002147','#003322']

export default function RotatorForm({ rotator }: Props) {
  const router  = useRouter()
  const isEdit  = !!rotator

  const [groups,   setGroups]   = useState<RotatorGroup[]>([])
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState<'basic'|'theme'>('basic')
  const [uploading,setUploading]= useState(false)

  const [form, setForm] = useState({
    name:         rotator?.name         || '',
    slug:         rotator?.slug         || '',
    description:  rotator?.description  || '',
    group_id:     rotator?.group_id     || '',
    interval_sec: rotator?.interval_sec ?? 10,
    is_active:    rotator?.is_active    ?? true,
  })

  const [theme, setTheme] = useState<ThemeConfig>(
    rotator?.theme_config
      ? { ...DEFAULT_THEME, ...rotator.theme_config }
      : { ...DEFAULT_THEME }
  )

  useEffect(() => {
    listGroups().then(setGroups)
  }, [])

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: isEdit ? f.slug : generateRotatorSlug(name) }))
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    // Upload ke Supabase Storage (online) atau folder lokal (offline) — lihat lib/data.ts
    const url = await uploadLogo(file)
    if (url) setTheme(t => ({ ...t, logo_url: url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.slug.trim()) { setError('Nama dan slug wajib diisi'); return }
    setSaving(true)

    const payload = {
      name:         form.name.trim(),
      slug:         form.slug.trim(),
      description:  form.description.trim() || null,
      group_id:     form.group_id || null,
      interval_sec: form.interval_sec,
      is_active:    form.is_active,
      theme_config: theme,
    }

    const { data, error: err } = await saveRotator(payload, isEdit ? rotator.id : undefined)

    if (err) {
      setError(err.includes('slug') || err.includes('Slug') ? 'Slug sudah dipakai, coba yang lain.' : err)
      setSaving(false)
      return
    }

    if (!isEdit && data) router.push(`/rotator/${data.id}`)
    else router.push('/rotator')
    router.refresh()
  }

  const obsUrl = form.slug ? `${getBaseUrl()}/obs/${form.slug}` : ''

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/rotator" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Rotator' : 'Buat Rotator'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? 'Perbarui pengaturan dan tema rotator' : 'Buat rotator baru dengan URL dan tema custom'}</p>
        </div>
      </div>

      {error && <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['basic','theme'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'basic' ? '⚙️ Pengaturan Dasar' : '🎨 Tema & Tampilan'}
          </button>
        ))}
      </div>

      {/* ── TAB: BASIC ── */}
      {tab === 'basic' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Rotator <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)}
              placeholder="Contoh: Flash Sale, Elektronik Murah..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug URL (OBS) <span className="text-red-500">*</span></label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
              <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/obs/</span>
              <input type="text" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'') }))}
                placeholder="nama-rotator-anda"
                className="flex-1 px-3 py-2 text-sm focus:outline-none" required />
            </div>
            {obsUrl && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                🎬 URL OBS:
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-purple-600">{obsUrl}</code>
              </p>
            )}
          </div>

          {/* Grup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Grup</label>
            <select value={form.group_id} onChange={e => setForm(f => ({ ...f, group_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="">— Tanpa Grup —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <Link href="/rotator/groups/new" className="text-xs text-purple-600 hover:underline mt-1 block">
              + Buat grup baru
            </Link>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Catatan opsional"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Interval Tampil</label>
            <div className="flex items-center gap-3">
              <input type="range" min={5} max={60} step={5} value={form.interval_sec}
                onChange={e => setForm(f => ({ ...f, interval_sec: parseInt(e.target.value) }))}
                className="flex-1 accent-purple-600" />
              <div className="w-16 text-center bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 text-sm font-medium text-purple-700">
                {form.interval_sec}s
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Status Aktif</p>
              <p className="text-xs text-gray-400">Rotator nonaktif tidak tampil di OBS</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-purple-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: THEME ── */}
      {tab === 'theme' && (
        <div className="space-y-4">

          {/* Preview mini */}
          <div className="rounded-xl overflow-hidden border border-gray-200 h-32 flex items-center justify-center"
            style={{ background: '#2d2d2d' }}>
            <div style={{
              background: theme.bg_color,
              borderRadius: theme.border_radius,
              padding: '10px 14px',
              opacity: theme.opacity,
              width: theme.size === 'small' ? 180 : theme.size === 'large' ? 280 : 230,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background: theme.accent_color }} />
                <span style={{ color: theme.accent_color, fontSize:9, fontWeight:700 }}>PROMO SEKARANG</span>
                {theme.logo_url && <img src={theme.logo_url} alt="logo" style={{ height:14, marginLeft:'auto', objectFit:'contain' }} />}
              </div>
              <div style={{ color: theme.text_color, fontSize:11, fontWeight:600 }}>Nama Produk Contoh</div>
              {theme.show_price && <div style={{ color:'#4ade80', fontSize:11, fontWeight:700, marginTop:3 }}>Rp 150.000</div>}
              {theme.show_marketplace && <div style={{ color:'rgba(255,255,255,0.4)', fontSize:9, marginTop:2 }}>🟠 Shopee</div>}
              <div style={{ height:2, background:'rgba(255,255,255,0.1)', borderRadius:2, marginTop:6, overflow:'hidden' }}>
                <div style={{ width:'60%', height:'100%', background: theme.accent_color, borderRadius:2 }} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

            {/* Warna Background */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna Background</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {BG_PRESETS.map(c => (
                  <button key={c} type="button" onClick={() => setTheme(t => ({ ...t, bg_color: c }))}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${theme.bg_color===c?'border-purple-500 scale-110':'border-gray-300'}`}
                    style={{ background:c }} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={theme.bg_color} onChange={e => setTheme(t => ({ ...t, bg_color: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <code className="text-xs text-gray-500">{theme.bg_color}</code>
              </div>
            </div>

            {/* Warna Aksen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna Aksen</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {ACCENT_PRESETS.map(c => (
                  <button key={c} type="button" onClick={() => setTheme(t => ({ ...t, accent_color: c }))}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${theme.accent_color===c?'border-gray-800 scale-110':'border-transparent'}`}
                    style={{ background:c }} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={theme.accent_color} onChange={e => setTheme(t => ({ ...t, accent_color: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <code className="text-xs text-gray-500">{theme.accent_color}</code>
              </div>
            </div>

            {/* Warna Teks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna Teks</label>
              <div className="flex items-center gap-2">
                <input type="color" value={theme.text_color} onChange={e => setTheme(t => ({ ...t, text_color: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <code className="text-xs text-gray-500">{theme.text_color}</code>
              </div>
            </div>

            {/* Ukuran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran Kartu</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(OVERLAY_SIZE_LABELS) as [OverlaySize, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setTheme(t => ({ ...t, size: key }))}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      theme.size === key ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posisi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Posisi di OBS</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(OVERLAY_POSITION_LABELS) as [OverlayPosition, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setTheme(t => ({ ...t, position: key }))}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                      theme.position === key ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sudut Kartu: <span className="text-purple-600">{theme.border_radius}px</span>
              </label>
              <input type="range" min={0} max={32} step={2} value={theme.border_radius}
                onChange={e => setTheme(t => ({ ...t, border_radius: parseInt(e.target.value) }))}
                className="w-full accent-purple-600" />
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Transparansi: <span className="text-purple-600">{Math.round(theme.opacity * 100)}%</span>
              </label>
              <input type="range" min={0.3} max={1} step={0.05} value={theme.opacity}
                onChange={e => setTheme(t => ({ ...t, opacity: parseFloat(e.target.value) }))}
                className="w-full accent-purple-600" />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo / Watermark</label>
              {theme.logo_url ? (
                <div className="flex items-center gap-3">
                  <img src={theme.logo_url} alt="logo" className="h-10 object-contain border border-gray-200 rounded-lg p-1 bg-gray-50" />
                  <button type="button" onClick={() => setTheme(t => ({ ...t, logo_url: null }))}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
                    <X size={14} /> Hapus Logo
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{uploading ? 'Mengupload...' : 'Upload logo (PNG/SVG, max 1MB)'}</span>
                  <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                </label>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Logo tampil di pojok kanan atas kartu overlay.
              </p>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              {[
                { key: 'show_price',       label: 'Tampilkan Harga' },
                { key: 'show_marketplace', label: 'Tampilkan Marketplace' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{label}</span>
                  <button type="button"
                    onClick={() => setTheme(t => ({ ...t, [key]: !t[key as keyof ThemeConfig] }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${(theme as any)[key] ? 'bg-purple-500' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${(theme as any)[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Save size={15} /> {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Rotator →'}
        </button>
        <Link href="/rotator" className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
          Batal
        </Link>
      </div>
    </form>
  )
}
