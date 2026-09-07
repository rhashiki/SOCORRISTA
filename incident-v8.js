/* Re.Force APH — Build 4 / v8
 * Dynamic Incident Engine: randomized clinical priorities for the same vertical slice.
 * Educational abstraction: findings and decisions stay high-level and non-graphic.
 */

let ACTIVE_CASE=null;
const V8_CASES=[
  {
    id:'x_external', title:'COLISÃO CARRO × MOTO', qth:'Av. Central × Rua 4', priority:'ALTA', info:'Vítima ao solo; trânsito ativo',
    focus:'X', visual:'Há sangue visível junto à perna direita e a roupa está bastante escurecida na região.',
    airway:'A vítima consegue responder com voz clara.', breathing:'Expansão torácica aparentemente simétrica; respiração rápida, sem esforço marcado.',
    spo2:96, bp:'108/70', witness:'“Eu vi a moto cair de lado depois da batida.”'
  },
  {
    id:'a_airway', title:'QUEDA APÓS COLISÃO', qth:'Rua 4 × Av. Central', priority:'ALTA', info:'Motociclista desorientado após impacto',
    focus:'A', visual:'Não há hemorragia externa importante evidente na varredura inicial.',
    airway:'A fala é muito limitada e a resposta vocal está alterada; isso exige prioridade na avaliação da via aérea.', breathing:'Após a prioridade anterior ser reconhecida, o tórax apresenta expansão sem assimetria evidente.',
    spo2:94, bp:'116/74', witness:'“Ele tentou responder, mas parecia muito confuso.”'
  },
  {
    id:'b_breathing', title:'COLISÃO EM CRUZAMENTO', qth:'Av. Central × Rua 4', priority:'ALTA', info:'Uma vítima consciente no solo',
    focus:'B', visual:'Não há hemorragia externa importante evidente na varredura inicial.',
    airway:'A vítima fala e mantém resposta verbal compreensível.', breathing:'A respiração está mais trabalhosa e a expansão do tórax parece desigual.',
    spo2:91, bp:'112/72', witness:'“Depois da queda ele começou a respirar bem mais rápido.”'
  },
  {
    id:'stable_primary', title:'ACIDENTE DE MOTOCICLETA', qth:'Setor Leste • Rua 4', priority:'MODERADA', info:'Vítima consciente; mecanismo relevante',
    focus:'NONE', visual:'Não há hemorragia externa importante evidente na varredura inicial.',
    airway:'A vítima responde claramente e mantém fala adequada.', breathing:'Expansão torácica simétrica e sem esforço respiratório marcante.',
    spo2:97, bp:'122/78', witness:'“Ele caiu e ficou consciente o tempo todo.”'
  }
];

function v8PickCase(){
  const last=localStorage.getItem('reforce-last-case');
  const pool=V8_CASES.filter(c=>c.id!==last);
  const c=pool[Math.floor(Math.random()*pool.length)]||V8_CASES[0];
  localStorage.setItem('reforce-last-case',c.id);
  return c;
}
function v8ApplyDispatch(){
  if(!ACTIVE_CASE)return;
  const card=document.querySelector('.dispatch-card'); if(!card)return;
  const title=card.querySelector('h2'); if(title)title.textContent=ACTIVE_CASE.title;
  const blocks=card.querySelectorAll('.dispatch-grid b');
  if(blocks[0])blocks[0].textContent=ACTIVE_CASE.qth;
  if(blocks[1])blocks[1].textContent='1 vítima';
  if(blocks[2])blocks[2].textContent=ACTIVE_CASE.priority;
  if(blocks[3])blocks[3].textContent=ACTIVE_CASE.info;
}
function v8ApplyPatientVisual(){
  if(!patient?.pool||!patient?.patch||!ACTIVE_CASE)return;
  const xCase=ACTIVE_CASE.focus==='X';
  patient.pool.visible=xCase; patient.patch.visible=xCase;
  patient.pool.scale.set(.85,.85,1);
  patient.assessedBleed=false;
  patient.v8XObserved=false; patient.v8AObserved=false; patient.v8BObserved=false;
  patient.v8AResolved=false; patient.v8BResolved=false;
}

const v8BaseInit=init;
init=async function(){
  ACTIVE_CASE=v8PickCase();
  v8ApplyDispatch();
  await v8BaseInit();
  v8ApplyDispatch();
  v8ApplyPatientVisual();
  logEvent(`Caso dinâmico carregado: ${ACTIVE_CASE.id}.`);
};

function renderX(){
  const observed=patient.v8XObserved;
  const actions=[
    {label:'Fazer varredura visual rápida',done:observed,fn:()=>{
      patient.v8XObserved=true;patient.assessedBleed=true;
      logEvent('Varredura inicial realizada.');
      observe(ACTIVE_CASE.visual);
      setTimeout(renderX,950);
    }},
    {label:'Controlar a hemorragia externa visível',primary:ACTIVE_CASE.focus==='X',locked:!observed,fn:()=>{
      if(ACTIVE_CASE.focus!=='X'){
        penalize(6,'Tentou tratar uma hemorragia externa importante que não estava presente no caso.');
        observe('A avaliação não mostrou uma hemorragia externa importante que justificasse essa prioridade.');return;
      }
      patient.bleedActive=false;clinicalStage='A';reward(5,'Ameaça prioritária em X reconhecida e controlada.');
      observe('A progressão do achado externo cessa. Continue a avaliação primária.');setTimeout(renderA,900);
    }},
    {label:'Avançar para avaliação da via aérea',primary:ACTIVE_CASE.focus!=='X',locked:!observed,fn:()=>{
      if(ACTIVE_CASE.focus==='X'){
        penalize(8,'Avançou para A sem resolver uma ameaça evidente em X.');
        observe('A ameaça externa continua presente. Reavalie a prioridade.');return;
      }
      clinicalStage='A';reward(3,'Varredura X sem ameaça prioritária; avanço correto para A.');renderA();
    }},
    {label:'Começar entrevista SAMPLE',fn:()=>wrongClinical('Iniciou SAMPLE antes de concluir a avaliação primária.',5)}
  ];
  openInteraction('Avaliação inicial','XABCDE','Procure ameaças antes de agir. O caso pode ou não conter uma alteração prioritária em X.',actions);
}

function renderA(){
  const observed=patient.v8AObserved;
  const actions=[
    {label:'Avaliar resposta verbal e sinais de via aérea',done:observed,fn:()=>{
      patient.v8AObserved=true;logEvent('Via aérea avaliada pela resposta observável.');observe(ACTIVE_CASE.airway);setTimeout(renderA,950);
    }},
    {label:'Reconhecer prioridade de via aérea e aplicar suporte previsto no protocolo',primary:ACTIVE_CASE.focus==='A',locked:!observed,fn:()=>{
      if(ACTIVE_CASE.focus!=='A'){
        penalize(5,'Classificou como ameaça de via aérea um achado que não indicava essa prioridade.');observe('Os achados observados não sustentam uma ameaça prioritária em A.');return;
      }
      patient.v8AResolved=true;clinicalStage='B';reward(5,'Alteração prioritária em A reconhecida e encaminhada conforme protocolo de treinamento.');renderB();
    }},
    {label:'Avançar para respiração',primary:ACTIVE_CASE.focus!=='A',locked:!observed,fn:()=>{
      if(ACTIVE_CASE.focus==='A'){
        penalize(8,'Avançou para B sem resolver a prioridade identificada em A.');observe('A alteração da via aérea ainda precisa ser priorizada.');return;
      }
      clinicalStage='B';reward(3,'A sem ameaça imediata; avanço correto para B.');renderB();
    }},
    {label:'Abrir avaliação secundária',fn:()=>wrongClinical('Pulou etapas da avaliação primária.',6)}
  ];
  openInteraction('Avaliação primária','VIA AÉREA','Obtenha um achado observável antes de decidir se existe uma ameaça em A.',actions);
}

function renderB(){
  const observed=patient.v8BObserved;
  const actions=[
    {label:'Observar tórax, frequência e esforço respiratório',done:observed,fn:()=>{
      patient.v8BObserved=true;logEvent('Respiração avaliada de forma dirigida.');observe(ACTIVE_CASE.breathing);setTimeout(renderB,950);
    }},
    {label:'Reconhecer prioridade respiratória e acionar suporte previsto no protocolo',primary:ACTIVE_CASE.focus==='B',locked:!observed,fn:()=>{
      if(ACTIVE_CASE.focus!=='B'){
        penalize(5,'Classificou como ameaça respiratória um achado que não indicava essa prioridade.');observe('Os achados respiratórios não sustentam essa prioridade neste caso.');return;
      }
      patient.v8BResolved=true;clinicalStage='C';reward(5,'Alteração prioritária em B reconhecida e encaminhada conforme protocolo de treinamento.');renderC();
    }},
    {label:'Avançar para circulação',primary:ACTIVE_CASE.focus!=='B',locked:!observed,fn:()=>{
      if(ACTIVE_CASE.focus==='B'){
        penalize(8,'Avançou para C sem resolver uma alteração prioritária em B.');observe('A alteração respiratória permanece prioritária.');return;
      }
      clinicalStage='C';reward(3,'B sem ameaça imediata; avanço correto para C.');renderC();
    }},
    {label:'Perguntar medicamentos',fn:()=>wrongClinical('Antecipou SAMPLE durante a avaliação primária.',4)}
  ];
  openInteraction('Avaliação primária','RESPIRAÇÃO','Observe antes de decidir. Nem toda ocorrência terá alteração em B.',actions);
}

const v8BaseUpdatePatient=updatePatient;
updatePatient=function(dt){
  v8BaseUpdatePatient(dt);
  if(ACTIVE_CASE&&ACTIVE_CASE.focus!=='X'&&patient?.pool){patient.pool.visible=false;patient.patch.visible=false;}
};
