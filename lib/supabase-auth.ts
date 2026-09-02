import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL      || 'http://localhost:54321'
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'offline-placeholder-anon-key'

// ── Browser client ONLY (untuk 'use client' components) ──
// Catatan: di mode offline fungsi ini tidak pernah dipanggil (lihat
// app/(dashboard)/layout.tsx), nilai fallback di atas cuma jaga-jaga
// supaya import module ini tidak melempar error.
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnon)
}
