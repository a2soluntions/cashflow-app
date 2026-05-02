import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // PRODUÇÃO (Vercel/PWA): '/' | ELECTRON: './'
  base: process.env.ELECTRON_BUILD === 'true' ? './' : '/',

  server: {
    port: 5173,
    strictPort: true,
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-lucide': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  },

  plugins: [
    react(),
      VitePWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw-v2-1.ts',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'VittaCash',
        short_name: 'VittaCash',
        description: 'VittaCash - Seu aplicativo de finanças confiável',
        theme_color: '#0a0a0c',
        background_color: '#0a0a0c',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
