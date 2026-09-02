import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

export async function GET() {
  return NextResponse.json({ data: db.listGroups() })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body?.name) return NextResponse.json({ error: 'Nama grup wajib diisi' }, { status: 400 })
  const item = db.createGroup(body)
  return NextResponse.json({ data: item })
}
