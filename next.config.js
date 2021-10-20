module.exports = require('next-compose-plugins')(
  [
    process.env.ANALYZE && [require('@next/bundle-analyzer')({ enabled: true })]
  ].filter(v => v),
  {
    images: {
      disableStaticImages: true,
      domains: ['cdn.shopify.com'],
      minimumCacheTTL: 60
    },

    poweredByHeader: false,
    reactStrictMode: true
  }
)
