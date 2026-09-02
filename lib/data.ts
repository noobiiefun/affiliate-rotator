// ─────────────────────────────────────────────────────────────
// lib/data.ts
// Lapisan data terpadu dipakai semua komponen dashboard + overlay OBS.
// OFFLINE=false → jalan seperti semula (Supabase).
// OFFLINE=true  → semua baca/tulis lewat /api/local/* (file JSON lokal),
//                 tanpa internet & tanpa Supabase sama sekali.
//
// NEXT_PUBLIC_OFFLINE_MODE di-bake saat `next build` (lihat .env.production.local).
// ─────────────────────────────────────────────────────────────
import { supabase } from '@/lib/supabase'
import { Product, Rotator, RotatorGroup, RotatorItem } from '@/types'

export const OFFLINE = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`/api/local${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Request gagal')
  return json
}

// ── Products ─────────────────────────────────────────────────
export async function listProducts(): Promise<Product[]> {
  if (OFFLINE) { const j = await api('/products'); return j.data || [] }
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function listActiveProducts(): Promise<Product[]> {
  if (OFFLINE) { const j = await api('/products?active=1'); return j.data || [] }
  const { data } = await supabase.from('products').select('*').eq('is_active', true).order('name')
  return data || []
}

export async function getProduct(id: string): Promise<Product | null> {
  if (OFFLINE) { try { const j = await api(`/products/${id}`); return j.data } catch { return null } }
  const { data } = await supabase.from('products').select('*').eq('id', id).single()
  return data
}

export async function saveProduct(payload: Record<string, any>, existingId?: string): Promise<{ error?: string }> {
  if (OFFLINE) {
    try {
      await api(existingId ? `/products/${existingId}` : '/products', {
        method: existingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      return {}
    } catch (e: any) { return { error: e.message } }
  }
  const { error } = existingId
    ? await supabase.from('products').update(payload).eq('id', existingId)
    : await supabase.from('products').insert(payload)
  return { error: error?.message }
}

export async function toggleProductActive(product: Product) {
  if (OFFLINE) { await api(`/products/${product.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !product.is_active }) }); return }
  await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
}

export async function deleteProductById(id: string) {
  if (OFFLINE) { await api(`/products/${id}`, { method: 'DELETE' }); return }
  await supabase.from('products').delete().eq('id', id)
}

// ── Rotator Groups ──────────────────────────────────────────
export async function listGroups(): Promise<RotatorGroup[]> {
  if (OFFLINE) { const j = await api('/groups'); return j.data || [] }
  const { data } = await supabase.from('rotator_groups').select('*').order('name')
  return data || []
}

export async function createGroup(payload: Record<string, any>): Promise<{ error?: string }> {
  if (OFFLINE) { try { await api('/groups', { method: 'POST', body: JSON.stringify(payload) }); return {} } catch (e: any) { return { error: e.message } } }
  const { error } = await supabase.from('rotator_groups').insert(payload)
  return { error: error?.message }
}

export async function deleteGroupById(id: string) {
  if (OFFLINE) { await api(`/groups/${id}`, { method: 'DELETE' }); return }
  await supabase.from('rotator_groups').delete().eq('id', id)
}

// ── Rotators ─────────────────────────────────────────────────
export async function listRotators(): Promise<Rotator[]> {
  if (OFFLINE) { const j = await api('/rotators'); return j.data || [] }
  const { data } = await supabase.from('rotators').select('*, group:rotator_groups(*)').order('created_at', { ascending: false })
  return (data as any) || []
}

export async function getRotatorById(id: string): Promise<Rotator | null> {
  if (OFFLINE) { try { const j = await api(`/rotators/${id}`); return j.data } catch { return null } }
  const { data } = await supabase.from('rotators').select('*').eq('id', id).single()
  return data
}

export async function saveRotator(payload: Record<string, any>, existingId?: string): Promise<{ data?: Rotator; error?: string }> {
  if (OFFLINE) {
    try {
      const j = await api(existingId ? `/rotators/${existingId}` : '/rotators', {
        method: existingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      return { data: j.data }
    } catch (e: any) { return { error: e.message } }
  }
  const { data, error } = existingId
    ? await supabase.from('rotators').update(payload).eq('id', existingId).select().single()
    : await supabase.from('rotators').insert(payload).select().single()
  return { data: data || undefined, error: error?.message }
}

export async function toggleRotatorActive(r: Rotator) {
  if (OFFLINE) { await api(`/rotators/${r.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !r.is_active }) }); return }
  await supabase.from('rotators').update({ is_active: !r.is_active }).eq('id', r.id)
}

export async function deleteRotatorById(id: string) {
  if (OFFLINE) { await api(`/rotators/${id}`, { method: 'DELETE' }); return }
  await supabase.from('rotators').delete().eq('id', id)
}

// ── Rotator Items ────────────────────────────────────────────
export async function listRotatorItems(rotatorId: string): Promise<RotatorItem[]> {
  if (OFFLINE) { const j = await api(`/rotator-items?rotator_id=${rotatorId}`); return j.data || [] }
  const { data } = await supabase.from('rotator_items').select('*, product:products(*)').eq('rotator_id', rotatorId).order('position')
  return (data as any) || []
}

export async function addRotatorItem(rotatorId: string, productId: string) {
  if (OFFLINE) { await api('/rotator-items', { method: 'POST', body: JSON.stringify({ rotator_id: rotatorId, product_id: productId }) }); return }
  const { data: existing } = await supabase.from('rotator_items').select('id').eq('rotator_id', rotatorId)
  const position = existing?.length || 0
  await supabase.from('rotator_items').insert({ rotator_id: rotatorId, product_id: productId, position, is_active: true })
}

export async function removeRotatorItem(itemId: string) {
  if (OFFLINE) { await api(`/rotator-items/${itemId}`, { method: 'DELETE' }); return }
  await supabase.from('rotator_items').delete().eq('id', itemId)
}

export async function reorderRotatorItems(rotatorId: string, orderedIds: string[]) {
  if (OFFLINE) { await api('/rotator-items/reorder', { method: 'POST', body: JSON.stringify({ rotator_id: rotatorId, order: orderedIds }) }); return }
  await Promise.all(orderedIds.map((id, pos) => supabase.from('rotator_items').update({ position: pos }).eq('id', id)))
}

// ── Upload logo/watermark ───────────────────────────────────
export async function uploadLogo(file: File): Promise<string | null> {
  if (OFFLINE) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/local/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const j = await res.json()
    return j.url || null
  }
  const path = `logos/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
  if (error || !data) return null
  const { data: pub } = supabase.storage.from('logos').getPublicUrl(data.path)
  return pub.publicUrl
}

// ── Overlay OBS ──────────────────────────────────────────────
export async function getRotatorForObs(rotatorIdOrSlug: string): Promise<{ rotator: Rotator | null; items: any[] }> {
  if (OFFLINE) {
    try {
      const j = await api(`/rotator-lookup/${rotatorIdOrSlug}`)
      return { rotator: j.rotator || null, items: j.items || [] }
    } catch { return { rotator: null, items: [] } }
  }
  let { data: rot } = await supabase.from('rotators').select('*').eq('slug', rotatorIdOrSlug).single()
  if (!rot) { const r = await supabase.from('rotators').select('*').eq('id', rotatorIdOrSlug).single(); rot = r.data }
  if (!rot) return { rotator: null, items: [] }
  const { data: its } = await supabase
    .from('rotator_items')
    .select('id, position, spotlight_duration, spotlight_active, product:products(*)')
    .eq('rotator_id', rot.id)
    .eq('is_active', true)
    .order('position')
  return { rotator: rot, items: (its as any) || [] }
}

// Tracking klik — TIDAK ADA di mode offline (sesuai permintaan: tanpa analytics/tracking).
export async function trackClick(productId: string, rotatorId: string, source: 'qr' | 'direct' | 'share' = 'qr') {
  if (OFFLINE) return
  await supabase.from('click_events').insert({ product_id: productId, rotator_id: rotatorId, source })
}

// ── Stats dashboard overview ─────────────────────────────────
export async function getDashboardStats() {
  if (OFFLINE) { return api('/stats') }
  const [{ count: totalProducts }, { count: activeProducts }, { count: totalRotators }, { count: clicksToday }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('rotators').select('*', { count: 'exact', head: true }),
    supabase.from('click_events').select('*', { count: 'exact', head: true })
      .gte('clicked_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])
  return {
    totalProducts: totalProducts ?? 0,
    activeProducts: activeProducts ?? 0,
    totalRotators: totalRotators ?? 0,
    clicksToday: clicksToday ?? 0,
  }
}
