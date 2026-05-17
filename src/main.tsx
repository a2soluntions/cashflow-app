import React from 'react'
import ReactDOM from 'react-dom/client'
import Vitta from './Vitta' // Referência única e exata
import './index.css'

// Desativa o Service Worker para evitar cache de versões antigas durante a transição
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Migração segura de localStorage para usuários antigos (VittaCash -> A2Finanças)
try {
  const oldKeys = [
    'vittacash_pro_categories',
    'vittacash_pro_budgets',
    'vittacash_pro_transactions',
    'vittacash_user_phone',
    'vittacash_machine_id',
    'vittacash_saved_key',
    'vittacash_debts_desktop',
    'vittacash_budgets',
    'vitta_cookie_consent',
    'vitta_debts'
  ];
  oldKeys.forEach(oldKey => {
    const value = localStorage.getItem(oldKey);
    if (value) {
      const newKey = oldKey.replace('vittacash', 'a2financas').replace('vitta_', 'a2financas_');
      if (!localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, value);
        console.log(`[Migration] Copying legacy data: ${oldKey} -> ${newKey}`);
      }
    }
  });
} catch (e) {
  console.warn('[Migration] LocalStorage migration failed:', e);
}

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