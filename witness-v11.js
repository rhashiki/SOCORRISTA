/* Re.Force APH — Build 7 / v11
 * Witness & Scene Intelligence.
 * Bystander reports add context but never replace direct clinical findings.
 */

let V11_WITNESS={asked:new Set(),interviews:0,nearest:null};
const V11_Q=[
  {id:'mechanism',label:'O que você viu acontecer?',answer:()=>ACTIVE_CASE?.witness||'“Vi a vítima cair logo depois do impacto.”',value:'mechanism'},
  {id:'time',label:'Há quanto tempo aconteceu?',answer:()=>['“Poucos minutos, talvez três ou quatro.”','“Foi agora há pouco; não sei dizer exatamente.”'][Math.floor(Math.random()*2)],value:'time'},
  {id:'conscious',label:'Ela chegou a responder depois da queda?',answer:()=>ACTIVE_CASE?.focus==='A'?'“Tentou responder, mas a fala parecia diferente.”':'“Sim, eu ouvi ela falando depois da queda.”',value:'conscious'},
  {id:'guess',label:'Você acha que ela quebrou alguma coisa?',answer:()=> '“Não sei. Só vi a queda de longe.”',value:'low'}
];

function v11NearestWitness(){
  if(!player?.root||!curiosos?.length)return null;let best=null,bd=99;
  for(const r of curiosos){const d=dist2(player.root.position,r.position);if(d<bd){bd=d;best=r;}}
  return bd<2.7?best:null;
}
function v11OpenWitness(){
  const w=v11NearestWitness();if(!w){flash('Nenhuma testemunha próxima.');return;}
  V11_WITNESS.nearest=w;V11_WITNESS.interviews++;
  const actions=V11_Q.map(q=>({label:q.label,done:V11_WITNESS.asked.has(q.id),fn:()=>{
    if(!V11_WITNESS.asked.has(q.id)){V11_WITNESS.asked.add(q.id);if(q.value!=='low')reward(1,`Informação de cena obtida com testemunha: ${q.id}.`);else penalize(1,'Gastou tempo pedindo opinião especulativa à testemunha.');}
    observe(`${q.answer()}\n\nRelato de terceiros: use como contexto e confirme com a avaliação da vítima.`);setTimeout(v11OpenWitness,1200);
  }}));
  actions.push({label:'Encerrar conversa',primary:true,fn:closeInteraction});
  openInteraction('Testemunha','INFORMAÇÃO DE CENA','A pessoa presenciou parte da ocorrência. Pergunte apenas o que pode melhorar sua leitura do mecanismo e da evolução.',actions);
}

const v11BaseUpdateContext=updateContext;
updateContext=function(){
  v11BaseUpdateContext();
  if(controlled==='player'&&['SCENE','PATIENT'].includes(phase)&&v11NearestWitness()&&!uiBlock())actionBtn.textContent='FALAR';
};
const v11BaseContextAction=doContextAction;
doContextAction=function(){
  if(uiBlock())return;
  if(controlled==='player'&&['SCENE','PATIENT'].includes(phase)&&v11NearestWitness()){v11OpenWitness();return;}
  return v11BaseContextAction();
};

const v11BaseShowDebrief=showDebrief;
showDebrief=function(elapsed){
  v11BaseShowDebrief(elapsed);
  const learningEl=document.querySelector('#learning');if(!learningEl)return;
  const p=document.createElement('p');
  if(V11_WITNESS.asked.size>=2)p.textContent='Você usou testemunhas para reconstruir contexto do evento. Relatos ajudaram a entender o mecanismo, mas a avaliação clínica continuou sendo a fonte principal.';
  else p.textContent='Testemunhas podem acrescentar contexto sobre mecanismo e evolução, mas o relato de terceiros deve ser confirmado pela avaliação direta da vítima.';
  learningEl.appendChild(p);
};
