'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProduct } from '@/lib/data'
import { Product, Marketplace, MARKETPLACE_INFO, getProductImages } from '@/types'
import { generateSlug } from '@/lib/utils'
import { Save, ArrowLeft, ExternalLink, Plus, Trash2, GripVertical, Youtube } from 'lucide-react'
import Link from 'next/link'

interface ProductFormProps { product?: Product }

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name:          product?.name          || '',
    description:   product?.description   || '',
    price:         product?.price?.toString() || '',
    affiliate_url: product?.affiliate_url || '',
    marketplace:   (product?.marketplace  || 'shopee') as Marketplace,
    slug:          product?.slug          || '',
    video_url:     product?.video_url     || '',
    coupon_code:   product?.coupon_code   || '',
    coupon_label:  product?.coupon_label  || '',
    sale_ends_at:  product?.sale_ends_at ? new Date(product.sale_ends_at).toISOString().slice(0,16) : '',
    sale_label:    product?.sale_label    || '',
    is_active:     product?.is_active     ?? true,
  })

  // Gambar: gabungkan image_url lama + images array
  const initImages = product ? getProductImages(product) : ['']
  const [images, setImages] = useState<string[]>(initImages.length > 0 ? initImages : [''])

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: isEdit ? f.slug : generateSlug(name) }))
  }

  // ── Gambar helpers ──
  function addImage()  { setImages(imgs => [...imgs, '']) }
  function removeImage(idx: number) { setImages(imgs => imgs.filter((_, i) => i !== idx)) }
  function updateImage(idx: number, val: string) {
    setImages(imgs => imgs.map((img, i) => i === idx ? val : img))
  }
  function moveImage(from: number, to: number) {
    setImages(imgs => {
      const next = [...imgs]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const cleanImages = images.filter(img => img.trim() !== '')

    const payload = {
      name:          form.name.trim(),
      description:   form.description.trim() || null,
      price:         form.price ? parseInt(form.price.replace(/\D/g, '')) : null,
      image_url:     cleanImages[0] || null,   // gambar pertama tetap di image_url untuk OBS
      images:        cleanImages,
      video_url:     form.video_url.trim() || null,
      coupon_code:   form.coupon_code.trim()  || null,
      coupon_label:  form.coupon_label.trim() || null,
      sale_ends_at:  form.sale_ends_at ? new Date(form.sale_ends_at).toISOString() : null,
      sale_label:    form.sale_label.trim()   || null,
      affiliate_url: form.affiliate_url.trim(),
      marketplace:   form.marketplace,
      slug:          form.slug.trim(),
      is_active:     form.is_active,
    }

    if (!payload.name || !payload.affiliate_url || !payload.slug) {
      setError('Nama, URL affiliate, dan slug wajib diisi.')
      setSaving(false)
      return
    }

    const { error: err } = await saveProduct(payload, isEdit ? product.id : undefined)

    if (err) {
      setError(err.includes('slug') || err.includes('Slug') ? 'Slug sudah digunakan, coba yang lain.' : err)
      setSaving(false)
      return
    }

    router.push('/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/products" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? 'Edit Produk' : 'Tambah Produk'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? 'Perbarui informasi produk affiliate' : 'Tambahkan produk affiliate baru'}
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
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)}
            placeholder="Contoh: Sepatu Nike Air Max 270"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug URL <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
            <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/p/</span>
            <input type="text" value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="nama-produk-anda"
              className="flex-1 px-3 py-2 text-sm focus:outline-none" required />
          </div>
          <p className="text-xs text-gray-400 mt-1">URL: /p/{form.slug || 'nama-produk'}</p>
        </div>

        {/* Marketplace */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Marketplace</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(MARKETPLACE_INFO).map(mp => (
              <button key={mp.id} type="button" onClick={() => setForm(f => ({ ...f, marketplace: mp.id }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  form.marketplace === mp.id
                    ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                <span>{mp.icon}</span>{mp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Affiliate URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            URL Affiliate <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input type="url" value={form.affiliate_url}
              onChange={e => setForm(f => ({ ...f, affiliate_url: e.target.value }))}
              placeholder="https://shopee.co.id/..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
            {form.affiliate_url && (
              <a href={form.affiliate_url} target="_blank" rel="noopener noreferrer"
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Harga */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp)</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
            <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">Rp</span>
            <input type="text" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value.replace(/\D/g, '') }))}
              placeholder="150000"
              className="flex-1 px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>

        {/* ── GAMBAR PRODUK (multiple) ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Gambar Produk
              <span className="text-gray-400 font-normal ml-1">(gambar pertama = utama di OBS)</span>
            </label>
            <button type="button" onClick={addImage}
              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
              <Plus size={13} /> Tambah Gambar
            </button>
          </div>

          <div className="space-y-2">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="flex flex-col gap-1 mt-2">
                  {idx > 0 && (
                    <button type="button" onClick={() => moveImage(idx, idx - 1)}
                      className="text-gray-300 hover:text-gray-500 text-xs leading-none">▲</button>
                  )}
                  {idx < images.length - 1 && (
                    <button type="button" onClick={() => moveImage(idx, idx + 1)}
                      className="text-gray-300 hover:text-gray-500 text-xs leading-none">▼</button>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">
                      {idx === 0 ? '🌟' : `${idx + 1}`}
                    </span>
                    <input type="url" value={img}
                      onChange={e => updateImage(idx, e.target.value)}
                      placeholder={idx === 0 ? 'URL gambar utama (wajib ada)' : `URL gambar ${idx + 1}`}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    {images.length > 1 && (
                      <button type="button" onClick={() => removeImage(idx)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {/* Preview gambar */}
                  {img && (
                    <img src={img} alt={`preview ${idx}`}
                      className="mt-1.5 ml-7 w-16 h-16 object-cover rounded-lg border border-gray-200"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Tip: Copy URL gambar dari Shopee/Tokopedia dengan klik kanan → "Salin alamat gambar"
          </p>
        </div>

        {/* ── VIDEO ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Youtube size={15} className="text-red-500" />
              URL Video (Opsional)
            </span>
          </label>
          <input type="url" value={form.video_url}
            onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
            placeholder="https://youtube.com/watch?v=... atau https://youtu.be/..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <p className="text-xs text-gray-400 mt-1">Support: YouTube, YouTube Shorts</p>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <textarea value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Deskripsi singkat produk..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
        </div>

        {/* ── KUPON & FLASH SALE ── */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">🎫 Kupon & Flash Sale (Opsional)</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kode Kupon</label>
              <input type="text" value={form.coupon_code}
                onChange={e => setForm(f => ({ ...f, coupon_code: e.target.value.toUpperCase() }))}
                placeholder="Contoh: DISKON20"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono tracking-wider" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label Kupon</label>
              <input type="text" value={form.coupon_label}
                onChange={e => setForm(f => ({ ...f, coupon_label: e.target.value }))}
                placeholder="Contoh: Gratis Ongkir"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">🔥 Flash Sale Berakhir</label>
              <input type="datetime-local" value={form.sale_ends_at}
                onChange={e => setForm(f => ({ ...f, sale_ends_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label Flash Sale</label>
              <input type="text" value={form.sale_label}
                onChange={e => setForm(f => ({ ...f, sale_label: e.target.value }))}
                placeholder="Contoh: Flash Sale!"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          {form.sale_ends_at && (
            <button type="button" onClick={() => setForm(f => ({ ...f, sale_ends_at: '', sale_label: '' }))}
              className="mt-2 text-xs text-red-500 hover:underline">
              ✕ Hapus flash sale
            </button>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Status Aktif</p>
            <p className="text-xs text-gray-400">Produk nonaktif tidak tampil di rotator</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Save size={15} />
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
        <Link href="/products"
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
          Batal
        </Link>
      </div>
    </form>
  )
}
