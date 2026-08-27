// Kill switch: this app no longer uses a service worker. This file exists
// only so browsers that already have the old (vite-plugin-pwa/Workbox)
// worker registered at this scope pick it up as an update, activate
// immediately, wipe out the old precache, unregister themselves, and
// reload any open tabs onto plain network fetches.
//
// Browsers cap service worker script caching at 24h regardless of
// Cache-Control, and re-check on navigation, so already-installed clients
// self-heal without the user clearing site data. New visitors never
// register a service worker at all, so this file is irrelevant to them.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
