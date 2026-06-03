'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import { Product, Rotator, ThemeConfig, DEFAULT_THEME, MARKETPLACE_INFO } from '@/types'
import { formatRupiah, getBaseUrl } from '@/lib/utils'

interface Item { id: string; position: number; product: Product }

// Ukuran kartu berdasarkan setting
const SIZE_MAP = { small: 200, medium: 260, large: 320 }

// Posisi overlay
const POSITION_STYLE: Record<string, React.CSSProperties> = {
  'bottom-left':  { bottom: 24, left: 24 },
  'bottom-right': { bottom: 24, right: 24 },
  'top-left':     { top: 24, left: 24 },
  'top-right':    { top: 24, right: 24 },
  'center':       { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
}

export default function ObsOverlayPage() {
  const { rotatorId } = useParams() as { rotatorId: string }

  const [rotator,    setRotator]    = useState<Rotator | null>(null)
  const [items,      setItems]      = useState<Item[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [qrDataUrl,  setQrDataUrl]  = useState('')
  const [progress,   setProgress]   = useState(0)
  const [loaded,     setLoaded]     = useState(false)
  const [animating,  setAnimating]  = useState(false)

  useEffect(() => {
    async function fetchData() {
      // Coba cari by slug dulu, fallback ke id
      let { data: rot } = await supabase
        .from('rotators').select('*').eq('slug', rotatorId).single()
      if (!rot) {
        const res = await supabase.from('rotators').select('*').eq('id', rotatorId).single()
        rot = res.data
      }
      if (!rot) { setLoaded(true); return }
      setRotator(rot)

      const { data: its } = await supabase
        .from('rotator_items')
        .select('*, product:products(*)')
        .eq('rotator_id', rot.id)
        .eq('is_active', true)
        .order('position')
      setItems((its as any) || [])
      setLoaded(true)
    }
    fetchData()
  }, [rotatorId])

  const currentItem = items[currentIdx]
  const theme: ThemeConfig = rotator?.theme_config
    ? { ...DEFAULT_THEME, ...rotator.theme_config }
    : DEFAULT_THEME

  // Generate QR
  useEffect(() => {
    if (!currentItem) return
    QRCode.toDataURL(`${getBaseUrl()}/p/${currentItem.product.slug}`, {
      width: 200, margin: 1,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl)
  }, [currentItem])

  // Auto-rotate + progress
  useEffect(() => {
    if (!rotator || items.length <= 1) return
    const intervalMs = rotator.interval_sec * 1000
    const tickMs = 50
    let elapsed = 0
    const tick = setInterval(() => {
      elapsed += tickMs
      setProgress((elapsed / intervalMs) * 100)
      if (elapsed >= intervalMs) {
        elapsed = 0
        setAnimating(true)
        setTimeout(() => { setCurrentIdx(i => (i + 1) % items.length); setAnimating(false) }, 400)
      }
    }, tickMs)
    return () => clearInterval(tick)
  }, [rotator, items.length])

  async function trackClick() {
    if (!currentItem || !rotator) return
    await supabase.from('click_events').insert({
      product_id: currentItem.product.id,
      rotator_id: rotator.id,
      source: 'qr',
    })
  }

  if (!loaded) return (
    <div style={{ width:'100vw', height:'100vh', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#ffffff', fontSize:12, opacity:0.4 }}>Memuat...</div>
    </div>
  )

  if (!rotator || items.length === 0) return (
    <div style={{ width:'100vw', height:'100vh', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'rgba(0,0,0,0.7)', borderRadius:12, padding:'12px 20px', color:'#fff', fontSize:12 }}>
        {!rotator ? `Rotator "${rotatorId}" tidak ditemukan` : 'Tidak ada produk aktif'}
      </div>
    </div>
  )

  const product  = currentItem?.product
  const mp       = product ? MARKETPLACE_INFO[product.marketplace] : null
  const cardW    = SIZE_MAP[theme.size]
  const posStyle = POSITION_STYLE[theme.position] || POSITION_STYLE['bottom-left']
  const imgSize  = theme.size === 'small' ? 52 : theme.size === 'large' ? 88 : 68
  const qrSize   = imgSize

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:transparent !important; overflow:hidden; }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-8px); } }
        @keyframes pulse   { 0%,100%{ opacity:1; } 50%{ opacity:0.6; } }
        .card      { animation: fadeIn  0.4s ease forwards; }
        .card.exit { animation: fadeOut 0.4s ease forwards; }
        .scan-hint { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      <div style={{ width:'100vw', height:'100vh', background:'transparent', position:'relative' }}>
        {product && (
          <div
            className={`card${animating ? ' exit' : ''}`}
            style={{
              position: 'absolute',
              ...posStyle,
              width: cardW,
              background: theme.bg_color,
              borderRadius: theme.border_radius,
              padding: theme.size === 'small' ? 10 : 14,
              opacity: theme.opacity,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* Header row */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
              <div style={{ background:`${theme.accent_color}33`, borderRadius:6, padding:'3px 8px', display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:theme.accent_color, boxShadow:`0 0 5px ${theme.accent_color}` }} />
                <span style={{ color:theme.accent_color, fontSize:9, fontWeight:700, letterSpacing:'0.05em' }}>PROMO SEKARANG</span>
              </div>
              {items.length > 1 && (
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:9, marginLeft:'auto' }}>{currentIdx+1}/{items.length}</span>
              )}
              {theme.logo_url && (
                <img src={theme.logo_url} alt="logo" style={{ height:16, objectFit:'contain', marginLeft: items.length > 1 ? 0 : 'auto' }} />
              )}
            </div>

            {/* Product + QR */}
            <div style={{ display:'flex', gap:10, marginBottom:10 }}>
              {/* Gambar produk */}
              <div style={{ width:imgSize, height:imgSize, borderRadius:10, overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🛍️</div>
                }
              </div>

              {/* QR */}
              <div onClick={trackClick} style={{ width:qrSize, height:qrSize, borderRadius:10, overflow:'hidden', flexShrink:0, background:'#fff', padding:4, cursor:'pointer' }}>
                {qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ width:'100%', height:'100%' }} />}
              </div>

              {/* Info produk */}
              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <p style={{ color:theme.text_color, fontSize: theme.size==='small'?10:12, fontWeight:600, lineHeight:1.3,
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {product.name}
                </p>
                <div>
                  {theme.show_marketplace && mp && (
                    <span style={{ color:'rgba(255,255,255,0.45)', fontSize:9 }}>{mp.icon} {mp.label}</span>
                  )}
                  {theme.show_price && product.price && (
                    <p style={{ color:'#4ade80', fontSize: theme.size==='small'?11:13, fontWeight:700, marginTop:2 }}>
                      {formatRupiah(product.price)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Scan hint */}
            <div className="scan-hint" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginBottom:8 }}>
              <span style={{ fontSize:12 }}>📱</span>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:10 }}>Scan QR untuk beli sekarang</span>
            </div>

            {/* Progress bar */}
            {items.length > 1 && (
              <div style={{ height:2, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg, ${theme.accent_color}, ${theme.accent_color}cc)`, borderRadius:2, transition:'width 0.05s linear' }} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
