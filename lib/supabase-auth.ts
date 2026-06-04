import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client ONLY (untuk 'use client' components) ──
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnon)
}
