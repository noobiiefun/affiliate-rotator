'use client'

import { useState } from 'react'
import { ShoppingBag, Share2, Check, ChevronLeft, Shield, Truck, Tag, ChevronRight, Play } from 'lucide-react'
import { Product, MARKETPLACE_INFO, getProductImages, getVideoEmbedUrl } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Props { product: Product }

const MP_BUTTON_COLOR: Record<string, string> = {
  tokopedia: '#42B549', shopee: '#EE4D2D', lazada: '#0F146D',
  tiktok: '#010101',   blibli: '#0095DA', other:  '#2563eb',
}

export default function LandingPageClient({ product }: Props) {
  const allImages  = getProductImages(product)
  const embedUrl   = getVideoEmbedUrl(product.video_url || null)
  const mp         = MARKETPLACE_INFO[product.marketplace]
  const btnColor   = MP_BUTTON_COLOR[product.marketplace] || '#2563eb'

  const [imgIdx,   setImgIdx]   = useState(0)
  const [shared,   setShared]   = useState(false)
  const [clicked,  setClicked]  = useState(false)
  const [showVideo,setShowVideo]= useState(false)

  async function handleBuy() {
    setClicked(true)
    await supabase.from('click_events').insert({ product_id: product.id, source: 'direct' })
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer')
    setTimeout(() => setClicked(false), 2000)
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: product.name, text: `Cek produk ini: ${product.name}`, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  const S: Record<string, React.CSSProperties> = {
    root:    { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui,-apple-system,sans-serif', paddingBottom: 100 },
    topbar:  { position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 },
    btn:     { padding: 6, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', display: 'flex' },
    wrap:    { maxWidth: 600, margin: '0 auto' },
  }

  return (
    <div style={S.root}>
      {/* Top bar */}
      <div style={S.topbar}>
        <button onClick={() => window.history.back()} style={S.btn}>
          <ChevronLeft size={18} color="#374151" />
        </button>
        <p style={{ flex:1, fontSize:14, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {product.name}
        </p>
        <button onClick={handleShare} style={S.btn}>
          {shared ? <Check size={18} color="#16a34a" /> : <Share2 size={18} color="#374151" />}
        </button>
      </div>

      <div style={S.wrap}>

        {/* ── GALERI GAMBAR ── */}
        {allImages.length > 0 && (
          <div style={{ background: '#fff', position: 'relative' }}>
            {/* Gambar utama */}
            <div style={{ aspectRatio: '1/1', overflow: 'hidden', position: 'relative', background: '#f9fafb' }}>
              <img
                src={allImages[imgIdx]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }}
                onError={e => { (e.target as HTMLImageElement).src = '' }}
              />

              {/* Tombol prev/next jika ada lebih dari 1 gambar */}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + allImages.length) % allImages.length)}
                    style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.4)', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ChevronLeft size={18} color="#fff" />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % allImages.length)}
                    style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.4)', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ChevronRight size={18} color="#fff" />
                  </button>
                  {/* Counter */}
                  <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(0,0,0,0.5)', borderRadius:20, padding:'2px 10px', color:'#fff', fontSize:12 }}>
                    {imgIdx + 1}/{allImages.length}
                  </div>
                </>
              )}

              {/* Marketplace badge */}
              <div style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.55)', borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:12 }}>{mp.icon}</span>
                <span style={{ color:'#fff', fontSize:11, fontWeight:600 }}>{mp.label}</span>
              </div>
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div style={{ display:'flex', gap:6, padding:'10px 12px', overflowX:'auto' }}>
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    style={{ width:56, height:56, flexShrink:0, borderRadius:8, overflow:'hidden', border: i===imgIdx ? `2px solid ${btnColor}` : '2px solid #e5e7eb', cursor:'pointer', background:'#f9fafb', padding:0 }}>
                    <img src={img} alt={`foto ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                  </button>
                ))}
                {/* Thumbnail video jika ada */}
                {embedUrl && (
                  <button onClick={() => setShowVideo(true)}
                    style={{ width:56, height:56, flexShrink:0, borderRadius:8, border:'2px solid #e5e7eb', cursor:'pointer', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Play size={20} color="#ef4444" fill="#ef4444" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── VIDEO EMBED ── */}
        {embedUrl && (showVideo || allImages.length === 0) && (
          <div style={{ background:'#000', marginTop: allImages.length > 0 ? 4 : 0 }}>
            <div style={{ position:'relative', paddingTop:'56.25%' }}>
              <iframe
                src={embedUrl}
                title="Video produk"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
              />
            </div>
          </div>
        )}

        {/* Tombol tampilkan video (jika ada gambar & video, tapi video disembunyikan) */}
        {embedUrl && allImages.length > 0 && !showVideo && (
          <button onClick={() => setShowVideo(true)}
            style={{ width:'100%', background:'#fff', border:'none', borderTop:'4px solid #f5f5f5', padding:'12px 16px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#ef4444', fontSize:13, fontWeight:600 }}>
            <Play size={16} fill="#ef4444" /> Tonton Video Produk
          </button>
        )}

        {/* ── INFO PRODUK ── */}
        <div style={{ background:'#fff', padding:'16px 16px 0', borderTop:'4px solid #f5f5f5', marginTop: (embedUrl && !showVideo && allImages.length > 0) ? 0 : 4 }}>
          {product.price && (
            <p style={{ fontSize:24, fontWeight:700, color:'#EE4D2D', marginBottom:8 }}>
              {formatRupiah(product.price)}
            </p>
          )}
          <h1 style={{ fontSize:15, fontWeight:500, color:'#111827', lineHeight:1.5, marginBottom:12 }}>
            {product.name}
          </h1>
          <div style={{ height:1, background:'#f3f4f6', margin:'0 -16px' }} />
        </div>

        {/* Trust signals */}
        <div style={{ background:'#fff', padding:'12px 16px', display:'flex', borderTop:'4px solid #f5f5f5' }}>
          {[
            { icon: Shield, text:'Terverifikasi',    sub:'Link resmi' },
            { icon: Truck,  text:'Pengiriman Aman',  sub:'Via marketplace' },
            { icon: Tag,    text:'Harga Terbaik',    sub:'Dari toko resmi' },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'4px' }}>
              <Icon size={20} color="#2563eb" strokeWidth={1.5} />
              <p style={{ fontSize:11, fontWeight:600, color:'#111827', textAlign:'center' }}>{text}</p>
              <p style={{ fontSize:10, color:'#9ca3af', textAlign:'center' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Deskripsi */}
        {product.description && (
          <div style={{ background:'#fff', padding:16, marginTop:8, borderTop:'4px solid #f5f5f5' }}>
            <p style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:8 }}>Deskripsi Produk</p>
            <p style={{ fontSize:13, color:'#4b5563', lineHeight:1.6, whiteSpace:'pre-wrap' }}>
              {product.description}
            </p>
          </div>
        )}

        {/* Marketplace info */}
        <div style={{ background:'#fff', padding:'12px 16px', marginTop:8, borderTop:'4px solid #f5f5f5', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:`${btnColor}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
            {mp.icon}
          </div>
          <div>
            <p style={{ fontSize:12, color:'#6b7280' }}>Dijual di</p>
            <p style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{mp.label}</p>
          </div>
          <div style={{ marginLeft:'auto', fontSize:11, color:'#9ca3af' }}>Link Affiliate</div>
        </div>
      </div>

      {/* ── STICKY CTA ── */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #e5e7eb', padding:'12px 16px', zIndex:50 }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <button onClick={handleBuy}
            style={{ width:'100%', background: clicked ? '#16a34a' : btnColor, color:'#fff', border:'none', borderRadius:12, padding:'14px 20px', fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.2s', boxShadow:`0 4px 14px ${btnColor}55` }}>
            {clicked
              ? <><Check size={18} /> Membuka {mp.label}...</>
              : <><ShoppingBag size={18} /> Beli di {mp.label}</>
            }
          </button>
          <p style={{ textAlign:'center', fontSize:10, color:'#9ca3af', marginTop:6 }}>
            Anda akan diarahkan ke {mp.label} · Link affiliate
          </p>
        </div>
      </div>
    </div>
  )
}
