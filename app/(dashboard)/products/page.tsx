'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import { listProducts, toggleProductActive, deleteProductById } from '@/lib/data'
import { Product, MARKETPLACE_INFO } from '@/types'
import { formatRupiah } from '@/lib/utils'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    setProducts(await listProducts())
    setLoading(false)
  }

  async function toggleActive(product: Product) {
    await toggleProductActive(product)
    fetchProducts()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Hapus produk ini?')) return
    await deleteProductById(id)
    fetchProducts()
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produk</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} produk terdaftar</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Tambah Produk
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Memuat produk...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm mb-3">Belum ada produk</p>
            <Link href="/products/new" className="text-green-600 text-sm font-medium hover:underline">
              + Tambah produk pertama
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Marketplace</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => {
                const mp = MARKETPLACE_INFO[product.marketplace]
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-none">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-1">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {mp.icon} {mp.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.price ? formatRupiah(product.price) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(product)} className="flex items-center gap-1.5 text-xs">
                        {product.is_active ? (
                          <>
                            <ToggleRight size={18} className="text-green-600" />
                            <span className="text-green-600">Aktif</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={18} className="text-gray-400" />
                            <span className="text-gray-400">Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
