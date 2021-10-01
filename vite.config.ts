import reactRefresh from '@vitejs/plugin-react-refresh'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  alias: {
    '~': resolve(__dirname, 'src')
  },
  base: '/',
  build: {
    outDir: resolve(__dirname, 'dist')
  },
  plugins: [tsconfigPaths(), reactRefresh()],
  root: resolve(__dirname, 'src')
})
