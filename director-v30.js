/* Re.Force APH — Build 26 / v30
 * Adaptive Incident Director: training mode biases cases toward weak mastery areas.
 */

let V30_DIRECTOR={reason:'ALEATÓRIO',target:null};
const V30_AREA_CASE={X:'x_external',A:'a_airway',B:'b_breathing',C:'c_perfusion',D:'d_neuro'};
const v30BasePick=v8PickCase;
v8PickCase=function(){
  if(V13_MODE!=='training'||Math.random()>.78){V30_DIRECTOR={reason:'ALEATÓRIO',target:null};return v30BasePick();}
  const weak=v14Weakest(),id=V30_AREA_CASE[weak];if(!id){V30_DIRECTOR={reason:'ALEATÓRIO',target:null};return v30BasePick();}
  const c=V8_CASES.find(x=>x.id===id);if(!c){V30_DIRECTOR={reason:'ALEATÓRIO',target:null};return v30BasePick();}
  const loc=V12_LOCATIONS[c.id]||V12_LOCATIONS.x_external;ACCIDENT_POS.set(...loc.pos);c.qth=loc.qth;V18_HAZARDS=[...(V18_POOLS[c.id]||['traffic'])];
  const baseInfo=String(c.info||'').split(' • Trânsito ativo próximo')[0].split(' • Curiosos comprimindo')[0].split(' • Visibilidade ruim')[0].split(' • Acesso estreito')[0];c.info=`${baseInfo} • ${V18_HAZARDS.map(h=>V18_INFO[h].label).join(' • ')}`;
  localStorage.setItem('reforce-last-case',c.id);V30_DIRECTOR={reason:`FOCO ADAPTATIVO: ${weak}`,target:weak};return c;
};
function v30SetupLanding(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#directorNote'))return;const el=document.createElement('div');el.id='directorNote';el.className='director-note';el.innerHTML='<small>INCIDENT DIRECTOR</small><span>No Treinamento, o simulador pode priorizar seu ponto mais fraco. Simulação e Avaliação permanecem aleatórias.</span>';const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
}
const v30BaseInit=init;
init=async function(){await v30BaseInit();if(V30_DIRECTOR.target)logEvent(`Incident Director selecionou caso com foco adaptativo em ${V30_DIRECTOR.target}.`);};
const v30BaseShow=showDebrief;
showDebrief=function(elapsed){v30BaseShow(elapsed);const learningEl=document.querySelector('#learning');if(learningEl&&V30_DIRECTOR.target){const p=document.createElement('p');p.textContent=`Este caso foi selecionado pelo Incident Director porque ${V30_DIRECTOR.target} estava entre seus menores índices de domínio no modo Treinamento.`;learningEl.appendChild(p);}};
v30SetupLanding();
