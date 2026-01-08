// Firebase Messaging Service Worker
// This handles push notifications when the app is in the background

// Import Firebase scripts (use compat for service worker)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase config will be passed via the main app
// For now, we initialize with empty config and update when message is received
let firebaseConfig = null;

// Listen for config from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    initializeFirebase();
  }
});

function initializeFirebase() {
  if (!firebaseConfig || firebase.apps.length > 0) return;

  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[FCM SW] Background message received:', payload);

      const notificationTitle = payload.notification?.title || 'Pratyaksha';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        tag: payload.data?.tag || 'pratyaksha-notification',
        data: payload.data,
        actions: getNotificationActions(payload.data?.type),
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    console.log('[FCM SW] Firebase initialized successfully');
  } catch (error) {
    console.error('[FCM SW] Failed to initialize Firebase:', error);
  }
}

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'daily_reminder':
      return [
        { action: 'open', title: 'Write Entry' },
        { action: 'snooze', title: 'Remind Later' },
      ];
    case 'streak_at_risk':
      return [
        { action: 'open', title: 'Save My Streak' },
        { action: 'dismiss', title: 'Dismiss' },
      ];
    case 'weekly_summary':
      return [
        { action: 'open', title: 'View Insights' },
      ];
    default:
      return [];
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked:', event.action);

  event.notification.close();

  // Determine where to navigate based on action
  let targetUrl = '/';

  if (event.action === 'open' || !event.action) {
    const notificationType = event.notification.data?.type;

    switch (notificationType) {
      case 'daily_reminder':
        targetUrl = '/logs?new=true'; // Open logs with new entry modal
        break;
      case 'streak_at_risk':
        targetUrl = '/logs?new=true';
        break;
      case 'weekly_summary':
        targetUrl = '/dashboard?tab=insights';
        break;
      default:
        targetUrl = '/dashboard';
    }
  } else if (event.action === 'snooze') {
    // Snooze action - we could trigger a re-notification after some time
    // For now, just dismiss
    return;
  } else if (event.action === 'dismiss') {
    return;
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle push events directly (fallback)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    console.log('[FCM SW] Push event received:', payload);

    // If Firebase messaging doesn't handle it, show notification manually
    if (payload.notification) {
      const notificationTitle = payload.notification.title || 'Pratyaksha';
      const notificationOptions = {
        body: payload.notification.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: payload.data,
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    }
  } catch (error) {
    console.error('[FCM SW] Push event error:', error);
  }
});
