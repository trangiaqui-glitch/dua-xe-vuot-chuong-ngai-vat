/* Service worker — cho phép chơi offline và cài game như một ứng dụng.
   Chiến lược: "mạng trước, cache dự phòng" cho file của game => luôn nhận bản mới khi có mạng,
   mất mạng vẫn chơi được. Không động tới yêu cầu tới Supabase hay tên miền khác.
   Khi sửa code, tăng CACHE_VERSION để dọn cache cũ. */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `be-dua-xe-${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './config.js',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())        // thiếu 1 file cũng không làm hỏng việc cài đặt
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('be-dua-xe-') && k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // chỉ xử lý file của chính game

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
      )
  );
});
