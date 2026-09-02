import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const UPLOADS_DIR = process.env.OFFLINE_UPLOADS_DIR
  || path.join(process.cwd(), 'offline-uploads.local')

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  webp: 'image/webp', svg: 'image/svg+xml',
}

export async function GET(_req: NextRequest, { params }: { params: { file: string[] } }) {
  const filename = (params.file || []).join('/')
  // Cegah path traversal — hanya nama file datar di dalam UPLOADS_DIR yang boleh diakses.
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return NextResponse.json({ error: 'Nama file tidak valid' }, { status: 400 })
  }
  const filePath = path.join(UPLOADS_DIR, filename)
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const buf = fs.readFileSync(filePath)
  return new NextResponse(buf, {
    headers: {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
