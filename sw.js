// RUNNOW Service Worker (Network-First with Auto-Cache-Busting)
const CACHE_NAME = 'runnow-v3.4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const skipAi = url.origin !== self.location.origin
    || event.request.destination === 'wasm'
    || /\.(wasm|task|tflite)$/i.test(url.pathname)
    || /mediapipe|jsdelivr|unpkg|googleapis|gstatic/i.test(url.href);

  // 관절 모델·WASM은 워커가 가로채면 폰에서 로드가 깨집니다.
  if (skipAi) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => networkResponse)
      .catch(() => caches.match(event.request))
  );
});
