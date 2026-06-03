'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tv2, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { createBrowserSupabase } from '@/lib/supabase-auth'

export default function LoginPage() {
  const router      = useRouter()
  const params      = useSearchParams()
  const next        = params.get('next') || '/dashboard'
  const supabase    = createBrowserSupabase()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // Kalau sudah login, redirect langsung
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(next)
    })
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    router.replace(next)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Tv2 size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Affiliate Rotator</h1>
        <p className="text-gray-500 text-sm mt-1">Masuk ke dashboard admin</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@email.com"
              required
              autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Masuk...</>
              : <><LogIn size={16} /> Masuk</>
            }
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700 font-medium mb-1">Belum punya akun admin?</p>
        <p className="text-xs text-blue-600">
          Buka Supabase → Authentication → Users → Add user.
          Gunakan email & password yang sama di sini.
        </p>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Affiliate Rotator · Dashboard Admin
      </p>
    </div>
  )
}
