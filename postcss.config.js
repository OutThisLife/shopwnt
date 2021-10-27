module.exports = {
  plugins: [
    'postcss-flexbugs-fixes',
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009'
        },
        features: {
          'custom-properties': false
        },
        stage: 3
      }
    ],
    [
      '@fullhuman/postcss-purgecss',
      {
        content: ['./src/components/**/*.{tsx}', './src/pages/*.{tsx}'],
        defaultExtractor: s => s.match(/([A-z0-9-]+)(?= {)/g) || [],
        safelist: {
          standard: ['html', 'body']
        }
      }
    ]
  ]
}
