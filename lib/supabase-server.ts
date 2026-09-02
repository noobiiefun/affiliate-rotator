import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL      || 'http://localhost:54321'
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'offline-placeholder-anon-key'

export function createServerSupabase() {
  const cookieStore = cookies()
  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get(name: string)                        { return cookieStore.get(name)?.value },
      set(name: string, val: string, opt: any) { try { cookieStore.set({ name, value: val, ...opt }) } catch {} },
      remove(name: string, opt: any)           { try { cookieStore.set({ name, value: '', ...opt }) } catch {} },
    },
  })
}
