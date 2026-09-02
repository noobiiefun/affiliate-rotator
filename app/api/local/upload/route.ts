import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Folder tempat file upload (logo dsb) disimpan di mode offline.
// electron/main.js men-set OFFLINE_UPLOADS_DIR ke folder userData.
const UPLOADS_DIR = process.env.OFFLINE_UPLOADS_DIR
  || path.join(process.cwd(), 'offline-uploads.local')

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Format tidak didukung (pakai PNG/JPG/WEBP/SVG)' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 })
  }

  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

  const ext = (file.name.split('.').pop() || 'png').replace(/[^a-z0-9]/gi, '')
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buf)

  return NextResponse.json({ url: `/api/local/uploads/${filename}` })
}
