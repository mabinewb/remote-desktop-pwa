'use strict';
// Installation support only. Never cache Google login or remote session traffic.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  if (new URL(event.request.url).origin === self.location.origin) {
    event.respondWith(fetch(event.request));
  }
});
