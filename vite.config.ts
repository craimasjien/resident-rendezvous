import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Firebase SDK into its own chunk
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Separate React and React DOM
          'react-vendor': ['react', 'react-dom'],
          // Separate TanStack Router
          'tanstack-router': ['@tanstack/react-router'],
          // Separate TanStack Query
          'tanstack-query': ['@tanstack/react-query'],
        },
      },
    },
    // Increase chunk size warning limit to 600KB (from default 500KB)
    // This gives some buffer while still warning about very large chunks
    chunkSizeWarningLimit: 600,
  },
})

