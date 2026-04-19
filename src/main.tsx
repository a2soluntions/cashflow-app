import React from 'react'
import ReactDOM from 'react-dom/client'
import Vitta from './Vitta' // Referência única e exata
import './index.css'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Vitta />
  </React.StrictMode>,
)