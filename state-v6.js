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

let renderer,scene,camera,clock;
let player={root:null,visual:null,mixer:null,speed:0};
let ambulance={root:null,visual:null,speed:0,heading:0,siren:false};
let traffic=[], pedestrians=[], curiosos=[], buildings=[], streetLights=[], trafficLights=[], parkedCars=[], cityDecor=[];
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
let cameraYaw=0.15,cameraPitch=.34,cameraDistance=7.2,lastCameraDrag=0;
let smoothCamPos=new THREE.Vector3(),smoothCamTarget=new THREE.Vector3(),cameraReady=false;
let cityClock=0,lastDistrict='',audioCtx=null,sirenOscA=null,sirenOscB=null,sirenGain=null;
let joy={x:0,y:0,active:false,id:null};
let runHeld=false;
let keys={};
let cameraPointer=null;
let uiLocked=false;
let trafficCollisionCooldown=0;
let models={man:null,truck:null,car:null};
let bodyZoneMode=false;
let trafficPhase='H_GREEN';

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

function initAudio(){try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume?.();}catch{}}
function radioBeep(){if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=880;g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.04,audioCtx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.18);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.2);}
function setSirenAudio(on){if(!audioCtx)return;if(on&&!sirenGain){sirenGain=audioCtx.createGain();sirenGain.gain.value=.025;sirenOscA=audioCtx.createOscillator();sirenOscB=audioCtx.createOscillator();sirenOscA.type='sine';sirenOscB.type='sine';sirenOscA.connect(sirenGain);sirenOscB.connect(sirenGain);sirenGain.connect(audioCtx.destination);sirenOscA.start();sirenOscB.start();}if(!on&&sirenGain){sirenGain.gain.setTargetAtTime(.0001,audioCtx.currentTime,.05);setTimeout(()=>{try{sirenOscA.stop();sirenOscB.stop();}catch{}sirenGain=null;sirenOscA=sirenOscB=null;},220);}}
function updateSirenAudio(t){if(!sirenGain||!sirenOscA||!sirenOscB)return;const sweep=(Math.sin(t*4.2)+1)/2;sirenOscA.frequency.setValueAtTime(520+sweep*210,audioCtx.currentTime);sirenOscB.frequency.setValueAtTime(680+(1-sweep)*170,audioCtx.currentTime);}

async function init(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x86a9c0);scene.fog=new THREE.Fog(0x86a9c0,62,145);
  camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,220);clock=new THREE.Clock();
  const hemi=new THREE.HemisphereLight(0xddeeff,0x5d4b39,1.85);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffe5bd,3.0);sun.position.set(-35,65,28);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;scene.add(sun);
  initAudio();buildCity();buildActors();buildAccident();bindInput();resize();addEventListener('resize',resize);
  phase='BASE';setObjective('EM SERVIÇO','Apresente-se na unidade e aguarde a central.');missionStart=performance.now();logEvent('Plantão iniciado.');
  show(game);requestAnimationFrame(loop);
  setTimeout(()=>{if(phase==='BASE'){radioBeep();dispatchModal.hidden=false;}},1200);
}