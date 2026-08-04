const CACHE_NAME='trip-companion-20260804-1';
const CORE=[
  './','./index.html','./maria.html','./manifest.json','./manifest-maria.json',
  './guide-map.css','./guide-map-v2.js','./home-intelligence.css','./home-intelligence.js',
  './travel-readiness.css','./trip-tools.css','./trip-tools.js',
  './claim-organizer.css','./claim-organizer.js',
  './floating-shortcuts.css','./floating-shortcuts.js',
  './private-vault.css','./private-vault.js',
  './final-polish.css','./final-polish.js','./french-audio-v2.js',
  './daily-transit.css','./daily-transit.js',
  './packing-checklist.css','./packing-checklist.js',
  './today-glance.css','./today-glance.js',
  './quick-actions.js','./nav-upgrade.css',
  './map-places-index.json','./map-places-maria.json',
  './leaflet/leaflet.js','./leaflet/leaflet.css',
  './leaflet/images/marker-icon.png','./leaflet/images/marker-icon-2x.png','./leaflet/images/marker-shadow.png',
  './leaflet/images/layers.png','./leaflet/images/layers-2x.png',
  './apple-touch-icon.png','./favicon-32.png','./icon-192.png','./icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
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
