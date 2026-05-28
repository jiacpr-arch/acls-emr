/// <reference lib="webworker" />
// Custom service worker for ACLS/BLS app.
// Handles: workbox precaching (vite-plugin-pwa injects manifest), web push, notification click.

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// __WB_MANIFEST is injected by vite-plugin-pwa (injectManifest strategy)
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Web push handler
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'ข่าวใหม่', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'ข่าวใหม่';
  const options = {
    body: data.body || '',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: data.tag || 'news',
    renotify: true,
    data: { url: data.url || '/news' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/news';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // If a tab is already open, focus it and navigate
      for (const client of list) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(url);
          return;
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
