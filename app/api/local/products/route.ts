import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

export async function GET(req: NextRequest) {
  const active = req.nextUrl.searchParams.get('active')
  const data = active ? db.listActiveProducts() : db.listProducts()
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body?.name || !body?.affiliate_url || !body?.slug) {
    return NextResponse.json({ error: 'Nama, URL affiliate, dan slug wajib diisi.' }, { status: 400 })
  }
  const result = db.createProduct(body)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ data: result.data })
}
