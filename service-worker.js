
const CACHE_NAME = "factory-prep-cache-v1";
const urlsToCache = [
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// ติดตั้ง service worker และแคชไฟล์
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// ใช้งาน service worker และตอบกลับจาก cache
self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
