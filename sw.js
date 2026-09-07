const CACHE='reforce-openworld-v40';
const CORE=[
  './','./index.html',
  './styles.css?v=40','./visual-v6.css?v=40','./visual-v7.css?v=40','./visual-v9.css?v=40','./visual-v10.css?v=40','./visual-v13.css?v=40','./visual-v14.css?v=40','./visual-v16.css?v=40','./visual-v17.css?v=40','./visual-v20.css?v=40','./visual-v24.css?v=40','./visual-v25.css?v=40','./visual-v26.css?v=40','./visual-v27.css?v=40','./visual-v30.css?v=40','./visual-v34.css?v=40','./visual-v35.css?v=40','./visual-v36.css?v=40',
  './state-v6.js?v=40','./city-v6.js?v=40','./actors-v6.js?v=40','./scene-v6.js?v=40','./world-v6.js?v=40','./clinical-v6.js?v=40','./living-v7.js?v=40',
  './incident-v8.js?v=40','./equipment-v9.js?v=40','./career-v10.js?v=40','./witness-v11.js?v=40','./scenegen-v12.js?v=40','./modes-v13.js?v=40','./mastery-v14.js?v=40','./neuro-v15.js?v=40','./performance-v16.js?v=40','./navigation-v17.js?v=40','./hazards-v18.js?v=40','./patientstate-v19.js?v=40','./achievements-v20.js?v=40','./circulation-v21.js?v=40','./sample-v22.js?v=40','./secondary-v23.js?v=40','./environment-v24.js?v=40','./controls-v25.js?v=40','./audio-v26.js?v=40','./vehicle-v27.js?v=40','./partner-v28.js?v=40','./transport-v29.js?v=40','./director-v30.js?v=40',
  './materials-v31.js?v=40','./patientvisual-v32.js?v=40','./traffic-v33.js?v=40','./radio-v34.js?v=40','./scenario-v35.js?v=40',
  './map-v36.js?v=40','./camera-v37.js?v=40','./lighting-v38.js?v=40','./transportvisual-v39.js?v=40','./trafficvariety-v40.js?v=40','./integration-v30.js?v=40'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);if(url.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
