// Replaces the worker that earlier installations registered here with scope "/" before the
// app moved to /app. That worker would keep answering every page with the old cached app, and
// it can only be updated through a script that exists, so this one removes its cache and itself.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil((async () => {
  await caches.delete(`workbox-precache-v2-${self.registration.scope}`);
  await self.registration.unregister();
  for (const client of await self.clients.matchAll({type: 'window'})) {
    client.navigate(client.url);
  }
})()));
