import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabase } from '@/lib/supabase-middleware'

const PROTECTED = ['/dashboard', '/products', '/rotator', '/analytics']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return res

  try {
    const supabase = createMiddlewareSupabase(req, res)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|obs|p/).*)'],
}
