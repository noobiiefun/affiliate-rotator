import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Server client (untuk Server Components & Route Handlers) ──
// File ini HANYA boleh diimport dari server components (tidak ada 'use client')
export function createServerSupabase() {
  const cookieStore = cookies()
  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get(name)           { return cookieStore.get(name)?.value },
      set(name, val, opt) { try { cookieStore.set({ name, value: val, ...opt }) } catch {} },
      remove(name, opt)   { try { cookieStore.set({ name, value: '', ...opt }) } catch {} },
    },
  })
}
