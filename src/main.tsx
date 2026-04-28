import React from 'react'
import ReactDOM from 'react-dom/client'
import Vitta from './Vitta' // Referência única e exata
import './index.css'

// Importa a função virtual gerada automagicamente pelo vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Registro do Service Worker (atualização automática sem popup nativo)
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[VittaCash] Nova versão detectada — atualizando automaticamente...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[VittaCash] App pronto para uso offline!');
  },
});

import { AuthProvider } from './components/AuthProvider'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Vitta />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)