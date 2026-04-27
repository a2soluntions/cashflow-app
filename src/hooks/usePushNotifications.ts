import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const VAPID_PUBLIC_KEY = 'BKhEP0ahNoLA3eOKmSGAR93sLE6GVWyh6VcYyo2wpdIUN4P6Gkb2OqmSHayw1rz4Jm7ZEk6SNAHowxYlCfkqfKs';

export function usePushNotifications(userId: string | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeUser = async () => {
    if (!userId) {
      console.warn('[Push] ID do usuário não disponível.');
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('[Push] Push não suportado neste navegador.');
      alert('Seu navegador não suporta notificações Push.');
      return;
    }

    setLoading(true);
    try {
      // Timeout para evitar loop infinito caso o Service Worker trave
      const swPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao aguardar Service Worker')), 5000)
      );

      const registration = await Promise.race([swPromise, timeoutPromise]) as ServiceWorkerRegistration;
      
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Permissão negada pelo usuário.');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Se falhar o fetch (ex: ambiente local sem API), pelo menos paramos o loading
      const response = await fetch('/api/save-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription }),
      }).catch(err => {
        console.warn('[Push] API local não encontrada ou offline, mas subscription foi gerada.', err);
        return { ok: true }; // Fallback para não travar o UI
      });

      console.log('[Push] Sucesso ao configurar notificações!');
      return true;
    } catch (error: any) {
      console.error('[Push] Erro:', error);
      alert(`Erro nas Notificações: ${error.message || 'Falha desconhecida'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeUser = async () => {
    if (!userId) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove do Supabase
        await fetch('/api/save-subscription', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        
        console.log('[Push] Usuário desinscrito.');
      }
    } catch (error) {
      console.error('[Push] Erro ao desinscrever:', error);
    }
  };

  return { permission, subscribeUser, unsubscribeUser, loading };
}
