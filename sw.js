// RUNNOW Service Worker - Auto-Cache-Busting & Clean Slate
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 항상 네트워크 최신 우선, 네트워크 실패 시만 캐시
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
