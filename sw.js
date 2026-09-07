const CACHE='reforce-openworld-v7';
const CORE=[
  './','./index.html','./styles.css?v=5','./visual-v6.css?v=6','./visual-v7.css?v=7',
  './state-v6.js?v=6','./city-v6.js?v=6','./actors-v6.js?v=6',
  './scene-v6.js?v=6','./world-v6.js?v=6','./clinical-v6.js?v=6','./living-v7.js?v=7'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put(e.request,c)).catch(()=>{});return r;}).catch(()=>caches.match(e.request).then(x=>x||caches.match('./index.html'))));
});
