import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Carrom Tracker',
        short_name: 'Carrom',
        description: 'Track your carrom matches and statistics',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/vite.svg', // Update with your icon
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined // Remove manual chunk splitting
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})