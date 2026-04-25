const CACHE_NAME = 'lumiere-v5';
const urlsToCache = [
  '/',
  '/index.html',
  // '/manifest.json', // Do NOT cache manifest.json to avoid syntax errors on corrupted cache
  '/vite.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Do not intercept API calls, cross-origin requests, or Vite HMR requests
  const url = new URL(event.request.url);
  if (
    url.pathname.includes('/api/') ||
    url.pathname.startsWith('/@vite/') ||
    url.search.includes('t=') || // Vite HMR timestamps
    !url.href.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
