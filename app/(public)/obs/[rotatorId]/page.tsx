'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import { getRotatorForObs, trackClick, OFFLINE } from '@/lib/data'
import { Product, Rotator, ThemeConfig, DEFAULT_THEME, MARKETPLACE_INFO } from '@/types'
import { formatRupiah, getBaseUrl } from '@/lib/utils'

interface Item {
  id: string; position: number
  spotlight_duration: number | null
  spotlight_active: boolean
  product: Product
}

interface SpotlightEvent {
  id: string; product_id: string; ends_at: string; is_active: boolean
}

const SIZE_MAP  = { small: 200, medium: 260, large: 320 }
const POS_STYLE: Record<string, React.CSSProperties> = {
  'bottom-left':  { bottom: 24, left: 24 },
  'bottom-right': { bottom: 24, right: 24 },
  'top-left':     { top: 24, left: 24 },
  'top-right':    { top: 24, right: 24 },
  'center':       { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
}

export default function ObsOverlayPage() {
  const { rotatorId } = useParams() as { rotatorId: string }

  const [rotator,    setRotator]    = useState<Rotator | null>(null)
  const [items,      setItems]      = useState<Item[]>([])
  const [spotlight,  setSpotlight]  = useState<SpotlightEvent | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [qrDataUrl,  setQrDataUrl]  = useState('')
  const [progress,   setProgress]   = useState(0)
  const [loaded,     setLoaded]     = useState(false)
  const [animating,  setAnimating]  = useState(false)
  const [splCountdown, setSplCountdown] = useState('')
  const audioRef = useRef<AudioContext | null>(null)
  const prevSpotlightRef = useRef<string | null>(null)

  // Fetch data + polling setiap 5 detik untuk detect spotlight
  useEffect(() => {
    fetchData()
    const poll = setInterval(fetchSpotlight, 5000)
    return () => clearInterval(poll)
  }, [rotatorId])

  async function fetchData() {
    const { rotator: rot, items: its } = await getRotatorForObs(rotatorId)
    if (!rot) { setLoaded(true); return }
    setRotator(rot)
    setItems((its as any) || [])

    await fetchSpotlightForRotator(rot.id)
    setLoaded(true)
  }

  async function fetchSpotlight() {
    if (!rotator) return
    await fetchSpotlightForRotator(rotator.id)
  }

  async function fetchSpotlightForRotator(rotId: string) {
    // Fitur spotlight (flash-sale highlight) belum tersedia di mode offline.
    if (OFFLINE) { setSpotlight(null); return }

    const { data } = await supabase
      .from('spotlight_events')
      .select('*')
      .eq('rotator_id', rotId)
      .eq('is_active', true)
      .gte('ends_at', new Date().toISOString())
      .order('started_at', { ascending: false })
      .limit(1)

    const spl = data?.[0] || null
    setSpotlight(spl)

    // Play sound jika spotlight baru dimulai
    if (spl && spl.id !== prevSpotlightRef.current) {
      playAlertSound()
      prevSpotlightRef.current = spl.id
    } else if (!spl) {
      prevSpotlightRef.current = null
    }
  }

  // Sound alert (Web Audio API — tidak butuh file audio)
  function playAlertSound() {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext()
      const ctx = audioRef.current
      const play = (freq: number, start: number, dur: number) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + dur)
      }
      play(523, 0,    0.15)  // C
      play(659, 0.15, 0.15)  // E
      play(784, 0.3,  0.3)   // G
    } catch {}
  }

  // Determine current product: spotlight atau rotasi normal
  const isSpotlightActive = !!spotlight
  const spotlightItem = isSpotlightActive
    ? items.find(i => i.product.id === spotlight!.product_id)
    : null
  const currentItem = spotlightItem || items[currentIdx]

  // Spotlight countdown
  useEffect(() => {
    if (!spotlight) { setSplCountdown(''); return }
    const tick = () => {
      const diff = new Date(spotlight.ends_at).getTime() - Date.now()
      if (diff <= 0) { setSplCountdown(''); setSpotlight(null); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setSplCountdown(`${m}:${s.toString().padStart(2,'0')}`)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [spotlight])

  // Generate QR
  // Mode Offline: QR langsung berisi link affiliate — begitu discan, HP penonton
  // langsung ke marketplace tanpa mampir ke halaman/app ini sama sekali.
  // Mode Online: QR berisi link landing page kita (/p/slug) seperti semula.
  useEffect(() => {
    if (!currentItem) return
    const target = OFFLINE
      ? currentItem.product.affiliate_url
      : `${getBaseUrl()}/p/${currentItem.product.slug}`
    QRCode.toDataURL(target, {
      width: 200, margin: 1,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl)
  }, [currentItem?.product.slug, currentItem?.product.affiliate_url])

  // Auto-rotate (hanya jika tidak ada spotlight)
  useEffect(() => {
    if (!rotator || items.length <= 1 || isSpotlightActive) return
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
  }, [rotator, items.length, isSpotlightActive])

  async function handleQrClick() {
    // Tidak melakukan apa-apa di mode offline (klik langsung buka marketplace,
    // browser yang menangani navigasi — tidak ada tracking).
    if (!currentItem || !rotator) return
    await trackClick(currentItem.product.id, rotator.id, 'qr')
  }

  if (!loaded) return (
    <div style={{ width:'100vw', height:'100vh', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#fff', fontSize:12, opacity:0.4 }}>Memuat...</div>
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
  const theme: ThemeConfig = { ...DEFAULT_THEME, ...(rotator.theme_config || {}) }
  const cardW    = SIZE_MAP[theme.size]
  const posStyle = POS_STYLE[theme.position] || POS_STYLE['bottom-left']
  const imgSize  = theme.size === 'small' ? 52 : theme.size === 'large' ? 88 : 68

  // Spotlight styling overrides
  const spotlightBg      = isSpotlightActive ? '#1a0a00' : theme.bg_color
  const spotlightAccent  = isSpotlightActive ? '#f59e0b' : theme.accent_color
  const spotlightGlow    = isSpotlightActive
    ? `0 0 30px rgba(245,158,11,0.6), 0 8px 32px rgba(0,0,0,0.5), 0 0 0 2px rgba(245,158,11,0.5)`
    : `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)`

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:transparent !important; overflow:hidden; }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut   { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-8px)} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.4),0 8px 32px rgba(0,0,0,0.5),0 0 0 2px rgba(245,158,11,0.4)} 50%{box-shadow:0 0 40px rgba(245,158,11,0.8),0 8px 32px rgba(0,0,0,0.5),0 0 0 2px rgba(245,158,11,0.8)} }
        @keyframes badgePop  { 0%{transform:scale(0.8)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
        .card        { animation: fadeIn 0.4s ease forwards; }
        .card.exit   { animation: fadeOut 0.4s ease forwards; }
        .card.spotlight { animation: glowPulse 2s ease-in-out infinite; }
        .scan-hint   { animation: pulse 2s ease-in-out infinite; }
        .badge-feat  { animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div style={{ width:'100vw', height:'100vh', background:'transparent', position:'relative' }}>
        {product && (
          <div
            className={`card${animating&&!isSpotlightActive?' exit':''} ${isSpotlightActive?'spotlight':''}`}
            style={{
              position: 'absolute', ...posStyle,
              width: isSpotlightActive ? Math.min(cardW + 40, 360) : cardW,
              background: spotlightBg,
              borderRadius: theme.border_radius,
              padding: theme.size === 'small' ? 10 : 14,
              opacity: theme.opacity,
              boxShadow: spotlightGlow,
              transition: 'all 0.5s ease',
            }}
          >
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
              {isSpotlightActive ? (
                <div className="badge-feat" style={{
                  background:'linear-gradient(135deg,#f59e0b,#d97706)',
                  borderRadius:6, padding:'3px 8px',
                  display:'flex', alignItems:'center', gap:4,
                }}>
                  <span style={{ fontSize:9 }}>⚡</span>
                  <span style={{ color:'#fff', fontSize:9, fontWeight:700, letterSpacing:'0.05em' }}>FEATURED</span>
                </div>
              ) : (
                <div style={{ background:`${spotlightAccent}33`, borderRadius:6, padding:'3px 8px', display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:spotlightAccent, boxShadow:`0 0 5px ${spotlightAccent}` }} />
                  <span style={{ color:spotlightAccent, fontSize:9, fontWeight:700, letterSpacing:'0.05em' }}>PROMO SEKARANG</span>
                </div>
              )}

              {/* Spotlight countdown */}
              {isSpotlightActive && splCountdown && (
                <div style={{ marginLeft:'auto', background:'rgba(245,158,11,0.2)', borderRadius:6, padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
                  <span style={{ fontSize:9 }}>⏱</span>
                  <span style={{ color:'#f59e0b', fontSize:10, fontWeight:700, fontFamily:'monospace' }}>{splCountdown}</span>
                </div>
              )}

              {!isSpotlightActive && items.length > 1 && (
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:9, marginLeft:'auto' }}>
                  {currentIdx+1}/{items.length}
                </span>
              )}

              {theme.logo_url && !isSpotlightActive && (
                <img src={theme.logo_url} alt="logo" style={{ height:16, objectFit:'contain', marginLeft:'auto' }} />
              )}
            </div>

            {/* Product + QR */}
            <div style={{ display:'flex', gap:10, marginBottom:10 }}>
              <div style={{ width:imgSize, height:imgSize, borderRadius:10, overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)', border:`1px solid ${isSpotlightActive?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.1)'}` }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🛍️</div>
                }
              </div>

              <div onClick={handleQrClick} style={{ width:imgSize, height:imgSize, borderRadius:10, overflow:'hidden', flexShrink:0, background:'#fff', padding:4, cursor:'pointer', border:isSpotlightActive?'2px solid #f59e0b':'none' }}>
                {qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ width:'100%', height:'100%' }} />}
              </div>

              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <p style={{ color:theme.text_color, fontSize:theme.size==='small'?10:12, fontWeight:600, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {product.name}
                </p>
                <div>
                  {theme.show_marketplace && mp && (
                    <span style={{ color:'rgba(255,255,255,0.45)', fontSize:9 }}>{mp.icon} {mp.label}</span>
                  )}
                  {theme.show_price && product.price && (
                    <p style={{ color:'#4ade80', fontSize:theme.size==='small'?11:13, fontWeight:700, marginTop:2 }}>
                      {formatRupiah(product.price)}
                    </p>
                  )}
                  {/* Kupon badge di OBS */}
                  {product.coupon_code && (
                    <div style={{ marginTop:3, background:'rgba(245,158,11,0.2)', border:'1px dashed rgba(245,158,11,0.5)', borderRadius:4, padding:'2px 5px', display:'inline-block' }}>
                      <span style={{ color:'#fbbf24', fontSize:8, fontWeight:700 }}>🎫 {product.coupon_code}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scan hint */}
            <div className="scan-hint" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginBottom:8 }}>
              <span style={{ fontSize:12 }}>📱</span>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:10 }}>
                {isSpotlightActive ? 'Scan sekarang — penawaran terbatas!' : 'Scan QR untuk beli sekarang'}
              </span>
            </div>

            {/* Progress bar */}
            {items.length > 1 && !isSpotlightActive && (
              <div style={{ height:2, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${spotlightAccent},${spotlightAccent}cc)`, borderRadius:2, transition:'width 0.05s linear' }} />
              </div>
            )}

            {/* Spotlight bar (kuning penuh) */}
            {isSpotlightActive && (
              <div style={{ height:2, background:'rgba(245,158,11,0.3)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:'100%', background:'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius:2 }} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
