/* Re.Force APH — Build 2 / v6
 * Clinical layer + contextual interaction + minimap.
 * Educational simulation: no procedural replacement for formal training.
 */

function updateContext(){
  const actor=controlled==='vehicle'?ambulance.root?.position:player.root?.position;
  if(!actor)return;

  if(controlled==='player'){
    if(phase==='TO_AMBULANCE'&&dist2(player.root.position,ambulance.root.position)<3.5){actionBtn.textContent='ENTRAR';}
    else if((phase==='SCENE'||phase==='PATIENT')&&dist2(player.root.position,ACCIDENT_POS)<8&&!sceneReady()){actionBtn.textContent='CENA';}
    else if(phase==='SCENE'&&sceneReady()&&dist2(player.root.position,ACCIDENT_POS)<8){actionBtn.textContent='VÍTIMA';}
    else if((phase==='PATIENT'||phase==='CLINICAL')&&patient.anchor&&dist2(player.root.position,patient.anchor.position)<3.2){actionBtn.textContent='ATENDER';}
    else actionBtn.textContent='USAR';
  }else actionBtn.textContent='SAIR';

  let target=null,label='';
  if(phase==='TO_AMBULANCE'){target=ambulance.root?.position;label='VIATURA';}
  else if(['EN_ROUTE','AT_SCENE_VEHICLE','SCENE','PATIENT','CLINICAL'].includes(phase)){target=ACCIDENT_POS;label='OCORRÊNCIA';}
  else if(phase==='BASE'){target=BASE_POS;label='BASE';}
  if(target){const d=Math.round(dist2(actor,target));distanceLabel.textContent=d<4?label:`${d} m`;}
}

function openInteraction(title,kicker,text,actions){
  interactionTitle.textContent=title;
  interactionKicker.textContent=kicker;
  interactionText.textContent=text;
  interactionActions.innerHTML='';
  observationBox.hidden=true;
  actions.forEach(a=>{
    const b=document.createElement('button');
    b.textContent=a.label;
    if(a.primary)b.classList.add('primary-action');
    if(a.done)b.classList.add('done');
    if(a.locked)b.classList.add('locked');
    b.disabled=!!a.locked;
    b.onclick=()=>a.fn(b);
    interactionActions.appendChild(b);
  });
  interactionPanel.hidden=false;
}
function closeInteraction(){interactionPanel.hidden=true;observationBox.hidden=true;}
function observe(msg){observationBox.textContent=msg;observationBox.hidden=false;}

function openSceneInteraction(){
  const actions=[
    {label:'Conferir EPI antes do contato',done:sceneChecks.has('epi'),fn:()=>{if(!sceneChecks.has('epi')){sceneChecks.add('epi');reward(1,'EPI conferido antes do contato.');}openSceneInteraction();}},
    {label:'Sinalizar e organizar o entorno',done:sceneChecks.has('signal'),fn:()=>{if(!sceneChecks.has('signal')){sceneChecks.add('signal');reward(1,'Cena sinalizada e fluxo afastado da vítima.');}openSceneInteraction();}},
    {label:'Observar riscos e mecanismo',done:sceneChecks.has('risks'),fn:()=>{if(!sceneChecks.has('risks')){sceneChecks.add('risks');reward(1,'Riscos e mecanismo avaliados.');}observe('Colisão carro x moto, vítima ao solo e trânsito ainda ativo. Não há fogo visível.');setTimeout(openSceneInteraction,1000);}},
    {label:'Ir direto para a vítima',primary:true,fn:()=>{
      if(!sceneReady()){
        penalize(8,'Abordou a vítima antes de controlar a segurança da cena.');
        observe('Você iniciou a aproximação sem completar a segurança da cena. Isso ficará registrado no debrief.');
      }else beginPatientApproach();
    }}
  ];
  if(sceneReady()) actions.push({label:'Aproximar-se do paciente',primary:true,fn:beginPatientApproach});
  openInteraction('Controle da cena','SEGURANÇA','O trânsito continua passando e há curiosos próximos. Organize a cena antes de iniciar a avaliação.',actions);
}
function beginPatientApproach(){
  phase='PATIENT';closeInteraction();setObjective('ATENDIMENTO','Aproxime-se do paciente e inicie a avaliação.');logEvent('Cena controlada; abordagem autorizada.');flash('Cena controlada. Aproxime-se da vítima.');
}

function openClinicalInteraction(){
  if(!patient.clinicalStart){
    patient.clinicalStart=performance.now();
    clinicalStatus.hidden=false;
    phase='CLINICAL';
    logEvent('Contato com paciente iniciado.');
  }
  if(clinicalStage==='X')return renderX();
  if(clinicalStage==='A')return renderA();
  if(clinicalStage==='B')return renderB();
  if(clinicalStage==='C')return renderC();
  if(clinicalStage==='D')return renderD();
  if(clinicalStage==='E')return renderE();
  if(clinicalStage==='SAMPLE')return renderSample();
  if(clinicalStage==='SECONDARY')return startSecondary();
  if(clinicalStage==='DONE')return finishMission();
}
function wrongClinical(msg,pen=5){penalize(pen,msg);observe('Essa decisão não resolve a prioridade atual. O caso continua evoluindo.');}

function renderX(){
  openInteraction('Avaliação inicial','PACIENTE','Leia a vítima e a cena. O jogo não mostrará a letra do protocolo que você deve executar.',[
    {label:'Fazer uma varredura visual rápida',fn:()=>{patient.assessedBleed=true;logEvent('Alteração externa importante reconhecida visualmente.');observe('Na perna direita, a roupa está muito escurecida e há sangue no solo junto ao membro.');setTimeout(renderX,1100);}},
    {label:'Controlar a hemorragia externa visível',primary:true,fn:()=>{
      if(!patient.assessedBleed)penalize(2,'Reconheceu a prioridade, mas sem registrar uma varredura inicial.');
      patient.bleedActive=false;clinicalStage='A';reward(4,'Ameaça externa prioritária controlada.');observe('A progressão do sangramento cessa. Reavalie e continue pela próxima prioridade.');setTimeout(renderA,1000);
    }},
    {label:'Perguntar sobre alergias',fn:()=>wrongClinical('Iniciou SAMPLE antes de resolver a ameaça imediata.',6)},
    {label:'Medir pressão arterial primeiro',fn:()=>wrongClinical('Priorizou uma medida complementar antes da ameaça imediata.',5)}
  ]);
}
function renderA(){
  openInteraction('Avaliação primária','PACIENTE','A ameaça inicial foi resolvida. Continue sem pular prioridades.',[
    {label:'Falar com a vítima e avaliar resposta',primary:true,fn:()=>{clinicalStage='B';reward(2,'Via aérea avaliada pela capacidade de falar.');observe('A vítima consegue responder com voz clara, embora ansiosa.');setTimeout(renderB,900);}},
    {label:'Perguntar quando comeu pela última vez',fn:()=>wrongClinical('Antecipou SAMPLE durante a avaliação primária.',4)},
    {label:'Começar exame da pelve',fn:()=>wrongClinical('Pulou prioridades da avaliação primária.',5)},
    {label:'Abrir prontuário para preencher dados',fn:()=>wrongClinical('Interrompeu a sequência para uma ação não prioritária.',3)}
  ]);
}
function renderB(){
  openInteraction('Avaliação primária','PACIENTE','Observe o padrão respiratório antes de procurar números.',[
    {label:'Observar tórax, frequência e esforço respiratório',primary:true,fn:()=>{clinicalStage='C';reward(2,'Respiração avaliada de forma dirigida.');observe('Expansão torácica simétrica, sem esforço respiratório marcado. Frequência aproximada: 22 irpm.');setTimeout(renderC,950);}},
    {label:'Perguntar medicamentos de uso diário',fn:()=>wrongClinical('Antecipou a história SAMPLE.',4)},
    {label:'Avaliar Glasgow agora',fn:()=>wrongClinical('Avançou para o neurológico antes da circulação.',5)},
    {label:'Examinar o dorso',fn:()=>wrongClinical('Antecipou a avaliação secundária.',5)}
  ]);
}
function renderC(){
  openInteraction('Avaliação primária','PACIENTE','Avalie circulação e perfusão após controlar a ameaça externa.',[
    {label:'Avaliar pulso e perfusão periférica',primary:true,fn:()=>{clinicalStage='D';reward(2,'Circulação e perfusão avaliadas.');observe(`Pulso rápido e perfusão periférica reduzida. ${patient.bloodLoss>35?'A demora anterior tornou os sinais mais preocupantes.':'O controle precoce limitou a deterioração.'}`);setTimeout(renderD,1000);}},
    {label:'Perguntar alergias agora',fn:()=>wrongClinical('História ainda não é a prioridade desta etapa.',3)},
    {label:'Começar exame da cabeça aos pés',fn:()=>wrongClinical('Iniciou a secundária antes de terminar a primária.',6)},
    {label:'Encerrar atendimento',fn:()=>wrongClinical('Tentou encerrar sem completar a avaliação.',8)}
  ]);
}
function renderD(){
  const ev=patient.gcsEvidence;
  openInteraction('Avaliação neurológica','PACIENTE','Obtenha evidências observáveis antes de registrar Glasgow.',[
    {label:'Observar abertura ocular',done:ev.has('E'),fn:()=>{ev.add('E');observe('Os olhos estão abertos espontaneamente.');setTimeout(renderD,800);}},
    {label:'Perguntar nome e local',done:ev.has('V'),fn:()=>{ev.add('V');observe('A vítima diz o nome corretamente, mas se confunde sobre onde está.');setTimeout(renderD,800);}},
    {label:'Pedir um comando motor simples',done:ev.has('M'),fn:()=>{ev.add('M');observe('A vítima obedece ao comando motor solicitado.');setTimeout(renderD,800);}},
    {label:'Registrar Glasgow',primary:true,locked:ev.size<3,fn:()=>{$('#glasgowEvidence').textContent='Olhos abertos espontaneamente. Responde verbalmente, mas está confusa quanto ao local. Obedece a comando motor simples.';$('#glasgowModal').hidden=false;}}
  ]);
}
function saveGlasgow(){
  const e=+$('#gE').value,v=+$('#gV').value,m=+$('#gM').value;
  if(!e||!v||!m){flash('Preencha E, V e M.');return;}
  $('#glasgowModal').hidden=true;
  if(e===4&&v===4&&m===6)reward(4,'Glasgow interpretado corretamente: E4 V4 M6 = 14.');
  else penalize(8,`Glasgow registrado como E${e} V${v} M${m}; o caso correspondia a E4 V4 M6.`);
  clinicalStage='E';renderE();
}
function renderE(){
  openInteraction('Conclusão da primária','PACIENTE','Finalize a avaliação primária mantendo proteção térmica e privacidade.',[
    {label:'Expor de forma dirigida e proteger do frio',primary:true,fn:()=>{clinicalStage='SAMPLE';reward(2,'Exposição dirigida concluída com proteção térmica.');observe('Nenhuma nova ameaça imediata é percebida na exposição dirigida. Agora obtenha a história.');setTimeout(renderSample,1000);}},
    {label:'Perguntar a última refeição antes de concluir a primária',fn:()=>wrongClinical('Antecipou a entrevista antes de concluir a primária.',3)},
    {label:'Examinar somente a perna alterada',fn:()=>wrongClinical('Focou uma região antes de completar a visão global.',4)}
  ]);
}

const SAMPLE_Q={
  symptoms:['O que você está sentindo agora?','Dor forte na perna direita e tontura leve.','S'],
  allergies:['Você tem alguma alergia conhecida?','Relata alergia a dipirona.','A'],
  meds:['Usa algum medicamento diariamente?','Usa medicamento para hipertensão.','M'],
  past:['Tem alguma doença ou condição importante?','Refere hipertensão; nega cirurgia recente.','P'],
  last:['Quando comeu ou bebeu pela última vez?','Almoçou há cerca de duas horas.','L'],
  event:['Conte o que aconteceu imediatamente antes da colisão.','A moto foi atingida lateralmente e a vítima caiu para o lado direito.','E']
};
function renderSample(){
  const actions=[];
  Object.entries(SAMPLE_Q).forEach(([k,v])=>actions.push({label:v[0],done:patient.sample.has(k),fn:()=>{if(!patient.sample.has(k)){patient.sample.add(k);reward(1,`SAMPLE: informação ${v[2]} obtida.`);}observe(v[1]);setTimeout(renderSample,850);}}));
  actions.push({label:'Qual é o seu signo?',fn:()=>{penalize(3,'Pergunta irrelevante durante a história dirigida.');observe('A pergunta não contribui para a decisão clínica deste atendimento.');}});
  actions.push({label:'Qual a marca da sua moto?',fn:()=>{penalize(2,'Pergunta de baixo valor clínico durante SAMPLE.');observe('A informação não muda a avaliação atual.');}});
  if(patient.sample.size===6)actions.push({label:'Concluir história e iniciar avaliação secundária',primary:true,fn:()=>{clinicalStage='SECONDARY';reward(2,'História SAMPLE concluída.');startSecondary();}});
  openInteraction('História dirigida','SAMPLE','Faça uma entrevista eficiente. Nem todas as perguntas disponíveis têm valor clínico.',actions);
}

const SECONDARY=['head','neck','chest','abdomen','pelvis','limbs','back'];
const REGION_NAME={head:'cabeça',neck:'pescoço',chest:'tórax',abdomen:'abdome',pelvis:'pelve',limbs:'membros',back:'dorso'};
function startSecondary(){
  closeInteraction();
  bodyZoneMode=true;
  patient.secondaryOrder=[];
  cameraReady=false;
  cameraDistance=4.8;
  setObjective('AVALIAÇÃO SECUNDÁRIA','Examine a vítima da cabeça aos pés tocando diretamente nas regiões do corpo. Não há marcadores visíveis.');
  flash('Toque no corpo da vítima em uma sequência sistemática.');
  canvas.removeEventListener('click',secondaryClickOnce);
  canvas.addEventListener('click',secondaryClickOnce);
}
function secondaryClickOnce(e){
  if(!bodyZoneMode)return;
  const ray=new THREE.Raycaster(),p=new THREE.Vector2(),r=canvas.getBoundingClientRect();
  p.x=((e.clientX-r.left)/r.width)*2-1;p.y=-((e.clientY-r.top)/r.height)*2+1;
  ray.setFromCamera(p,camera);
  const hit=ray.intersectObjects(clinicalZones,false)[0];
  if(!hit)return;
  const region=hit.object.userData.region;
  if(patient.secondaryOrder.includes(region)){flash(`${REGION_NAME[region]} já examinada.`);return;}
  const expected=SECONDARY[patient.secondaryOrder.length];
  patient.secondaryOrder.push(region);
  if(region===expected){reward(1,`Secundária: ${REGION_NAME[region]} examinada em sequência.`);flash(`${REGION_NAME[region]}: sem nova ameaça imediata.`);}
  else{penalize(4,`Avaliação secundária fora de sequência: examinou ${REGION_NAME[region]} antes de ${REGION_NAME[expected]}.`);flash(`${REGION_NAME[region]} examinada fora da sequência sistemática.`);}
  if(patient.secondaryOrder.length===SECONDARY.length){
    bodyZoneMode=false;canvas.removeEventListener('click',secondaryClickOnce);clinicalStage='DONE';cameraReady=false;cameraDistance=7.2;
    setTimeout(()=>openInteraction('Atendimento concluído','ENCERRAMENTO','Você completou a abordagem da vítima. Encerre para receber o debrief da ocorrência.',[{label:'Encerrar ocorrência e revisar desempenho',primary:true,fn:finishMission}]),650);
  }
}

function finishMission(){
  closeInteraction();phase='DONE';clinicalStatus.hidden=true;setSirenAudio(false);
  const elapsed=nowSec();
  if(patient.bloodLoss>45){penalize(5,'Demora significativa antes do controle da hemorragia gerou deterioração clínica.');learning.push('A leitura inicial da vítima precisa reconhecer ameaças externas importantes cedo; atrasos pioram a evolução do caso.');}
  else learning.push('A leitura inicial permitiu resolver a ameaça externa antes de uma deterioração maior.');
  if(!sceneReady())learning.push('Segurança da cena faz parte do atendimento: EPI, sinalização e leitura de riscos antecedem a abordagem.');
  learning.push('Glasgow deve ser derivado das respostas observadas — ocular, verbal e motora — e registrado por componentes.');
  learning.push('SAMPLE funciona como história dirigida: perguntas relevantes ajudam a decisão; perguntas sem valor consomem tempo.');
  showDebrief(elapsed);
}
function showDebrief(elapsed){
  show(debrief);
  $('#finalScore').textContent=score;
  $('#debriefGrade').textContent=score>=90?'ATENDIMENTO EXCELENTE':score>=75?'MISSÃO CUMPRIDA':score>=60?'ATENDIMENTO APROVADO':'REFORÇO NECESSÁRIO';
  $('#summaryMetrics').innerHTML=`<div><b>${fmt(elapsed)}</b><span>TEMPO TOTAL</span></div><div><b>${timeline.filter(x=>x.type==='bad').length}</b><span>FALHAS</span></div><div><b>${patient.bloodLoss<35?'PRECOCE':'TARDIO'}</b><span>CONTROLE X</span></div>`;
  $('#timeline').innerHTML=timeline.map(x=>`<div class="${x.type}"><time>${fmt(x.t)}</time><span>${x.text}</span></div>`).join('');
  $('#learning').innerHTML=learning.map(x=>`<p>${x}</p>`).join('');
}

function drawMinimap(){
  if(!mctx||!mini||!player.root||!ambulance.root)return;
  const w=mini.width,h=mini.height,scale=w/WORLD;
  const tx=x=>(x+WORLD/2)*scale,tz=z=>(z+WORLD/2)*scale;
  mctx.clearRect(0,0,w,h);mctx.save();mctx.beginPath();mctx.arc(w/2,h/2,w/2-3,0,Math.PI*2);mctx.clip();
  mctx.fillStyle='#11171b';mctx.fillRect(0,0,w,h);
  mctx.strokeStyle='#414a50';mctx.lineCap='round';mctx.lineWidth=12*scale;
  [-30,0,30].forEach(z=>{mctx.beginPath();mctx.moveTo(0,tz(z));mctx.lineTo(w,tz(z));mctx.stroke();});
  [-48,0,48].forEach(x=>{mctx.beginPath();mctx.moveTo(tx(x),0);mctx.lineTo(tx(x),h);mctx.stroke();});

  const actor=controlled==='vehicle'?ambulance.root:player.root;
  let target=null;if(phase==='TO_AMBULANCE')target=ambulance.root.position;else if(['EN_ROUTE','AT_SCENE_VEHICLE','SCENE','PATIENT','CLINICAL'].includes(phase))target=ACCIDENT_POS;
  if(target){mctx.strokeStyle='#d4a35c';mctx.lineWidth=2;mctx.setLineDash([5,5]);mctx.beginPath();mctx.moveTo(tx(actor.position.x),tz(actor.position.z));mctx.lineTo(tx(target.x),tz(target.z));mctx.stroke();mctx.setLineDash([]);}

  mctx.fillStyle='#5ea869';mctx.beginPath();mctx.arc(tx(BASE_POS.x),tz(BASE_POS.z),4,0,Math.PI*2);mctx.fill();
  mctx.fillStyle='#72a8d6';mctx.beginPath();mctx.arc(tx(HOSPITAL_POS.x),tz(HOSPITAL_POS.z),4,0,Math.PI*2);mctx.fill();
  if(phase!=='DONE'){mctx.fillStyle='#e64b3f';mctx.beginPath();mctx.arc(tx(ACCIDENT_POS.x),tz(ACCIDENT_POS.z),6,0,Math.PI*2);mctx.fill();}

  const ang=controlled==='vehicle'?ambulance.heading:player.root.rotation.y;
  mctx.save();mctx.translate(tx(actor.position.x),tz(actor.position.z));mctx.rotate(-ang);mctx.fillStyle='#fff';mctx.beginPath();mctx.moveTo(0,-7);mctx.lineTo(5,5);mctx.lineTo(-5,5);mctx.closePath();mctx.fill();mctx.restore();mctx.restore();
}

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=6').catch(()=>{}));