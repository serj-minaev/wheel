// Service worker для PWA
const CACHE_NAME = 'wheel-of-life-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

// Установка service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Пытаемся добавить файлы в кеш, но не блокируем установку при ошибках
        return cache.addAll(urlsToCache).catch((err) => {
          console.log('Ошибка кеширования:', err);
        });
      })
  );
  // Принудительно активируем новый service worker
  self.skipWaiting();
});

// Активация service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Берем контроль над всеми страницами сразу
  return self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем из кеша или делаем сетевой запрос
        return response || fetch(event.request);
      })
  );
});

