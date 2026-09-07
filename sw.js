const CACHE='reforce-openworld-v45';
const CORE=[
  './','./index.html',
  './styles.css?v=45','./visual-v6.css?v=45','./visual-v7.css?v=45','./visual-v9.css?v=45','./visual-v10.css?v=45','./visual-v13.css?v=45','./visual-v14.css?v=45','./visual-v16.css?v=45','./visual-v17.css?v=45','./visual-v20.css?v=45','./visual-v24.css?v=45','./visual-v25.css?v=45','./visual-v26.css?v=45','./visual-v27.css?v=45','./visual-v30.css?v=45','./visual-v34.css?v=45','./visual-v35.css?v=45','./visual-v36.css?v=45','./visual-v42.css?v=45','./visual-v45.css?v=45',
  './state-v6.js?v=45','./city-v6.js?v=45','./actors-v6.js?v=45','./scene-v6.js?v=45','./world-v6.js?v=45','./clinical-v6.js?v=45','./living-v7.js?v=45',
  './incident-v8.js?v=45','./equipment-v9.js?v=45','./career-v10.js?v=45','./witness-v11.js?v=45','./scenegen-v12.js?v=45','./modes-v13.js?v=45','./mastery-v14.js?v=45','./neuro-v15.js?v=45','./performance-v16.js?v=45','./navigation-v17.js?v=45','./hazards-v18.js?v=45','./patientstate-v19.js?v=45','./achievements-v20.js?v=45','./circulation-v21.js?v=45','./sample-v22.js?v=45','./secondary-v23.js?v=45','./environment-v24.js?v=45','./controls-v25.js?v=45','./audio-v26.js?v=45','./vehicle-v27.js?v=45','./partner-v28.js?v=45','./transport-v29.js?v=45','./director-v30.js?v=45',
  './materials-v31.js?v=45','./patientvisual-v32.js?v=45','./traffic-v33.js?v=45','./radio-v34.js?v=45','./scenario-v35.js?v=45','./map-v36.js?v=45','./camera-v37.js?v=45','./lighting-v38.js?v=45','./transportvisual-v39.js?v=45','./trafficvariety-v40.js?v=45',
  './ambient-v41.js?v=45','./instructor-v42.js?v=45','./urbandetail-v43.js?v=45','./npc-v44.js?v=45','./shift-v45.js?v=45','./integration-v30.js?v=45'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);if(url.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
