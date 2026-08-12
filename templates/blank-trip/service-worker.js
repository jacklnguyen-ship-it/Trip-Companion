const CACHE_NAME = 'trip-companion-blank-trip-v2';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './trip-config.js',
  './trip-data.json',
  './map-places.json',
  '../../engine/template-shell.css',
  '../../engine/template-shell.js',
  '../../engine/structured-trip.css',
  '../../engine/structured-trip.js',
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
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.indexOf('trip-companion-blank-trip-') === 0 && key !== CACHE_NAME;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(function () {
    return caches.match(event.request, { ignoreSearch: true });
  }));
});
