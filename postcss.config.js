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
          greedy: [
            /^ant-btn.*?/,
            /^ant-layout.*?/,
            /^ant-drawer.*?/,
            /^ant-modal.*?/,
            /^ant-card.*?/,
            /^ant-spin.*?/,
            /^ant-skeleton.*?/,
            /^ant-select.*?/,
            /^ant-tag.*?/,
            /^ant-space.*?/,
            /^ant-typography.*?/
          ],
          standard: ['html', 'body', 'ul', 'li', 'anticon']
        }
      }
    ]
  ]
}
