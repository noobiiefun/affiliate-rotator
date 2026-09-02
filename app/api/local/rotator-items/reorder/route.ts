import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body?.rotator_id || !Array.isArray(body?.order)) {
    return NextResponse.json({ error: 'rotator_id dan order[] wajib diisi' }, { status: 400 })
  }
  db.reorderRotatorItems(body.rotator_id, body.order)
  return NextResponse.json({ ok: true })
}
