import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = 'BKhEP0ahNoLA3eOKmSGAR93sLE6GVWyh6VcYyo2wpdIUN4P6Gkb2OqmSHayw1rz4Jm7ZEk6SNAHowxYlCfkqfKs';

/**
 * Tenta obter o Service Worker ativo.
 * Se não houver SW registrado ou ativo, retorna null ao invés de travar.
 */
async function getActiveServiceWorker(timeoutMs = 8000): Promise<ServiceWorkerRegistration | null> {
  // Verifica se o navegador suporta SW
  if (!('serviceWorker' in navigator)) return null;

  // Verifica se já existe algum SW registrado
  const registrations = await navigator.serviceWorker.getRegistrations();
  if (registrations.length === 0) {
    console.warn('[Push] Nenhum Service Worker registrado.');
    return null;
  }

  // Aguarda o SW ficar ativo com timeout seguro
  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), timeoutMs)
      ),
    ]);
    return registration;
  } catch {
    return null;
  }
}

export function usePushNotifications(userId: string | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [loading, setLoading] = useState(false);

  // Estado de mensagem para o componente mostrar no Toast (sem alert nativo)
  const [lastMessage, setLastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  // Limpa a mensagem após 5s
  useEffect(() => {
    if (lastMessage) {
      const timer = setTimeout(() => setLastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastMessage]);

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

  const subscribeUser = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setLastMessage({ text: 'Faça login antes de ativar notificações.', type: 'error' });
      return false;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setLastMessage({ text: 'Seu navegador não suporta notificações Push.', type: 'error' });
      return false;
    }

    if (typeof Notification === 'undefined') {
      setLastMessage({ text: 'Notificações não disponíveis neste navegador.', type: 'error' });
      return false;
    }

    setLoading(true);
    setLastMessage(null);

    try {
      // 1. Pede permissão ANTES de verificar o SW (mais rápido para o usuário)
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setLastMessage({ text: 'Permissão de notificação negada. Verifique as configurações do navegador.', type: 'error' });
        return false;
      }

      // 2. Obtém o Service Worker (com timeout seguro, sem loop)
      const registration = await getActiveServiceWorker(8000);

      if (!registration) {
        setLastMessage({ 
          text: 'Service Worker não está ativo. Recarregue a página (Ctrl+Shift+R) e tente novamente.', 
          type: 'error' 
        });
        return false;
      }

      // 3. Inscreve no push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Salva no servidor
      await fetch('/api/save-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription }),
      }).catch(err => {
        console.warn('[Push] API não encontrada, subscription salva apenas no navegador.', err);
      });

      setLastMessage({ text: 'Notificações ativadas com sucesso!', type: 'success' });
      console.log('[Push] Sucesso ao configurar notificações!');
      return true;
    } catch (error: any) {
      console.error('[Push] Erro:', error);
      setLastMessage({ 
        text: error.message || 'Falha ao ativar notificações.', 
        type: 'error' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const unsubscribeUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const registration = await getActiveServiceWorker(5000);
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch('/api/save-subscription', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          }).catch(() => {});
        }
      }
      setPermission('default');
      setLastMessage({ text: 'Notificações desativadas.', type: 'success' });
    } catch (error) {
      console.error('[Push] Erro ao desinscrever:', error);
      setLastMessage({ text: 'Erro ao desativar notificações.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { permission, subscribeUser, unsubscribeUser, loading, lastMessage };
}
