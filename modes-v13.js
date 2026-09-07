/* Re.Force APH — Build 9 / v13
 * Difficulty modes: Training, Simulation and Evaluation.
 */

const V13_KEY='reforce-mode-v13';
let V13_MODE=localStorage.getItem(V13_KEY)||'simulation';
const V13_MODES={
  training:{label:'TREINAMENTO',mult:.75,penalty:.55,hints:true},
  simulation:{label:'SIMULAÇÃO',mult:1,penalty:1,hints:false},
  evaluation:{label:'AVALIAÇÃO',mult:1.3,penalty:1.15,hints:false}
};

function v13SetupModeUI(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#modeSelector'))return;
  const row=document.createElement('div');row.id='modeSelector';row.className='difficulty-selector';
  row.innerHTML=`<small>MODO DE JOGO</small><div>${Object.entries(V13_MODES).map(([id,m])=>`<button data-mode="${id}" class="${id===V13_MODE?'active':''}"><b>${m.label}</b><span>${id==='training'?'dicas e penalidades menores':id==='simulation'?'desafio padrão':'sem cola • XP maior'}</span></button>`).join('')}</div>`;
  const career=card.querySelector('#careerCard'),btn=card.querySelector('#startShift');card.insertBefore(row,career||btn);
  row.querySelectorAll('button').forEach(b=>b.onclick=()=>{V13_MODE=b.dataset.mode;localStorage.setItem(V13_KEY,V13_MODE);row.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));});
}
function v13SetupHud(){
  const top=document.querySelector('.hud-top');if(!top||document.querySelector('#modeBadge'))return;
  const badge=document.createElement('div');badge.id='modeBadge';badge.className='mode-badge';badge.textContent=V13_MODES[V13_MODE].label;top.appendChild(badge);
}
function v13HintForStage(){
  const hints={X:'Observe antes de agir: a prioridade só existe se o achado estiver presente.',A:'Use a resposta da vítima para decidir se há ameaça em via aérea.',B:'Compare padrão respiratório e expansão antes de avançar.',C:'Priorize circulação depois de X, A e B.',D:'Glasgow nasce das respostas observadas, não de um número adivinhado.',E:'Conclua a primária antes de aprofundar a história.'};
  return hints[clinicalStage]||'Mantenha uma sequência sistemática e confirme achados antes de decidir.';
}

const v13BasePenalize=penalize;
penalize=function(points,reason){
  const cfg=V13_MODES[V13_MODE];v13BasePenalize(Math.max(1,Math.round(points*cfg.penalty)),reason);
  if(cfg.hints)setTimeout(()=>flash(`DICA: ${v13HintForStage()}`,3300),300);
};

const v13BaseSetObjective=setObjective;
setObjective=function(label,text){
  if(V13_MODE==='evaluation'&&['ATENDIMENTO','PACIENTE','CLINICAL'].some(x=>String(label).includes(x))){v13BaseSetObjective('EM ATENDIMENTO','Avalie a vítima e tome suas decisões.');return;}
  v13BaseSetObjective(label,text);
};

const v13BaseOpenInteraction=openInteraction;
openInteraction=function(title,kicker,text,actions){
  if(V13_MODE==='evaluation'&&['XABCDE','VIA AÉREA','RESPIRAÇÃO','PACIENTE'].includes(kicker)){
    kicker='PACIENTE';
    if(title==='Avaliação inicial'||title==='Avaliação primária')title='Atendimento';
  }
  v13BaseOpenInteraction(title,kicker,text,actions);
};

const v13BaseMissionXP=v10MissionXP;
v10MissionXP=function(finalScore){return Math.round(v13BaseMissionXP(finalScore)*V13_MODES[V13_MODE].mult);};

const v13BaseInit=init;
init=async function(){await v13BaseInit();v13SetupHud();if(V13_MODE==='evaluation')clinicalStatus.hidden=true;};

v13SetupModeUI();
