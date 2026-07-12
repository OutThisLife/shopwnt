import next from 'eslint-config-next'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...next,
  {
    ignores: ['.next/**', 'dist/**', 'node_modules/**']
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off'
    }
  }
]

export default config
