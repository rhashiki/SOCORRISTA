/* Re.Force APH — Build 95 / v95
 * Desktop Performance Rescue.
 * Makes BALANCED a real low-cost default on every platform: no heavy shadow map,
 * no MSAA, lower internal resolution, frame pacing, all-device AI throttling and
 * aggressive distance culling for decorative layers.
 */
const V95_COARSE=(matchMedia?.('(pointer:coarse)')?.matches||innerWidth<900);
let V95_TRAFFIC_ACC=0,V95_PED_ACC=0,V95_LIGHT_ACC=0,V95_MAP_ACC=0,V95_LAST_FRAME=0,V95_FPS_EMA=60,V95_CONTEXT_ACC=0,V95_DISTRICT_ACC=0;
const V95_TMP=new THREE.Vector3();

// Force a cheaper renderer before init() creates WebGLRenderer. Build 94 only did this on mobile.
if(THREE?.WebGLRenderer&&!THREE.__RF95_FAST_RENDERER){
  const RF95BaseRenderer=THREE.WebGLRenderer;
  THREE.WebGLRenderer=class RF95FastRenderer extends RF95BaseRenderer{
    constructor(opts={}){super({...opts,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:false,alpha:false});}
  };
  THREE.__RF95_FAST_RENDERER=true;
}

function v95PixelCap(){
  const d=Math.min(devicePixelRatio||1,2),profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced';
  if(profile==='eco')return Math.min(d,V95_COARSE?.55:.62);
  if(profile==='high')return Math.min(d,V95_COARSE?.86:.95);
  return Math.min(d,V95_COARSE?.66:.76);
}
function v95FarPlane(){const p=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced';return p==='eco'?92:p==='high'?158:112;}
function v95FogFar(){const p=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced';return p==='eco'?76:p==='high'?132:94;}

function v95ApplyBudget(){
  if(!renderer)return;
  const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced',cap=v95PixelCap();
  renderer.setPixelRatio(cap);renderer.setSize(innerWidth,innerHeight,false);
  // Heavy shadow maps are opt-in only. Balanced/Eco use the cheap contact-shadow meshes.
  const heavyShadows=profile==='high'&&!V95_COARSE;
  renderer.shadowMap.enabled=heavyShadows;
  renderer.shadowMap.autoUpdate=heavyShadows;
  scene?.traverse?.(o=>{if(o?.isDirectionalLight)o.castShadow=heavyShadows;});
  if(scene?.fog){scene.fog.near=profile==='eco'?38:profile==='high'?62:46;scene.fog.far=v95FogFar();}
  if(camera){camera.far=v95FarPlane();camera.updateProjectionMatrix();}
  window.RF_PERFORMANCE={...(window.RF_PERFORMANCE||{}),build:95,pixelCap:cap,shadowMap:heavyShadows,profile};
}

// Replace the previous governors so they can never raise resolution above the Build 95 budget.
if(typeof v93PixelCap==='function')v93PixelCap=v95PixelCap;
if(typeof v70ProfileCap==='function')v70ProfileCap=v95PixelCap;
if(typeof v93ApplyPerformanceBudget==='function')v93ApplyPerformanceBudget=v95ApplyBudget;

// Build 94 was restoring camera.far=205 every frame on desktop. Keep FPS projection inside the same budget.
if(typeof v94ApplyCameraProjection==='function')v94ApplyCameraProjection=function(fov){
  if(!camera)return;let changed=false;
  if(Math.abs(camera.fov-fov)>.05){camera.fov=fov;changed=true;}
  if(camera.near!==.055){camera.near=.055;changed=true;}
  const far=v95FarPlane();if(camera.far!==far){camera.far=far;changed=true;}
  if(changed)camera.updateProjectionMatrix();
};

function v95DistSq(obj){
  if(!obj||!camera)return Infinity;
  obj.getWorldPosition(V95_TMP);
  const dx=V95_TMP.x-camera.position.x,dy=V95_TMP.y-camera.position.y,dz=V95_TMP.z-camera.position.z;
  return dx*dx+dy*dy+dz*dz;
}
function v95SetVisible(obj,on){if(obj&&obj!==player?.root&&obj!==ambulance?.root&&obj!==patient?.anchor)obj.visible=on;}

// Stronger LOD than v94 and includes decorative groups that were previously never culled.
v54ApplyLOD=function(){
  if(!camera)return;
  const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced';
  const far=profile==='eco'?30:profile==='high'?66:42;
  const pedFar=profile==='eco'?18:profile==='high'?44:27;
  const trafficFar=profile==='eco'?26:profile==='high'?58:36;
  const propFar=profile==='eco'?22:profile==='high'?54:34;
  const f2=far*far,p2=pedFar*pedFar,t2=trafficFar*trafficFar,pr2=propFar*propFar,a2=(far+9)*(far+9),crowd2=(pedFar+8)*(pedFar+8);
  cityDecor.forEach(o=>v95SetVisible(o,v95DistSq(o)<f2));
  if(typeof V43_PROPS!=='undefined')V43_PROPS.forEach(o=>v95SetVisible(o,v95DistSq(o)<pr2));
  if(typeof V51_ARCH!=='undefined')V51_ARCH.forEach(o=>v95SetVisible(o,v95DistSq(o)<a2));
  if(typeof V87_FACADES!=='undefined')V87_FACADES.forEach(o=>v95SetVisible(o,v95DistSq(o)<a2));
  pedestrians.forEach(p=>v95SetVisible(p.root,v95DistSq(p.root)<p2));
  traffic.forEach(t=>v95SetVisible(t.root,v95DistSq(t.root)<t2));
  parkedCars.forEach(c=>v95SetVisible(c,v95DistSq(c)<f2));
  curiosos.forEach(c=>v95SetVisible(c,v95DistSq(c)<crowd2));
};

// Traffic and pedestrians were still running at render frequency on desktop.
const v95TrafficDelegate=updateTraffic;
updateTraffic=function(dt){
  V95_TRAFFIC_ACC+=dt;const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced',hz=profile==='high'?30:profile==='eco'?10:15;
  if(V95_TRAFFIC_ACC<1/hz)return;const step=Math.min(V95_TRAFFIC_ACC,.12);V95_TRAFFIC_ACC=0;v95TrafficDelegate(step);
};
const v95PedDelegate=updatePedestrians;
updatePedestrians=function(dt){
  V95_PED_ACC+=dt;const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced',hz=profile==='high'?24:profile==='eco'?8:12;
  if(V95_PED_ACC<1/hz)return;const step=Math.min(V95_PED_ACC,.12);V95_PED_ACC=0;v95PedDelegate(step);
};
const v95LightDelegate=updateTrafficLights;
updateTrafficLights=function(){const now=performance.now();if(now-V95_LIGHT_ACC<125)return;V95_LIGHT_ACC=now;v95LightDelegate();};

// DOM/HUD proximity checks do not need render-frequency updates.
const v95ContextDelegate=updateContext;
updateContext=function(){const now=performance.now();if(now-V95_CONTEXT_ACC<90)return;V95_CONTEXT_ACC=now;v95ContextDelegate();};
const v95DistrictDelegate=updateDistrict;
updateDistrict=function(){const now=performance.now();if(now-V95_DISTRICT_ACC<250)return;V95_DISTRICT_ACC=now;v95DistrictDelegate();};

function v95TargetFPS(){const p=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced';return p==='high'?60:p==='eco'?24:30;}

// Frame pacing: Balanced intentionally renders at 30 FPS instead of asking every GPU for 60 FPS.
// Simulation still uses real elapsed time, so gameplay speed does not become slow motion.
loop=function(ts){
  requestAnimationFrame(loop);
  if(!renderer||!scene||!camera)return;
  ts=Number.isFinite(ts)?ts:performance.now();
  if(!V95_LAST_FRAME){V95_LAST_FRAME=ts;return;}
  const target=v95TargetFPS(),interval=1000/target,elapsedMs=ts-V95_LAST_FRAME;
  if(elapsedMs<interval*.90)return;
  V95_LAST_FRAME=ts-(elapsedMs%interval);
  const raw=Math.max(0,elapsedMs/1000),dt=Math.min(raw,.12);
  if(raw>0){const fps=Math.min(120,1/raw);V95_FPS_EMA=THREE.MathUtils.lerp(V95_FPS_EMA,fps,.08);}
  update(dt);renderer.render(scene,camera);
  V95_MAP_ACC+=dt;if(V95_MAP_ACC>=.12){V95_MAP_ACC=0;drawMinimap();}
  window.RF_PERFORMANCE={...(window.RF_PERFORMANCE||{}),fps:Math.round(V95_FPS_EMA),targetFPS:target,pixelRatio:+(renderer.getPixelRatio?.()||1).toFixed(2),build:95,profile:V16_PROFILE};
};

const v95BaseInit=init;
init=async function(){
  V95_TRAFFIC_ACC=V95_PED_ACC=V95_MAP_ACC=0;V95_LIGHT_ACC=V95_CONTEXT_ACC=V95_DISTRICT_ACC=0;V95_LAST_FRAME=0;V95_FPS_EMA=60;
  await v95BaseInit();
  v95ApplyBudget();v54ApplyLOD();
  // Hide the local player again after older init layers finish toggling visibility.
  if(player?.visual)player.visual.visible=false;
};
