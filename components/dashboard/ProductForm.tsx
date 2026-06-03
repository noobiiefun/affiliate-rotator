'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, Marketplace, MARKETPLACE_INFO } from '@/types'
import { generateSlug } from '@/lib/utils'
import { Save, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ProductFormProps {
  product?: Product
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  affiliate_url: '',
  marketplace: 'shopee' as Marketplace,
  slug: '',
  is_active: true,
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name:          product?.name          || '',
    description:   product?.description   || '',
    price:         product?.price?.toString() || '',
    image_url:     product?.image_url     || '',
    affiliate_url: product?.affiliate_url || '',
    marketplace:   (product?.marketplace  || 'shopee') as Marketplace,
    slug:          product?.slug          || '',
    is_active:     product?.is_active     ?? true,
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(name: string) {
    setForm(f => ({
      ...f,
      name,
      slug: isEdit ? f.slug : generateSlug(name),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      name:          form.name.trim(),
      description:   form.description.trim() || null,
      price:         form.price ? parseInt(form.price.replace(/\D/g, '')) : null,
      image_url:     form.image_url.trim() || null,
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

    const { error: err } = isEdit
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)

    if (err) {
      setError(err.message.includes('slug') ? 'Slug sudah digunakan, coba yang lain.' : err.message)
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
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        {/* Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Contoh: Sepatu Nike Air Max 270"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug URL <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
            <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/p/</span>
            <input
              type="text"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="nama-produk-anda"
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">URL: /p/{form.slug || 'nama-produk'}</p>
        </div>

        {/* Marketplace */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Marketplace</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(MARKETPLACE_INFO).map(mp => (
              <button
                key={mp.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, marketplace: mp.id }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  form.marketplace === mp.id
                    ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{mp.icon}</span>
                {mp.label}
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
            <input
              type="url"
              value={form.affiliate_url}
              onChange={e => setForm(f => ({ ...f, affiliate_url: e.target.value }))}
              placeholder="https://shopee.co.id/..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            {form.affiliate_url && (
              <a
                href={form.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
              >
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
            <input
              type="text"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value.replace(/\D/g, '') }))}
              placeholder="150000"
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Gambar URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Gambar Produk</label>
          <input
            type="url"
            value={form.image_url}
            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            placeholder="https://..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {form.image_url && (
            <img
              src={form.image_url}
              alt="Preview"
              className="mt-2 w-20 h-20 object-cover rounded-lg border border-gray-200"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Deskripsi singkat produk..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Status Aktif</p>
            <p className="text-xs text-gray-400">Produk nonaktif tidak tampil di rotator</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.is_active ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              form.is_active ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 mt-5">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={15} />
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
        <Link
          href="/products"
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          Batal
        </Link>
      </div>
    </form>
  )
}
