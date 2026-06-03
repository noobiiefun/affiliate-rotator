/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // Allow semua image dari URL external
    ],
  },
}

module.exports = nextConfig
