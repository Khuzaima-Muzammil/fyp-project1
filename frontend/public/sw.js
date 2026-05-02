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
  const url = event.request.url;

  // Do not intercept:
  // 1. API calls
  // 2. Cross-origin requests
  // 3. Vite internal requests (/@vite/client, etc.)
  // 4. HMR requests (containing ?t= or ?v=)
  // 5. Requests that are not http or https (e.g., chrome-extension://)
  if (
    url.includes('/api/') || 
    !url.startsWith(self.location.origin) ||
    url.includes('/@vite/') ||
    url.includes('/node_modules/') ||
    url.includes('?t=') ||
    url.includes('?v=') ||
    url.includes('manifest.json') ||
    !url.startsWith('http')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(err => {
          console.warn('SW fetch failed for:', url, err);
          // Return a fallback or just let it fail gracefully
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
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