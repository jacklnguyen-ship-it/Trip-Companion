const CACHE_NAME='trip-companion-20260727-3';
const CORE=[
  './','./index.html','./maria.html','./manifest.json','./manifest-maria.json',
  './guide-map.css','./guide-map.js','./home-intelligence.css','./home-intelligence.js',
  './travel-readiness.css','./trip-tools.css','./trip-tools.js',
  './map-places-index.json','./map-places-maria.json',
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
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached=>{
    var network=fetch(event.request).then(response=>{
      if(response.ok){var copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>cached);
    return cached||network;
  }));
});
