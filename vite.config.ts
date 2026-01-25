import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'CashFlow - Gestão Financeira',
        short_name: 'CashFlow',
        description: 'Seu controle financeiro inteligente e moderno.',
        theme_color: '#0f172a', // Cor do modo escuro
        background_color: '#0f172a',
        display: 'standalone', // Remove a barra do navegador
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.svg', // Usa o arquivo que criamos
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});