module.exports = require('next-compose-plugins')(
  [
    process.env.ANALYZE && [require('@next/bundle-analyzer')({ enabled: true })]
  ].filter(v => v),
  {
    images: {
      // disableStaticImages: true,
      domains: ['cdn.shopify.com'],
      minimumCacheTTL: 60,
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200]
    },

    poweredByHeader: false,
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
      styledComponents: true
    }
  }
)
