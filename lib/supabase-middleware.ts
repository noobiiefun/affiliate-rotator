import { createServerClient } from '@supabase/ssr'
import { type NextRequest, type NextResponse } from 'next/server'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createMiddlewareSupabase(req: NextRequest, res: NextResponse) {
  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get(name: string)                        { return req.cookies.get(name)?.value },
      set(name: string, val: string, opt: any) {
        req.cookies.set({ name, value: val, ...opt })
        res.cookies.set({ name, value: val, ...opt })
      },
      remove(name: string, opt: any)           {
        req.cookies.set({ name, value: '', ...opt })
        res.cookies.set({ name, value: '', ...opt })
      },
    },
  })
}
