const CACHE_NAME = 'factory-prep-v5'; // เปลี่ยนเป็น v5 เพื่อให้ sync กับการแก้ไข
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './style.css',
  './script.js',
  // เพิ่มไฟล์ screenshot ถ้ามี
  './screenshots/mobile-screenshot.png',
  './screenshots/desktop-screenshot.png'
];

// ติดตั้ง Service Worker และ cache ไฟล์ทั้งหมด
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v5...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] All files cached successfully');
        return self.skipWaiting(); // บังคับให้ service worker ใช้งานทันที
      })
      .catch(error => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Fetch event - ใช้ Cache First Strategy
self.addEventListener('fetch', event => {
  // ใช้เฉพาะกับ requests ที่เป็น GET เท่านั้น
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // ตรวจสอบว่า response ถูกต้อง
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response เพื่อเก็บใน cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(error => {
        console.error('[SW] Fetch failed:', error);
        // Return fallback page หรือ offline page ถ้ามี
        return caches.match('./index.html');
      })
  );
});

// ลบ cache เก่าเมื่อมีการ activate service worker ใหม่
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker v5...');
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] All old caches removed');
        return self.clients.claim(); // ให้ service worker ควบคุม clients ทั้งหมดทันที
      })
  );
});

// เพิ่ม Background Sync support (ถ้าต้องการ)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      // ทำงานที่ต้องการ sync ในพื้นหลัง
      performBackgroundSync()
    );
  }
});

// Function สำหรับ background sync
function performBackgroundSync() {
  return new Promise((resolve, reject) => {
    // ใส่ logic ที่ต้องการทำงานใน background
    console.log('[SW] Performing background sync...');
    resolve();
  });
}

// Push notification support (ถ้าต้องการ)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('[SW] Push notification received:', data);
    
    const options = {
      body: data.body || 'New notification from Factory Prep App',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'factory-prep-notification',
      requireInteraction: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Factory Prep App', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('./index.html')
  );
});