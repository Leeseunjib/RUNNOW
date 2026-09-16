const fs = require('fs');

const htmlPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 캐시 완전 퍼지 스크립트
const cachePurgeScript = `  <script>
    // [CRITICAL] 서비스워커 구버전 캐시 강제 무효화 및 클리어
    (function() {
      const CURRENT_APP_VERSION = 'v8.4_laps_pet_force_clean';
      const storedVer = localStorage.getItem('RUNNOW_APP_VERSION');
      if (storedVer !== CURRENT_APP_VERSION) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let reg of registrations) {
              reg.unregister();
            }
          });
        }
        if ('caches' in window) {
          caches.keys().then(function(names) {
            for (let name of names) {
              caches.delete(name);
            }
          });
        }
        localStorage.setItem('RUNNOW_APP_VERSION', CURRENT_APP_VERSION);
        // 캐시 날리고 깨끗한 최신 리소스로 1회 강제 리로드
        if (storedVer) {
          window.location.reload(true);
        }
      }
    })();
  </script>
`;

if (!html.includes('v8.4_laps_pet_force_clean')) {
  // <head> 바로 뒤에 삽입
  html = html.replace('<head>', '<head>\n' + cachePurgeScript);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('SUCCESS: Injected cache purge script into index.html');
} else {
  console.log('Already injected');
}

// sw.js 수정: 모든 캐시 삭제 및 통과
const swPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\sw.js';
let sw = `// RUNNOW Service Worker - Auto-Cache-Busting & Clean Slate
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
`;
fs.writeFileSync(swPath, sw, 'utf8');
console.log('SUCCESS: Overwritten sw.js with clean slate version');

// sandbox legacy_web으로 복사
const htmlPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\index.html';
const swPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\sw.js';
fs.writeFileSync(htmlPath2, html, 'utf8');
fs.writeFileSync(swPath2, sw, 'utf8');
console.log('SUCCESS: Synced to legacy_web');
