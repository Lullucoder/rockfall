/* Rockfall Alert Service Worker */

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activated');
  return self.clients.claim();
});

// Utility: parse vibration pattern
function getVibrationPattern(data) {
  try {
    if (data?.vibrationPattern) {
      if (Array.isArray(data.vibrationPattern)) return data.vibrationPattern;
      if (typeof data.vibrationPattern === 'string') {
        const parsed = JSON.parse(data.vibrationPattern);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {}
  // Default fallback pattern
  return [200, 100, 200];
}

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[ServiceWorker] Push event with no data');
    return;
  }

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    console.error('[ServiceWorker] Failed to parse push payload:', e);
    return;
  }

  const title = payload.title || 'Rockfall Alert';
  const body = payload.body || 'New safety notification';
  const severity = payload.severity || 'medium';
  const vibration = getVibrationPattern(payload);

  const icon = '/vite.svg';
  const badge = '/vite.svg';

  const colorMap = {
    critical: '#dc2626',
    high: '#f59e0b',
    medium: '#3b82f6'
  };

  const notificationOptions = {
    body,
    icon,
    badge,
    data: {
      ...payload,
      receivedAt: Date.now()
    },
    requireInteraction: severity === 'critical',
    vibrate: vibration,
    actions: [
      { action: 'ack', title: 'Acknowledge' },
      { action: 'open', title: 'Open Dashboard' }
    ],
    timestamp: Date.now(),
    silent: false
  };

  event.waitUntil(
    (async () => {
      console.log('[ServiceWorker] Showing notification', payload);
      self.registration.showNotification(title, notificationOptions);
      // Also vibrate explicitly for some browsers
      try { self.registration.getNotifications().then(() => self.navigator?.vibrate && self.navigator.vibrate(vibration)); } catch (e) {}
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const targetUrl = '/';

  if (action === 'ack') {
    // Could send acknowledgement to server later
    console.log('[ServiceWorker] Alert acknowledged');
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'notification-open', data: event.notification.data });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[ServiceWorker] Push subscription change event');
  // In a future enhancement, re-subscribe and POST to server.
});
