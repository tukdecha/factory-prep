// ⚙️ service-worker.js – สำหรับแอป PWA เต็มรูปแบบ

const CACHE_NAME = 'factory-prep-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/lesson.html',
  '/interview.html',
  '/styles.css',
  '/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ✅ ติดตั้งและเก็บ cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// ♻️ ล้าง cache เก่าเมื่อ activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// ⚡ ดึงข้อมูลจาก cache ก่อน ถ้าไม่มีค่อยโหลดใหม่
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// 🔄 รองรับ background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncDataWithServer());
  }
});

async function syncDataWithServer() {
  // ตัวอย่าง: ส่งข้อมูลแบบออฟไลน์ไปยังเซิร์ฟเวอร์
  // รอให้คุณเพิ่มระบบจัดเก็บ localStorage / IndexedDB ที่นี่
  console.log('🔄 Syncing data with server...');
}

// 🔔 รองรับ Push Notification
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'Factory App', body: 'มีข้อมูลใหม่!' };
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
