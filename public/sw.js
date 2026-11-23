const CACHE_NAME = 'biblia-rv1960-v23';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/styles.css?v=22',
  '/app.js?v=20',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/icon.svg'
];
const DATA_ASSET = '/data/rv1960.json?v=4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const oldKeys = keys.filter((k) => k !== CACHE_NAME);
      await Promise.all(oldKeys.map((k) => caches.delete(k)));
      await self.clients.claim();

      // Warm up Bible data in cache asynchronously without blocking SW activation
      try {
        const cache = await caches.open(CACHE_NAME);
        const existing = await cache.match(DATA_ASSET);
        if (!existing) {
          fetch(DATA_ASSET).then((res) => {
            if (res && res.status === 200) cache.put(DATA_ASSET, res);
          }).catch(() => {});
        }
      } catch (e) {}
    })()
  );
});

// Network-First strategy: always fetch fresh UTF-8 assets when online, fallback to cache offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  try {
    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;
  } catch (e) {}
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
        return undefined;
      })
  );
});
