import { NextResponse } from 'next/server'
import * as db from '@/lib/offline-db'

export async function GET() {
  return NextResponse.json(db.getStats())
}
