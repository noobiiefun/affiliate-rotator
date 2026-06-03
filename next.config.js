/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Security headers via Next.js
  async headers() {
    return [
      {
        // Semua halaman kecuali /obs
        source: '/((?!obs).*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control',   value: 'on' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Halaman OBS boleh di-iframe (untuk OBS Browser Source)
        source: '/obs/:path*',
        headers: [
          { key: 'X-Frame-Options',        value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
    ]
  },

  // Rate limit via rewrites (basic)
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
