import React from 'react'
import ReactDOM from 'react-dom/client'
import Vitta from './Vitta' // Referência única e exata
import './index.css'

// Limpeza inteligente e direcionada de cache/Service Workers legados (VittaCash/A2Finanças)
const SW_CLEAN_VERSION = 'a2mentor_sw_clean_v4';
if (localStorage.getItem(SW_CLEAN_VERSION) !== 'true') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        const scriptURL = registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL || '';
        if (scriptURL && !scriptURL.includes('sw-v3.js')) {
          registration.unregister().then(() => {
            console.log('[Migration] Unregistered stale service worker:', scriptURL);
          });
        }
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }
  localStorage.setItem(SW_CLEAN_VERSION, 'true');
}


// Migração segura de localStorage para usuários antigos (VittaCash / A2Finanças -> A2 Mentor)
try {
  const keysToMigrate = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keysToMigrate.push(key);
  }

  keysToMigrate.forEach(oldKey => {
    let matched = false;
    let newKey = oldKey;
    if (oldKey.startsWith('vittacash_')) {
      newKey = oldKey.replace('vittacash', 'a2mentor');
      matched = true;
    } else if (oldKey.startsWith('vitta_')) {
      newKey = oldKey.replace('vitta_', 'a2mentor_');
      matched = true;
    } else if (oldKey.startsWith('a2financas_')) {
      newKey = oldKey.replace('a2financas', 'a2mentor');
      matched = true;
    }

    if (matched && newKey !== oldKey) {
      const value = localStorage.getItem(oldKey);
      if (value && !localStorage.getItem(newKey)) {
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