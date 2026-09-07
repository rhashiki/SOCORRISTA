import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const $ = (s) => document.querySelector(s);
const home = $('#home'), game = $('#game'), debrief = $('#debrief');
const screens = [home, game, debrief];
const canvasEl = $('#sceneCanvas'), sceneWrap = $('#sceneWrap');
const loadingEl = $('#sceneLoading'), loadingText = $('#loadingText');
const actionSheet = $('#actionSheet'), protocolRail = $('#protocolRail');

const HUMAN_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/glTF-Binary/CesiumMan.glb';
const gltfLoader = new GLTFLoader();
let humanAsset = null;

const MISSIONS = [
  {id:'xabcde',protocol:'XABCDE',title:'COLISÃO URBANA',letter:'X',accent:'#a52a21',accent2:'#e3aa63',subtitle:'Encontre a ameaça e priorize sem ajuda',meta:['CENA LIVRE','EVOLUÇÃO','TRAUMA'],goal:'Examine a cena, encontre o problema prioritário e conduza a avaliação primária na ordem correta.'},
  {id:'glasgow',protocol:'GLASGOW',title:'QUEDA EM ESCADA',letter:'G',accent:'#376b85',accent2:'#9fc9d9',subtitle:'Obtenha respostas antes de pontuar',meta:['OBSERVAÇÃO','RESPOSTA','E/V/M'],goal:'Observe, interaja com a vítima e só então determine os componentes do Glasgow.'},
  {id:'sample',protocol:'SAMPLE',title:'CICLISTA AO SOLO',letter:'S',accent:'#8a6d36',accent2:'#e2bf78',subtitle:'Entrevista sem letras entregues',meta:['DIÁLOGO','MEMÓRIA','TEMPO'],goal:'Faça perguntas úteis, descarte distrações e organize as respostas no SAMPLE.'},
  {id:'secondary',protocol:'SECUNDÁRIA',title:'ACIDENTE EM OBRA',letter:'2',accent:'#8a5a2c',accent2:'#e1bc76',subtitle:'Varredura sistemática da vítima',meta:['CABEÇA AOS PÉS','ACHADOS','SINAIS'],goal:'Examine a vítima de forma sistemática, identifique achados e conclua os blocos complementares.'}
];

const progress = JSON.parse(localStorage.getItem('reforce-aph-progress') || '{}');
let renderer, scene3d, camera, world, raycaster, pointer;
let currentMission = null, run = null, raf = 0, lastFrame = 0;
let yaw = .5, pitch = .58, distance = 8.2;
let pointers = new Map(), moved = false, pinchDistance = null;
let hitZones = [], animationFns = [], flashers = [], currentHuman = null;

function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function saveProgress(){localStorage.setItem('reforce-aph-progress',JSON.stringify(progress));}
function showScreen(el){screens.forEach(s=>s.classList.remove('is-active'));el.classList.add('is-active');}
function seconds(){return Math.max(0,Math.round((Date.now()-run.started)/1000));}

function renderHome(){
  const grid=$('#missionGrid'); grid.innerHTML='';
  MISSIONS.forEach(m=>{
    const best=progress[m.id]||0, stars=best>=90?3:best>=75?2:best>=55?1:0;
    const b=document.createElement('button'); b.className='mission-card'; b.dataset.letter=m.letter;
    b.style.setProperty('--accent',m.accent);b.style.setProperty('--accent2',m.accent2);
    b.innerHTML=`<i class="stripe"></i><div class="mission-top"><span class="mission-tag">${m.protocol}</span><span class="mission-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span></div><h3>${m.title}</h3><p>${m.subtitle}</p><div class="mission-meta">${m.meta.map(x=>`<span>${x}</span>`).join('')}</div>`;
    b.onclick=()=>startMission(m); grid.appendChild(b);
  });
  const avg=Math.round(MISSIONS.reduce((a,m)=>a+(progress[m.id]||0),0)/MISSIONS.length);
  $('#progressPct').textContent=avg+'%'; $('#progressBar').style.width=avg+'%';
}

function setupRenderer(){
  if(renderer)return;
  renderer=new THREE.WebGLRenderer({canvas:canvasEl,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();bindCanvasControls();new ResizeObserver(resizeRenderer).observe(sceneWrap);
}
function resizeRenderer(){if(!renderer||!camera)return;const w=Math.max(1,sceneWrap.clientWidth),h=Math.max(1,sceneWrap.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function mat(color,rough=.8,metal=.04,extra={}){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,...extra});}
function addMesh(g,m,p=[0,0,0],r=[0,0,0],parent=world){const o=new THREE.Mesh(g,m);o.position.set(...p);o.rotation.set(...r);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(size,color,p,r=[0,0,0],parent=world,m=null){return addMesh(new THREE.BoxGeometry(...size),m||mat(color),p,r,parent);}
function cyl(rad,h,color,p,r=[0,0,0],parent=world,m=null){return addMesh(new THREE.CylinderGeometry(rad,rad,h,18),m||mat(color),p,r,parent);}
function plane(size,color,p,r=[-Math.PI/2,0,0],parent=world,m=null){return addMesh(new THREE.PlaneGeometry(...size),m||mat(color,1),p,r,parent);}

async function getHuman(){
  if(humanAsset)return SkeletonUtils.clone(humanAsset.scene);
  const gltf=await gltfLoader.loadAsync(HUMAN_URL); humanAsset=gltf; return SkeletonUtils.clone(gltf.scene);
}
function fallbackHuman(){
  const g=new THREE.Group(),skin=mat(0xb67e5e),shirt=mat(0x303840),pants=mat(0x20252a);
  addMesh(new THREE.SphereGeometry(.22,20,14),skin,[0,1.65,0],[0,0,0],g);
  addMesh(new THREE.CapsuleGeometry(.25,.72,5,12),shirt,[0,1.08,0],[0,0,0],g);
  for(const s of [-1,1]){addMesh(new THREE.CapsuleGeometry(.08,.55,4,10),shirt,[.34*s,1.12,0],[0,0,s*.22],g);addMesh(new THREE.CapsuleGeometry(.1,.68,4,10),pants,[.14*s,.45,0],[0,0,s*.08],g);}
  return g;
}
async function addVictim(){
  let h; try{h=await getHuman();h.scale.setScalar(1.45);}catch(e){console.warn('GLB fallback',e);h=fallbackHuman();}
  h.rotation.z=-Math.PI/2;h.rotation.y=.08;h.position.set(.1,.25,.05);world.add(h);currentHuman=h;return h;
}
function addResponder(x,z,rot=0){const g=fallbackHuman();g.scale.setScalar(.9);g.position.set(x,0,z);g.rotation.y=rot;world.add(g);return g;}
function addHitZone(id,p,r=.45){const z=addMesh(new THREE.SphereGeometry(r,10,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),p);z.userData.zone=id;hitZones.push(z);return z;}

function baseScene(){
  hitZones=[];animationFns=[];flashers=[];scene3d=new THREE.Scene();scene3d.background=new THREE.Color(0x07090d);scene3d.fog=new THREE.FogExp2(0x090c12,.035);world=new THREE.Group();scene3d.add(world);camera=new THREE.PerspectiveCamera(52,1,.1,100);
  scene3d.add(new THREE.HemisphereLight(0x8798b4,0x1b100d,1.3));
  const moon=new THREE.DirectionalLight(0xb9c9e6,1.7);moon.position.set(-6,9,3);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);scene3d.add(moon);
  const warm=new THREE.DirectionalLight(0xffc48c,.65);warm.position.set(5,4,5);scene3d.add(warm);
  plane([36,36],0x292722,[0,0,0]);yaw=.55;pitch=.58;distance=8.2;updateCamera();resizeRenderer();
}
function emergencyLight(color,p,phase){const l=new THREE.PointLight(color,3.4,11,2);l.position.set(...p);scene3d.add(l);flashers.push({l,phase});}
function ambulance(x=-5,z=-.3){
  const g=new THREE.Group();g.position.set(x,.02,z);world.add(g);box([4,.85,1.8],0xe5e8ea,[0,.8,0],[0,0,0],g,mat(0xe5e8ea,.48,.12));box([1.8,.6,1.65],0xf4f5f6,[1.05,1.45,0],[0,0,0],g);for(const wx of [-1.15,1])for(const wz of [-.82,.82])cyl(.32,.24,0x080808,[wx,.32,wz],[Math.PI/2,0,0],g);plane([1.45,.12],0xb52222,[.2,1.0,.92],[-Math.PI/2,0,0],g);emergencyLight(0xff2b24,[x-1.5,1.8,z+.7],0);emergencyLight(0x2f73ff,[x-1.5,1.8,z-.7],Math.PI/2);
}
function cone(x,z){addMesh(new THREE.ConeGeometry(.2,.6,12),mat(0xc35a22),[x,.31,z]);box([.5,.05,.5],0x1b1a18,[x,.03,z]);}
function darkStain(p,scale=1){const m=new THREE.MeshBasicMaterial({color:0x7a1515,transparent:true,opacity:.84,side:THREE.DoubleSide});const s=plane([.7*scale,.28*scale],0x7a1515,p,[-Math.PI/2,0,.18],world,m);s.name='injury-stain';return s;}
function bandageMarker(p){const g=new THREE.Group();g.position.set(...p);world.add(g);box([.42,.08,.28],0xe2d9c6,[0,0,0],[0,.2,0],g,mat(0xe2d9c6,.7,.03));return g;}

async function buildXScene(){
  baseScene();ambulance(-6,-.6);for(let x=-10;x<10;x+=2.3)plane([1.05,.07],0xc2a46a,[x,.012,-1.8]);
  const car=new THREE.Group();car.position.set(3,.35,-1.1);car.rotation.y=-.22;world.add(car);box([3.5,.66,1.6],0x5b1c18,[0,.45,0],[0,0,0],car,mat(0x5b1c18,.55,.18));box([1.9,.55,1.24],0x391512,[.18,.98,0],[0,0,0],car);for(const a of [-1.1,1.1])for(const b of [-.73,.73])cyl(.34,.25,0x090909,[a,.25,b],[Math.PI/2,0,0],car);cone(-2.6,-1.4);cone(-1.8,-2.1);
  await addVictim();currentHuman.position.set(.1,.25,.2);addResponder(.6,.05,-.55);addResponder(-1.2,-.25,.8);
  run.visuals={stain:darkStain([-.6,.055,.48],1.15),pool:darkStain([-.88,.018,.58],.75),bandage:null};
  addHitZone('leg',[-.55,.5,.4],.58);addHitZone('head',[1.25,.63,.05],.48);addHitZone('chest',[.45,.58,.04],.55);addHitZone('wrist',[.85,.42,.42],.42);addHitZone('whole',[.15,.5,-.18],.68);
}
async function buildGlasgowScene(){baseScene();ambulance(-6,2.5);for(let i=0;i<8;i++)box([3,.27,.75],0x3d3731,[-3+i*.55,.14+i*.27,-1.8+i*.22]);await addVictim();currentHuman.position.set(.25,.22,.25);addResponder(-.5,0,.95);addHitZone('head',[1.25,.62,.02],.55);addHitZone('hand',[.62,.43,.42],.48);}
async function buildSampleScene(){baseScene();ambulance(-6,.5);const bike=new THREE.Group();bike.position.set(2.4,.6,-1.15);bike.rotation.set(.2,.55,.15);world.add(bike);for(const z of [-.6,.6])addMesh(new THREE.TorusGeometry(.56,.055,10,24),mat(0x101112),[0,0,z],[0,0,0],bike);cyl(.035,1.15,0x962f27,[0,0,0],[Math.PI/2,0,0],bike);await addVictim();currentHuman.position.set(-.35,.22,.25);addResponder(.45,0,.95);addHitZone('head',[1.1,.6,.04],.55);}
async function buildSecondaryScene(){baseScene();for(const x of [-3.5,-1.2,1.2,3.5])for(const z of [-2.3,2.3])cyl(.07,4.8,0x777777,[x,2.4,z]);for(let y=.6;y<4.6;y+=1.1){box([7.3,.07,.1],0x7d7d7d,[0,y,-2.3]);box([7.3,.07,.1],0x7d7d7d,[0,y,2.3]);}cone(-2.6,-1.4);cone(-1.8,-1.9);await addVictim();currentHuman.position.set(.05,.22,.12);addResponder(.5,0,.95);[['head',[1.25,.62,.02],.5],['neck',[.95,.56,.02],.38],['chest',[.46,.55,.02],.52],['abdomen',[.02,.51,.02],.46],['pelvis',[-.38,.48,.02],.42],['limbs',[-1.05,.43,.25],.65],['back',[.25,.42,-.36],.55]].forEach(x=>addHitZone(...x));}

function addRuntimeUI(){
  let s=$('#caseStatus');if(!s){s=document.createElement('div');s.id='caseStatus';s.className='case-status';sceneWrap.appendChild(s);}let t=$('#sceneToast');if(!t){t=document.createElement('div');t.id='sceneToast';t.className='scene-toast';sceneWrap.appendChild(t);}
}
function toast(title,text,type='info'){const el=$('#sceneToast');el.className='scene-toast show '+type;el.innerHTML=`<b>${title}</b><span>${text}</span>`;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2800);}
function note(kind,text){run.notes.push({kind,text,time:seconds()});}
function penalize(points,text){run.score=Math.max(0,run.score-points);run.errors++;note('erro',text);$('#scoreValue').textContent=run.score;toast('PRIORIDADE INCORRETA',text,'bad');}
function reward(points,text){run.score=Math.min(100,run.score+points);note('acerto',text);$('#scoreValue').textContent=run.score;toast('BOA DECISÃO',text,'good');}

async function startMission(m){
  currentMission=m;run={score:100,errors:0,started:Date.now(),notes:[],quizCorrect:0,stage:0,stability:100,finished:false,data:{}};
  showScreen(game);addRuntimeUI();loadingEl.hidden=false;loadingText.textContent='Montando ocorrência...';$('#gameProtocol').textContent=m.protocol;$('#gameTitle').textContent=m.title;$('#scoreValue').textContent='100';$('#objectiveText').textContent=m.goal;
  setupRenderer();try{if(m.id==='xabcde')await buildXScene();if(m.id==='glasgow')await buildGlasgowScene();if(m.id==='sample')await buildSampleScene();if(m.id==='secondary')await buildSecondaryScene();loadingEl.hidden=true;renderMissionUI();startLoop();}catch(e){console.error(e);loadingText.textContent='Falha ao montar a cena.';$('#bootError').hidden=false;$('#bootError').textContent='Erro 3D: '+e.message;}
}

function renderMissionUI(){if(currentMission.id==='xabcde')renderXUI();if(currentMission.id==='glasgow')renderGlasgowUI();if(currentMission.id==='sample')renderSampleUI();if(currentMission.id==='secondary')renderSecondaryUI();renderRail();updateCaseStatus();}
function renderRail(){let labels=[];if(currentMission.id==='xabcde')labels=['X','A','B','C','D','E'];if(currentMission.id==='glasgow')labels=['OBS','VOZ','MOTOR','REG'];if(currentMission.id==='sample')labels=['COLETAR','ORGANIZAR','REG'];if(currentMission.id==='secondary')labels=['CABEÇA','PESCOÇO','TÓRAX','ABD','PELVE','MEMB','DORSO','SV','HIST'];protocolRail.innerHTML=labels.map((x,i)=>`<div class="protocol-step ${i<run.stage?'done':i===run.stage?'current':''}">${x}</div>`).join('');}
function updateCaseStatus(){const el=$('#caseStatus');const s=run.stability;el.innerHTML=`<span>OCORRÊNCIA <b>${seconds()}s</b></span><span>ESTADO <b class="${s<70?'danger':s<85?'warn':'ok'}">${s<70?'INSTÁVEL':s<85?'ATENÇÃO':'SEM PIORA APARENTE'}</b></span>`;}

function renderXUI(){
  const d=run.data.x ||= {found:false,controlled:false,airway:false,breathing:false,circulation:false,neuro:false,exposure:false,inspected:new Set()};
  const actions=[];
  actions.push(['exam-leg','Examinar membro inferior','Observar roupa, solo e membro.']);actions.push(['airway','Avaliar via aérea','Verifique se a vítima mantém a via aérea.']);actions.push(['breathing','Avaliar respiração','Observe movimento torácico e esforço respiratório.']);actions.push(['circulation','Checar perfusão','Avalie perfusão e sinais circulatórios.']);actions.push(['neuro','Avaliar consciência','Obtenha resposta e estado neurológico inicial.']);actions.push(['exposure','Fazer varredura rápida','Procure outras alterações mantendo proteção térmica.']);
  if(d.found&&!d.controlled)actions.unshift(['control','Controlar hemorragia externa','Priorize a ameaça externa identificada.']);
  const done=d.controlled&&d.airway&&d.breathing&&d.circulation&&d.neuro&&d.exposure;
  actionSheet.innerHTML=`<div class="sheet-title"><b>DECIDA NA CENA</b><span>SEM LETRAS ENTREGUES</span></div><p class="sheet-copy">Nada está destacado. Observe a vítima, toque nas regiões do corpo ou escolha uma ação. A ordem das prioridades conta.</p><div class="action-grid">${actions.map(a=>`<button class="action-btn" data-act="${a[0]}"><b>${a[1]}</b>${a[2]}</button>`).join('')}</div>${done?'<button class="action-btn full" data-act="finish">ENCERRAR AVALIAÇÃO PRIMÁRIA</button>':''}`;
  actionSheet.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>handleXAction(b.dataset.act));
}
function handleXAction(a){const d=run.data.x;
  if(a==='exam-leg'){d.found=true;d.inspected.add('leg');reward(2,'Você percebeu uma alteração importante no membro inferior e no solo ao redor.');note('ensino','A cena deve ser observada antes de seguir mecanicamente o mnemônico.');renderXUI();return;}
  if(a==='control'){if(!d.found)return penalize(4,'Você tentou uma conduta sem antes identificar o problema na cena.');if(d.controlled)return;d.controlled=true;run.stage=Math.max(run.stage,1);run.stability=Math.max(run.stability,82);if(run.visuals?.stain){run.visuals.stain.material.opacity=.28;run.visuals.pool.material.opacity=.22;}run.visuals.bandage=bandageMarker([-.62,.3,.46]);reward(8,'A ameaça externa prioritária foi reconhecida e controlada antes de avançar.');note('ensino','No XABCDE, uma hemorragia externa grave tem prioridade sobre as etapas seguintes.');renderMissionUI();return;}
  const map={airway:['airway',1,'A via aérea está mantida; a vítima responde ao chamado.','Avaliar via aérea antes de resolver uma hemorragia externa grave visível quebra a prioridade.'],breathing:['breathing',2,'A respiração está presente; há expansão torácica perceptível.','Você avançou para respiração antes de concluir as prioridades anteriores.'],circulation:['circulation',3,'Perfusão periférica reduzida, sem novo foco externo importante.','Você avançou para circulação cedo demais.'],neuro:['neuro',4,'A vítima responde, porém parece desorientada.','Você avançou para avaliação neurológica cedo demais.'],exposure:['exposure',5,'Nenhuma outra alteração externa importante foi encontrada na varredura rápida.','Você avançou para exposição cedo demais.']};
  if(map[a]){const [key,stage,okmsg,badmsg]=map[a];if(d[key])return;if(stage>0 && !d.controlled)return penalize(6,badmsg);const prev=['controlled','airway','breathing','circulation','neuro'];if(stage>1&&!d[prev[stage-1]])return penalize(5,badmsg);d[key]=true;run.stage=Math.max(run.stage,stage+1);reward(3,okmsg);renderMissionUI();return;}
  if(a==='finish')finishMission();
}

function renderGlasgowUI(){
  const d=run.data.g ||= {observe:false,voice:false,motor:false,orientation:false,registered:false};
  if(d.registered){actionSheet.innerHTML='<div class="sheet-title"><b>REGISTRO CONCLUÍDO</b><span>E/V/M</span></div><div class="obs">As respostas foram registradas. O debrief vai revisar a interpretação.</div><button class="action-btn full" id="gFinish">IR AO DEBRIEF</button>';$('#gFinish').onclick=finishMission;return;}
  const ready=d.observe&&d.voice&&d.motor;
  actionSheet.innerHTML=`<div class="sheet-title"><b>OBTENHA EVIDÊNCIAS</b><span>${[d.observe,d.voice,d.motor].filter(Boolean).length}/3 ESSENCIAIS</span></div><p class="sheet-copy">Não escolha um número primeiro. Observe o comportamento da vítima e construa a pontuação a partir das respostas.</p><div class="action-grid"><button class="action-btn" data-g="observe"><b>Observar sem estímulo</b>Veja se há resposta espontânea.</button><button class="action-btn" data-g="voice"><b>Chamar a vítima</b>Observe olhos e fala.</button><button class="action-btn" data-g="motor"><b>Dar comando simples</b>Observe resposta motora.</button><button class="action-btn" data-g="orientation"><b>Perguntar onde está</b>Teste orientação da fala.</button></div>${ready?`<div class="glasgow-grid"><label>ABERTURA OCULAR<select id="gE"><option value="">–</option>${[1,2,3,4].map(n=>`<option>${n}</option>`).join('')}</select></label><label>RESPOSTA VERBAL<select id="gV"><option value="">–</option>${[1,2,3,4,5].map(n=>`<option>${n}</option>`).join('')}</select></label><label>RESPOSTA MOTORA<select id="gM"><option value="">–</option>${[1,2,3,4,5,6].map(n=>`<option>${n}</option>`).join('')}</select></label></div><button class="action-btn full" id="gRecord">REGISTRAR AVALIAÇÃO</button>`:''}`;
  actionSheet.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>handleG(b.dataset.g));if(ready)$('#gRecord').onclick=recordG;
}
function handleG(a){const d=run.data.g;if(d[a])return;d[a]=true;
  if(a==='observe'){run.stage=Math.max(run.stage,1);reward(2,'Sem estímulo, a vítima permanece com os olhos fechados.');}
  if(a==='voice'){run.stage=Math.max(run.stage,2);reward(2,'Ao ser chamada, a vítima abre os olhos e fala de forma confusa.');if(currentHuman){currentHuman.rotation.y+=.06;setTimeout(()=>currentHuman&&(currentHuman.rotation.y-=.06),500);}}
  if(a==='motor'){run.stage=Math.max(run.stage,3);reward(2,'A vítima obedece a um comando motor simples.');if(currentHuman){currentHuman.position.z+=.08;setTimeout(()=>currentHuman&&(currentHuman.position.z-=.08),500);}}
  if(a==='orientation')reward(1,'A vítima conversa, mas se confunde ao dizer onde está.');renderMissionUI();}
function recordG(){const e=+$('#gE').value,v=+$('#gV').value,m=+$('#gM').value;if(!e||!v||!m)return toast('REGISTRO INCOMPLETO','Preencha os três componentes.','bad');const ok=e===3&&v===4&&m===6;if(ok)reward(10,'Você converteu corretamente as respostas observadas em E3 V4 M6.');else penalize(12,`As respostas observadas correspondiam a E3 V4 M6, não E${e} V${v} M${m}.`);run.data.g.registered=true;run.stage=4;note('ensino','Glasgow deve ser construído a partir do comportamento observado, não decorado como um total isolado.');renderMissionUI();}

const SAMPLE_QUESTIONS=[
  {id:'S',q:'O que você está sentindo agora?',a:'Dor no ombro direito e tontura leve.'},{id:'A',q:'Você tem alguma alergia conhecida?',a:'Tenho alergia a dipirona.'},{id:'M',q:'Usa algum medicamento todos os dias?',a:'Uso medicamento para pressão.'},{id:'P',q:'Tem algum problema de saúde importante?',a:'Tenho hipertensão.'},{id:'L',q:'Quando comeu ou bebeu pela última vez?',a:'Almocei há cerca de duas horas.'},{id:'E',q:'O que aconteceu antes da queda?',a:'A roda dianteira travou e eu caí sobre o lado direito.'},
  {id:'x1',q:'Qual é sua profissão?',a:'Trabalho em escritório.'},{id:'x2',q:'Você prefere hospital público ou privado?',a:'Não sei.'},{id:'x3',q:'Você já caiu de bicicleta antes?',a:'Sim, mas faz bastante tempo.'}
];
function renderSampleUI(){const d=run.data.s ||= {asked:new Set(),responses:{},classified:false};const relevant=[...d.asked].filter(x=>/^[SAMPLE]$/.test(x)).length;
  if(d.classified){actionSheet.innerHTML='<div class="sheet-title"><b>ENTREVISTA ORGANIZADA</b><span>SAMPLE</span></div><button class="action-btn full" id="sFinish">IR AO DEBRIEF</button>';$('#sFinish').onclick=finishMission;return;}
  const remaining=SAMPLE_QUESTIONS.filter(q=>!d.asked.has(q.id));const logs=Object.entries(d.responses).map(([id,a])=>`<div class="obs"><b>Resposta:</b> ${a}</div>`).join('');
  const organize=relevant===6?`<div class="sample-sort">${['S','A','M','P','L','E'].map(letter=>`<label>${letter}<select data-slot="${letter}"><option value="">Escolha a resposta</option>${Object.entries(d.responses).filter(([id])=>/^[SAMPLE]$/.test(id)).map(([id,a])=>`<option value="${id}">${a}</option>`).join('')}</select></label>`).join('')}</div><button class="action-btn full" id="sOrganize">CONFIRMAR ORGANIZAÇÃO</button>`:'';
  actionSheet.innerHTML=`<div class="sheet-title"><b>ENTREVISTA</b><span>${relevant}/6 CAMPOS ÚTEIS</span></div><p class="sheet-copy">Escolha perguntas que realmente ajudem a construir o histórico. Perguntas irrelevantes consomem tempo e pontuação.</p><div class="action-grid">${remaining.map(q=>`<button class="action-btn" data-sq="${q.id}"><b>${q.q}</b>Perguntar à vítima</button>`).join('')}</div>${logs?`<div class="obs-list">${logs}</div>`:''}${organize}`;
  actionSheet.querySelectorAll('[data-sq]').forEach(b=>b.onclick=()=>askSample(b.dataset.sq));if(relevant===6)$('#sOrganize').onclick=organizeSample;}
function askSample(id){const d=run.data.s,q=SAMPLE_QUESTIONS.find(x=>x.id===id);d.asked.add(id);d.responses[id]=q.a;if(/^[SAMPLE]$/.test(id)){reward(2,'Pergunta relevante coletada.');run.stage=Math.min(1,[...d.asked].filter(x=>/^[SAMPLE]$/.test(x)).length===6?1:0);}else penalize(3,'A pergunta não ajuda a construir o SAMPLE desta ocorrência.');toast('RESPOSTA DA VÍTIMA',q.a,'info');renderMissionUI();}
function organizeSample(){const sels=[...actionSheet.querySelectorAll('[data-slot]')];if(sels.some(s=>!s.value))return toast('ORGANIZAÇÃO INCOMPLETA','Classifique todas as respostas.','bad');let ok=0;sels.forEach(s=>{if(s.dataset.slot===s.value)ok++;});if(ok===6)reward(12,'Você associou corretamente cada resposta ao SAMPLE.');else penalize((6-ok)*3,`${ok}/6 respostas foram classificadas corretamente.`);run.data.s.classified=true;run.stage=3;note('ensino','O mnemônico só é útil quando cada pergunta produz informação clínica relevante.');renderMissionUI();}

const SEC_ORDER=['head','neck','chest','abdomen','pelvis','limbs','back'];
const SEC_FINDINGS={head:'Sem alteração externa evidente na cabeça.',neck:'Pescoço sem alteração externa evidente durante a inspeção.',chest:'Movimento torácico presente e simétrico na inspeção.',abdomen:'Abdome sem alteração externa evidente na inspeção.',pelvis:'Pelve sem alteração externa evidente na inspeção.',limbs:'Dor e limitação no ombro direito são relatadas.',back:'Dorso sem alteração externa evidente na inspeção.'};
function renderSecondaryUI(){const d=run.data.sec ||= {done:[],visited:new Set(),vitals:false,history:false};if(d.vitals&&d.history&&d.done.length===7){actionSheet.innerHTML='<div class="sheet-title"><b>AVALIAÇÃO SECUNDÁRIA CONCLUÍDA</b><span>9/9</span></div><button class="action-btn full" id="secFinish">IR AO DEBRIEF</button>';$('#secFinish').onclick=finishMission;return;}
  const extras=d.done.length===7?`<div class="action-grid"><button class="action-btn ${d.vitals?'done':''}" data-sec-extra="vitals"><b>Registrar sinais vitais</b>Complete o bloco objetivo.</button><button class="action-btn ${d.history?'done':''}" data-sec-extra="history"><b>Completar história e mecanismo</b>Use SAMPLE e contexto do trauma.</button></div>`:'';
  actionSheet.innerHTML=`<div class="sheet-title"><b>EXAME DA VÍTIMA</b><span>${d.done.length}/7 REGIÕES</span></div><p class="sheet-copy">Toque diretamente nas regiões do paciente. Não há marcadores visuais. A ordem cabeça → pés é pontuada.</p><div class="obs">Últimos achados: <b>${d.done.slice(-2).map(x=>SEC_FINDINGS[x]).join(' • ')||'nenhum'}</b></div>${extras}`;
  actionSheet.querySelectorAll('[data-sec-extra]').forEach(b=>b.onclick=()=>{const k=b.dataset.secExtra;if(!run.data.sec[k]){run.data.sec[k]=true;reward(3,k==='vitals'?'Sinais vitais registrados.':'História e mecanismo concluídos.');run.stage=Math.min(9,7+(run.data.sec.vitals?1:0)+(run.data.sec.history?1:0));renderMissionUI();}});}
function inspectSecondary(id){const d=run.data.sec;if(d.done.includes(id))return;d.visited.add(id);const expected=SEC_ORDER[d.done.length];if(id===expected){reward(3,'Região examinada na sequência sistemática.');d.done.push(id);run.stage=d.done.length;}else{penalize(3,`Você examinou uma região fora da sequência. A próxima região esperada ainda é ${expected}.`);}toast('ACHADO',SEC_FINDINGS[id],'info');renderMissionUI();}

function zoneTapped(id){if(currentMission.id==='xabcde'){if(id==='leg')handleXAction('exam-leg');else if(id==='head')toast('INSPEÇÃO','A vítima responde quando você se aproxima.','info');else if(id==='chest')toast('INSPEÇÃO','Movimento torácico pode ser observado.','info');else if(id==='wrist')toast('INSPEÇÃO','O pulso periférico só é interpretado após avaliação direcionada.','info');return;}if(currentMission.id==='glasgow'){if(id==='head')handleG('voice');if(id==='hand')handleG('motor');return;}if(currentMission.id==='secondary')inspectSecondary(id);}

function bindCanvasControls(){canvasEl.addEventListener('pointerdown',e=>{canvasEl.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;if(pointers.size===2){const a=[...pointers.values()];pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);}});canvasEl.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;yaw-=dx*.006;pitch=clamp(pitch+dy*.004,.2,1.15);updateCamera();}if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinchDistance)distance=clamp(distance+(pinchDistance-d)*.012,4.8,13);pinchDistance=d;updateCamera();}});const up=e=>{if(!moved&&pointers.size===1)pickAt(e.clientX,e.clientY);pointers.delete(e.pointerId);if(pointers.size<2)pinchDistance=null;};canvasEl.addEventListener('pointerup',up);canvasEl.addEventListener('pointercancel',up);}
function pickAt(x,y){if(!raycaster||!camera)return;const r=canvasEl.getBoundingClientRect();pointer.x=((x-r.left)/r.width)*2-1;pointer.y=-((y-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const h=raycaster.intersectObjects(hitZones,false)[0];if(h)zoneTapped(h.object.userData.zone);}
function updateCamera(){if(!camera)return;const target=new THREE.Vector3(0,.55,0);camera.position.set(target.x+distance*Math.sin(pitch)*Math.cos(yaw),target.y+distance*Math.cos(pitch),target.z+distance*Math.sin(pitch)*Math.sin(yaw));camera.lookAt(target);}

function tick(dt){if(!run||run.finished)return;updateCaseStatus();if(currentMission.id==='xabcde'){const d=run.data.x;if(d&&!d.controlled&&seconds()>12){run.stability=clamp(100-Math.floor((seconds()-12)/4)*4,58,100);if(run.stability<80&&Math.floor(seconds())%8===0&&!run.data.warned){run.data.warned=true;toast('PACIENTE PIORANDO','A ameaça prioritária ainda não foi resolvida.','bad');note('erro','A demora diante da ameaça prioritária reduziu a estabilidade do caso.');}}}}
function startLoop(){cancelAnimationFrame(raf);lastFrame=performance.now();const loop=(now)=>{const dt=(now-lastFrame)/1000;lastFrame=now;tick(dt);flashers.forEach((f,i)=>f.l.intensity=3.2*(.18+Math.max(0,Math.sin(now*.009+f.phase))));animationFns.forEach(fn=>fn(now*.001));renderer.render(scene3d,camera);raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop);}

function finishMission(){run.finished=true;cancelAnimationFrame(raf);let final=run.score;if(currentMission.id==='xabcde')final=Math.max(0,Math.round(final*.85+run.stability*.15));run.baseScore=final;run.elapsed=seconds();showDebrief();}
function showDebrief(){showScreen(debrief);$('#debriefTitle').textContent=currentMission.title;$('#finalScore').textContent=run.baseScore;$('#gradeText').textContent=run.baseScore>=90?'PRIORIDADES BEM CONSOLIDADAS':run.baseScore>=75?'BOA EXECUÇÃO • REVISE OS ERROS':run.baseScore>=55?'AINDA HÁ FALHAS DE SEQUÊNCIA':'REFAÇA A CENA E LEIA OS ACHADOS';$('#metricGrid').innerHTML=`<div class="metric"><b>${run.baseScore}</b><span>EXECUÇÃO</span></div><div class="metric"><b>${run.errors}</b><span>ERROS</span></div><div class="metric"><b>${run.elapsed}s</b><span>TEMPO</span></div>`;renderLessons();renderQuestions();}
function renderLessons(){let el=$('#debriefLessons');if(!el){el=document.createElement('section');el.id='debriefLessons';el.className='debrief-lessons';$('#metricGrid').after(el);}const important=run.notes.filter(n=>n.kind==='ensino'||n.kind==='erro').slice(-6);el.innerHTML=`<div class="section-head"><span>O QUE A CENA ENSINOU</span><small>linha do tempo</small></div>${important.map(n=>`<div class="lesson ${n.kind}"><b>${n.time}s</b><span>${n.text}</span></div>`).join('')||'<div class="lesson"><span>Conclua mais interações para gerar um debrief detalhado.</span></div>'}`;}
const QUIZ={xabcde:[['O que deveria chamar sua atenção primeiro nesta cena?',['A alteração externa importante no membro inferior','A entrevista SAMPLE','A avaliação secundária completa','A temperatura ambiental'],0,'A ameaça externa importante precisa ser reconhecida antes das etapas seguintes.'],['Depois de resolver a ameaça prioritária, qual sequência segue?',['A, B, C, D, E','B, C, A, E, D','D, A, C, B, E','SAMPLE primeiro'],0,'O restante da avaliação primária segue A → B → C → D → E.']],glasgow:[['A vítima abriu os olhos ao ser chamada, falou confusa e obedeceu comando. Qual registro corresponde?',['E3 V4 M6','E4 V5 M6','E2 V3 M5','E3 V5 M4'],0,'A evidência observada corresponde a E3 V4 M6.']],sample:[['Qual pergunta investigou a última ingestão?',['Quando comeu ou bebeu pela última vez?','O que está sentindo?','Tem alergia?','O que causou a queda?'],0,'Essa pergunta corresponde ao L do SAMPLE.']],secondary:[['Qual estratégia reduz a chance de esquecer regiões na secundária?',['Exame sistemático da cabeça aos pés','Examinar só onde dói','Começar pelos membros','Fazer SAMPLE antes de olhar a vítima'],0,'Uma sequência sistemática ajuda a reduzir omissões.']]};
function renderQuestions(){const list=$('#questionList');list.innerHTML='';(QUIZ[currentMission.id]||[]).forEach((q,qi)=>{const c=document.createElement('article');c.className='question-card';c.innerHTML=`<h4>${qi+1}. ${q[0]}</h4><div class="question-options"></div><div class="question-feedback" hidden></div>`;const opts=c.querySelector('.question-options'),fb=c.querySelector('.question-feedback');q[1].forEach((label,oi)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{if(c.dataset.answered)return;c.dataset.answered='1';const ok=oi===q[2];if(ok)run.quizCorrect++;[...opts.children].forEach((x,i)=>{x.disabled=true;if(i===q[2])x.classList.add('correct');});if(!ok)b.classList.add('incorrect');fb.hidden=false;fb.textContent=q[3];updateFinalAfterQuiz();};opts.appendChild(b);});list.appendChild(c);});}
function updateFinalAfterQuiz(){const qs=QUIZ[currentMission.id]||[],answered=document.querySelectorAll('.question-card[data-answered="1"]').length;if(answered!==qs.length)return;const quiz=Math.round(run.quizCorrect/qs.length*100),final=Math.round(run.baseScore*.8+quiz*.2);$('#finalScore').textContent=final;$('#metricGrid').children[0].querySelector('b').textContent=final;if(final>(progress[currentMission.id]||0)){progress[currentMission.id]=final;saveProgress();}}

$('#backBtn').onclick=()=>{run&&(run.finished=true);cancelAnimationFrame(raf);showScreen(home);renderHome();};$('#homeBtn').onclick=()=>{showScreen(home);renderHome();};$('#retryBtn').onclick=()=>startMission(currentMission);
renderHome();
