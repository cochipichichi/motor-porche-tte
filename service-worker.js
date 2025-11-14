
const CACHE_NAME = 'ttepo1-xr-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './assets/img/porsche_tte_po1_hero.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/models/motor_porsche_tte_po1.glb',
  './viewer3D/tte-po1-3d.html',
  './viewerAR/tte-po1-ar.html',
  './viewerVR/tte-po1-vr.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});
