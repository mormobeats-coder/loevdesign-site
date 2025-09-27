// Minimal no-op Service Worker to avoid 404 and enable future enhancements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch (no caching by default)
self.addEventListener('fetch', () => {});
const CACHE_NAME = 'tina-static-v26';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/styles.css?v=25',
  '/assets/js/main.js?v=10',
  '/assets/img/logo.svg',
  '/assets/img/favicon.svg?v=25'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first to avoid stale assets/HTML
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req))
  );
});

