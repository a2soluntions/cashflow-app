/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Limpa caches antigos e faz o precache dos assets gerados pelo build
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Fallback manual para requisições de navegação (evita tela em branco no celular ao abrir a raiz /)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') as Promise<Response>;
      })
    );
  }
});

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deletando cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
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

  let data: PushData = { title: 'A2 Mentor', body: 'Você tem uma nova notificação!', icon: '/pwa-192x192.png' };
  
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
      primaryKey: '3',
      url: data.url || '/?mode=pwa'
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

  const urlToOpen = event.notification.data.url || '/?mode=pwa';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
