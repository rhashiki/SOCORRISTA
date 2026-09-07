/* Re.Force APH — Build 93 / v93
 * Performance Rescue: prevents low-FPS slow motion and reduces mobile GPU/AI cost.
 */
const V93_MOBILE=matchMedia?.('(pointer:coarse)')?.matches||innerWidth<900;
let V93_TRAFFIC_ACC=0,V93_PED_ACC=0,V93_LIGHT_CLOCK=0,V93_MAP_ACC=0,V93_FPS_EMA=60;

function v93PixelCap(){
  const d=Math.min(devicePixelRatio||1,2);
  if(!V93_MOBILE)return V16_PROFILE==='high'?Math.min(d,1.55):V16_PROFILE==='eco'?Math.min(d,.95):Math.min(d,1.25);
  if(V16_PROFILE==='high')return Math.min(d,1.20);
  if(V16_PROFILE==='eco')return Math.min(d,.78);
  return Math.min(d,.92);
}
function v93ApplyPerformanceBudget(){
  if(!renderer)return;
  const cap=v93PixelCap();
  renderer.setPixelRatio(cap);renderer.setSize(innerWidth,innerHeight,false);
  // Mobile balanced/eco uses the cheap contact-shadow layer from v58 instead of a full shadow map.
  const heavyShadows=!V93_MOBILE||V16_PROFILE==='high';
  renderer.shadowMap.enabled=heavyShadows;
  if(renderer.shadowMap)renderer.shadowMap.autoUpdate=heavyShadows;
  if(scene?.fog){scene.fog.near=V93_MOBILE?64:72;scene.fog.far=V16_PROFILE==='eco'?108:V93_MOBILE?132:160;}
  // Prevent later adaptive recovery from pushing mobile resolution back above this budget.
  window.RF_PERFORMANCE={...(window.RF_PERFORMANCE||{}),mobile:V93_MOBILE,pixelCap:cap,shadowMap:heavyShadows};
}

// Keep v70's adaptive governor, but give it realistic caps for the expanded mobile world.
v70ProfileCap=function(){return v93PixelCap();};

// AI does not need to run at render frequency. Movement keeps real elapsed time through accumulated dt.
const v93BaseTraffic=updateTraffic;
updateTraffic=function(dt){
  if(!V93_MOBILE)return v93BaseTraffic(dt);
  V93_TRAFFIC_ACC+=dt;
  if(V93_TRAFFIC_ACC<1/30)return;
  const step=Math.min(V93_TRAFFIC_ACC,.10);V93_TRAFFIC_ACC=0;v93BaseTraffic(step);
};
const v93BasePeds=updatePedestrians;
updatePedestrians=function(dt){
  if(!V93_MOBILE)return v93BasePeds(dt);
  V93_PED_ACC+=dt;
  if(V93_PED_ACC<1/24)return;
  const step=Math.min(V93_PED_ACC,.10);V93_PED_ACC=0;v93BasePeds(step);
};
const v93BaseLights=updateTrafficLights;
updateTrafficLights=function(){
  if(!V93_MOBILE)return v93BaseLights();
  const now=performance.now();if(now-V93_LIGHT_CLOCK<90)return;V93_LIGHT_CLOCK=now;v93BaseLights();
};

// The old loop capped dt at .05s. Below 20 FPS that made simulation time run slower than real time.
// A .12s safety cap preserves real-time motion down to ~8 FPS without multiplying expensive update passes.
loop=function(){
  const raw=Math.max(0,clock.getDelta());
  const dt=Math.min(raw,.12);
  if(raw>0){const fps=Math.min(120,1/raw);V93_FPS_EMA=THREE.MathUtils.lerp(V93_FPS_EMA,fps,.06);}
  update(dt);
  renderer.render(scene,camera);
  V93_MAP_ACC+=dt;
  const mapStep=V93_MOBILE?1/12:1/24;
  if(V93_MAP_ACC>=mapStep){V93_MAP_ACC=0;drawMinimap();}
  window.RF_PERFORMANCE={...(window.RF_PERFORMANCE||{}),fps:Math.round(V93_FPS_EMA),pixelRatio:+(renderer.getPixelRatio?.()||1).toFixed(2),mobile:V93_MOBILE,build:93};
  requestAnimationFrame(loop);
};

const v93BaseInit=init;
init=async function(){
  V93_TRAFFIC_ACC=V93_PED_ACC=V93_MAP_ACC=0;V93_LIGHT_CLOCK=0;V93_FPS_EMA=60;
  await v93BaseInit();
  v93ApplyPerformanceBudget();
};
