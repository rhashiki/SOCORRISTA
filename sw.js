const CACHE='reforce-openworld-v30';
const CORE=[
  './','./index.html',
  './styles.css?v=30','./visual-v6.css?v=30','./visual-v7.css?v=30','./visual-v9.css?v=30','./visual-v10.css?v=30','./visual-v13.css?v=30','./visual-v14.css?v=30','./visual-v16.css?v=30','./visual-v17.css?v=30','./visual-v20.css?v=30','./visual-v24.css?v=30','./visual-v25.css?v=30','./visual-v26.css?v=30','./visual-v27.css?v=30','./visual-v30.css?v=30',
  './state-v6.js?v=30','./city-v6.js?v=30','./actors-v6.js?v=30','./scene-v6.js?v=30','./world-v6.js?v=30','./clinical-v6.js?v=30','./living-v7.js?v=30',
  './incident-v8.js?v=30','./equipment-v9.js?v=30','./career-v10.js?v=30','./witness-v11.js?v=30','./scenegen-v12.js?v=30','./modes-v13.js?v=30','./mastery-v14.js?v=30','./neuro-v15.js?v=30','./performance-v16.js?v=30','./navigation-v17.js?v=30','./hazards-v18.js?v=30','./patientstate-v19.js?v=30','./achievements-v20.js?v=30','./circulation-v21.js?v=30','./sample-v22.js?v=30','./secondary-v23.js?v=30','./environment-v24.js?v=30','./controls-v25.js?v=30','./audio-v26.js?v=30','./vehicle-v27.js?v=30','./partner-v28.js?v=30','./transport-v29.js?v=30','./director-v30.js?v=30','./integration-v30.js?v=30'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{
    if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}
    return r;
  }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
