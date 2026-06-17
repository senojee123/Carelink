const CACHE_NAME = 'carelink-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests, skip API calls
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  const url = new URL(event.request.url);

  // Network-first strategy for HTML documents/navigation
  // This ensures we always get the latest built HTML with updated asset hashes
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first (falling back to network) for static assets, but with protective checks
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          const contentType = response.headers.get('content-type') || '';
          const isAsset = url.pathname.includes('/assets/');
          const isHtmlResponse = contentType.includes('text/html');

          // CRITICAL: Do NOT cache if it's a static asset request but we received HTML.
          // This happens when a file is missing/404 on the server and the server rewrites it to index.html.
          if (response.ok && !(isAsset && isHtmlResponse)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // If offline and request fails, return cached if exists, or basic network error response
          return cached || new Response('Offline resource not found', { status: 404 });
        });

      // If we have a cached version and it's NOT a corrupted HTML response for a JS asset, return it
      if (cached) {
        const isAsset = url.pathname.includes('/assets/');
        // If it's a JS/CSS asset but the cached response is HTML, bypass cache and fetch from network
        const cachedContentType = cached.headers.get('content-type') || '';
        if (isAsset && cachedContentType.includes('text/html')) {
          return fetched;
        }
        return cached;
      }

      return fetched;
    })
  );
});
