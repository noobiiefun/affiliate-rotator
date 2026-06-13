'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Clock, Tag } from 'lucide-react'

interface Props {
  couponCode:  string | null
  couponLabel: string | null
  saleEndsAt:  string | null
  saleLabel:   string | null
}

export default function CouponBanner({ couponCode, couponLabel, saleEndsAt, saleLabel }: Props) {
  const [copied,   setCopied]   = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [expired,  setExpired]  = useState(false)

  useEffect(() => {
    if (!saleEndsAt) return
    const tick = () => {
      const diff = new Date(saleEndsAt).getTime() - Date.now()
      if (diff <= 0) { setExpired(true); setTimeLeft('Berakhir'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(h > 0 ? `${h}j ${m}m ${s}d` : `${m}m ${s}d`)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [saleEndsAt])

  function copy() {
    if (!couponCode) return
    navigator.clipboard.writeText(couponCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!couponCode && !saleEndsAt) return null

  return (
    <div style={{ background:'#fff', marginTop:8, borderTop:'4px solid #f5f5f5' }}>

      {/* Flash sale timer */}
      {saleEndsAt && !expired && (
        <div style={{ background:'linear-gradient(135deg,#dc2626,#b91c1c)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1 }}>
            <p style={{ color:'#fff', fontSize:12, fontWeight:700 }}>🔥 {saleLabel || 'Flash Sale!'}</p>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:11 }}>Berakhir dalam:</p>
          </div>
          <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'6px 12px', display:'flex', alignItems:'center', gap:5 }}>
            <Clock size={13} color="#fff" />
            <span style={{ color:'#fff', fontSize:18, fontWeight:800, fontFamily:'monospace', letterSpacing:'0.05em' }}>
              {timeLeft}
            </span>
          </div>
        </div>
      )}

      {expired && saleEndsAt && (
        <div style={{ background:'#f3f4f6', padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
          <span>⏰</span>
          <p style={{ fontSize:12, color:'#6b7280' }}>Penawaran ini telah berakhir</p>
        </div>
      )}

      {/* Kupon */}
      {couponCode && (
        <div style={{ padding:'12px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
            <Tag size={14} color="#d97706" />
            <p style={{ fontSize:12, fontWeight:700, color:'#92400e' }}>
              {couponLabel || 'Kode Kupon Eksklusif'}
            </p>
          </div>
          <div style={{ border:'2px dashed #f59e0b', borderRadius:10, padding:'10px 14px', background:'#fffbeb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:18, fontWeight:800, color:'#d97706', letterSpacing:'0.1em', fontFamily:'monospace' }}>
              {couponCode}
            </span>
            <button onClick={copy} style={{ background: copied?'#16a34a':'#f59e0b', color:'#fff', border:'none', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5, transition:'background 0.2s' }}>
              {copied ? <><Check size={13}/> Disalin!</> : <><Copy size={13}/> Copy</>}
            </button>
          </div>
          <p style={{ fontSize:11, color:'#9ca3af', marginTop:6 }}>
            Tempel kode ini di halaman checkout untuk mendapatkan promo
          </p>
        </div>
      )}
    </div>
  )
}
