const CACHE='reforce-openworld-v95';
async function precache(){
  const cache=await caches.open(CACHE);
  const res=await fetch('./index.html',{cache:'reload'});
  const html=await res.clone().text();
  await cache.put('./index.html',res.clone());
  const refs=[...html.matchAll(/(?:src|href)=["']\.\/([^?"']+)(\?[^"']*)?["']/g)].map(m=>'./'+m[1]+(m[2]||''));
  const urls=['./',...new Set(refs)];
  await Promise.allSettled(urls.map(u=>cache.add(u)));
}
self.addEventListener('install',e=>e.waitUntil(precache().then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);if(url.origin!==location.origin)return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
