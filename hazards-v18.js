/* Re.Force APH — Build 14 / v18
 * Dynamic scene hazards and scene-safety requirements.
 */

let V18_HAZARDS=[];
const V18_POOLS={
  x_external:['traffic','crowd'],
  a_airway:['crowd','visibility'],
  b_breathing:['traffic','access'],
  stable_primary:['traffic'],
  d_neuro:['access','crowd']
};
const V18_INFO={
  traffic:{label:'Trânsito ativo próximo da vítima',check:'signal'},
  crowd:{label:'Curiosos comprimindo a área de atendimento',check:'crowd'},
  visibility:{label:'Visibilidade ruim na área da ocorrência',check:'visibility'},
  access:{label:'Acesso estreito ou mal organizado ao paciente',check:'access'}
};

const v18BasePick=v8PickCase;
v8PickCase=function(){const c=v18BasePick();V18_HAZARDS=[...(V18_POOLS[c.id]||['traffic'])];c.info=`${c.info} • ${V18_HAZARDS.map(h=>V18_INFO[h].label).join(' • ')}`;return c;};
function v18RequiredChecks(){return ['epi','risks',...V18_HAZARDS.map(h=>V18_INFO[h].check)];}
sceneReady=function(){return v18RequiredChecks().every(x=>sceneChecks.has(x));};

function v18HazardActions(){
  const a=[];
  if(V18_HAZARDS.includes('traffic'))a.push({label:'Sinalizar o fluxo e preservar uma área segura',done:sceneChecks.has('signal'),fn:()=>{if(!sceneChecks.has('signal')){sceneChecks.add('signal');reward(2,'Risco de trânsito controlado na cena.');}openSceneInteraction();}});
  if(V18_HAZARDS.includes('crowd'))a.push({label:'Organizar curiosos fora da área de atendimento',done:sceneChecks.has('crowd'),fn:()=>{if(!sceneChecks.has('crowd')){sceneChecks.add('crowd');reward(2,'Curiosos afastados da área operacional.');}openSceneInteraction();}});
  if(V18_HAZARDS.includes('visibility'))a.push({label:'Melhorar a visibilidade da área antes da abordagem',done:sceneChecks.has('visibility'),fn:()=>{if(!sceneChecks.has('visibility')){sceneChecks.add('visibility');reward(2,'Visibilidade operacional melhorada.');}openSceneInteraction();}});
  if(V18_HAZARDS.includes('access'))a.push({label:'Organizar o acesso e manter o caminho seguro',done:sceneChecks.has('access'),fn:()=>{if(!sceneChecks.has('access')){sceneChecks.add('access');reward(2,'Acesso à vítima organizado com segurança.');}openSceneInteraction();}});
  return a;
}

openSceneInteraction=function(){
  const hazards=V18_HAZARDS.map(h=>V18_INFO[h].label).join(' • ');
  const actions=[
    {label:'Conferir EPI antes do contato',done:sceneChecks.has('epi'),fn:()=>{if(!sceneChecks.has('epi')){sceneChecks.add('epi');reward(1,'EPI conferido antes do contato.');}openSceneInteraction();}},
    {label:'Observar mecanismo, riscos e entorno',done:sceneChecks.has('risks'),fn:()=>{if(!sceneChecks.has('risks')){sceneChecks.add('risks');reward(1,'Riscos e mecanismo avaliados.');}observe(`Riscos identificados: ${hazards}.`);setTimeout(openSceneInteraction,950);}},
    ...v18HazardActions(),
    {label:'Ir direto para a vítima',primary:true,fn:()=>{if(!sceneReady()){penalize(9,'Abordou a vítima antes de controlar todos os riscos relevantes da cena.');observe('Ainda existem riscos de cena não controlados.');}else beginPatientApproach();}}
  ];
  if(sceneReady())actions.push({label:'Cena controlada • aproximar-se do paciente',primary:true,fn:beginPatientApproach});
  openInteraction('Controle da cena','SEGURANÇA',`Esta ocorrência possui riscos próprios. Não repita uma sequência decorada: leia o ambiente. ${hazards}`,actions);
};

const v18BaseInit=init;
init=async function(){
  await v18BaseInit();
  if(V18_HAZARDS.includes('visibility')&&scene){scene.background.setHex(0x617484);if(scene.fog){scene.fog.color.setHex(0x617484);scene.fog.near=45;scene.fog.far=Math.min(scene.fog.far||140,105);}}
};
