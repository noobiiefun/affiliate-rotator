import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

// Dipakai overlay OBS: satu panggilan → rotator + item aktif + produknya.
// (Tidak ada spotlight/flash-sale event di mode offline — lihat catatan di README patch.)
export async function GET(_req: NextRequest, { params }: { params: { idOrSlug: string } }) {
  const rotator = db.findRotator(params.idOrSlug)
  if (!rotator) return NextResponse.json({ rotator: null, items: [] })

  const items = db.listRotatorItems(rotator.id)
    .filter(i => i.is_active && i.product?.is_active)
    .map(i => ({
      id: i.id,
      position: i.position,
      spotlight_duration: null,
      spotlight_active: false,
      product: i.product,
    }))

  return NextResponse.json({ rotator, items })
}
