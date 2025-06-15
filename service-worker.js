const CACHE_NAME = 'factory-prep-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error('Cache addAll error:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // สำหรับการกดภายใน SPA หรือเปิดหน้าตรง
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
  } else {
    // สำหรับ resource อื่นๆ (ภาพ, js, json)
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});
