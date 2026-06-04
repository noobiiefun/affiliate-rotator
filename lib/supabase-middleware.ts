import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Middleware client (pakai request/response) ──
export function createMiddlewareSupabase(req: NextRequest, res: NextResponse) {
  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get(name)           { return req.cookies.get(name)?.value },
      set(name, val, opt) {
        req.cookies.set({ name, value: val, ...opt })
        res.cookies.set({ name, value: val, ...opt })
      },
      remove(name, opt)   {
        req.cookies.set({ name, value: '', ...opt })
        res.cookies.set({ name, value: '', ...opt })
      },
    },
  })
}
