const CACHE_NAME = 'trip-companion-blank-trip-v1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './trip-config.js',
  './map-places.json',
  '../../engine/template-shell.css',
  '../../engine/template-shell.js',
  '../../favicon-32.png',
  '../../icon-192.png',
  '../../icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(CORE);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(function () {
    return caches.match(event.request, { ignoreSearch: true });
  }));
});
