const $ = (s) => document.querySelector(s);
const home = $('#home');
const game = $('#game');
const debrief = $('#debrief');
const screens = [home, game, debrief];
const canvasEl = $('#sceneCanvas');
const sceneWrap = $('#sceneWrap');
const loadingEl = $('#sceneLoading');
const loadingText = $('#loadingText');
const actionSheet = $('#actionSheet');
const protocolRail = $('#protocolRail');

const MISSIONS = [
  {
    id:'xabcde', protocol:'XABCDE', title:'COLISÃO URBANA', letter:'X', accent:'#a52a21', accent2:'#e3aa63',
    subtitle:'Avaliação primária do trauma', meta:['6 ETAPAS','PRIORIDADE','TRAUMA'],
    goal:'Reconheça ameaças imediatas e execute a sequência X → A → B → C → D → E.',
    steps:[
      ['X','Hemorragia crítica','Identifique primeiro se existe hemorragia externa com risco imediato e sinalize o controle conforme seu treinamento.'],
      ['A','Via aérea + proteção cervical','Avalie se a vítima consegue manter a via aérea e considere proteção da coluna cervical conforme o mecanismo.'],
      ['B','Respiração / ventilação','Observe expansão torácica, esforço respiratório e sinais de ventilação inadequada.'],
      ['C','Circulação','Reavalie sangramentos, perfusão e sinais circulatórios.'],
      ['D','Neurológico','Avalie consciência, pupilas e resposta motora; use Glasgow quando indicado.'],
      ['E','Exposição / ambiente','Procure outras lesões mantendo prevenção de perda de calor e privacidade.']
    ],
    questions:[
      ['No XABCDE, qual é a prioridade representada pelo X?',['Hemorragia externa com risco imediato','Entrevista SAMPLE','Avaliação secundária','Temperatura corporal'],0,'O X destaca a busca e o controle prioritário de hemorragia externa grave.'],
      ['Em qual etapa entra a avaliação neurológica inicial?',['D','A','B','E'],0,'D corresponde à avaliação neurológica/déficit.'],
      ['A exposição da vítima deve vir acompanhada de atenção a:',['Prevenção de perda de calor','Apenas frequência cardíaca','Somente alergias','Somente mecanismo do trauma'],0,'A etapa E inclui exposição para procurar lesões e cuidado com o ambiente/temperatura.']
    ]
  },
  {
    id:'glasgow', protocol:'GLASGOW', title:'QUEDA EM ESCADA', letter:'G', accent:'#376b85', accent2:'#9fc9d9',
    subtitle:'Observe respostas e registre E • V • M', meta:['INTERAÇÃO','E/V/M','CONSCIÊNCIA'],
    goal:'Obtenha respostas reais da vítima da cena e depois registre abertura ocular, resposta verbal e resposta motora.',
    glasgow:true,
    steps:[['O','Observar','Veja se há abertura ocular espontânea e resposta sem estímulo.'],['V','Voz','Chame a vítima e observe abertura ocular e fala.'],['M','Comando motor','Solicite um comando simples e observe a resposta motora.'],['R','Registrar','Registre os três componentes separadamente.']],
    questions:[
      ['Quais componentes formam a Escala de Coma de Glasgow?',['Ocular, verbal e motora','Pressão, pulso e respiração','Dor, pupilas e glicemia','Via aérea, respiração e circulação'],0,'Glasgow registra abertura ocular, resposta verbal e resposta motora.'],
      ['Nesta ocorrência, a vítima apresentou E3 + V4 + M6. Qual total?',['13','12','14','15'],0,'3 + 4 + 6 = 13.'],
      ['A forma mais útil de registrar Glasgow é:',['E, V e M separadamente, além do total','Somente o total','Apenas resposta motora','Somente se a vítima estiver inconsciente'],0,'Os componentes separados deixam claro onde houve alteração.']
    ]
  },
  {
    id:'sample', protocol:'SAMPLE', title:'CICLISTA AO SOLO', letter:'S', accent:'#8a6d36', accent2:'#e2bf78',
    subtitle:'Entrevista dirigida da vítima', meta:['6 CAMPOS','DIÁLOGO','HISTÓRIA'],
    goal:'Conduza a entrevista sem receber o mnemônico pronto. Descubra S • A • M • P • L • E pela conversa.',
    sample:true,
    steps:[['S','Sinais e sintomas','Pergunte o que a vítima sente ou relata.'],['A','Alergias','Investigue alergias conhecidas.'],['M','Medicamentos','Pergunte sobre medicamentos em uso.'],['P','Passado médico','Investigue condições e histórico de saúde relevantes.'],['L','Última ingestão','Pergunte quando comeu ou bebeu pela última vez.'],['E','Eventos','Entenda o que aconteceu antes e durante o evento.']],
    questions:[
      ['No SAMPLE, a letra L representa:',['Última ingestão oral','Local da lesão','Lateralidade','Limitação motora'],0,'L corresponde à última ingestão de alimentos ou líquidos.'],
      ['“O que aconteceu imediatamente antes da queda?” investiga:',['E — eventos relacionados','A — alergias','M — medicamentos','P — passado médico'],0,'E reúne os eventos relacionados ao episódio atual.'],
      ['“Você usa algum medicamento diariamente?” pertence a:',['M','S','L','E'],0,'M corresponde a medicamentos em uso.']
    ]
  },
  {
    id:'secondary', protocol:'SECUNDÁRIA', title:'ACIDENTE EM OBRA', letter:'2', accent:'#8a5a2c', accent2:'#e1bc76',
    subtitle:'Avaliação sistemática após a primária', meta:['CABEÇA AOS PÉS','SINAIS VITAIS','SAMPLE'],
    goal:'Faça uma avaliação física sistemática da cabeça aos pés e complete os blocos complementares da avaliação secundária.',
    secondary:true,
    steps:[['1','Cabeça','Inspecione a cabeça.'],['2','Pescoço','Inspecione o pescoço.'],['3','Tórax','Inspecione o tórax.'],['4','Abdome','Inspecione o abdome.'],['5','Pelve','Inspecione a pelve.'],['6','Membros','Inspecione membros.'],['7','Dorso','Inclua o dorso quando for seguro e indicado.'],['8','Sinais vitais','Registre sinais vitais previstos pelo seu protocolo.'],['9','História / mecanismo','Complete SAMPLE e mecanismo de lesão.']],
    questions:[
      ['A avaliação secundária do trauma é feita, em geral:',['Depois da avaliação primária e estabilização inicial','Antes de procurar ameaças imediatas','Somente após chegada ao hospital','Apenas em vítimas conscientes'],0,'A secundária vem depois da avaliação primária e das intervenções iniciais necessárias.'],
      ['Qual descrição combina melhor com a avaliação física secundária?',['Exame sistemático da cabeça aos pés','Somente Glasgow','Somente pressão arterial','Apenas local de maior dor'],0,'A busca é sistemática para reduzir a chance de lesões passarem despercebidas.'],
      ['Além do exame físico, a referência enviada inclui:',['Sinais vitais e histórico SAMPLE/mecanismo','Apenas glicemia','Somente alergias','Apenas temperatura'],0,'A referência inclui sinais vitais e histórico de saúde/SAMPLE com mecanismo de lesão.']
    ]
  }
];

let THREE = null;
let renderer = null;
let threeScene = null;
let camera = null;
let world = null;
let currentMission = null;
let run = null;
let raf = 0;
let raycaster = null;
let pointer = null;
let yaw = .45, pitch = .44, distance = 8.4;
let pointers = new Map();
let moved = false;
let pinchDistance = null;
let victim = null;
let victimRig = null;
let hotspots = [];
let flashers = [];
let animators = [];
let dynamicLabels = [];
const progress = JSON.parse(localStorage.getItem('reforce-aph-progress') || '{}');

function showScreen(el){ screens.forEach(s=>s.classList.remove('is-active')); el.classList.add('is-active'); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function saveProgress(){ localStorage.setItem('reforce-aph-progress',JSON.stringify(progress)); }
function rand(a,b){ return a + Math.random() * (b-a); }

function renderHome(){
  const grid=$('#missionGrid'); grid.innerHTML='';
  for(const m of MISSIONS){
    const best=progress[m.id]||0;
    const stars=best>=90?3:best>=75?2:best>=55?1:0;
    const b=document.createElement('button'); b.className='mission-card'; b.dataset.letter=m.letter;
    b.style.setProperty('--accent',m.accent); b.style.setProperty('--accent2',m.accent2);
    b.innerHTML=`<i class="stripe"></i><div class="mission-top"><span class="mission-tag">${m.protocol}</span><span class="mission-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span></div><h3>${m.title}</h3><p>${m.subtitle}</p><div class="mission-meta">${m.meta.map(x=>`<span>${x}</span>`).join('')}</div>`;
    b.addEventListener('click',()=>startMission(m)); grid.appendChild(b);
  }
  const avg=Math.round(MISSIONS.reduce((a,m)=>a+(progress[m.id]||0),0)/(MISSIONS.length));
  $('#progressPct').textContent=avg+'%'; $('#progressBar').style.width=avg+'%';
}

async function ensureThree(){
  if(THREE) return true;
  loadingText.textContent='Carregando motor gráfico...';
  try{
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    return true;
  }catch(err){
    console.error(err);
    loadingText.textContent='Não foi possível carregar o motor 3D.';
    $('#bootError').hidden=false;
    $('#bootError').textContent='O motor 3D não carregou. Verifique a conexão e recarregue a página.';
    return false;
  }
}

function setupRenderer(){
  if(renderer) return;
  renderer = new THREE.WebGLRenderer({canvas:canvasEl,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  raycaster=new THREE.Raycaster(); pointer=new THREE.Vector2();
  bindCanvasControls();
  new ResizeObserver(resizeRenderer).observe(sceneWrap);
}

function resizeRenderer(){
  if(!renderer||!camera) return;
  const w=Math.max(1,sceneWrap.clientWidth), h=Math.max(1,sceneWrap.clientHeight);
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}

function mat(color,rough=.78,metal=.05,extra={}){ return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,...extra}); }
function addMesh(geometry,material,position=[0,0,0],rotation=[0,0,0],parent=world){
  const o=new THREE.Mesh(geometry,material); o.position.set(...position); o.rotation.set(...rotation); o.castShadow=true; o.receiveShadow=true; parent.add(o); return o;
}
function box(size,color,pos,rot=[0,0,0],parent=world,material=null){ return addMesh(new THREE.BoxGeometry(...size),material||mat(color),pos,rot,parent); }
function cyl(r,h,color,pos,rot=[0,0,0],parent=world,material=null){ return addMesh(new THREE.CylinderGeometry(r,r,h,18),material||mat(color),pos,rot,parent); }
function sphere(r,color,pos,parent=world,material=null){ return addMesh(new THREE.SphereGeometry(r,18,14),material||mat(color),pos,[0,0,0],parent); }
function plane(size,color,pos,rot=[-Math.PI/2,0,0],parent=world,material=null){ return addMesh(new THREE.PlaneGeometry(...size),material||mat(color,1,0),pos,rot,parent); }

function resetSceneState(){
  hotspots=[]; flashers=[]; animators=[]; dynamicLabels=[]; victim=null; victimRig=null;
  yaw=.45; pitch=.43; distance=8.4;
}

function buildBaseScene(){
  resetSceneState();
  threeScene=new THREE.Scene();
  threeScene.background=new THREE.Color(0x0a0b0f);
  threeScene.fog=new THREE.FogExp2(0x0a0b0f,.042);
  world=new THREE.Group(); threeScene.add(world);
  camera=new THREE.PerspectiveCamera(52,1,.1,120);

  const hemi=new THREE.HemisphereLight(0xa0adc2,0x120d0b,1.35); threeScene.add(hemi);
  const moon=new THREE.DirectionalLight(0xb9cfff,1.9); moon.position.set(-6,9,-2); moon.castShadow=true; moon.shadow.mapSize.set(1024,1024); threeScene.add(moon);
  const fill=new THREE.DirectionalLight(0xffc990,.65); fill.position.set(6,4,5); threeScene.add(fill);
  const ambientGlow=new THREE.PointLight(0xff9b57,.7,20); ambientGlow.position.set(0,2,4); threeScene.add(ambientGlow);

  const sky = new THREE.Mesh(new THREE.SphereGeometry(50,20,16), new THREE.MeshBasicMaterial({color:0x0a1018, side:THREE.BackSide}));
  threeScene.add(sky);

  const groundMat = mat(0x2a2724,.98,.02);
  const ground=plane([44,44],0x27231f,[0,0,0],[-Math.PI/2,0,0],world,groundMat);
  ground.receiveShadow=true;

  addDustParticles();
  updateCamera(); resizeRenderer();
}

function addDustParticles(){
  const count=90, pos=[];
  for(let i=0;i<count;i++) pos.push(rand(-10,10), rand(.2,5.5), rand(-10,10));
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({color:0xd8c2a0,size:.06,transparent:true,opacity:.24,depthWrite:false}));
  threeScene.add(pts);
  animators.push(t=>{ pts.rotation.y = t*0.012; pts.position.y = Math.sin(t*0.25)*0.06; });
}

function addFlashLight(color, position, intensity=3.2, dist=10, freq=8.5, phase=0){
  const l=new THREE.PointLight(color,intensity,dist,2); l.position.set(...position); threeScene.add(l);
  flashers.push({light:l,base:intensity,freq,phase}); return l;
}

function addSpotLamp(color, position, targetPos, intensity=2.8, angle=.45, penumbra=.6){
  const l=new THREE.SpotLight(color,intensity,16,angle,penumbra,1.2); l.position.set(...position);
  const target=new THREE.Object3D(); target.position.set(...targetPos); threeScene.add(target); l.target=target; l.castShadow=true; threeScene.add(l); return l;
}

function addRoadMarking(x,z,len=1.1,rot=0){
  plane([len,.08],0xe2c078,[x,.015,z],[-Math.PI/2,rot,0],world,mat(0xe2c078,.95,0));
}
function addSkid(x,z,w=.9,h=.16,r=0){ plane([w,h],0x171412,[x,.016,z],[-Math.PI/2,r,0],world,mat(0x171412,1,0)); }
function addGrassPatch(x,z,s=1){
  for(let i=0;i<8;i++) plane([.18*s,.24*s],0x2e3f24,[x+rand(-.4,.4)*s,.03,z+rand(-.4,.4)*s],[-1.26,rand(0,Math.PI),0],world,mat(0x2e3f24,.92,0));
}
function addDebris(x,z,count=8,spread=1.2,color=0x55504a){
  for(let i=0;i<count;i++) box([rand(.05,.18),rand(.03,.08),rand(.05,.18)],color,[x+rand(-spread,spread),rand(.04,.1),z+rand(-spread,spread)],[rand(0,.5),rand(0,Math.PI),rand(0,.5)]);
}
function addCone(x,z){
  const cone=addMesh(new THREE.ConeGeometry(.22,.65,12),mat(0xc55b22,.72,.1),[x,.34,z]);
  box([.55,.06,.55],0x1e1c1a,[x,.04,z]);
  plane([.34,.07],0xf7f2ef,[x,.26,z+.01],[-1.52,0,0],world,mat(0xf0f0f0,.4,.05));
  return cone;
}
function addBarrier(x,z,rot=0){
  const g=new THREE.Group(); world.add(g); g.position.set(x,0,z); g.rotation.y=rot;
  box([1.4,.08,.08],0xc0392b,[0,.7,0],undefined,g); box([1.4,.08,.08],0xe8ecef,[0,.52,0],undefined,g); box([1.4,.08,.08],0xc0392b,[0,.34,0],undefined,g);
  cyl(.04,.95,0x6b635b,[-.58,.38,0],[0,0,0],g); cyl(.04,.95,0x6b635b,[.58,.38,0],[0,0,0],g);
}

function createResponder({uniform=0x13181d,vest=0x20252b,skin=0xb67a55,helmet=0x111315, pose='kneel', faceLight=false}={}){
  const g=new THREE.Group();
  const body=mat(uniform,.82,.06), vestMat=mat(vest,.7,.08), skinMat=mat(skin,.78,.02), helmetMat=mat(helmet,.5,.15), bootMat=mat(0x0a0a0a,.6,.1);
  addMesh(new THREE.CapsuleGeometry(.22,.62,5,10),body,[0,1.18,0],[0,0,0],g);
  box([.52,.34,.38],vest,[0,1.05,0],undefined,g,vestMat);
  sphere(.16,skin,[0,1.72,0],g,skinMat);
  sphere(.18,helmet,[0,1.77,0],g,helmetMat);
  for(const side of [-1,1]){
    addMesh(new THREE.CapsuleGeometry(.07,.44,4,8),body,[.27*side,1.14,.06*side],[0,0,side*.6],g);
    addMesh(new THREE.CapsuleGeometry(.06,.36,4,8),skinMat,[.45*side,.92,.14*side],[0,0,side*1.05],g);
    addMesh(new THREE.CapsuleGeometry(.08,.42,4,8),body,[.12*side,.72,0],[0,0,pose==='kneel'?side*.15:0],g);
    addMesh(new THREE.CapsuleGeometry(.07,.36,4,8),body,[.13*side,pose==='kneel'?.42:.28,pose==='kneel'? .1*side:0],[pose==='kneel'?1.2:0,0,pose==='kneel'?side*.4:0],g);
    box([.16,.08,.26],0x090909,[.15*side,pose==='kneel'?.16:.04,pose==='kneel'?.1*side:0],undefined,g,bootMat);
  }
  if(faceLight){
    const lamp=sphere(.03,0xf4ddb0,[.09,1.77,.13],g,mat(0xfff2d6,.2,.1,{emissive:0xffd592,emissiveIntensity:3}));
    animators.push(t=>{ lamp.material.emissiveIntensity = 2.6 + Math.sin(t*4)*.25; });
  }
  return g;
}

function createVictim({shirt=0x2a333a,pants=0x191d20,skin=0xb98261,helmet=null,hiVis=false}={}){
  victim=new THREE.Group(); victim.name='victim'; world.add(victim);
  const shirtMat=mat(shirt,.83,.05), pantsMat=mat(pants,.86,.05), skinMat=mat(skin,.82,.03), bootMat=mat(0x0b0b0b,.6,.1), hiMat=mat(0xb7962c,.55,.12);

  const head = sphere(.18,skin,[1.37,.53,0],victim,skinMat); head.scale.set(1,.92,.9);
  cyl(.06,.12,skin,[1.13,.49,0],[0,0,Math.PI/2],victim,skinMat);
  const chest = addMesh(new THREE.CapsuleGeometry(.23,.75,5,12),shirtMat,[.58,.51,0],[0,0,Math.PI/2],victim);
  const abdomen = box([.4,.28,.44],shirt,[.07,.48,0],[0,0,.04],victim,shirtMat);
  const pelvis = box([.42,.24,.5],0x21262b,[-.36,.45,0],[0,0,.04],victim,mat(0x21262b,.86,.05));
  if(hiVis) plane([.45,.18],0xc9ae32,[.58,.63,.23],[-1.57,0,0],victim,hiMat);

  const limbs={};
  for(const side of [-1,1]){
    const shoulderZ=.28*side, armZ=.33*side;
    const upperArm=addMesh(new THREE.CapsuleGeometry(.072,.44,4,8),shirtMat,[.82,.46,shoulderZ],[Math.PI/2,0,Math.PI/2],victim);
    const foreArm=addMesh(new THREE.CapsuleGeometry(.06,.4,4,8),skinMat,[1.07,.43,armZ],[Math.PI/2,0,Math.PI/2+(side>.0?.28:-.18)],victim);
    const hand=box([.12,.05,.12],skin,[1.27,.42,armZ],undefined,victim,skinMat);
    const thigh=addMesh(new THREE.CapsuleGeometry(.09,.56,4,8),pantsMat,[-.78,.42,.17*side],[0,0,Math.PI/2+.04*side],victim);
    const shin=addMesh(new THREE.CapsuleGeometry(.08,.52,4,8),pantsMat,[-1.36,.37,.17*side],[0,0,Math.PI/2-.08*side],victim);
    const boot=box([.22,.11,.18],0x090909,[-1.74,.31,.17*side],[0,0,.03],victim,bootMat);
    limbs[side>0?'right':'left']={upperArm,foreArm,hand,thigh,shin,boot};
  }

  if(helmet){
    const helm = sphere(.21,helmet,[1.39,.58,0],victim,mat(helmet,.42,.18));
    helm.scale.set(1.05,.7,1.08);
  }

  victim.rotation.y=.15;
  victimRig={head,chest,abdomen,pelvis,limbs};
  animators.push(t=>{
    if(!victimRig) return;
    const breathe = Math.sin(t*1.9)*0.02;
    victimRig.chest.position.y = .51 + breathe;
    victimRig.abdomen.position.y = .48 + breathe*.6;
    victimRig.head.rotation.z = Math.sin(t*1.1)*0.015;
  });
  return victimRig;
}

function addHotspot(id,pos,label,color=0xe1b66d){
  const g=new THREE.SphereGeometry(.13,16,12);
  const m=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.72,transparent:true,opacity:.86,roughness:.4});
  const h=addMesh(g,m,pos); h.userData.hotspot=id; h.userData.label=label; hotspots.push(h);
  const ring=addMesh(new THREE.TorusGeometry(.24,.018,8,22),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.66}),pos,[Math.PI/2,0,0]);
  ring.userData.decor=true; dynamicLabels.push(ring);
  return h;
}

function buildSceneFor(m){
  buildBaseScene();
  if(m.id==='xabcde') buildCrashScene();
  if(m.id==='glasgow') buildStairsScene();
  if(m.id==='sample') buildBikeScene();
  if(m.id==='secondary') buildConstructionScene();
  updateCamera(); resizeRenderer();
}

function addAmbulance(x=0,z=0,rot=0,{rearOpen=true,interiorGlow=true}={}){
  const amb = new THREE.Group(); world.add(amb); amb.position.set(x,.02,z); amb.rotation.y=rot;
  box([4.2,.22,2],0x111213,[0,.11,0],undefined,amb,mat(0x111213,.9,.08));
  box([4,.9,1.85],0xf1f4f6,[0,1.0,0],undefined,amb,mat(0xf1f4f6,.46,.14));
  box([1.7,.62,1.75],0xf7fafb,[1.0,1.62,0],undefined,amb,mat(0xf7fafb,.4,.16));
  plane([1.5,.12],0xbb2424,[.6,1.05,.93],[-1.57,0,0],amb,mat(0xbb2424,.4,.2));
  plane([1.5,.12],0xbb2424,[.6,1.05,-.93],[-1.57,0,0],amb,mat(0xbb2424,.4,.2));
  plane([.8,.38],0x2c343d,[1.9,1.6,.58],[-1.57,0,1.57],amb,mat(0x2c343d,.2,.5,{transparent:true,opacity:.72}));
  plane([.8,.38],0x2c343d,[1.9,1.6,-.58],[-1.57,0,1.57],amb,mat(0x2c343d,.2,.5,{transparent:true,opacity:.72}));
  for(const wx of [-1.25,.95]) for(const wz of [-.86,.86]) cyl(.33,.24,0x080808,[wx,.35,wz],[Math.PI/2,0,0],amb,mat(0x080808,.72,.12));
  if(rearOpen){
    box([.06,1.35,.78],0xf4f5f6,[-2.03,1.18,.5],[0,1.25,0],amb,mat(0xf4f5f6,.48,.12));
    box([.06,1.35,.78],0xf4f5f6,[-2.03,1.18,-.5],[0,-1.25,0],amb,mat(0xf4f5f6,.48,.12));
  }
  if(interiorGlow){
    const inner = new THREE.PointLight(0xfff1ce,2.7,5); inner.position.set(-1.15,1.65,0); amb.add(inner);
    box([1.6,.08,.56],0x4f6b7a,[-1.2,.72,0],undefined,amb,mat(0x4f6b7a,.5,.1));
  }
  addFlashLight(0xff2c22,[x-1.55,1.82,z+.78],3.8,10,8.4,0);
  addFlashLight(0x2c72ff,[x-1.55,1.82,z-.78],3.8,10,8.4,Math.PI/2);
  addFlashLight(0xff2c22,[x+1.65,1.82,z+.78],2.8,7,8.4,.6);
  addFlashLight(0x2c72ff,[x+1.65,1.82,z-.78],2.8,7,8.4,2.4);
  return amb;
}

function buildCrashScene(){
  plane([30,5],0x222120,[0,.01,0],[-Math.PI/2,0,0],world,mat(0x222120,.97,.02));
  for(let x=-11;x<11;x+=2.4) addRoadMarking(x,-1.65,1.2);
  addSkid(.4,-.9,1.2,.14,-.18); addSkid(-1.4,-.2,1.6,.14,-.1); addSkid(2.2,-1.1,1.1,.12,-.3);
  addBarrier(-4.6,-2.35,.15);
  addAmbulance(-6.4,-.2,0.04,{rearOpen:true});

  const car=new THREE.Group(); world.add(car); car.position.set(3.1,.35,-1.05); car.rotation.y=-.24;
  box([3.6,.7,1.62],0x551b18,[0,.46,0],undefined,car,mat(0x551b18,.55,.18));
  box([1.9,.58,1.25],0x3f1714,[.15,.98,0],undefined,car,mat(0x3f1714,.48,.15));
  plane([1.1,.45],0x2d3640,[1.3,1.06,0],[-1.57,0,0],car,mat(0x2d3640,.18,.58,{transparent:true,opacity:.62}));
  for(const x of [-1.1,1.1]) for(const z of [-.75,.75]) cyl(.34,.26,0x080808,[x,.25,z],[Math.PI/2,0,0],car,mat(0x080808,.72,.12));
  box([.55,.18,.34],0xe0d8ca,[1.75,.57,.47],undefined,car,mat(0xe0d8ca,.38,.22,{emissive:0xf7d9aa,emissiveIntensity:.8}));
  box([.55,.18,.34],0xe0d8ca,[1.75,.57,-.47],undefined,car,mat(0xe0d8ca,.38,.22,{emissive:0xf7d9aa,emissiveIntensity:.8}));
  addCone(-2.8,-1.2); addCone(-1.9,-2.0); addCone(1.1,-2.3); addDebris(2.4,-.5,10,1.2,0x4c4136);

  createVictim({shirt:0x3b4047,pants:0x22272c}); victim.position.set(-.35,.17,.32); victim.rotation.y=.15;
  const kneel = createResponder({uniform:0x151a20,vest:0x252d34,pose:'kneel',faceLight:true}); kneel.position.set(.35,0,-.95); kneel.rotation.y=.6; world.add(kneel);
  const standing = createResponder({uniform:0x171c21,vest:0x1f262b,pose:'stand'}); standing.position.set(-1.8,0,-.2); standing.rotation.y=1.25; world.add(standing);
  addSpotLamp(0xfff0cd,[.28,1.55,-1.05],[.3,.45,.05],3.1,.48,.66);

  addHotspot('bleed',[-.62,.56,.58],'Sangramento crítico',0xd83a2d);
  addHotspot('airway',[1.38,.79,.12],'Via aérea');
  addHotspot('chest',[.58,.83,.08],'Tórax',0xe4b764);
  addHotspot('wrist',[.95,.46,.34],'Pulso / perfusão',0x7d9852);
  addHotspot('neuro',[1.46,.82,-.1],'Neurológico',0x4e89a6);
  addHotspot('expose',[-.05,.72,-.26],'Exposição',0xc08b3c);
}

function buildStairsScene(){
  plane([26,12],0x2a2521,[0,.01,0],[-Math.PI/2,0,0],world,mat(0x2a2521,.96,.02));
  for(let i=0;i<8;i++) box([3,.28,.8],0x3f3831,[-2.85+i*.56,.14+i*.28,-1.9+i*.22],undefined,world,mat(0x3f3831,.92,.03));
  box([8,.08,3.3],0x26211d,[0,.05,.2]);
  cyl(.05,4.8,0x777471,[.85,2.1,-.55],[0,0,0]); cyl(.05,4.8,0x777471,[4.35,3.5,.8],[0,0,0]);
  box([4.8,.05,.05],0x7d7974,[2.6,3.85,.16],[0,0,.38]);
  const lamp = new THREE.PointLight(0xffc57d,1.2,11); lamp.position.set(3.8,4.9,1); threeScene.add(lamp);
  addAmbulance(-6.5,2.5,.12,{rearOpen:false,interiorGlow:false});

  createVictim({shirt:0x3a4048,pants:0x20252a}); victim.position.set(.4,.16,.38); victim.rotation.y=-.15;
  const responder = createResponder({uniform:0x1a1f25,vest:0x2b3138,pose:'kneel'}); responder.position.set(-.55,0,.92); responder.rotation.y=-.22; world.add(responder);
  addSpotLamp(0xffddb5,[-.38,1.4,.72],[1.1,.55,.0],2.4,.44,.54);

  addHotspot('observe',[1.5,.82,.05],'Olhos / resposta espontânea',0x4e89a6);
  addHotspot('voice',[1.35,.72,-.15],'Resposta à voz',0xd3a95c);
  addHotspot('motor',[.45,.53,.52],'Resposta motora',0x7c9a55);
}

function buildBike(){
  const bike=new THREE.Group(); world.add(bike); bike.position.set(2.35,.57,-1.15); bike.rotation.set(.22,.55,.15);
  for(const z of [-.62,.62]) addMesh(new THREE.TorusGeometry(.58,.055,10,26),mat(0x0e0f10,.72,.12),[0,0,z],[0,0,0],bike);
  cyl(.036,1.18,0x9c2f26,[0,0,0],[Math.PI/2,0,0],bike,mat(0x9c2f26,.46,.2));
  cyl(.035,1.1,0x9c2f26,[.32,.12,0],[0,0,.58],bike,mat(0x9c2f26,.46,.2));
  cyl(.03,.76,0x7d858d,[.46,.34,.02],[0,0,-.38],bike,mat(0x7d858d,.38,.3));
  cyl(.024,.44,0x20262b,[.58,.66,0],[0,0,1.57],bike,mat(0x20262b,.6,.12));
  box([.18,.08,.14],0x222a31,[.58,.67,.0],undefined,bike,mat(0x222a31,.7,.12));
  return bike;
}

function buildBikeScene(){
  plane([28,5.4],0x23211f,[0,.01,0],[-Math.PI/2,0,0],world,mat(0x23211f,.98,.02));
  for(let x=-10;x<10;x+=2.4) addRoadMarking(x,-1.72,1.12);
  addCone(-2.3,-1.9); addCone(-1.4,-2.2); addGrassPatch(-4.8,2,1.6); addGrassPatch(5.2,2.1,1.4);
  addAmbulance(-6.5,.4,0.02,{rearOpen:false,interiorGlow:false});
  buildBike();
  createVictim({shirt:0x2f3640,pants:0x23272c,helmet:0x252b31}); victim.position.set(-.48,.16,.22); victim.rotation.y=.08;
  const responder = createResponder({uniform:0x171c21,vest:0x242c33,pose:'kneel',faceLight:true}); responder.position.set(.52,0,.82); responder.rotation.y=-.35; world.add(responder);
  const support = createResponder({uniform:0x171c21,vest:0x242c33,pose:'stand'}); support.position.set(-1.45,0,-.6); support.rotation.y=.78; world.add(support);
  addSpotLamp(0xffe3bf,[.5,1.46,.76],[.1,.42,.1],2.9,.46,.62);
  addHotspot('talk',[1.3,.76,.05],'Conversar com a vítima',0xd5ad65);
}

function buildConstructionScene(){
  plane([30,8],0x3a352d,[0,.01,0],[-Math.PI/2,0,0],world,mat(0x3a352d,.97,.03));
  for(const x of [-3.6,-1.2,1.2,3.6]){ for(const z of [-2.3,2.3]) cyl(.08,4.8,0x868686,[x,2.4,z],[0,0,0],world,mat(0x868686,.75,.18)); }
  for(let y=.6;y<4.6;y+=1.1){ box([7.6,.08,.1],0x797979,[0,y,-2.3]); box([7.6,.08,.1],0x797979,[0,y,2.3]); }
  box([2.8,1.2,1.8],0x8b6b3d,[3.2,.62,1.3],undefined,world,mat(0x8b6b3d,.85,.06));
  box([1.2,.2,.8],0xc89a39,[2.6,.14,-1.2],undefined,world,mat(0xc89a39,.5,.1));
  cyl(.25,.8,0x404040,[2.1,.41,-1.25],[0,0,0],world,mat(0x404040,.75,.14));
  addCone(-2.7,-1.4); addCone(-1.9,-1.9); addDebris(.9,.4,11,1.4,0x5c5247);
  addSpotLamp(0xffd18f,[2.15,2.1,-1.15],[0.1,.45,0.1],4.2,.55,.45);
  addFlashLight(0xff6a34,[2.2,1.98,-1.12],1.7,5,6.4,0);

  createVictim({shirt:0x2c353d,pants:0x20252b,helmet:0xd9be37,hiVis:true}); victim.position.set(-.22,.17,.15);
  const kneel = createResponder({uniform:0x171c20,vest:0x263039,pose:'kneel'}); kneel.position.set(.65,0,.92); kneel.rotation.y=-.5; world.add(kneel);
  const stand = createResponder({uniform:0x171c20,vest:0x263039,pose:'stand',helmet:0xe2c13c}); stand.position.set(-1.55,0,-.82); stand.rotation.y=.58; world.add(stand);

  addHotspot('head',[1.45,.78,.02],'Cabeça');
  addHotspot('neck',[1.09,.64,.02],'Pescoço');
  addHotspot('chest',[.57,.64,.02],'Tórax');
  addHotspot('abdomen',[.08,.57,.02],'Abdome');
  addHotspot('pelvis',[-.31,.54,.02],'Pelve');
  addHotspot('limbs',[-1.13,.47,.28],'Membros');
  addHotspot('back',[.38,.46,-.38],'Dorso');
}

function startMission(m){
  currentMission=m; run={step:0,score:100,errors:0,observed:new Set(),started:Date.now(),quizCorrect:0,glasgow:{},sample:new Set(),secondary:new Set()};
  showScreen(game); loadingEl.hidden=false; $('#bootError').hidden=true;
  $('#gameProtocol').textContent=m.protocol; $('#gameTitle').textContent=m.title; $('#scoreValue').textContent=run.score;
  renderProtocolRail(); renderActionSheet(); $('#objectiveText').textContent=m.goal;
  requestAnimationFrame(async()=>{
    const ok=await ensureThree(); if(!ok)return;
    try{ setupRenderer(); buildSceneFor(m); loadingEl.hidden=true; startLoop(); }
    catch(err){ console.error(err); loadingText.textContent='Falha ao criar a cena 3D.'; $('#bootError').hidden=false; $('#bootError').textContent='Erro na cena 3D: '+(err?.message||err); }
  });
}

function renderProtocolRail(){
  protocolRail.innerHTML=currentMission.steps.map((s,i)=>`<div class="protocol-step ${i<run.step?'done':i===run.step?'current':''}">${s[0]}</div>`).join('');
}
function updateObjective(){
  const s=currentMission.steps[Math.min(run.step,currentMission.steps.length-1)];
  $('#objectiveText').textContent = run.step>=currentMission.steps.length ? 'Simulação concluída. Finalize para abrir o debrief.' : `${s[1]} — ${s[2]}`;
}

function standardActionButtons(){
  const expected=currentMission.steps[run.step];
  if(!expected) return `<button class="action-btn full" data-finish="1">ENCERRAR ATENDIMENTO E IR AO DEBRIEF</button>`;
  const all=currentMission.steps.map((s,i)=>({i,label:s[1],letter:s[0]}));
  const options=[all[run.step],...all.filter(x=>x.i!==run.step).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
  return options.map(o=>`<button class="action-btn" data-step="${o.i}"><b>${o.letter}</b>${o.label}</button>`).join('');
}

function renderActionSheet(){
  if(currentMission.glasgow) return renderGlasgowSheet();
  if(currentMission.sample) return renderSampleSheet();
  if(currentMission.secondary) return renderSecondarySheet();
  actionSheet.innerHTML=`<div class="sheet-title"><b>CONDUTA NA CENA</b><span>${run.step}/${currentMission.steps.length}</span></div><p class="sheet-copy">Explore o paciente no 3D e escolha a próxima etapa. A ordem conta para a pontuação.</p><div class="action-grid">${standardActionButtons()}</div>`;
  actionSheet.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>chooseStep(+b.dataset.step,b));
  const fin=actionSheet.querySelector('[data-finish]'); if(fin) fin.onclick=finishMission;
  updateObjective(); renderProtocolRail();
}

function chooseStep(idx,btn){
  if(idx===run.step){ run.step++; run.score=Math.min(100,run.score+1); btn.classList.add('done'); $('#scoreValue').textContent=run.score; setTimeout(renderActionSheet,180); }
  else{ run.errors++; run.score=Math.max(35,run.score-7); $('#scoreValue').textContent=run.score; btn.classList.add('wrong'); setTimeout(()=>btn.classList.remove('wrong'),300); }
}

function renderGlasgowSheet(){
  const obs=[];
  if(run.observed.has('observe')) obs.push('<div class="obs"><b>Observação:</b> olhos fechados, sem abertura espontânea.</div>');
  if(run.observed.has('voice')) obs.push('<div class="obs"><b>À voz:</b> abre os olhos ao ser chamada e responde de forma confusa.</div>');
  if(run.observed.has('motor')) obs.push('<div class="obs"><b>Resposta motora:</b> obedece a comando simples.</div>');
  const ready=run.observed.size===3;
  const selectors=ready?`<div class="glasgow-grid"><label>E<select id="gE"><option value="">–</option>${[1,2,3,4].map(n=>`<option>${n}</option>`).join('')}</select></label><label>V<select id="gV"><option value="">–</option>${[1,2,3,4,5].map(n=>`<option>${n}</option>`).join('')}</select></label><label>M<select id="gM"><option value="">–</option>${[1,2,3,4,5,6].map(n=>`<option>${n}</option>`).join('')}</select></label></div><button class="action-btn full" id="recordG">REGISTRAR E • V • M</button>`:'';
  actionSheet.innerHTML=`<div class="sheet-title"><b>AVALIAÇÃO NEUROLÓGICA</b><span>${run.observed.size}/3 OBSERVAÇÕES</span></div><p class="sheet-copy">Toque nos marcadores da vítima para obter as respostas. Depois registre os componentes separadamente.</p>${obs.join('')||'<div class="obs">Nenhuma resposta observada ainda.</div>'}${selectors}`;
  if(ready) $('#recordG').onclick=()=>{
    const e=+$('#gE').value,v=+$('#gV').value,m=+$('#gM').value; if(!e||!v||!m)return;
    run.step=4; if(e===3&&v===4&&m===6) run.score=Math.min(100,run.score+4); else {run.errors++;run.score=Math.max(35,run.score-12);} $('#scoreValue').textContent=run.score;
    actionSheet.innerHTML=`<div class="sheet-title"><b>GLASGOW REGISTRADO</b><span>E${e} V${v} M${m}</span></div><div class="obs">Total informado: <b>${e+v+m}</b>. O debrief mostrará a revisão.</div><button class="action-btn full" id="finishG">ENCERRAR E IR AO DEBRIEF</button>`; $('#finishG').onclick=finishMission; renderProtocolRail();
  };
  updateObjective(); renderProtocolRail();
}

const SAMPLE_DATA={
  S:['O que você está sentindo?','Dor no ombro direito e tontura leve.'],
  A:['Você tem alguma alergia conhecida?','Relata alergia a dipirona.'],
  M:['Usa algum medicamento?','Refere uso diário de medicamento para pressão.'],
  P:['Tem algum problema de saúde importante?','Refere hipertensão; nega cirurgia recente.'],
  L:['Quando comeu ou bebeu pela última vez?','Almoçou há cerca de duas horas.'],
  E:['O que aconteceu antes da queda?','A roda dianteira travou e a vítima caiu sobre o lado direito.']
};
function renderSampleSheet(){
  const buttons=Object.entries(SAMPLE_DATA).map(([k,v])=>`<button class="action-btn ${run.sample.has(k)?'done':''}" data-sample="${k}"><b>${k}</b>${v[0]}</button>`).join('');
  const logs=[...run.sample].map(k=>`<div class="obs"><b>${k}:</b> ${SAMPLE_DATA[k][1]}</div>`).join('');
  const finished=run.sample.size===6;
  actionSheet.innerHTML=`<div class="sheet-title"><b>ENTREVISTA DO PACIENTE</b><span>${run.sample.size}/6</span></div><p class="sheet-copy">Converse com a vítima e monte o SAMPLE a partir das respostas.</p><div class="action-grid">${buttons}</div>${logs?`<div class="obs-list">${logs}</div>`:''}${finished?'<button class="action-btn full" id="finishS">ENTREVISTA COMPLETA • IR AO DEBRIEF</button>':''}`;
  actionSheet.querySelectorAll('[data-sample]').forEach(b=>b.onclick=()=>{const k=b.dataset.sample;if(!run.sample.has(k)){run.sample.add(k);run.step=run.sample.size;run.score=Math.min(100,run.score+1);}renderSampleSheet();$('#scoreValue').textContent=run.score;});
  if(finished) $('#finishS').onclick=finishMission; updateObjective(); renderProtocolRail();
}

const SECONDARY_ORDER=['head','neck','chest','abdomen','pelvis','limbs','back'];
function renderSecondarySheet(){
  const physical=run.secondary.size;
  const expected=SECONDARY_ORDER[physical];
  let extra='';
  if(physical===7){ extra='<div class="action-grid"><button class="action-btn" id="vitals"><b>8</b>Registrar sinais vitais</button><button class="action-btn" id="history"><b>9</b>Completar SAMPLE + mecanismo</button></div>'; }
  if(run.step>=9) extra='<button class="action-btn full" id="finishSec">AVALIAÇÃO SECUNDÁRIA COMPLETA • DEBRIEF</button>';
  actionSheet.innerHTML=`<div class="sheet-title"><b>VARREDURA SISTEMÁTICA</b><span>${Math.min(run.step,9)}/9</span></div><p class="sheet-copy">Toque na vítima na ordem cabeça → pés. Marcador esperado: <b>${expected?currentMission.steps[physical][1]:'blocos complementares'}</b>.</p><div class="obs">Regiões concluídas: <b>${[...run.secondary].map(x=>x.toUpperCase()).join(' • ')||'nenhuma'}</b></div>${extra}`;
  const vit=$('#vitals'); if(vit) vit.onclick=()=>{ if(run.step<8){run.step=8;run.score=Math.min(100,run.score+2);} renderSecondarySheet();$('#scoreValue').textContent=run.score; };
  const his=$('#history'); if(his) his.onclick=()=>{ if(run.step<9){run.step=9;run.score=Math.min(100,run.score+2);} renderSecondarySheet();$('#scoreValue').textContent=run.score; };
  const fin=$('#finishSec'); if(fin) fin.onclick=finishMission; updateObjective(); renderProtocolRail();
}

function onHotspot(id){
  if(!currentMission) return;
  if(currentMission.glasgow && ['observe','voice','motor'].includes(id)){ run.observed.add(id); run.step=run.observed.size; run.score=Math.min(100,run.score+1); $('#scoreValue').textContent=run.score; renderGlasgowSheet(); return; }
  if(currentMission.secondary){
    const expected=SECONDARY_ORDER[run.secondary.size];
    if(id===expected){ run.secondary.add(id); run.step=run.secondary.size; run.score=Math.min(100,run.score+1); }
    else if(SECONDARY_ORDER.includes(id) && !run.secondary.has(id)){ run.errors++; run.score=Math.max(35,run.score-5); }
    $('#scoreValue').textContent=run.score; renderSecondarySheet(); return;
  }
  const expectedMap=['bleed','airway','chest','wrist','neuro','expose'];
  if(currentMission.id==='xabcde' && expectedMap.includes(id)){
    const expected=expectedMap[run.step];
    if(id===expected){ run.score=Math.min(100,run.score+2); } else { run.score=Math.max(35,run.score-2); }
    $('#scoreValue').textContent=run.score;
  }
}

function bindCanvasControls(){
  canvasEl.addEventListener('pointerdown',e=>{
    canvasEl.setPointerCapture?.(e.pointerId); pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}); moved=false;
    if(pointers.size===2){ const a=[...pointers.values()]; pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y); }
  });
  canvasEl.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return; const prev=pointers.get(e.pointerId); pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===1){ const dx=e.clientX-prev.x,dy=e.clientY-prev.y; if(Math.abs(dx)+Math.abs(dy)>2)moved=true; yaw-=dx*.006; pitch=clamp(pitch+dy*.004,.18,1.15); updateCamera(); }
    if(pointers.size===2){ const a=[...pointers.values()]; const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y); if(pinchDistance){distance=clamp(distance+(pinchDistance-d)*.012,4.8,13);} pinchDistance=d; updateCamera(); }
  });
  const up=e=>{ if(!moved && pointers.size===1) pickAt(e.clientX,e.clientY); pointers.delete(e.pointerId); if(pointers.size<2)pinchDistance=null; };
  canvasEl.addEventListener('pointerup',up); canvasEl.addEventListener('pointercancel',up);
  canvasEl.addEventListener('wheel',e=>{ distance=clamp(distance+Math.sign(e.deltaY)*.45,4.8,13); updateCamera(); },{passive:true});
}

function pickAt(clientX,clientY){
  if(!raycaster||!camera||!hotspots.length)return; const r=canvasEl.getBoundingClientRect(); pointer.x=((clientX-r.left)/r.width)*2-1; pointer.y=-((clientY-r.top)/r.height)*2+1; raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(hotspots,false); if(hits[0]) onHotspot(hits[0].object.userData.hotspot);
}
function updateCamera(){ if(!camera)return; const target=new THREE.Vector3(0,.55,0); camera.position.set(target.x+distance*Math.sin(pitch)*Math.cos(yaw),target.y+distance*Math.cos(pitch),target.z+distance*Math.sin(pitch)*Math.sin(yaw)); camera.lookAt(target); }

function startLoop(){
  cancelAnimationFrame(raf);
  const loop=()=>{
    if(renderer&&threeScene&&camera){
      const t=performance.now()*.001;
      flashers.forEach(f=>{ f.light.intensity = f.base * (0.28 + Math.max(0,Math.sin(t*f.freq + f.phase))*0.95); });
      hotspots.forEach((h,i)=>{ const s=1+Math.sin(t*3.2+i*.75)*.12; h.scale.setScalar(s); });
      dynamicLabels.forEach((r,i)=>{ r.rotation.z = t*1.2 + i; r.material.opacity = .34 + (Math.sin(t*2.4+i)+1)*.12; });
      animators.forEach(fn=>fn(t));
      renderer.render(threeScene,camera);
    }
    raf=requestAnimationFrame(loop);
  };
  loop();
}

function finishMission(){
  run.elapsed=Math.max(1,Math.round((Date.now()-run.started)/1000));
  run.baseScore=clamp(run.score,0,100); showDebrief();
}
function showDebrief(){
  showScreen(debrief); cancelAnimationFrame(raf); $('#debriefTitle').textContent=currentMission.title;
  $('#finalScore').textContent=run.baseScore; const grade=run.baseScore>=90?'PRONTO PARA A PRÓXIMA OCORRÊNCIA':run.baseScore>=75?'BOA EXECUÇÃO • REFORCE A SEQUÊNCIA':run.baseScore>=55?'PRECISA DE MAIS UMA PASSADA':'REFAÇA COM FOCO NA ORDEM'; $('#gradeText').textContent=grade;
  $('#metricGrid').innerHTML=`<div class="metric"><b>${run.baseScore}</b><span>EXECUÇÃO</span></div><div class="metric"><b>${run.errors}</b><span>ERROS DE ORDEM</span></div><div class="metric"><b>${run.elapsed}s</b><span>TEMPO</span></div>`;
  renderQuestions();
}
function renderQuestions(){
  const list=$('#questionList'); list.innerHTML='';
  currentMission.questions.forEach((q,qi)=>{
    const card=document.createElement('article'); card.className='question-card'; card.innerHTML=`<h4>${qi+1}. ${q[0]}</h4><div class="question-options"></div><div class="question-feedback" hidden></div>`;
    const opts=card.querySelector('.question-options'), fb=card.querySelector('.question-feedback');
    q[1].forEach((label,oi)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{if(card.dataset.answered)return;card.dataset.answered='1';const ok=oi===q[2];b.classList.add(ok?'correct':'incorrect');if(ok)run.quizCorrect++;[...opts.children].forEach((x,i)=>{if(i===q[2])x.classList.add('correct');x.disabled=true;});fb.hidden=false;fb.textContent=q[3];updateBestAfterQuiz();};opts.appendChild(b);});
    list.appendChild(card);
  });
}
function updateBestAfterQuiz(){
  const answered=document.querySelectorAll('.question-card[data-answered="1"]').length;
  if(answered!==currentMission.questions.length)return;
  const quiz=Math.round((run.quizCorrect/currentMission.questions.length)*100); const final=Math.round(run.baseScore*.75+quiz*.25); $('#finalScore').textContent=final; $('#metricGrid').children[0].querySelector('b').textContent=final;
  if(final>(progress[currentMission.id]||0)){progress[currentMission.id]=final;saveProgress();}
}

$('#backBtn').onclick=()=>{cancelAnimationFrame(raf);showScreen(home);renderHome();};
$('#homeBtn').onclick=()=>{showScreen(home);renderHome();};
$('#retryBtn').onclick=()=>startMission(currentMission);

renderHome();

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
