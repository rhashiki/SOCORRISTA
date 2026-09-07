import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';

const $ = s => document.querySelector(s);
const landing=$('#landing'), game=$('#game'), debrief=$('#debrief');
const canvas=$('#world'), mini=$('#minimap'), mctx=mini.getContext('2d');
const objectiveEl=$('#objective'), phaseLabel=$('#phaseLabel'), scoreEl=$('#score');
const actionBtn=$('#actionBtn'), runBtn=$('#runBtn'), sirenBtn=$('#sirenBtn');
const joystick=$('#joystick'), stick=$('#stick');
const vehicleHud=$('#vehicleHud'), speedEl=$('#speedValue'), mapMode=$('#mapMode'), distanceLabel=$('#distanceLabel');
const dispatchModal=$('#dispatchModal'), interactionPanel=$('#interactionPanel'), observationBox=$('#observationBox');
const interactionTitle=$('#interactionTitle'), interactionKicker=$('#interactionKicker'), interactionText=$('#interactionText'), interactionActions=$('#interactionActions');
const clinicalStatus=$('#clinicalStatus'), patientStateEl=$('#patientState'), clinicalClock=$('#clinicalClock');
const toast=$('#toast');

const WORLD=150;
const BASE_POS=new THREE.Vector3(-48,0,36);
const AMB_POS=new THREE.Vector3(-42,0,34);
const ACCIDENT_POS=new THREE.Vector3(42,0,-28);
const HOSPITAL_POS=new THREE.Vector3(50,0,44);
const MODEL_URLS={
  man:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb',
  truck:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb',
  car:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb'
};

let renderer,scene,camera,clock,loader;
let player={root:null,visual:null,mixer:null,speed:0};
let ambulance={root:null,visual:null,speed:0,heading:0,siren:false};
let traffic=[], pedestrians=[], curiosos=[], buildings=[], streetLights=[];
let patient={anchor:null,visual:null,mixer:null,bleedActive:true,bloodLoss:0,clinicalStart:0,assessmentStart:0,pool:null,patch:null,secondaryOrder:[],gcsEvidence:new Set(),sample:new Set()};
let clinicalZones=[];
let controlled='player';
let phase='LOADING';
let score=100;
let missionStart=0;
let timeline=[];
let learning=[];
let sceneChecks=new Set();
let clinicalStage='X';
let cameraYaw=0.15,cameraPitch=.38,cameraDistance=7.5,lastCameraDrag=0;
let joy={x:0,y:0,active:false,id:null};
let runHeld=false;
let keys={};
let cameraPointer=null;
let trafficCollisionCooldown=0;
let models={man:null,truck:null,car:null};
let bodyZoneMode=false;

function show(el){[landing,game,debrief].forEach(x=>x.classList.remove('active'));el.classList.add('active');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function dist2(a,b){const dx=a.x-b.x,dz=a.z-b.z;return Math.hypot(dx,dz);}
function nowSec(){return missionStart?Math.max(0,(performance.now()-missionStart)/1000):0;}
function fmt(sec){sec=Math.max(0,Math.round(sec));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
function logEvent(text,type='good'){timeline.push({t:nowSec(),text,type});}
function penalize(points,reason){score=Math.max(0,score-points);scoreEl.textContent=score;logEvent(reason,'bad');}
function reward(points,text){score=Math.min(100,score+points);scoreEl.textContent=score;if(text)logEvent(text,'good');}
function setObjective(label,text){phaseLabel.textContent=label;objectiveEl.textContent=text;}
function flash(msg,ms=2300){toast.textContent=msg;toast.hidden=false;clearTimeout(flash.t);flash.t=setTimeout(()=>toast.hidden=true,ms);}
function uiBlock(){return !dispatchModal.hidden || !interactionPanel.hidden || !$('#glasgowModal').hidden;}
function rand(a,b){return a+Math.random()*(b-a);}

function material(color,rough=.78,metal=.03){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function mesh(geo,mat,pos=[0,0,0],rot=[0,0,0],parent=scene){const o=new THREE.Mesh(geo,mat);o.position.set(...pos);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(s,color,pos,rot=[0,0,0],parent=scene){return mesh(new THREE.BoxGeometry(...s),material(color),pos,rot,parent);}
function cyl(r,h,color,pos,rot=[0,0,0],parent=scene){return mesh(new THREE.CylinderGeometry(r,r,h,14),material(color),pos,rot,parent);}
function plane(w,h,color,pos,rot=[-Math.PI/2,0,0],parent=scene){return mesh(new THREE.PlaneGeometry(w,h),material(color,1,0),pos,rot,parent);}

async function loadModel(url){return new Promise((resolve,reject)=>loader.load(url,g=>resolve(g),undefined,reject));}
function normalize(obj,targetHeight=1.8){
  const bb=new THREE.Box3().setFromObject(obj), size=new THREE.Vector3();bb.getSize(size);
  const s=targetHeight/Math.max(.001,size.y);obj.scale.multiplyScalar(s);
  const bb2=new THREE.Box3().setFromObject(obj), c=new THREE.Vector3();bb2.getCenter(c);
  obj.position.x-=c.x;obj.position.z-=c.z;obj.position.y-=bb2.min.y;
  obj.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});
  return obj;
}
function normalizeMax(obj,targetMax=4.8){const bb=new THREE.Box3().setFromObject(obj),s=new THREE.Vector3();bb.getSize(s);obj.scale.multiplyScalar(targetMax/Math.max(s.x,s.y,s.z));const bb2=new THREE.Box3().setFromObject(obj),c=new THREE.Vector3();bb2.getCenter(c);obj.position.sub(c);obj.position.y-=bb2.min.y;obj.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});return obj;}

async function init(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x8eb1c5);scene.fog=new THREE.Fog(0x8eb1c5,55,125);
  camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,220);clock=new THREE.Clock();loader=new GLTFLoader();
  const hemi=new THREE.HemisphereLight(0xdcecff,0x65513c,2.2);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff0cf,2.6);sun.position.set(-35,65,28);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;scene.add(sun);
  await Promise.allSettled([
    loadModel(MODEL_URLS.man).then(g=>models.man=g),
    loadModel(MODEL_URLS.truck).then(g=>models.truck=g),
    loadModel(MODEL_URLS.car).then(g=>models.car=g)
  ]);
  buildCity();buildActors();buildAccident();bindInput();resize();addEventListener('resize',resize);
  phase='BASE';setObjective('EM SERVIÇO','Apresente-se na unidade e aguarde a central.');missionStart=performance.now();logEvent('Plantão iniciado.');
  show(game);requestAnimationFrame(loop);
  setTimeout(()=>{if(phase==='BASE') dispatchModal.hidden=false;},1200);
}

function buildCity(){
  plane(WORLD,WORLD,0x517443,[0,-.03,0]);
  const roadMat=material(0x34383c,.95,.02), walkMat=material(0x90918d,.95,.01);
  const roads=[{x:0,z:-30,w:WORLD,h:12},{x:0,z:0,w:WORLD,h:12},{x:0,z:30,w:WORLD,h:12},{x:-48,z:0,w:12,h:WORLD},{x:0,z:0,w:12,h:WORLD},{x:48,z:0,w:12,h:WORLD}];
  roads.forEach(r=>mesh(new THREE.PlaneGeometry(r.w,r.h),roadMat,[r.x,.001,r.z],[-Math.PI/2,0,0]));
  [-36,-24,-6,6,24,36].forEach(z=>mesh(new THREE.PlaneGeometry(WORLD,2.5),walkMat,[0,.012,z],[-Math.PI/2,0,0]));
  [-54,-42,-6,6,42,54].forEach(x=>mesh(new THREE.PlaneGeometry(2.5,WORLD),walkMat,[x,.013,0],[-Math.PI/2,0,0]));
  for(const z of [-30,0,30]) for(let x=-70;x<=70;x+=8) plane(3,.12,0xd6c57e,[x,.018,z]);
  for(const x of [-48,0,48]) for(let z=-70;z<=70;z+=8) plane(.12,3,0xd6c57e,[x,.019,z]);
  const blocks=[[-25,-48],[25,-48],[-25,-15],[25,-15],[-25,15],[25,15],[-25,48],[25,48],[-65,-15],[65,-15],[-65,15],[65,15],[-65,48],[65,48]];
  blocks.forEach((p,i)=>{
    if(dist2({x:p[0],z:p[1]},BASE_POS)<18 || dist2({x:p[0],z:p[1]},ACCIDENT_POS)<20) return;
    const w=rand(12,20),d=rand(10,18),h=rand(6,20),color=[0xb88762,0x9caaad,0xd0ba8e,0x8e9ca8,0xb55f55][i%5];
    box([w,h,d],color,[p[0],h/2,p[1]]);buildings.push({x:p[0],z:p[1],w,d});
    for(let y=2.5;y<h-1;y+=3.2){for(let k=-1;k<=1;k++){const win=box([.08,1.2,1.5],0x273846,[p[0]+w/2+.045,y,p[1]+k*3]);win.material.emissive=new THREE.Color(0x172530);win.material.emissiveIntensity=.25;}}
  });
  box([22,8,16],0x24282d,[BASE_POS.x-3,4,BASE_POS.z+2]);addLabel('RE.FORCE • BASE',[BASE_POS.x-3,8.5,BASE_POS.z-6.1],0xe6d1ae);
  box([8,4,3],0x34383e,[BASE_POS.x+7,2,BASE_POS.z-7]);
  box([24,12,18],0xe5e4df,[HOSPITAL_POS.x,6,HOSPITAL_POS.z]);addLabel('HOSPITAL',[HOSPITAL_POS.x,12.7,HOSPITAL_POS.z-9.2],0xcc3e36);
  box([3,7,.3],0xcc3b35,[HOSPITAL_POS.x,8,HOSPITAL_POS.z-9.45]);box([7,3,.3],0xcc3b35,[HOSPITAL_POS.x,8,HOSPITAL_POS.z-9.46]);
  for(let i=0;i<35;i++){let x=rand(-70,70),z=rand(-70,70);if(isRoad(x,z))continue;cyl(.18,2.4,0x6b4a31,[x,1.2,z]);mesh(new THREE.SphereGeometry(1.15,10,8),material(0x3d6a3e),[x,2.8,z]);}
  for(const z of [-36,-24,24,36])for(let x=-65;x<70;x+=15)addStreetLight(x,z);
}
function isRoad(x,z){return Math.abs(z+30)<7||Math.abs(z)<7||Math.abs(z-30)<7||Math.abs(x+48)<7||Math.abs(x)<7||Math.abs(x-48)<7;}
function addStreetLight(x,z){const g=new THREE.Group();cyl(.08,4.2,0x4e5357,[0,2.1,0],[0,0,0],g);box([.8,.08,.08],0x4e5357,[.35,4.15,0],undefined,g);const bulb=box([.32,.10,.22],0xffe1a6,[.74,4.1,0],undefined,g);bulb.material.emissive=new THREE.Color(0xffd38c);bulb.material.emissiveIntensity=1.1;g.position.set(x,0,z);scene.add(g);streetLights.push(g);}
function addLabel(text,pos,color=0xffffff){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='rgba(10,12,14,.88)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#'+new THREE.Color(color).getHexString();ctx.font='900 42px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));sp.position.set(...pos);sp.scale.set(8,1.5,1);scene.add(sp);return sp;}

function buildActors(){
  player.root=new THREE.Group();scene.add(player.root);player.root.position.copy(BASE_POS).add(new THREE.Vector3(2,0,-4));
  if(models.man){player.visual=normalize(skeletonClone(models.man.scene),1.8);player.root.add(player.visual);player.mixer=new THREE.AnimationMixer(player.visual);if(models.man.animations?.length)player.mixer.clipAction(models.man.animations[0]).play();}
  else player.visual=createFallbackHuman(0x26333d),player.root.add(player.visual);
  ambulance.root=new THREE.Group();ambulance.root.position.copy(AMB_POS);ambulance.heading=Math.PI/2;scene.add(ambulance.root);buildAmbulanceVisual();
  buildTraffic();buildPedestrians();
}
function createFallbackHuman(color=0x2b343c){const g=new THREE.Group();const skin=material(0xb97f5d);mesh(new THREE.CapsuleGeometry(.23,.8,5,10),material(color),[0,1.05,0],[0,0,0],g);mesh(new THREE.SphereGeometry(.18,14,10),skin,[0,1.7,0],undefined,g);for(const s of [-1,1]){mesh(new THREE.CapsuleGeometry(.07,.55,4,8),material(color),[.15*s,.48,0],undefined,g);mesh(new THREE.CapsuleGeometry(.06,.6,4,8),material(color),[.28*s,1.05,0],[0,0,s*.18],g);}return g;}
function buildAmbulanceVisual(){
  if(models.truck){const m=normalizeMax(models.truck.scene.clone(true),5.4);m.rotation.y=Math.PI;ambulance.visual=m;ambulance.root.add(m);m.traverse(n=>{if(n.isMesh&&n.material){n.material=n.material.clone();n.material.color?.lerp(new THREE.Color(0xffffff),.35);}});}else{
    const v=new THREE.Group();box([4.8,1.5,2.0],0xeeeeea,[0,1,0],undefined,v);box([1.6,1.0,1.8],0xf7f7f4,[1.3,2,0],undefined,v);ambulance.visual=v;ambulance.root.add(v);
  }
  box([3.2,.16,.08],0xc82924,[0,1.15,1.02],undefined,ambulance.root);box([3.2,.16,.08],0xc82924,[0,1.15,-1.02],undefined,ambulance.root);
  const lightbar=new THREE.Group();box([.45,.12,.22],0xe52d29,[-.28,2.75,0],undefined,lightbar);box([.45,.12,.22],0x286ce0,[.28,2.75,0],undefined,lightbar);ambulance.root.add(lightbar);ambulance.lightbar=lightbar;addVehicleLabel(ambulance.root,'RE.FORCE',[-.4,1.55,1.08]);
}
function addVehicleLabel(parent,text,pos){const c=document.createElement('canvas');c.width=300;c.height=64;const x=c.getContext('2d');x.fillStyle='#ffffff';x.font='900 35px Arial';x.textAlign='center';x.fillText(text,150,43);const tex=new THREE.CanvasTexture(c);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));sp.position.set(...pos);sp.scale.set(2.4,.5,1);parent.add(sp);}
function createCar(color=0x3d6b8d){const g=new THREE.Group();if(models.car){const c=normalizeMax(models.car.scene.clone(true),3.4);c.traverse(n=>{if(n.isMesh&&n.material){n.material=n.material.clone();if(n.material.color)n.material.color.lerp(new THREE.Color(color),.45);}});g.add(c);}else{box([3.2,.8,1.6],color,[0,.5,0],undefined,g);box([1.6,.6,1.3],0x283540,[.2,1.1,0],undefined,g);}return g;}
function buildTraffic(){
  const paths=[
    [[-68,-31],[68,-31],[68,31],[-68,31]],
    [[68,-29],[-68,-29],[-68,29],[68,29]],
    [[-49,-68],[-49,68],[49,68],[49,-68]],
    [[-47,68],[-47,-68],[47,-68],[47,68]]
  ];
  for(let i=0;i<10;i++){const root=createCar([0x4f7b9a,0x9a4b42,0x7b7b73,0x42684d,0xa07a3c][i%5]);root.position.set(paths[i%4][0][0],0,paths[i%4][0][1]);scene.add(root);traffic.push({root,path:paths[i%4],seg:i%4,speed:5.5+Math.random()*2.4});}
}
function buildPedestrians(){
  const walkways=[[-35,20,35,20],[-35,-20,35,-20],[-60,38,-20,38],[15,38,65,38],[-58,-38,-20,-38],[18,-38,65,-38]];
  for(let i=0;i<14;i++){const w=walkways[i%walkways.length],root=new THREE.Group();if(models.man){root.add(normalize(skeletonClone(models.man.scene),1.65));}else root.add(createFallbackHuman([0x546776,0x7a5e4f,0x536e52,0x6f5269][i%4]));root.position.set(w[0]+Math.random()*(w[2]-w[0]),0,w[1]);scene.add(root);pedestrians.push({root,a:new THREE.Vector3(w[0],0,w[1]),b:new THREE.Vector3(w[2],0,w[3]),dir:Math.random()<.5?1:-1,speed:.75+Math.random()*.45,bob:Math.random()*6});}
}

function buildAccident(){
  const car=createCar(0x7f322c);car.position.copy(ACCIDENT_POS).add(new THREE.Vector3(2.5,0,-.7));car.rotation.y=.45;scene.add(car);
  const bike=new THREE.Group();for(const x of [-.65,.65])mesh(new THREE.TorusGeometry(.38,.045,8,20),material(0x111111),[x,.38,0],[Math.PI/2,0,0],bike);cyl(.035,1.15,0xa63229,[0,.48,0],[0,0,Math.PI/2],bike);bike.position.copy(ACCIDENT_POS).add(new THREE.Vector3(-1.6,.02,.8));bike.rotation.set(.1,.35,.45);scene.add(bike);
  [[-3,-2],[-1,-3],[2,-3]].forEach(([x,z])=>{const g=new THREE.Group();mesh(new THREE.ConeGeometry(.23,.62,10),material(0xd45c24),[0,.34,0],undefined,g);box([.55,.05,.55],0x202020,[0,.04,0],undefined,g);g.position.copy(ACCIDENT_POS).add(new THREE.Vector3(x,0,z));scene.add(g);});
  for(let i=0;i<9;i++)box([rand(.05,.18),rand(.03,.08),rand(.05,.18)],0x4d4b48,[ACCIDENT_POS.x+rand(-2,2),.05,ACCIDENT_POS.z+rand(-1.5,1.5)],[rand(0,.5),rand(0,3),rand(0,.5)]);
  patient.anchor=new THREE.Group();patient.anchor.position.copy(ACCIDENT_POS).add(new THREE.Vector3(-.1,.05,1.2));patient.anchor.rotation.z=-Math.PI/2;scene.add(patient.anchor);
  if(models.man){patient.visual=normalize(skeletonClone(models.man.scene),1.78);patient.anchor.add(patient.visual);}else patient.visual=createFallbackHuman(0x343c43),patient.anchor.add(patient.visual);
  const stainMat=new THREE.MeshStandardMaterial({color:0x5f1715,roughness:1,transparent:true,opacity:.86});patient.pool=mesh(new THREE.CircleGeometry(.55,24),stainMat,[ACCIDENT_POS.x-.9,.017,ACCIDENT_POS.z+1.2],[-Math.PI/2,0,0]);
  const patchMat=new THREE.MeshBasicMaterial({color:0x731d19,transparent:true,opacity:.9,depthTest:true});patient.patch=mesh(new THREE.PlaneGeometry(.38,.22),patchMat,[0,.34,.18],[0,0,0],patient.anchor);
  const zones=[['head',1.65],['neck',1.43],['chest',1.15],['abdomen',.93],['pelvis',.72],['limbs',.38],['back',1.08]];
  zones.forEach(([name,y])=>{const z=mesh(new THREE.BoxGeometry(name==='limbs'?.65:.45,name==='limbs'?.55:.28,.55),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),[0,y,name==='back'?-.28:0],[0,0,0],patient.anchor);z.userData.region=name;clinicalZones.push(z);});
  const pts=[[-3,3],[-4,1],[-3,-1],[4,2],[4,-1],[2,4]];
  pts.forEach(p=>{const r=new THREE.Group();if(models.man)r.add(normalize(skeletonClone(models.man.scene),1.68));else r.add(createFallbackHuman(0x5c6166));r.position.copy(ACCIDENT_POS).add(new THREE.Vector3(p[0],0,p[1]));r.lookAt(patient.anchor.position);scene.add(r);curiosos.push(r);});
}

function bindInput(){
  $('#startShift').onclick=()=>init();
  $('#acceptCall').onclick=()=>{dispatchModal.hidden=true;phase='TO_AMBULANCE';setObjective('OCORRÊNCIA ACEITA','Entre na ambulância Re.Force e desloque-se para a ocorrência.');logEvent('Ocorrência aceita pela unidade.');flash('GPS atualizado: Av. Central × Rua 4');};
  $('#closeInteraction').onclick=()=>closeInteraction();
  $('#cameraReset').onclick=()=>{if(controlled==='vehicle')cameraYaw=-ambulance.heading;else cameraYaw=0.15;cameraPitch=.38;lastCameraDrag=0;};
  sirenBtn.onclick=()=>{ambulance.siren=!ambulance.siren;sirenBtn.classList.toggle('on',ambulance.siren);sirenBtn.textContent=ambulance.siren?'SIRENE ON':'SIRENE';};
  actionBtn.onclick=doContextAction;
  runBtn.addEventListener('pointerdown',e=>{e.preventDefault();runHeld=true;});['pointerup','pointercancel','pointerleave'].forEach(ev=>runBtn.addEventListener(ev,()=>runHeld=false));
  const joyMove=e=>{if(!joy.active||e.pointerId!==joy.id)return;const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=r.width*.34,mag=Math.hypot(dx,dy)||1;if(mag>max){dx=dx/mag*max;dy=dy/mag*max;}joy.x=dx/max;joy.y=dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`;};
  joystick.addEventListener('pointerdown',e=>{joy.active=true;joy.id=e.pointerId;joystick.setPointerCapture?.(e.pointerId);joyMove(e);});joystick.addEventListener('pointermove',joyMove);const joyEnd=e=>{if(e.pointerId!==joy.id)return;joy={x:0,y:0,active:false,id:null};stick.style.transform='translate(0,0)';};joystick.addEventListener('pointerup',joyEnd);joystick.addEventListener('pointercancel',joyEnd);
  canvas.addEventListener('pointerdown',e=>{if(uiBlock())return;cameraPointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!cameraPointer||e.pointerId!==cameraPointer.id||uiBlock())return;const dx=e.clientX-cameraPointer.x,dy=e.clientY-cameraPointer.y;cameraPointer.x=e.clientX;cameraPointer.y=e.clientY;cameraYaw+=dx*.0065;cameraPitch=clamp(cameraPitch-dy*.0045,.18,.95);lastCameraDrag=performance.now();});
  const camEnd=e=>{if(cameraPointer?.id===e.pointerId)cameraPointer=null;};canvas.addEventListener('pointerup',camEnd);canvas.addEventListener('pointercancel',camEnd);
  canvas.addEventListener('wheel',e=>{cameraDistance=clamp(cameraDistance+Math.sign(e.deltaY)*.6,4.5,11);},{passive:true});
  addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE')doContextAction();if(e.code==='KeyQ')ambulance.siren=!ambulance.siren;});addEventListener('keyup',e=>keys[e.code]=false);
  $('#saveGlasgow').onclick=saveGlasgow;
  $('#restartBtn').onclick=()=>location.reload();
}

function resize(){renderer?.setSize(innerWidth,innerHeight,false);if(camera){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}}
function loop(){const dt=Math.min(clock.getDelta(),.05);update(dt);renderer.render(scene,camera);drawMinimap();requestAnimationFrame(loop);}

function update(dt){
  updateTraffic(dt);updatePedestrians(dt);updatePatient(dt);
  if(!uiBlock() && !bodyZoneMode){if(controlled==='player')updatePlayer(dt);else updateVehicle(dt);}
  updateCamera(dt);updateContext();
  if(player.mixer)player.mixer.update(dt*(Math.abs(player.speed)>.1?1:0));
  trafficCollisionCooldown=Math.max(0,trafficCollisionCooldown-dt);
  if(ambulance.lightbar){const pulse=Math.sin(performance.now()*.018)>0;ambulance.lightbar.children[0].material.emissive=new THREE.Color(pulse&&ambulance.siren?0xff0000:0x000000);ambulance.lightbar.children[1].material.emissive=new THREE.Color(!pulse&&ambulance.siren?0x0055ff:0x000000);ambulance.lightbar.children[0].material.emissiveIntensity=2;ambulance.lightbar.children[1].material.emissiveIntensity=2;}
}
function inputAxes(){let x=joy.x,y=joy.y;if(keys.KeyA)x=-1;if(keys.KeyD)x=1;if(keys.KeyW)y=-1;if(keys.KeyS)y=1;return{x,y};}
function updatePlayer(dt){const inp=inputAxes(),mag=clamp(Math.hypot(inp.x,inp.y),0,1),running=runHeld||keys.ShiftLeft||keys.ShiftRight,speed=(running?6.4:3.5)*mag;player.speed=speed;if(mag>.05){const f=new THREE.Vector3(-Math.sin(cameraYaw),0,-Math.cos(cameraYaw)),r=new THREE.Vector3(Math.cos(cameraYaw),0,-Math.sin(cameraYaw)),v=f.multiplyScalar(-inp.y).add(r.multiplyScalar(inp.x)).normalize(),old=player.root.position.clone();player.root.position.addScaledVector(v,speed*dt);player.root.position.x=clamp(player.root.position.x,-WORLD/2+2,WORLD/2-2);player.root.position.z=clamp(player.root.position.z,-WORLD/2+2,WORLD/2-2);if(hitBuilding(player.root.position))player.root.position.copy(old);player.root.rotation.y=Math.atan2(v.x,v.z);if(!player.mixer&&player.visual)player.visual.position.y=Math.abs(Math.sin(performance.now()*.008))*0.035;}else player.speed=0;}
function updateVehicle(dt){const inp=inputAxes(),throttle=clamp(-inp.y,-1,1),steer=clamp(inp.x,-1,1),max=ambulance.siren?17:14;ambulance.speed+=throttle*8.5*dt;ambulance.speed*=Math.pow(.985,dt*60);ambulance.speed=clamp(ambulance.speed,-5,max);if(Math.abs(ambulance.speed)<.03)ambulance.speed=0;const steerStrength=(.45+Math.min(1,Math.abs(ambulance.speed)/6))*1.25;ambulance.heading-=steer*steerStrength*dt*Math.sign(ambulance.speed||1);const forward=new THREE.Vector3(Math.sin(ambulance.heading),0,-Math.cos(ambulance.heading)),old=ambulance.root.position.clone();ambulance.root.position.addScaledVector(forward,ambulance.speed*dt);ambulance.root.rotation.y=ambulance.heading;ambulance.root.position.x=clamp(ambulance.root.position.x,-WORLD/2+3,WORLD/2-3);ambulance.root.position.z=clamp(ambulance.root.position.z,-WORLD/2+3,WORLD/2-3);if(hitBuilding(ambulance.root.position)){ambulance.root.position.copy(old);ambulance.speed*=-.18;}
  for(const t of traffic){if(dist2(ambulance.root.position,t.root.position)<2.2){ambulance.speed*=.35;if(trafficCollisionCooldown<=0){penalize(2,'Colisão durante o deslocamento: condução insegura.');trafficCollisionCooldown=1.5;}break;}}
  speedEl.textContent=Math.round(Math.abs(ambulance.speed)*3.6);
  if(phase==='EN_ROUTE'&&dist2(ambulance.root.position,ACCIDENT_POS)<13){phase='AT_SCENE_VEHICLE';setObjective('CHEGADA À CENA','Reduza a velocidade, posicione a viatura e saia para controlar a cena.');logEvent('Unidade alcançou o endereço da ocorrência.');flash('Ocorrência à vista. Estacione e desembarque.');}
  if(performance.now()-lastCameraDrag>1200)cameraYaw=lerpAngle(cameraYaw,-ambulance.heading,1-Math.exp(-dt*2));
}
function hitBuilding(pos){return buildings.some(b=>Math.abs(pos.x-b.x)<b.w/2+.6&&Math.abs(pos.z-b.z)<b.d/2+.6);}
function lerpAngle(a,b,t){let d=((b-a+Math.PI)%(Math.PI*2))-Math.PI;return a+d*t;}
function updateCamera(){let target;if(controlled==='vehicle'){target=ambulance.root.position.clone();target.y=1.2;cameraDistance=clamp(cameraDistance,6.5,10);}else if(bodyZoneMode&&patient.anchor){target=patient.anchor.position.clone();target.y=.7;cameraDistance=clamp(cameraDistance,4.2,5.5);}else{target=player.root.position.clone();target.y=1.2;cameraDistance=clamp(cameraDistance,5.5,9);}const cp=Math.cos(cameraPitch),sp=Math.sin(cameraPitch);camera.position.set(target.x+cameraDistance*Math.sin(cameraYaw)*cp,target.y+cameraDistance*sp,target.z+cameraDistance*Math.cos(cameraYaw)*cp);camera.lookAt(target);}
function updateTraffic(dt){traffic.forEach(t=>{const p=t.path,a=p[t.seg%p.length],b=p[(t.seg+1)%p.length],A=new THREE.Vector3(a[0],0,a[1]),B=new THREE.Vector3(b[0],0,b[1]),dir=B.clone().sub(A);dir.normalize();t.root.position.addScaledVector(dir,t.speed*dt);t.root.rotation.y=Math.atan2(dir.x,dir.z);if(t.root.position.distanceTo(B)<1.2)t.seg=(t.seg+1)%p.length;});}
function updatePedestrians(dt){pedestrians.forEach(p=>{const target=p.dir>0?p.b:p.a,dir=target.clone().sub(p.root.position);dir.y=0;if(dir.length()<.5)p.dir*=-1;else{dir.normalize();p.root.position.addScaledVector(dir,p.speed*dt);p.root.rotation.y=Math.atan2(dir.x,dir.z);p.root.position.y=Math.abs(Math.sin(performance.now()*.004+p.bob))*.025;}});}
function updatePatient(dt){if(!patient.anchor)return;if(patient.clinicalStart&&patient.bleedActive){patient.bloodLoss+=dt;const scale=1+Math.min(.8,patient.bloodLoss/75);patient.pool.scale.set(scale,scale,1);if(patient.bloodLoss>30&&patient.bloodLoss<31)flash('A vítima parece mais pálida e inquieta.');if(patient.bloodLoss>55&&patient.bloodLoss<56)flash('A vítima responde mais lentamente.');}if(patient.clinicalStart){clinicalClock.textContent=fmt((performance.now()-patient.clinicalStart)/1000);patientStateEl.textContent=patient.bleedActive?(patient.bloodLoss>50?'Deteriorando':'Em avaliação'):'Estabilizando';}}

function updateContext(){
  if(controlled==='player'){
    if(phase==='TO_AMBULANCE'&&dist2(player.root.position,ambulance.root.position)<3.4){actionBtn.textContent='ENTRAR';return;}
    if((phase==='SCENE'||phase==='PATIENT')&&dist2(player.root.position,ACCIDENT_POS)<8&&!sceneReady()){actionBtn.textContent='CENA';return;}
    if(phase==='SCENE'&&sceneReady()&&dist2(player.root.position,ACCIDENT_POS)<8){actionBtn.textContent='VÍTIMA';return;}
    if((phase==='PATIENT'||phase==='CLINICAL')&&dist2(player.root.position,patient.anchor.position)<3.1){actionBtn.textContent='ATENDER';return;}
    actionBtn.textContent='USAR';
  }else actionBtn.textContent='SAIR';
  const actor=controlled==='vehicle'?ambulance.root.position:player.root.position,target=phase==='TO_AMBULANCE'?ambulance.root.position:ACCIDENT_POS;distanceLabel.textContent=`${Math.round(dist2(actor,target))} m`;
}
function doContextAction(){if(uiBlock())return;if(controlled==='player'){
  if(phase==='TO_AMBULANCE'&&dist2(player.root.position,ambulance.root.position)<3.4){enterAmbulance();return;}
  if((phase==='SCENE'||phase==='PATIENT')&&dist2(player.root.position,ACCIDENT_POS)<8&&!sceneReady()){openSceneInteraction();return;}
  if(phase==='SCENE'&&sceneReady()&&dist2(player.root.position,ACCIDENT_POS)<8){phase='PATIENT';setObjective('ATENDIMENTO','Aproxime-se do paciente e inicie a avaliação.');logEvent('Cena controlada; abordagem autorizada.');flash('Cena controlada. Aproxime-se da vítima.');return;}
  if((phase==='PATIENT'||phase==='CLINICAL')&&dist2(player.root.position,patient.anchor.position)<3.1){openClinicalInteraction();return;}
  flash('Nada para interagir aqui.');
}else exitAmbulance();}
function enterAmbulance(){controlled='vehicle';player.root.visible=false;ambulance.speed=0;vehicleHud.hidden=false;mapMode.textContent='VIATURA';phase='EN_ROUTE';setObjective('DESLOCAMENTO','Siga o GPS até a ocorrência. Use a sirene quando necessário e conduza com segurança.');logEvent('Unidade iniciou deslocamento.');cameraYaw=-ambulance.heading;cameraDistance=8;}
function exitAmbulance(){ambulance.speed=0;controlled='player';player.root.visible=true;const right=new THREE.Vector3(Math.cos(ambulance.heading),0,Math.sin(ambulance.heading));player.root.position.copy(ambulance.root.position).addScaledVector(right,2.2);vehicleHud.hidden=true;mapMode.textContent='A PÉ';if(dist2(ambulance.root.position,ACCIDENT_POS)<12){phase='SCENE';setObjective('NA CENA','Controle a cena antes de iniciar o atendimento.');logEvent('Unidade chegou à ocorrência.');}else{phase='TO_AMBULANCE';setObjective('FORA DA VIATURA','Retorne à ambulância para continuar o deslocamento.');}}
function sceneReady(){return ['epi','signal','risks'].every(x=>sceneChecks.has(x));}

function openInteraction(title,kicker,text,actions){interactionTitle.textContent=title;interactionKicker.textContent=kicker;interactionText.textContent=text;interactionActions.innerHTML='';observationBox.hidden=true;actions.forEach(a=>{const b=document.createElement('button');b.textContent=a.label;if(a.primary)b.classList.add('primary-action');if(a.done)b.classList.add('done');if(a.locked)b.classList.add('locked');b.disabled=!!a.locked;b.onclick=()=>a.fn(b);interactionActions.appendChild(b);});interactionPanel.hidden=false;}
function closeInteraction(){interactionPanel.hidden=true;observationBox.hidden=true;}
function observe(msg){observationBox.textContent=msg;observationBox.hidden=false;}

function openSceneInteraction(){
  openInteraction('Controle da cena','SEGURANÇA','O trânsito continua passando e há curiosos próximos. Decida o que fazer antes de abordar o paciente.',[
    {label:'Vestir EPI adequado',done:sceneChecks.has('epi'),fn:()=>{if(!sceneChecks.has('epi')){sceneChecks.add('epi');reward(1,'EPI conferido antes do contato.');}openSceneInteraction();}},
    {label:'Sinalizar e organizar o entorno',done:sceneChecks.has('signal'),fn:()=>{if(!sceneChecks.has('signal')){sceneChecks.add('signal');reward(1,'Cena sinalizada e fluxo afastado da vítima.');}openSceneInteraction();}},
    {label:'Observar riscos e mecanismo',done:sceneChecks.has('risks'),fn:()=>{if(!sceneChecks.has('risks')){sceneChecks.add('risks');reward(1,'Riscos e mecanismo avaliados.');}observe('Carro x moto, vítima projetada ao solo. Não há fogo visível; trânsito ainda exige atenção.');setTimeout(openSceneInteraction,900);}},
    {label:'Ir direto para a vítima',primary:true,fn:()=>{if(!sceneReady()){penalize(8,'Abordou a vítima antes de controlar a segurança da cena.');observe('Você se aproximou sem completar a segurança da cena. Isso será revisto no debrief.');}else{phase='PATIENT';closeInteraction();setObjective('ATENDIMENTO','Aproxime-se do paciente e inicie a avaliação.');logEvent('Cena controlada; abordagem autorizada.');}}},
    ...(sceneReady()?[{label:'Aproximar-se do paciente',primary:true,fn:()=>{phase='PATIENT';closeInteraction();setObjective('ATENDIMENTO','Aproxime-se do paciente e inicie a avaliação.');logEvent('Cena controlada; abordagem autorizada.');}}]:[])
  ]);
}

function openClinicalInteraction(){
  if(!patient.clinicalStart){patient.clinicalStart=performance.now();clinicalStatus.hidden=false;phase='CLINICAL';logEvent('Contato com paciente iniciado.');}
  if(clinicalStage==='X')return renderX();if(clinicalStage==='A')return renderA();if(clinicalStage==='B')return renderB();if(clinicalStage==='C')return renderC();if(clinicalStage==='D')return renderD();if(clinicalStage==='E')return renderE();if(clinicalStage==='SAMPLE')return renderSample();if(clinicalStage==='SECONDARY')return startSecondary();if(clinicalStage==='DONE')return finishMission();
}
function wrongClinical(msg,pen=5){penalize(pen,msg);observe('Essa ação não resolve a prioridade atual. O paciente continua evoluindo.');}
function renderX(){openInteraction('Avaliação inicial','PACIENTE','Você encontrou a vítima ao solo. O jogo não informará qual letra do protocolo está ativa: interprete a cena e priorize.',[
  {label:'Fazer varredura visual rápida',fn:()=>{observe('Há uma mancha escura de sangue na perna direita e uma poça junto ao membro que aumenta lentamente.');patient.assessedBleed=true;logEvent('Hemorragia externa reconhecida visualmente.');setTimeout(renderX,1200);}},
  {label:'Controlar a hemorragia externa visível',primary:true,fn:()=>{if(!patient.assessedBleed)penalize(2,'Controlou o sangramento sem documentar a varredura inicial, mas reconheceu a prioridade correta.');patient.bleedActive=false;patient.pool.scale.multiplyScalar(.98);clinicalStage='A';reward(4,'Hemorragia externa prioritária controlada.');observe('O sangramento deixa de progredir. Agora reavalie a vítima e avance para a próxima prioridade.');setTimeout(renderA,1100);}},
  {label:'Perguntar sobre alergias',fn:()=>wrongClinical('Iniciou história SAMPLE antes de resolver ameaça imediata.',6)},
  {label:'Medir pressão arterial primeiro',fn:()=>wrongClinical('Priorizou medida complementar antes da ameaça imediata.',5)}
]);}
function renderA(){openInteraction('Avaliação primária','PACIENTE','A hemorragia prioritária foi resolvida. Continue sem pular etapas.',[
  {label:'Falar com a vítima e avaliar resposta',primary:true,fn:()=>{clinicalStage='B';reward(2,'Via aérea avaliada pela fala: paciente consegue responder.');observe('A vítima responde com voz clara, embora ansiosa. A via aérea está pérvia neste momento.');setTimeout(renderB,1000);}},
  {label:'Perguntar quando almoçou',fn:()=>wrongClinical('Antecipou SAMPLE durante a avaliação primária.',4)},
  {label:'Examinar pelve agora',fn:()=>wrongClinical('Pulou prioridades da avaliação primária.',5)},
  {label:'Abrir prontuário e registrar dados',fn:()=>wrongClinical('Interrompeu a sequência para documentação não prioritária.',3)}
]);}
function renderB(){openInteraction('Avaliação primária','PACIENTE','Use observação clínica antes de buscar números.',[
  {label:'Observar tórax, frequência e esforço respiratório',primary:true,fn:()=>{clinicalStage='C';reward(2,'Respiração avaliada de forma dirigida.');observe('Expansão torácica simétrica, sem esforço marcado. FR aproximada: 22 irpm.');setTimeout(renderC,1000);}},
  {label:'Perguntar medicamentos de uso diário',fn:()=>wrongClinical('Antecipou história SAMPLE.',4)},
  {label:'Avaliar Glasgow agora',fn:()=>wrongClinical('Avançou para avaliação neurológica antes de completar circulação.',5)},
  {label:'Examinar dorso',fn:()=>wrongClinical('Antecipou avaliação secundária.',5)}
]);}
function renderC(){openInteraction('Avaliação primária','PACIENTE','A vítima ainda está ansiosa. Avalie perfusão e circulação.',[
  {label:'Avaliar pulso e perfusão periférica',primary:true,fn:()=>{clinicalStage='D';reward(2,'Circulação e perfusão avaliadas.');observe(`Pulso rápido, perfusão periférica reduzida. ${patient.bloodLoss>35?'A demora prévia tornou os sinais mais preocupantes.':'O controle precoce do sangramento limitou a deterioração.'}`);setTimeout(renderD,1100);}},
  {label:'Repetir pergunta sobre alergias',fn:()=>wrongClinical('História ainda não é a prioridade desta etapa.',3)},
  {label:'Começar exame cabeça aos pés',fn:()=>wrongClinical('Iniciou avaliação secundária antes de concluir a primária.',6)},
  {label:'Encerrar atendimento',fn:()=>wrongClinical('Tentou encerrar sem completar a avaliação.',8)}
]);}
function renderD(){const ev=patient.gcsEvidence;openInteraction('Avaliação neurológica','PACIENTE','Obtenha evidências antes de registrar Glasgow.',[
  {label:'Observar abertura ocular',done:ev.has('E'),fn:()=>{ev.add('E');observe('Os olhos estão abertos espontaneamente.');setTimeout(renderD,850);}},
  {label:'Perguntar nome e local',done:ev.has('V'),fn:()=>{ev.add('V');observe('Diz o nome corretamente, mas se confunde sobre onde está.');setTimeout(renderD,850);}},
  {label:'Pedir um comando motor simples',done:ev.has('M'),fn:()=>{ev.add('M');observe('Obedece ao comando motor solicitado.');setTimeout(renderD,850);}},
  {label:'Registrar Glasgow',primary:true,locked:ev.size<3,fn:()=>{$('#glasgowEvidence').textContent='Olhos abertos espontaneamente. Responde, mas está confuso quanto ao local. Obedece a comando motor simples.';$('#glasgowModal').hidden=false;}}
]);}
function saveGlasgow(){const e=+$('#gE').value,v=+$('#gV').value,m=+$('#gM').value;if(!e||!v||!m){flash('Preencha E, V e M.');return;}$('#glasgowModal').hidden=true;const ok=e===4&&v===4&&m===6;if(ok)reward(4,'Glasgow interpretado corretamente: E4 V4 M6 = 14.');else penalize(8,`Glasgow registrado como E${e} V${v} M${m}; o caso correspondia a E4 V4 M6.`);clinicalStage='E';renderE();}
function renderE(){openInteraction('Conclusão da primária','PACIENTE','Finalize a avaliação primária sem perder controle térmico e privacidade.',[
  {label:'Expor de forma dirigida e proteger do frio',primary:true,fn:()=>{clinicalStage='SAMPLE';reward(2,'Exposição dirigida concluída com proteção térmica.');observe('Nenhuma nova ameaça imediata é percebida na exposição dirigida. Agora obtenha a história e aprofunde o exame.');setTimeout(renderSample,1000);}},
  {label:'Perguntar sobre última refeição antes de expor',fn:()=>wrongClinical('Antecipou a entrevista antes de concluir a primária.',3)},
  {label:'Examinar somente a perna lesionada',fn:()=>wrongClinical('Focou em uma região antes de completar a visão global.',4)}
]);}

const SAMPLE_Q={
  symptoms:['O que você está sentindo agora?','Dor forte na perna direita e tontura leve.','S'],
  allergies:['Você tem alguma alergia conhecida?','Relata alergia a dipirona.','A'],
  meds:['Usa algum medicamento diariamente?','Usa medicamento para hipertensão.','M'],
  past:['Tem alguma doença ou condição importante?','Refere hipertensão; nega cirurgia recente.','P'],
  last:['Quando comeu ou bebeu pela última vez?','Almoçou há cerca de duas horas.','L'],
  event:['Conte o que aconteceu imediatamente antes da colisão.','A moto foi atingida lateralmente e a vítima caiu para o lado direito.','E']
};
function renderSample(){const a=[];Object.entries(SAMPLE_Q).forEach(([k,v])=>a.push({label:v[0],done:patient.sample.has(k),fn:()=>{if(!patient.sample.has(k)){patient.sample.add(k);reward(1,`SAMPLE: informação ${v[2]} obtida.`);}observe(v[1]);setTimeout(renderSample,900);}}));a.push({label:'Qual é o seu signo?',fn:()=>{penalize(3,'Pergunta irrelevante durante história dirigida.');observe('A pergunta não ajuda a tomada de decisão no atendimento.');}});a.push({label:'Qual marca da sua moto?',fn:()=>{penalize(2,'Pergunta de baixo valor clínico durante SAMPLE.');observe('Essa informação não muda a avaliação atual.');}});if(patient.sample.size===6)a.push({label:'Concluir história e iniciar exame secundário',primary:true,fn:()=>{clinicalStage='SECONDARY';reward(2,'História SAMPLE concluída.');startSecondary();}});openInteraction('História dirigida','SAMPLE','Faça uma entrevista eficiente. Nem todas as perguntas disponíveis são úteis.',a);}

const SECONDARY=['head','neck','chest','abdomen','pelvis','limbs','back'];
const REGION_NAME={head:'cabeça',neck:'pescoço',chest:'tórax',abdomen:'abdome',pelvis:'pelve',limbs:'membros',back:'dorso'};
function startSecondary(){closeInteraction();bodyZoneMode=true;patient.secondaryOrder=[];setObjective('AVALIAÇÃO SECUNDÁRIA','Examine a vítima da cabeça aos pés tocando diretamente nas regiões do corpo. Não há marcadores visíveis.');flash('Toque no corpo da vítima em uma sequência sistemática.');canvas.addEventListener('click',secondaryClickOnce);}
function secondaryClickOnce(e){if(!bodyZoneMode)return;const ray=new THREE.Raycaster(),p=new THREE.Vector2(),r=canvas.getBoundingClientRect();p.x=((e.clientX-r.left)/r.width)*2-1;p.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(p,camera);const hit=ray.intersectObjects(clinicalZones,false)[0];if(!hit)return;const region=hit.object.userData.region;if(patient.secondaryOrder.includes(region)){flash(`${REGION_NAME[region]} já examinada.`);return;}const expected=SECONDARY[patient.secondaryOrder.length];patient.secondaryOrder.push(region);if(region===expected){reward(1,`Secundária: ${REGION_NAME[region]} examinada em sequência.`);flash(`${REGION_NAME[region]}: sem nova ameaça imediata.`);}else{penalize(4,`Avaliação secundária fora de sequência: examinou ${REGION_NAME[region]} antes de ${REGION_NAME[expected]}.`);flash(`${REGION_NAME[region]} examinada fora da sequência sistemática.`);}if(patient.secondaryOrder.length===SECONDARY.length){bodyZoneMode=false;canvas.removeEventListener('click',secondaryClickOnce);clinicalStage='DONE';setTimeout(()=>{openInteraction('Atendimento concluído','ENCERRAMENTO','Você completou a abordagem da vítima. Encerre para receber o debrief da ocorrência.',[{label:'Encerrar ocorrência e revisar desempenho',primary:true,fn:finishMission}]);},700);}}

function finishMission(){closeInteraction();phase='DONE';clinicalStatus.hidden=true;const elapsed=nowSec();if(patient.bloodLoss>45){penalize(5,'Demora significativa antes do controle da hemorragia gerou deterioração clínica.');learning.push('Hemorragias externas importantes precisam ser reconhecidas logo na leitura inicial da vítima; atrasos cobram preço no estado clínico.');}else learning.push('A leitura inicial da cena e da vítima permitiu controlar a ameaça externa antes que o caso se deteriorasse mais.');if(!sceneReady())learning.push('Segurança da cena faz parte do atendimento: EPI, sinalização e leitura de riscos precisam anteceder a abordagem.');learning.push('Glasgow deve ser derivado das respostas observadas — abertura ocular, resposta verbal e resposta motora — e registrado por componentes.');learning.push('SAMPLE funciona melhor como história dirigida e eficiente; perguntas irrelevantes consomem tempo sem melhorar decisão clínica.');showDebrief(elapsed);}
function showDebrief(elapsed){show(debrief);$('#finalScore').textContent=score;$('#debriefGrade').textContent=score>=90?'ATENDIMENTO EXCELENTE':score>=75?'MISSÃO CUMPRIDA':score>=60?'ATENDIMENTO APROVADO':'REFORÇO NECESSÁRIO';$('#summaryMetrics').innerHTML=`<div><b>${fmt(elapsed)}</b><span>TEMPO TOTAL</span></div><div><b>${timeline.filter(x=>x.type==='bad').length}</b><span>FALHAS</span></div><div><b>${patient.bloodLoss<35?'PRECOCE':'TARDIO'}</b><span>CONTROLE X</span></div>`;$('#timeline').innerHTML=timeline.map(x=>`<div class="${x.type}"><time>${fmt(x.t)}</time><span>${x.text}</span></div>`).join('');$('#learning').innerHTML=learning.map(x=>`<p>${x}</p>`).join('');}

function drawMinimap(){
  const w=mini.width,h=mini.height,scale=w/WORLD;mctx.clearRect(0,0,w,h);mctx.save();mctx.beginPath();mctx.arc(w/2,h/2,w/2-3,0,Math.PI*2);mctx.clip();mctx.fillStyle='#151b20';mctx.fillRect(0,0,w,h);
  const tx=x=>(x+WORLD/2)*scale,tz=z=>(z+WORLD/2)*scale;
  mctx.strokeStyle='#404950';mctx.lineWidth=12*scale;[-30,0,30].forEach(z=>{mctx.beginPath();mctx.moveTo(0,tz(z));mctx.lineTo(w,tz(z));mctx.stroke();});[-48,0,48].forEach(x=>{mctx.beginPath();mctx.moveTo(tx(x),0);mctx.lineTo(tx(x),h);mctx.stroke();});
  mctx.fillStyle='#53a35f';mctx.beginPath();mctx.arc(tx(BASE_POS.x),tz(BASE_POS.z),4,0,Math.PI*2);mctx.fill();mctx.fillStyle='#72a8d6';mctx.beginPath();mctx.arc(tx(HOSPITAL_POS.x),tz(HOSPITAL_POS.z),4,0,Math.PI*2);mctx.fill();
  if(phase!=='DONE'){mctx.fillStyle='#e64b3f';mctx.beginPath();mctx.arc(tx(ACCIDENT_POS.x),tz(ACCIDENT_POS.z),6,0,Math.PI*2);mctx.fill();}
  const actor=controlled==='vehicle'?ambulance.root:player.root,ang=controlled==='vehicle'?ambulance.heading:player.root.rotation.y;mctx.save();mctx.translate(tx(actor.position.x),tz(actor.position.z));mctx.rotate(-ang);mctx.fillStyle='#fff';mctx.beginPath();mctx.moveTo(0,-7);mctx.lineTo(5,5);mctx.lineTo(-5,5);mctx.closePath();mctx.fill();mctx.restore();mctx.restore();
}

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=5').catch(()=>{}));
