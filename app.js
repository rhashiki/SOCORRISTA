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
let hotspots = [];
const progress = JSON.parse(localStorage.getItem('reforce-aph-progress') || '{}');

function showScreen(el){ screens.forEach(s=>s.classList.remove('is-active')); el.classList.add('is-active'); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function saveProgress(){ localStorage.setItem('reforce-aph-progress',JSON.stringify(progress)); }

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  raycaster=new THREE.Raycaster(); pointer=new THREE.Vector2();
  bindCanvasControls();
  new ResizeObserver(resizeRenderer).observe(sceneWrap);
}

function resizeRenderer(){
  if(!renderer||!camera) return;
  const w=Math.max(1,sceneWrap.clientWidth), h=Math.max(1,sceneWrap.clientHeight);
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}

function mat(color,rough=.78,metal=.05){ return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal}); }
function addMesh(geometry,material,position=[0,0,0],rotation=[0,0,0],parent=world){
  const o=new THREE.Mesh(geometry,material); o.position.set(...position); o.rotation.set(...rotation); o.castShadow=true; o.receiveShadow=true; parent.add(o); return o;
}
function box(size,color,pos,rot=[0,0,0],parent=world){ return addMesh(new THREE.BoxGeometry(...size),mat(color),pos,rot,parent); }
function cyl(r,h,color,pos,rot=[0,0,0],parent=world){ return addMesh(new THREE.CylinderGeometry(r,r,h,18),mat(color),pos,rot,parent); }

function buildVictim(){
  victim=new THREE.Group(); victim.name='victim'; world.add(victim);
  const skin=mat(0xb98261), uniform=mat(0x202b30), pants=mat(0x171b1e);
  const head=addMesh(new THREE.SphereGeometry(.34,20,14),skin,[1.38,.42,0],[0,0,0],victim); head.scale.set(1,.92,.88);
  const chest=addMesh(new THREE.CapsuleGeometry(.35,.82,5,12),uniform,[.42,.38,0],[0,0,Math.PI/2],victim);
  const pelvis=box([.48,.34,.66],0x20252a,[-.25,.35,0],[0,0,.03],victim);
  for(const z of [-.24,.24]){
    addMesh(new THREE.CapsuleGeometry(.13,.68,5,10),pants,[-.72,.34,z],[0,0,Math.PI/2],victim);
    addMesh(new THREE.CapsuleGeometry(.11,.62,5,10),pants,[-1.36,.31,z],[0,0,Math.PI/2],victim);
    box([.32,.15,.22],0x080808,[-1.78,.28,z],[0,0,.02],victim);
  }
  for(const z of [-.42,.42]) addMesh(new THREE.CapsuleGeometry(.095,.58,4,10),skin,[.55,.32,z],[Math.PI/2,0,Math.PI/2],victim);
  victim.rotation.y=.15;
  return {head,chest,pelvis};
}

function buildBaseScene(){
  threeScene=new THREE.Scene(); threeScene.background=new THREE.Color(0x15100c); threeScene.fog=new THREE.Fog(0x15100c,11,25);
  world=new THREE.Group(); threeScene.add(world);
  camera=new THREE.PerspectiveCamera(52,1,.1,80);
  const hemi=new THREE.HemisphereLight(0xffe4c5,0x201b18,1.8); threeScene.add(hemi);
  const key=new THREE.DirectionalLight(0xffe2b6,2.4); key.position.set(-4,8,5); key.castShadow=true; threeScene.add(key);
  const red=new THREE.PointLight(0xff3020,3.2,9); red.position.set(5,2,-4); threeScene.add(red);
  const blue=new THREE.PointLight(0x2a7fff,2.4,8); blue.position.set(-5,2,-3); threeScene.add(blue);
  const ground=addMesh(new THREE.PlaneGeometry(30,30),mat(0x27231f,1),[0,0,0],[-Math.PI/2,0,0]); ground.receiveShadow=true;
  hotspots=[]; yaw=.45; pitch=.43; distance=8.4;
}

function addCone(x,z){
  const cone=addMesh(new THREE.ConeGeometry(.22,.65,12),mat(0xc55b22),[x,.34,z]);
  box([.55,.06,.55],0x1e1c1a,[x,.04,z]); return cone;
}
function addHotspot(id,pos,label,color=0xe1b66d){
  const g=new THREE.SphereGeometry(.16,14,10); const m=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.55,transparent:true,opacity:.85});
  const h=addMesh(g,m,pos); h.userData.hotspot=id; h.userData.label=label; hotspots.push(h);
  const ring=addMesh(new THREE.TorusGeometry(.28,.025,8,22),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7}),pos,[Math.PI/2,0,0]); ring.userData.decor=true;
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

function buildCrashScene(){
  box([30,.03,5],0x242321,[0,.02,0]);
  for(let x=-12;x<12;x+=2) box([1.1,.012,.08],0xc4a15e,[x,.04,-1.8]);
  const car=new THREE.Group(); world.add(car); car.position.set(3,.35,-1.2); car.rotation.y=-.22;
  box([3.5,.65,1.55],0x551b18,[0,.45,0],[0,0,0],car); box([1.9,.55,1.25],0x3e1715,[.2,.95,0],[0,0,0],car);
  for(const x of [-1.1,1.1]) for(const z of [-.72,.72]) cyl(.34,.26,0x080808,[x,.25,z],[Math.PI/2,0,0],car);
  addCone(-2.8,-1.3); addCone(-1.9,-2.1); addCone(1.0,-2.4);
  buildVictim(); victim.position.set(-.2,.17,.35);
  addHotspot('bleed',[-.55,.55,.62],'Sangramento crítico',0xd83a2d);
  addHotspot('airway',[1.35,.78,.12],'Via aérea');
  addHotspot('chest',[.55,.82,.08],'Tórax',0xe4b764);
  addHotspot('wrist',[.68,.5,.48],'Pulso / perfusão',0x7d9852);
  addHotspot('neuro',[1.44,.78,-.12],'Neurológico',0x4e89a6);
  addHotspot('expose',[-.15,.73,-.36],'Exposição',0xc08b3c);
}

function buildStairsScene(){
  for(let i=0;i<7;i++) box([3,.28,.7],0x39332e,[-2.9+i*.55,.14+i*.28,-1.6+i*.2]);
  box([8,.08,2.5],0x2a2724,[0,.05,.2]);
  buildVictim(); victim.position.set(.4,.16,.35); victim.rotation.y=-.15;
  addHotspot('observe',[1.5,.82,.05],'Olhos / resposta espontânea',0x4e89a6);
  addHotspot('voice',[1.4,.72,-.15],'Resposta à voz',0xd3a95c);
  addHotspot('motor',[.4,.52,.52],'Resposta motora',0x7c9a55);
}

function buildBikeScene(){
  box([30,.04,5],0x282622,[0,.03,0]);
  const bike=new THREE.Group(); world.add(bike); bike.position.set(2.5,.55,-1.25); bike.rotation.set(.15,.5,.12);
  for(const z of [-.62,.62]) addMesh(new THREE.TorusGeometry(.55,.055,10,26),mat(0x111111),[0,0,z],[0,0,0],bike);
  cyl(.035,1.2,0x8b2e26,[0,0,0],[Math.PI/2,0,0],bike); cyl(.035,1.05,0x8b2e26,[.35,.15,0],[0,0,.55],bike);
  buildVictim(); victim.position.set(-.4,.16,.2); victim.rotation.y=.08;
  addHotspot('talk',[1.3,.76,.05],'Conversar com a vítima',0xd5ad65);
  addCone(-2.3,-1.9); addCone(-1.4,-2.2);
}

function buildConstructionScene(){
  box([30,.04,8],0x3b342a,[0,.03,0]);
  for(const x of [-3.4,3.4]){ for(const z of [-2.2,2.2]) cyl(.07,4.6,0x787878,[x,2.3,z]); }
  for(let y=.5;y<4.5;y+=1.1) box([7,.08,.1],0x777777,[0,y,-2.2]);
  box([2.8,1.2,1.8],0x8b6b3d,[3.2,.62,1.3]); addCone(-2.7,-1.4); addCone(-1.9,-1.9);
  buildVictim(); victim.position.set(-.2,.17,.15);
  addHotspot('head',[1.45,.76,.02],'Cabeça');
  addHotspot('neck',[1.08,.63,.02],'Pescoço');
  addHotspot('chest',[.55,.62,.02],'Tórax');
  addHotspot('abdomen',[.05,.57,.02],'Abdome');
  addHotspot('pelvis',[-.3,.54,.02],'Pelve');
  addHotspot('limbs',[-1.1,.47,.28],'Membros');
  addHotspot('back',[.35,.46,-.38],'Dorso');
}

function startMission(m){
  currentMission=m; run={step:0,score:100,errors:0,observed:new Set(),started:Date.now(),quizCorrect:0,glasgow:{},sample:new Set(),secondary:new Set()};
  showScreen(game); loadingEl.hidden=false; $('#gameProtocol').textContent=m.protocol; $('#gameTitle').textContent=m.title; $('#scoreValue').textContent=run.score;
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
  if(run.observed.has('voice')) obs.push('<div class="obs"><b>À voz:</b> abre os olhos e fala de forma confusa sobre onde está.</div>');
  if(run.observed.has('motor')) obs.push('<div class="obs"><b>Comando motor:</b> obedece ao comando simples solicitado.</div>');
  const ready=['observe','voice','motor'].every(x=>run.observed.has(x));
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
function updateCamera(){ if(!camera)return; const target=new THREE.Vector3(0,.45,0); camera.position.set(target.x+distance*Math.sin(pitch)*Math.cos(yaw),target.y+distance*Math.cos(pitch),target.z+distance*Math.sin(pitch)*Math.sin(yaw)); camera.lookAt(target); }
function startLoop(){ cancelAnimationFrame(raf); const loop=()=>{ if(renderer&&threeScene&&camera){ const t=performance.now()*.002; hotspots.forEach((h,i)=>{h.scale.setScalar(1+Math.sin(t+i)*.12);}); renderer.render(threeScene,camera);} raf=requestAnimationFrame(loop);}; loop(); }

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
