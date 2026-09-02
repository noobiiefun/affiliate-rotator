import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = db.getProduct(params.id)
  if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ data: product })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const result = db.updateProduct(params.id, body)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ data: result.data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  db.deleteProduct(params.id)
  return NextResponse.json({ ok: true })
}
