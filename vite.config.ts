import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // ESSENCIAL PARA ELECTRON: Define arquivos relativos em vez de na raiz
  base: './', 
  
  server: {
    port: 5173,
    strictPort: true,
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Permite controlar quando atualizar, útil para apps.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // Faz o cache automático dessas extensões
      },
      // Estrutura do PWA
      manifest: {
        name: 'VittaCash',
        short_name: 'VittaCash',
        description: 'VittaCash - Seu aplicativo de finanças confiável',
        theme_color: '#ffffff', // Cor primária da barra de status no mobile
        background_color: '#ffffff', // Cor da tela de splash durante a abertura
        display: 'standalone', // Faz o app agir como nativo (oculta a barra do navegador)
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
            purpose: 'any maskable' // Fundamental para Android, permite que o SO recorte o ícone em círculos ou quadrados
          }
        ]
      }
    })
  ],
});
