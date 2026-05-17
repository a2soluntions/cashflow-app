/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Limpa caches antigos e faz o precache dos assets gerados pelo build
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

interface PushData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

// --- LISTENER DE NOTIFICAÇÕES PUSH ---
self.addEventListener('push', (event) => {
  console.log('[SW] Push Recebido:', event);

  let data: PushData = { title: 'A2Finanças', body: 'Você tem uma nova notificação!', icon: '/pwa-192x192.png' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options: any = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2',
      url: data.url || '/'
    },
    actions: [
      { action: 'explore', title: 'Ver agora' },
      { action: 'close', title: 'Fechar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// --- LISTENER DE CLIQUE NA NOTIFICAÇÃO ---
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clique na Notificação detectado.');
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma aba aberta, foca nela e navega
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Caso contrário, abre uma nova aba
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
