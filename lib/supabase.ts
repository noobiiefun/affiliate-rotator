import { createClient } from '@supabase/supabase-js'

// Fallback dummy — supaya tidak crash saat mode offline (env Supabase memang
// sengaja kosong). Client ini tidak pernah benar-benar dipanggil saat
// OFFLINE=true karena semua pemanggilnya sudah dibungkus lib/data.ts.
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL      || 'http://localhost:54321'
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'offline-placeholder-anon-key'

// Client sederhana untuk komponen yang belum pakai auth (OBS overlay, landing page)
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Server client dengan service role (untuk server components tanpa auth)
export const createServerSupabaseClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return supabase
}
