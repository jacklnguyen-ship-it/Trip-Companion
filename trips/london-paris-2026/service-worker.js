const CACHE_NAME='trip-companion-london-paris-2026-phase1-1';
const CORE=[
  './','./index.html','./maria.html','./manifest.json','./manifest-maria.json',
  '../../engine/guide-map.css','../../engine/guide-map-v2.js','../../engine/home-intelligence.css','../../engine/home-intelligence.js',
  '../../engine/travel-readiness.css','../../engine/trip-tools.css','../../engine/trip-tools.js',
  '../../engine/claim-organizer.css','../../engine/claim-organizer.js',
  '../../engine/floating-shortcuts.css','../../engine/floating-shortcuts.js',
  '../../engine/private-vault.css','../../engine/private-vault.js',
  '../../engine/final-polish.css','../../engine/final-polish.js','../../engine/french-audio-v2.js',
  '../../engine/daily-transit.css','../../engine/daily-transit.js',
  '../../engine/packing-checklist.css','../../engine/packing-checklist.js',
  '../../engine/today-glance.css','../../engine/today-glance.js',
  '../../engine/quick-actions.js','../../engine/nav-upgrade.css',
  './map-places-index.json','./map-places-maria.json',
  '../../engine/leaflet/leaflet.js','../../engine/leaflet/leaflet.css',
  '../../engine/leaflet/images/marker-icon.png','../../engine/leaflet/images/marker-icon-2x.png','../../engine/leaflet/images/marker-shadow.png',
  '../../engine/leaflet/images/layers.png','../../engine/leaflet/images/layers-2x.png',
  './apple-touch-icon.png','./favicon-32.png','./icon-192.png','./icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.indexOf('trip-companion-london-paris-2026-')===0&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{
      var copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;
    }).catch(()=>caches.match(event.request).then(match=>match||caches.match(event.request.url.indexOf('maria.html')>-1?'./maria.html':'./index.html'))));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){var copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match(event.request,{ignoreSearch:true})));
});
