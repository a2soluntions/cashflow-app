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

  optimizeDeps: {
    exclude: ['workbox-precaching'],
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
      filename: 'sw-v3.ts',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'A2 Mentor',
        short_name: 'A2 Mentor',
        description: 'A2 Mentor - Seu aplicativo de finanças confiável',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        id: 'a2mentor-v3',
        start_url: '/?mode=pwa',
        scope: '/',
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
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
