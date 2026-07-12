const {
  NODE_ENV = 'development',
  VERCEL_ENV = NODE_ENV,
  VERCEL_URL = 'localhost:3000',
  HOSTNAME = `http${/local/.test(VERCEL_URL) ? '' : 's'}://${VERCEL_URL}`
} = process.env

const isProd = VERCEL_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['@apollo/server'],

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**.shopify.com' }]
  },

  async headers() {
    const security = [
      { key: 'X-Host', value: HOSTNAME },
      { key: 'X-Robots-Tag', value: isProd ? 'all' : 'none' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Download-Options', value: 'noopen' },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      }
    ]

    if (isProd) {
      security.push({
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self' data: https:",
          "font-src 'self' data: https:",
          "frame-src 'self' https:",
          "img-src 'self' data: https:",
          "manifest-src 'self'",
          "object-src 'none'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
          "style-src 'self' 'unsafe-inline' https:"
        ].join('; ')
      })
    }

    return [{ source: '/:path*', headers: security }]
  }
}

export default nextConfig
