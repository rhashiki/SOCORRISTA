const CACHE='reforce-openworld-v35';
const CORE=[
  './','./index.html',
  './styles.css?v=35','./visual-v6.css?v=35','./visual-v7.css?v=35','./visual-v9.css?v=35','./visual-v10.css?v=35','./visual-v13.css?v=35','./visual-v14.css?v=35','./visual-v16.css?v=35','./visual-v17.css?v=35','./visual-v20.css?v=35','./visual-v24.css?v=35','./visual-v25.css?v=35','./visual-v26.css?v=35','./visual-v27.css?v=35','./visual-v30.css?v=35','./visual-v34.css?v=35','./visual-v35.css?v=35',
  './state-v6.js?v=35','./city-v6.js?v=35','./actors-v6.js?v=35','./scene-v6.js?v=35','./world-v6.js?v=35','./clinical-v6.js?v=35','./living-v7.js?v=35',
  './incident-v8.js?v=35','./equipment-v9.js?v=35','./career-v10.js?v=35','./witness-v11.js?v=35','./scenegen-v12.js?v=35','./modes-v13.js?v=35','./mastery-v14.js?v=35','./neuro-v15.js?v=35','./performance-v16.js?v=35','./navigation-v17.js?v=35','./hazards-v18.js?v=35','./patientstate-v19.js?v=35','./achievements-v20.js?v=35','./circulation-v21.js?v=35','./sample-v22.js?v=35','./secondary-v23.js?v=35','./environment-v24.js?v=35','./controls-v25.js?v=35','./audio-v26.js?v=35','./vehicle-v27.js?v=35','./partner-v28.js?v=35','./transport-v29.js?v=35','./director-v30.js?v=35',
  './materials-v31.js?v=35','./patientvisual-v32.js?v=35','./traffic-v33.js?v=35','./radio-v34.js?v=35','./scenario-v35.js?v=35','./integration-v30.js?v=35'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);if(url.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
