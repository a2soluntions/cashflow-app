import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ESSENCIAL PARA ELECTRON:
  // Define que os caminhos dos arquivos (js, css, imagens) são relativos.
  // Sem isso, o .exe procura em "/assets" (raiz do C:) em vez de na pasta do app.
  base: './',

  build: {
    // Garante que a pasta de saída seja 'dist', que é o padrão que o Electron Builder procura
    outDir: 'dist',
    emptyOutDir: true,
  }
});