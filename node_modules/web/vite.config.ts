import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'animations': ['framer-motion'],
          'utils': ['lodash', 'axios'],
        }
      }
    },
    // Optimize build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
