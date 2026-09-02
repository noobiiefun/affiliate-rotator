// ─────────────────────────────────────────────────────────────
// lib/offline-db.ts
// "Database" lokal berbasis file JSON untuk Mode Offline.
// Dipakai HANYA di server (API routes & server components) — pakai `fs`,
// jadi jangan pernah di-import dari file 'use client'.
//
// Lokasi file data ditentukan lewat env var OFFLINE_DB_PATH (di-set oleh
// electron/main.js ke folder userData). Kalau tidak ada (misal saat
// `npm run dev` biasa), fallback ke ./offline-data.local.json di root project.
// ─────────────────────────────────────────────────────────────
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Product, Rotator, RotatorItem, RotatorGroup, DEFAULT_THEME } from '@/types'

const DB_PATH = process.env.OFFLINE_DB_PATH
  || path.join(process.cwd(), 'offline-data.local.json')

interface DB {
  products:       Product[]
  rotators:       Rotator[]
  rotator_items:  RotatorItem[]
  rotator_groups: RotatorGroup[]
}

function emptyDB(): DB {
  return { products: [], rotators: [], rotator_items: [], rotator_groups: [] }
}

function readDB(): DB {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8')
      const parsed = JSON.parse(raw)
      return { ...emptyDB(), ...parsed }
    }
  } catch (e) {
    console.error('[offline-db] gagal baca file data, mulai dari kosong:', e)
  }
  return emptyDB()
}

function writeDB(db: DB) {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function newId() { return crypto.randomUUID() }
function nowISO() { return new Date().toISOString() }

// ── Products ─────────────────────────────────────────────────
export function listProducts(): Product[] {
  return [...readDB().products].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
}
export function listActiveProducts(): Product[] {
  return listProducts().filter(p => p.is_active).sort((a, b) => a.name.localeCompare(b.name))
}
export function getProduct(id: string): Product | null {
  return readDB().products.find(p => p.id === id) || null
}
export function createProduct(payload: Partial<Product>): { data?: Product; error?: string } {
  const db = readDB()
  if (payload.slug && db.products.some(p => p.slug === payload.slug)) {
    return { error: 'Slug sudah digunakan, coba yang lain.' }
  }
  const item: Product = {
    id: newId(), created_at: nowISO(), updated_at: nowISO(),
    description: null, price: null, image_url: null, images: [],
    video_url: null, coupon_code: null, coupon_label: null,
    sale_ends_at: null, sale_label: null, is_active: true,
    ...payload,
  } as Product
  db.products.unshift(item)
  writeDB(db)
  return { data: item }
}
export function updateProduct(id: string, payload: Partial<Product>): { data?: Product; error?: string } {
  const db = readDB()
  const idx = db.products.findIndex(p => p.id === id)
  if (idx === -1) return { error: 'Produk tidak ditemukan' }
  if (payload.slug && db.products.some(p => p.slug === payload.slug && p.id !== id)) {
    return { error: 'Slug sudah digunakan, coba yang lain.' }
  }
  db.products[idx] = { ...db.products[idx], ...payload, updated_at: nowISO() }
  writeDB(db)
  return { data: db.products[idx] }
}
export function deleteProduct(id: string) {
  const db = readDB()
  db.products = db.products.filter(p => p.id !== id)
  db.rotator_items = db.rotator_items.filter(i => i.product_id !== id)
  writeDB(db)
}

// ── Rotator Groups ──────────────────────────────────────────
export function listGroups(): RotatorGroup[] {
  return [...readDB().rotator_groups].sort((a, b) => a.name.localeCompare(b.name))
}
export function createGroup(payload: Partial<RotatorGroup>): RotatorGroup {
  const db = readDB()
  const item: RotatorGroup = {
    id: newId(), created_at: nowISO(), updated_at: nowISO(),
    description: null, color: '#8b5cf6',
    ...payload,
  } as RotatorGroup
  db.rotator_groups.push(item)
  writeDB(db)
  return item
}
export function deleteGroup(id: string) {
  const db = readDB()
  db.rotator_groups = db.rotator_groups.filter(g => g.id !== id)
  db.rotators = db.rotators.map(r => (r.group_id === id ? { ...r, group_id: null } : r))
  writeDB(db)
}

// ── Rotators ─────────────────────────────────────────────────
function attachGroup(r: Rotator, db: DB): Rotator {
  const group = r.group_id ? db.rotator_groups.find(g => g.id === r.group_id) : undefined
  return { ...r, group }
}
export function listRotators(): Rotator[] {
  const db = readDB()
  return [...db.rotators]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map(r => attachGroup(r, db))
}
// Cari berdasarkan id ATAU slug — dipakai overlay OBS.
export function findRotator(idOrSlug: string): Rotator | null {
  const db = readDB()
  const r = db.rotators.find(x => x.id === idOrSlug) || db.rotators.find(x => x.slug === idOrSlug)
  return r ? attachGroup(r, db) : null
}
export function createRotator(payload: Partial<Rotator>): { data?: Rotator; error?: string } {
  const db = readDB()
  if (payload.slug && db.rotators.some(r => r.slug === payload.slug)) {
    return { error: 'Slug sudah dipakai, coba yang lain.' }
  }
  const item: Rotator = {
    id: newId(), created_at: nowISO(), updated_at: nowISO(),
    description: null, group_id: null, interval_sec: 10, is_active: true,
    theme_config: DEFAULT_THEME,
    ...payload,
  } as Rotator
  db.rotators.push(item)
  writeDB(db)
  return { data: attachGroup(item, db) }
}
export function updateRotator(id: string, payload: Partial<Rotator>): { data?: Rotator; error?: string } {
  const db = readDB()
  const idx = db.rotators.findIndex(r => r.id === id)
  if (idx === -1) return { error: 'Rotator tidak ditemukan' }
  if (payload.slug && db.rotators.some(r => r.slug === payload.slug && r.id !== id)) {
    return { error: 'Slug sudah dipakai, coba yang lain.' }
  }
  db.rotators[idx] = { ...db.rotators[idx], ...payload, updated_at: nowISO() }
  writeDB(db)
  return { data: attachGroup(db.rotators[idx], db) }
}
export function deleteRotator(id: string) {
  const db = readDB()
  db.rotators = db.rotators.filter(r => r.id !== id)
  db.rotator_items = db.rotator_items.filter(i => i.rotator_id !== id)
  writeDB(db)
}

// ── Rotator Items ────────────────────────────────────────────
function attachProduct(item: RotatorItem, db: DB) {
  return { ...item, product: db.products.find(p => p.id === item.product_id) as Product }
}
export function listRotatorItems(rotatorId: string) {
  const db = readDB()
  return db.rotator_items
    .filter(i => i.rotator_id === rotatorId)
    .sort((a, b) => a.position - b.position)
    .map(i => attachProduct(i, db))
}
export function addRotatorItem(rotatorId: string, productId: string): RotatorItem {
  const db = readDB()
  const position = db.rotator_items.filter(i => i.rotator_id === rotatorId).length
  const item: RotatorItem = {
    id: newId(), rotator_id: rotatorId, product_id: productId,
    position, is_active: true, created_at: nowISO(),
  }
  db.rotator_items.push(item)
  writeDB(db)
  return item
}
export function removeRotatorItem(itemId: string) {
  const db = readDB()
  db.rotator_items = db.rotator_items.filter(i => i.id !== itemId)
  writeDB(db)
}
export function reorderRotatorItems(rotatorId: string, orderedIds: string[]) {
  const db = readDB()
  orderedIds.forEach((iid, pos) => {
    const item = db.rotator_items.find(i => i.id === iid && i.rotator_id === rotatorId)
    if (item) item.position = pos
  })
  writeDB(db)
}

// ── Stats (dashboard overview) ─────────────────────────────────
export function getStats() {
  const db = readDB()
  return {
    totalProducts:  db.products.length,
    activeProducts: db.products.filter(p => p.is_active).length,
    totalRotators:  db.rotators.length,
  }
}
