import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Incluímos os dois arquivos aqui para garantir que carreguem
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'logo.png', 'icon.png'],
      manifest: {
        name: 'VittaCash',
        short_name: 'VittaCash',
        description: 'Saúde financeira para sua empresa',
        theme_color: '#000000', // Preto oficial da marca
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon.png', // <--- Use a versão QUADRADA (só o símbolo) aqui
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon.png', // <--- Versão quadrada de alta resolução
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Isso permite que o Android arredonde os cantos sem cortar o desenho
          }
        ]
      }
    })
  ],
});