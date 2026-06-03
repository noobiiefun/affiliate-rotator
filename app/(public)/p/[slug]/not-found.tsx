import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#f5f5f5',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'system-ui, sans-serif',
    }}>
      <ShoppingBag size={48} color="#d1d5db" strokeWidth={1} />
      <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginTop: 16 }}>
        Produk Tidak Ditemukan
      </h1>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
        Produk ini sudah tidak tersedia atau link sudah kadaluarsa.
      </p>
    </div>
  )
}
