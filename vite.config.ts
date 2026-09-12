import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { visualizer } from 'rollup-plugin-visualizer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: 'client',
  resolve: {
    alias: {
      '@/__tests__': path.resolve(__dirname, 'tests/unit'),
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    ...(process.env.ANALYZE ? [visualizer({ open: false, gzipSize: true, brotliSize: true, template: 'raw-data', filename: './stats.json' })] : []),
  ],
  define: {
    'import.meta.vitest': 'undefined',
  },
  build: {
    outDir: '../dist',
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'vendor-react'
          }

          if (
            id.includes('/src/lib/data/') ||
            id.includes('\\src\\lib\\data\\') ||
            id.endsWith('/src/lib/data/index.ts') ||
            id.endsWith('\\src\\lib\\data\\index.ts') ||
            id.includes('/src/lib/mocks') ||
            id.includes('\\src\\lib\\mocks')
          ) {
            return 'data-mock'
          }

          if (
            id.includes('/src/lib/translations/') ||
            id.includes('\\src\\lib\\translations\\')
          ) {
            return 'translations'
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['@exodus/bytes', 'jsdom']
      }
    },
    setupFiles: path.resolve(__dirname, 'tests/unit/setup/setup.ts'),
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],
    include: ['../tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'e2e/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'tests/**',
        '**/index.ts',
        '**/types.ts',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.test-d.ts',
        '**/*.json',
      ],
    },
  },
})
