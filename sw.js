const CACHE='reforce-openworld-v50';
const CORE=[
  './','./index.html',
  './styles.css?v=50','./visual-v6.css?v=50','./visual-v7.css?v=50','./visual-v9.css?v=50','./visual-v10.css?v=50','./visual-v13.css?v=50','./visual-v14.css?v=50','./visual-v16.css?v=50','./visual-v17.css?v=50','./visual-v20.css?v=50','./visual-v24.css?v=50','./visual-v25.css?v=50','./visual-v26.css?v=50','./visual-v27.css?v=50','./visual-v30.css?v=50','./visual-v34.css?v=50','./visual-v35.css?v=50','./visual-v36.css?v=50','./visual-v42.css?v=50','./visual-v45.css?v=50','./visual-v47.css?v=50','./visual-v50.css?v=50',
  './state-v6.js?v=50','./city-v6.js?v=50','./actors-v6.js?v=50','./scene-v6.js?v=50','./world-v6.js?v=50','./clinical-v6.js?v=50','./living-v7.js?v=50',
  './incident-v8.js?v=50','./equipment-v9.js?v=50','./career-v10.js?v=50','./witness-v11.js?v=50','./scenegen-v12.js?v=50','./modes-v13.js?v=50','./mastery-v14.js?v=50','./neuro-v15.js?v=50','./performance-v16.js?v=50','./navigation-v17.js?v=50','./hazards-v18.js?v=50','./patientstate-v19.js?v=50','./achievements-v20.js?v=50','./circulation-v21.js?v=50','./sample-v22.js?v=50','./secondary-v23.js?v=50','./environment-v24.js?v=50','./controls-v25.js?v=50','./audio-v26.js?v=50','./vehicle-v27.js?v=50','./partner-v28.js?v=50','./transport-v29.js?v=50','./director-v30.js?v=50',
  './materials-v31.js?v=50','./patientvisual-v32.js?v=50','./traffic-v33.js?v=50','./radio-v34.js?v=50','./scenario-v35.js?v=50','./map-v36.js?v=50','./camera-v37.js?v=50','./lighting-v38.js?v=50','./transportvisual-v39.js?v=50','./trafficvariety-v40.js?v=50',
  './ambient-v41.js?v=50','./instructor-v42.js?v=50','./urbandetail-v43.js?v=50','./npc-v44.js?v=50','./shift-v45.js?v=50',
  './responderpose-v46.js?v=50','./dialogue-v47.js?v=50','./vehicleentry-v48.js?v=50','./driving-v49.js?v=50','./mission-v50.js?v=50','./integration-v30.js?v=50'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);if(url.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
