import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  db.deleteGroup(params.id)
  return NextResponse.json({ ok: true })
}
