import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

export async function GET() {
  return NextResponse.json({ data: db.listRotators() })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body?.name || !body?.slug) {
    return NextResponse.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 })
  }
  const result = db.createRotator(body)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ data: result.data })
}
