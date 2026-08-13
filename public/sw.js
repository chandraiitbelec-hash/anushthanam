// Minimal service worker: exists only to satisfy PWA installability criteria.
// Deliberately no offline caching strategy — site content updates hourly via
// ISR/unstable_cache (see CLAUDE.md), so a cache-first or stale-while-revalidate
// strategy here would risk serving stale Sheets-backed content. Every fetch
// passes straight through to the network.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
