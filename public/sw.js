self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through to network
});

// Handle push notification events
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Kaivu Order Update';
    const options = {
      body: data.body || 'Your order status has been updated.',
      icon: data.icon || '/images/menu/burger-classic.jpg',
      badge: '/images/menu/burger-classic.jpg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/orders'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error displaying push notification:', err);
    // Fallback if data is text instead of JSON
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Kaivu Update', {
        body: text,
        icon: '/images/menu/burger-classic.jpg',
        badge: '/images/menu/burger-classic.jpg',
        data: { url: '/orders' }
      })
    );
  }
});

// Handle notification click to open the app page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this app
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
