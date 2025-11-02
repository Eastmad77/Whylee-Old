/* service-worker.js — v9010 */
const CACHE = 'whylee-v9010';

self.addEventListener('install', (e) => {
  // Minimal warmup — index only. Static assets fetched on-demand.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/'])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Helper: strip querystring for cache lookups on static assets
function normalizeForCache(reqUrl) {
  try {
    const u = new URL(reqUrl);
    if (u.origin === self.location.origin &&
        (u.pathname.startsWith('/styles/') || u.pathname.startsWith('/scripts/'))) {
      u.search = ''; // ignore ?v=…
    }
    return u.toString();
  } catch {
    return reqUrl;
  }
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Don’t try to cache source maps
  if (url.pathname.endsWith('.map')) return;

  // Navigate requests: network-first, fallback to /
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Same-origin assets: cache-first with normalized key
  if (url.origin === self.location.origin &&
      (url.pathname.startsWith('/styles/') || url.pathname.startsWith('/scripts/') || url.pathname.startsWith('/media/'))) {
    const cacheKey = normalizeForCache(e.request.url);
    e.respondWith(
      caches.match(cacheKey).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(cacheKey, copy)).catch(()=>{});
          return resp;
        });
      })
    );
    return;
  }

  // Default: network, fallback to cache exact request if any
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
