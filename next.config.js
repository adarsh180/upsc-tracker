/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    formats: ['image/webp', 'image/avif']
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.groq.com;"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig