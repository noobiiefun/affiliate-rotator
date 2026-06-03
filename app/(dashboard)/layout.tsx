'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, RotateCcw, BarChart2, Tv2, ChevronRight, LogOut, User } from 'lucide-react'
import { createBrowserSupabase } from '@/lib/supabase-auth'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/dashboard',  label: 'Overview',   icon: LayoutDashboard },
  { href: '/products',   label: 'Produk',     icon: Package },
  { href: '/rotator',    label: 'Rotator',    icon: RotateCcw },
  { href: '/analytics',  label: 'Analytics',  icon: BarChart2 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createBrowserSupabase()
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email || '')
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-full z-10">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <Tv2 size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 leading-none">Affiliate</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Rotator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-2">Menu</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-3 border-t border-gray-200 space-y-1">
          {email && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <User size={12} className="text-green-700" />
              </div>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
