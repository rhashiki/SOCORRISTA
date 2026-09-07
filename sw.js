const CACHE='reforce-openworld-v75';
const CORE=[
  './','./index.html',
  './styles.css?v=55','./visual-v6.css?v=55','./visual-v7.css?v=55','./visual-v9.css?v=55','./visual-v10.css?v=55','./visual-v13.css?v=55','./visual-v14.css?v=55','./visual-v16.css?v=55','./visual-v17.css?v=55','./visual-v20.css?v=55','./visual-v24.css?v=55','./visual-v25.css?v=55','./visual-v26.css?v=55','./visual-v27.css?v=55','./visual-v30.css?v=55','./visual-v34.css?v=55','./visual-v35.css?v=55','./visual-v36.css?v=55','./visual-v42.css?v=55','./visual-v45.css?v=55','./visual-v47.css?v=55','./visual-v50.css?v=55',
  './state-v6.js?v=75','./city-v6.js?v=55','./actors-v6.js?v=55','./scene-v6.js?v=55','./world-v6.js?v=55','./clinical-v6.js?v=55','./living-v7.js?v=55',
  './incident-v8.js?v=55','./equipment-v9.js?v=55','./career-v10.js?v=55','./witness-v11.js?v=55','./scenegen-v12.js?v=55','./modes-v13.js?v=55','./mastery-v14.js?v=55','./neuro-v15.js?v=55','./performance-v16.js?v=55','./navigation-v17.js?v=55','./hazards-v18.js?v=55','./patientstate-v19.js?v=55','./achievements-v20.js?v=55','./circulation-v21.js?v=55','./sample-v22.js?v=55','./secondary-v23.js?v=55','./environment-v24.js?v=55','./controls-v25.js?v=55','./audio-v26.js?v=55','./vehicle-v27.js?v=55','./partner-v28.js?v=55','./transport-v29.js?v=55','./director-v30.js?v=55',
  './materials-v31.js?v=55','./patientvisual-v32.js?v=55','./traffic-v33.js?v=55','./radio-v34.js?v=55','./scenario-v35.js?v=55','./map-v36.js?v=55','./camera-v37.js?v=55','./lighting-v38.js?v=55','./transportvisual-v39.js?v=55','./trafficvariety-v40.js?v=55',
  './ambient-v41.js?v=55','./instructor-v42.js?v=55','./urbandetail-v43.js?v=55','./npc-v44.js?v=55','./shift-v45.js?v=55',
  './responderpose-v46.js?v=55','./dialogue-v47.js?v=55','./vehicleentry-v48.js?v=55','./driving-v49.js?v=55','./mission-v50.js?v=55',
  './architecture-v51.js?v=55','./vehiclevisual-v52.js?v=70','./animation-v53.js?v=55','./lod-v54.js?v=55','./scenequality-v55.js?v=55',
  './textures-v56.js?v=60','./crowdvisual-v57.js?v=60','./contactshadow-v58.js?v=60','./camerapolish-v59.js?v=60','./skyline-v60.js?v=60',
  './roadwear-v61.js?v=65','./streetvehicles-v62.js?v=65','./faces-v63.js?v=65','./streetlife-v64.js?v=65','./atmosphere-v65.js?v=65',
  './vehicleorientation-v66.js?v=70','./movement-v67.js?v=70','./wayfinding-v68.js?v=70','./hudcontext-v69.js?v=70','./autoperf-v70.js?v=70',
  './district-v71.js?v=75','./incidentlocations-v72.js?v=75','./outertraffic-v73.js?v=75','./outerpedestrians-v74.js?v=75','./roadroute-v75.js?v=75','./integration-v30.js?v=75'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);if(url.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});
