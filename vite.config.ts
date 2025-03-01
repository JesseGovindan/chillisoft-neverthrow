import path from 'path'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: './build',
  },
  test: {
    // environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // include: ['./src/**/*.test.tsx'],
    globals: true,
    poolOptions: {
      threads: {
        maxThreads: 12,
      },
    },
  },
})
