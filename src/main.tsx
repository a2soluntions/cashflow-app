import React from 'react'
import ReactDOM from 'react-dom/client'
import Vitta from './Vitta' // Referência única e exata
import './index.css'

// 💣 BOMBA DE CACHE: OBRIGA O NAVEGADOR A LIMPAR VERSÕES ANTIGAS DO VITTA CASH
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Cache antigo eliminado para carregar nova versão SaaS!');
    }
  });
}

// Importa a função virtual gerada automagicamente pelo vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Registro do Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Alerta nativo simples. Em um sistema robusto, isso poderia acionar o estado 
    // de um Toast/Modal para atualizar ("Uma nova versão está disponível! Atualizar agora?")
    const reload = confirm('Existe uma nova versão do VittaCash disponível. Deseja atualizar agora?');
    if (reload) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('O app VittaCash já pode ser acessado offline!');
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