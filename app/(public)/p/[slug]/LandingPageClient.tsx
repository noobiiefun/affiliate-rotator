'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, ShoppingBag, Share2, Check, ChevronLeft, Shield, Truck, Tag } from 'lucide-react'
import { Product, MARKETPLACE_INFO } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Props { product: Product }

const MP_BUTTON_COLOR: Record<string, string> = {
  tokopedia: '#42B549',
  shopee:    '#EE4D2D',
  lazada:    '#0F146D',
  tiktok:    '#010101',
  blibli:    '#0095DA',
  other:     '#2563eb',
}

export default function LandingPageClient({ product }: Props) {
  const [shared,   setShared]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const [clicked,  setClicked]  = useState(false)

  const mp       = MARKETPLACE_INFO[product.marketplace]
  const btnColor = MP_BUTTON_COLOR[product.marketplace] || '#2563eb'

  // Track click + redirect
  async function handleBuy() {
    setClicked(true)
    // Track ke DB
    await supabase.from('click_events').insert({
      product_id: product.id,
      source: 'direct',
    }).then(() => {})

    // Buka affiliate link
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer')

    setTimeout(() => setClicked(false), 2000)
  }

  // Web Share API
  async function handleShare() {
    const shareData = {
      title: product.name,
      text:  `Cek produk ini: ${product.name}`,
      url:   window.location.href,
    }
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => window.history.back()}
          style={{ padding: 6, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', display: 'flex' }}>
          <ChevronLeft size={18} color="#374151" />
        </button>
        <p style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111827',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </p>
        <button onClick={handleShare}
          style={{ padding: 6, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', display: 'flex' }}>
          {shared ? <Check size={18} color="#16a34a" /> : <Share2 size={18} color="#374151" />}
        </button>
      </div>

      {/* Max-width container */}
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Gambar produk */}
        <div style={{ background: '#ffffff', position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
          {product.image_url && !imgError ? (
            <img
              src={product.image_url}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', gap: 8,
            }}>
              <ShoppingBag size={48} strokeWidth={1} />
              <span style={{ fontSize: 13 }}>Tidak ada gambar</span>
            </div>
          )}

          {/* Marketplace badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.6)',
            borderRadius: 20, padding: '4px 10px',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 12 }}>{mp.icon}</span>
            <span style={{ color: '#ffffff', fontSize: 11, fontWeight: 600 }}>{mp.label}</span>
          </div>
        </div>

        {/* Info produk */}
        <div style={{ background: '#ffffff', padding: '16px 16px 0', borderTop: '4px solid #f5f5f5' }}>
          {/* Harga */}
          {product.price && (
            <p style={{ fontSize: 24, fontWeight: 700, color: '#EE4D2D', marginBottom: 8 }}>
              {formatRupiah(product.price)}
            </p>
          )}

          {/* Nama */}
          <h1 style={{ fontSize: 15, fontWeight: 500, color: '#111827', lineHeight: 1.5, marginBottom: 12 }}>
            {product.name}
          </h1>

          {/* Divider */}
          <div style={{ height: 1, background: '#f3f4f6', margin: '0 -16px' }} />
        </div>

        {/* Keunggulan / trust signals */}
        <div style={{ background: '#ffffff', padding: '12px 16px', display: 'flex', gap: 0, borderTop: '4px solid #f5f5f5' }}>
          {[
            { icon: Shield,  text: 'Produk Terverifikasi',  sub: 'Link resmi marketplace' },
            { icon: Truck,   text: 'Pengiriman Terjamin',   sub: 'Via marketplace resmi' },
            { icon: Tag,     text: 'Harga Terbaik',         sub: 'Langsung dari toko' },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px' }}>
              <Icon size={20} color="#2563eb" strokeWidth={1.5} />
              <p style={{ fontSize: 11, fontWeight: 600, color: '#111827', textAlign: 'center' }}>{text}</p>
              <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Deskripsi */}
        {product.description && (
          <div style={{ background: '#ffffff', padding: '16px', marginTop: 8, borderTop: '4px solid #f5f5f5' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Deskripsi Produk</p>
            <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {product.description}
            </p>
          </div>
        )}

        {/* Info marketplace */}
        <div style={{
          background: '#ffffff', padding: '12px 16px',
          marginTop: 8, borderTop: '4px solid #f5f5f5',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `${btnColor}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            {mp.icon}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280' }}>Dijual di</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{mp.label}</p>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>
            Link Affiliate
          </div>
        </div>

        {/* Spacer untuk sticky button */}
        <div style={{ height: 100 }} />
      </div>

      {/* Sticky CTA button */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px',
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <button
            onClick={handleBuy}
            style={{
              width: '100%',
              background: clicked ? '#16a34a' : btnColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 20px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s',
              boxShadow: `0 4px 14px ${btnColor}55`,
            }}
          >
            {clicked
              ? <><Check size={18} /> Membuka {mp.label}...</>
              : <><ShoppingBag size={18} /> Beli di {mp.label}</>
            }
          </button>
          <p style={{ textAlign: 'center', fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
            Anda akan diarahkan ke {mp.label} · Link affiliate
          </p>
        </div>
      </div>
    </div>
  )
}
