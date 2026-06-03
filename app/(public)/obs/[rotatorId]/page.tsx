'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import { Product, Rotator, MARKETPLACE_INFO } from '@/types'
import { formatRupiah, getBaseUrl } from '@/lib/utils'

interface RotatorItemWithProduct {
  id: string
  position: number
  product: Product
}

export default function ObsOverlayPage() {
  const params = useParams()
  const rotatorId = params.rotatorId as string

  const [rotator,    setRotator]    = useState<Rotator | null>(null)
  const [items,      setItems]      = useState<RotatorItemWithProduct[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [qrDataUrl,  setQrDataUrl]  = useState('')
  const [progress,   setProgress]   = useState(0)
  const [loaded,     setLoaded]     = useState(false)
  const [animating,  setAnimating]  = useState(false)

  // Fetch rotator + products
  useEffect(() => {
    async function fetchData() {
      const { data: rot } = await supabase
        .from('rotators')
        .select('*')
        .eq('id', rotatorId)
        .single()

      if (!rot) return
      setRotator(rot)

      const { data: its } = await supabase
        .from('rotator_items')
        .select('*, product:products(*)')
        .eq('rotator_id', rotatorId)
        .eq('is_active', true)
        .order('position')

      setItems((its as any) || [])
      setLoaded(true)
    }
    fetchData()
  }, [rotatorId])

  // Generate QR code whenever current product changes
  const currentItem = items[currentIdx]
  useEffect(() => {
    if (!currentItem) return
    const landingUrl = `${getBaseUrl()}/p/${currentItem.product.slug}`
    QRCode.toDataURL(landingUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl)
  }, [currentItem])

  // Auto-rotate + progress bar
  useEffect(() => {
    if (!rotator || items.length <= 1) return

    const intervalMs   = rotator.interval_sec * 1000
    const tickMs       = 50
    let elapsed        = 0

    const tick = setInterval(() => {
      elapsed += tickMs
      setProgress((elapsed / intervalMs) * 100)

      if (elapsed >= intervalMs) {
        elapsed = 0
        setAnimating(true)
        setTimeout(() => {
          setCurrentIdx(i => (i + 1) % items.length)
          setAnimating(false)
        }, 400)
      }
    }, tickMs)

    return () => clearInterval(tick)
  }, [rotator, items.length])

  // Log click for analytics
  async function trackClick() {
    if (!currentItem) return
    await supabase.from('click_events').insert({
      product_id: currentItem.product.id,
      rotator_id: rotatorId,
      source: 'qr',
    })
  }

  if (!loaded) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#ffffff', fontSize: 13, opacity: 0.5 }}>Memuat...</div>
      </div>
    )
  }

  if (!rotator || items.length === 0) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          borderRadius: 12,
          padding: '16px 24px',
          color: '#ffffff',
          fontSize: 13,
          textAlign: 'center',
        }}>
          {!rotator ? 'Rotator tidak ditemukan' : 'Tidak ada produk aktif di rotator ini'}
        </div>
      </div>
    )
  }

  const product = currentItem?.product
  const mp      = product ? MARKETPLACE_INFO[product.marketplace] : null

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent !important; overflow: hidden; }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        .card      { animation: fadeIn 0.4s ease forwards; }
        .card.exit { animation: fadeOut 0.4s ease forwards; }
        .scan-hint { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        padding: '0 0 24px 24px',
      }}>
        {product && (
          <div
            className={`card${animating ? ' exit' : ''}`}
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,35,0.97) 0%, rgba(26,26,60,0.97) 100%)',
              borderRadius: 20,
              padding: 16,
              width: 260,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                background: 'rgba(139,92,246,0.3)',
                borderRadius: 8,
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#a78bfa',
                  boxShadow: '0 0 6px #a78bfa',
                }} />
                <span style={{ color: '#c4b5fd', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>
                  PROMO SEKARANG
                </span>
              </div>
              {items.length > 1 && (
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginLeft: 'auto' }}>
                  {currentIdx + 1}/{items.length}
                </span>
              )}
            </div>

            {/* Product info + QR */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              {/* Product image */}
              <div style={{
                width: 72, height: 72,
                borderRadius: 12,
                overflow: 'hidden',
                flexShrink: 0,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>
                    🛍️
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div style={{
                width: 72, height: 72,
                borderRadius: 12,
                overflow: 'hidden',
                flexShrink: 0,
                background: '#ffffff',
                padding: 4,
                cursor: 'pointer',
              }} onClick={trackClick}>
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR" style={{ width: '100%', height: '100%' }} />
                )}
              </div>

              {/* Product detail */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {product.name}
                  </p>
                  {mp && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: 4,
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      {mp.icon} {mp.label}
                    </span>
                  )}
                </div>
                {product.price && (
                  <p style={{
                    color: '#4ade80',
                    fontSize: 13,
                    fontWeight: 700,
                    marginTop: 4,
                  }}>
                    {formatRupiah(product.price)}
                  </p>
                )}
              </div>
            </div>

            {/* Scan hint */}
            <div className="scan-hint" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 10,
            }}>
              <span style={{ fontSize: 14 }}>📱</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                Scan QR untuk beli sekarang
              </span>
            </div>

            {/* Progress bar */}
            {items.length > 1 && (
              <div style={{
                height: 2,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                  borderRadius: 2,
                  transition: 'width 0.05s linear',
                }} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
