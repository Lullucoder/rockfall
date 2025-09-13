import { useState, useCallback } from 'react';

interface PushState {
  permission: NotificationPermission;
  supported: boolean;
  subscribed: boolean;
  loading: boolean;
  error: string | null;
  subscription: PushSubscription | null;
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export const usePushNotifications = (backendBaseUrl: string, apiKey?: string, deviceId?: string) => {
  const [state, setState] = useState<PushState>({
    permission: Notification.permission,
    supported: 'serviceWorker' in navigator && 'PushManager' in window,
    subscribed: false,
    loading: false,
    error: null,
    subscription: null
  });

  const registerServiceWorker = useCallback(async () => {
    if (!state.supported) throw new Error('Push not supported in this browser');
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  }, [state.supported]);

  const getPublicKey = useCallback(async () => {
    const res = await fetch(`${backendBaseUrl}/api/devices/push-public-key`, {
      headers: apiKey ? { 'X-API-Key': apiKey } : {}
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed fetching public key');
    return json.publicKey as string;
  }, [backendBaseUrl, apiKey]);

  const subscribe = useCallback(async () => {
    try {
      setState(s => ({ ...s, loading: true, error: null }));

      if (Notification.permission === 'denied') throw new Error('Notifications blocked');
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') throw new Error('Permission not granted');
      }

      const reg = await registerServiceWorker();
      const publicKey = await getPublicKey();

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setState(s => ({ ...s, subscribed: true, subscription: existing, permission: Notification.permission }));
        return existing;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      setState(s => ({ ...s, subscription: sub, subscribed: true, permission: Notification.permission }));

      // Send to backend
      if (deviceId) {
        await fetch(`${backendBaseUrl}/api/devices/${deviceId}/subscribe`, {
          method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(apiKey ? { 'X-API-Key': apiKey } : {})
            },
            body: JSON.stringify(sub)
        });
      }

      return sub;

    } catch (err: any) {
      console.error('Push subscription failed:', err);
      setState(s => ({ ...s, error: err.message || 'Subscription failed' }));
      throw err;
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, [apiKey, backendBaseUrl, deviceId, getPublicKey, registerServiceWorker]);

  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return;
    await state.subscription.unsubscribe();
    setState(s => ({ ...s, subscribed: false, subscription: null }));
  }, [state.subscription]);

  return {
    ...state,
    subscribe,
    unsubscribe
  };
};
