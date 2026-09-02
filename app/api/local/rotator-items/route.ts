import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

export async function GET(req: NextRequest) {
  const rotatorId = req.nextUrl.searchParams.get('rotator_id')
  if (!rotatorId) return NextResponse.json({ error: 'rotator_id wajib diisi' }, { status: 400 })
  return NextResponse.json({ data: db.listRotatorItems(rotatorId) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body?.rotator_id || !body?.product_id) {
    return NextResponse.json({ error: 'rotator_id dan product_id wajib diisi' }, { status: 400 })
  }
  const item = db.addRotatorItem(body.rotator_id, body.product_id)
  return NextResponse.json({ data: item })
}
