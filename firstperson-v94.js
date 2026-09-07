/* Re.Force APH — Build 94 / v94
 * First-person gameplay + mobile render rescue.
 * Removes the local third-person avatar from the render path and replaces orbit camera with eye/driver POV.
 */
const V94_MOBILE=(typeof V93_MOBILE!=='undefined'?V93_MOBILE:(matchMedia?.('(pointer:coarse)')?.matches||innerWidth<900));
let V94_YAW=.15,V94_PITCH=0,V94_VEH_OFFSET=0,V94_LAST_LOOK=0,V94_PTR=null,V94_INPUT_INSTALLED=false;
const V94_CAM_POS=new THREE.Vector3(),V94_CAM_DIR=new THREE.Vector3(),V94_CAM_TARGET=new THREE.Vector3(),V94_LOCAL=new THREE.Vector3(),V94_MOVE=new THREE.Vector3(),V94_FORWARD=new THREE.Vector3(),V94_RIGHT=new THREE.Vector3();

// Stronger mobile budget than v93; FPS view lets us trade some distant detail for responsiveness.
if(typeof v93PixelCap==='function'){
  v93PixelCap=function(){
    const d=Math.min(devicePixelRatio||1,2);
    if(!V94_MOBILE)return V16_PROFILE==='high'?Math.min(d,1.45):V16_PROFILE==='eco'?Math.min(d,.90):Math.min(d,1.18);
    if(V16_PROFILE==='high')return Math.min(d,.95);
    if(V16_PROFILE==='eco')return Math.min(d,.62);
    return Math.min(d,.74);
  };
  if(typeof v70ProfileCap==='function')v70ProfileCap=function(){return v93PixelCap();};
}

// Disable hardware antialiasing on coarse/mobile devices before the renderer is created.
if(V94_MOBILE&&THREE?.WebGLRenderer&&!THREE.__RF94_FAST_RENDERER){
  const RF94BaseRenderer=THREE.WebGLRenderer;
  THREE.WebGLRenderer=class RF94FastRenderer extends RF94BaseRenderer{constructor(opts={}){super({...opts,antialias:false,powerPreference:'high-performance'});}};
  THREE.__RF94_FAST_RENDERER=true;
}

function v94SetDir(yaw,pitch,out=V94_CAM_DIR){
  const cp=Math.cos(pitch);out.set(-Math.sin(yaw)*cp,Math.sin(pitch),-Math.cos(yaw)*cp);return out;
}
function v94PointInBuilding(p){
  if(typeof v37PointHitsBuilding==='function')return v37PointHitsBuilding(p);
  return buildings.some(b=>Math.abs(p.x-b.x)<b.w/2+.2&&Math.abs(p.z-b.z)<b.d/2+.2&&p.y<23);
}
function v94SafeVehicleCamera(out){
  V94_LOCAL.set(-.52,1.72,-3.34);out.copy(V94_LOCAL);ambulance.root.localToWorld(out);
  if(!v94PointInBuilding(out))return out;
  // Pull the eye point toward the vehicle centre if the nose is too close to geometry.
  const centre=ambulance.root.position;for(let i=1;i<=8;i++){const t=i/8;out.lerpVectors(V94_CAM_POS.copy(centre).setY(1.72),out,t);if(!v94PointInBuilding(out))return out;}
  out.copy(centre).setY(2.15);return out;
}
function v94ApplyCameraProjection(fov){
  if(!camera)return;const far=V94_MOBILE?148:205;
  let changed=false;if(Math.abs(camera.fov-fov)>.05){camera.fov=fov;changed=true;}if(camera.near!==.055){camera.near=.055;changed=true;}if(camera.far!==far){camera.far=far;changed=true;}if(changed)camera.updateProjectionMatrix();
}

// Replaces every previous orbit/collision/polish camera layer.
updateCamera=function(dt){
  if(!camera)return;
  if(controlled==='vehicle'&&ambulance?.root){
    if(performance.now()-V94_LAST_LOOK>900)V94_VEH_OFFSET=THREE.MathUtils.lerp(V94_VEH_OFFSET,0,1-Math.exp(-dt*2.1));
    V94_YAW=-ambulance.heading+V94_VEH_OFFSET;
    v94SafeVehicleCamera(V94_CAM_POS);camera.position.copy(V94_CAM_POS);
    const p=clamp(V94_PITCH,-.58,.52);v94SetDir(V94_YAW,p,V94_CAM_DIR);V94_CAM_TARGET.copy(V94_CAM_POS).addScaledVector(V94_CAM_DIR,12);camera.lookAt(V94_CAM_TARGET);v94ApplyCameraProjection(70);
  }else if(player?.root){
    V94_CAM_POS.copy(player.root.position);V94_CAM_POS.y+=1.63;camera.position.copy(V94_CAM_POS);
    v94SetDir(V94_YAW,clamp(V94_PITCH,-1.02,1.02),V94_CAM_DIR);V94_CAM_TARGET.copy(V94_CAM_POS).addScaledVector(V94_CAM_DIR,10);camera.lookAt(V94_CAM_TARGET);v94ApplyCameraProjection(74);
  }
  smoothCamPos.copy(camera.position);smoothCamTarget.copy(V94_CAM_TARGET);cameraReady=true;
};

// No local skeletal animation in FPS: movement is cheaper and the old multi-layer walk glitches disappear.
updatePlayer=function(dt){
  const inp=inputAxes(),mag=clamp(Math.hypot(inp.x,inp.y),0,1),running=runHeld||keys.ShiftLeft||keys.ShiftRight,speed=(running?7.0:4.15)*mag;player.speed=speed;
  if(player.visual)player.visual.visible=false;if(player.root?.userData?.v58Shadow)player.root.userData.v58Shadow.visible=false;
  if(mag>.05&&player?.root){
    V94_FORWARD.set(-Math.sin(V94_YAW),0,-Math.cos(V94_YAW));V94_RIGHT.set(Math.cos(V94_YAW),0,-Math.sin(V94_YAW));
    V94_MOVE.copy(V94_FORWARD).multiplyScalar(-inp.y).addScaledVector(V94_RIGHT,inp.x);if(V94_MOVE.lengthSq()>.0001)V94_MOVE.normalize();
    const old=player.root.position.clone(),next=old.clone().addScaledVector(V94_MOVE,speed*dt);next.x=clamp(next.x,-WORLD/2+2,WORLD/2-2);next.z=clamp(next.z,-WORLD/2+2,WORLD/2-2);
    player.root.position.copy(typeof v67ResolvePlayerMove==='function'?v67ResolvePlayerMove(old,next):(!hitBuilding(next)?next:old));
  }
  const face=v94SetDir(V94_YAW,0,V94_CAM_DIR);player.root.rotation.y=Math.atan2(face.x,face.z);
};

// Arrival cutaway is incompatible with FPS and was one source of sudden camera jumps.
if(typeof v37WatchArrival==='function')v37WatchArrival=function(){};

function v94AimAt(world){
  if(!player?.root||!world)return;const eye=V94_CAM_POS.copy(player.root.position).setY(player.root.position.y+1.63),d=V94_CAM_DIR.copy(world).sub(eye).normalize();V94_YAW=Math.atan2(-d.x,-d.z);V94_PITCH=Math.asin(clamp(d.y,-1,1));
}
const v94BaseSecondary=startSecondary;
startSecondary=function(){v94BaseSecondary();if(patient?.anchor){const p=patient.anchor.position.clone();p.y+=.85;v94AimAt(p);}};

const v94BaseEnter=enterAmbulance;
enterAmbulance=function(){v94BaseEnter();V94_VEH_OFFSET=0;V94_PITCH=0;V94_YAW=-ambulance.heading;V94_LAST_LOOK=0;};
const v94BaseExit=exitAmbulance;
exitAmbulance=function(){v94BaseExit();V94_VEH_OFFSET=0;V94_PITCH=0;V94_YAW=-ambulance.heading;if(player?.visual)player.visual.visible=false;};

function v94SetupReticle(){
  if(document.querySelector('#fpsReticle'))return;const r=document.createElement('div');r.id='fpsReticle';r.setAttribute('aria-hidden','true');document.querySelector('#game')?.appendChild(r);document.body.classList.add('rf-fps');
}
function v94InstallLookInput(){
  if(V94_INPUT_INSTALLED||!canvas)return;V94_INPUT_INSTALLED=true;
  const down=e=>{if(uiBlock())return;V94_PTR={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);e.stopImmediatePropagation();};
  const move=e=>{if(!V94_PTR||e.pointerId!==V94_PTR.id||uiBlock())return;const dx=e.clientX-V94_PTR.x,dy=e.clientY-V94_PTR.y;V94_PTR.x=e.clientX;V94_PTR.y=e.clientY;const s=V25_SETTINGS?.sensitivity||1,hs=(V25_SETTINGS?.invertX?1:-1),vs=(V25_SETTINGS?.invertY?1:-1);if(controlled==='vehicle'){V94_VEH_OFFSET=clamp(V94_VEH_OFFSET+hs*dx*.0049*s,-1.45,1.45);}else V94_YAW+=hs*dx*.0049*s;V94_PITCH=clamp(V94_PITCH+vs*dy*.0039*s,controlled==='vehicle'?-.58:-1.02,controlled==='vehicle'?.52:1.02);V94_LAST_LOOK=performance.now();e.stopImmediatePropagation();};
  const end=e=>{if(V94_PTR?.id===e.pointerId)V94_PTR=null;e.stopImmediatePropagation();};
  canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('pointermove',move,true);canvas.addEventListener('pointerup',end,true);canvas.addEventListener('pointercancel',end,true);
  const reset=document.querySelector('#cameraReset');if(reset)reset.onclick=()=>{V94_PITCH=0;V94_VEH_OFFSET=0;if(controlled==='vehicle')V94_YAW=-ambulance.heading;V94_LAST_LOOK=0;};
}

// Tighter FPS-oriented LOD on mobile, using squared distance and no per-object allocations.
if(typeof v54ApplyLOD==='function')v54ApplyLOD=function(){
  if(!camera)return;const mobile=V94_MOBILE,profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced';
  const far=mobile?(profile==='eco'?38:profile==='high'?58:47):(profile==='high'?100:78),pedFar=mobile?(profile==='eco'?22:profile==='high'?38:30):(profile==='high'?68:52),trafficFar=mobile?(profile==='eco'?34:profile==='high'?58:45):(profile==='high'?92:72);
  const cx=camera.position.x,cy=camera.position.y,cz=camera.position.z,within=(o,d)=>{if(!o)return false;o.updateWorldMatrix?.(true,false);const e=o.matrixWorld.elements,dx=e[12]-cx,dy=e[13]-cy,dz=e[14]-cz;return dx*dx+dy*dy+dz*dz<d*d;},set=(o,on)=>{if(o&&o!==player?.root&&o!==ambulance?.root&&o!==patient?.anchor)o.visible=on;};
  cityDecor.forEach(o=>set(o,within(o,far)));V51_ARCH?.forEach?.(o=>set(o,within(o,far+14)));pedestrians.forEach(p=>set(p.root,within(p.root,pedFar)));traffic.forEach(t=>set(t.root,within(t.root,trafficFar)));parkedCars.forEach(c=>set(c,within(c,far)));curiosos.forEach(c=>set(c,within(c,pedFar+12)));
};

const v94BaseInit=init;
init=async function(){
  V94_YAW=.15;V94_PITCH=0;V94_VEH_OFFSET=0;V94_LAST_LOOK=0;await v94BaseInit();
  if(player?.visual)player.visual.visible=false;if(player?.root?.userData?.v58Shadow)player.root.userData.v58Shadow.visible=false;
  if(typeof v93ApplyPerformanceBudget==='function')v93ApplyPerformanceBudget();
  v94SetupReticle();v94InstallLookInput();v54ApplyLOD?.();updateCamera(1/60);
};
v94SetupReticle();
