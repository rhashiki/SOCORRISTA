/* Re.Force APH — Build 45 / v45
 * Continuous shift/session statistics across consecutive incidents.
 */

const V45_KEY='reforce-shift-v45';
let V45_SHIFT=v45Load();
function v45Load(){try{return Object.assign({id:Date.now(),missions:0,total:0,best:0,errors:0,started:Date.now()},JSON.parse(sessionStorage.getItem(V45_KEY)||'{}'));}catch{return {id:Date.now(),missions:0,total:0,best:0,errors:0,started:Date.now()};}}
function v45Save(){sessionStorage.setItem(V45_KEY,JSON.stringify(V45_SHIFT));}
function v45Avg(){return V45_SHIFT.missions?Math.round(V45_SHIFT.total/V45_SHIFT.missions):0;}
function v45SetupLanding(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#shiftCard'))return;
  const el=document.createElement('div');el.id='shiftCard';el.className='shift-card';el.innerHTML=`<small>PLANTÃO ATUAL</small><div><b>${V45_SHIFT.missions}</b><span>ocorrências</span><b>${v45Avg()}</b><span>média</span><b>${V45_SHIFT.best}</b><span>melhor</span></div>`;const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
}
function v45Record(){
  if(document.body.dataset.v45Recorded==='1')return;document.body.dataset.v45Recorded='1';const final=Number(document.querySelector('#finalScore')?.textContent||score||0);V45_SHIFT.missions++;V45_SHIFT.total+=final;V45_SHIFT.best=Math.max(V45_SHIFT.best,final);V45_SHIFT.errors+=timeline.filter(x=>x.type==='bad').length;v45Save();
}
function v45NextIncident(){
  const p=new URLSearchParams(location.search);p.delete('case');p.delete('seed');p.set('v','45');location.href=`${location.pathname}?${p.toString()}`;
}
function v45EndShift(){sessionStorage.removeItem(V45_KEY);location.href=`${location.pathname}?v=45`;}
const v45BaseShow=showDebrief;
showDebrief=function(elapsed){
  v45BaseShow(elapsed);v45Record();const card=document.querySelector('.debrief-card');if(!card)return;
  const panel=document.createElement('section');panel.className='shift-result';panel.innerHTML=`<small>RESUMO DO PLANTÃO</small><div><b>${V45_SHIFT.missions}</b><span>ocorrências</span><b>${v45Avg()}</b><span>média</span><b>${V45_SHIFT.errors}</b><span>falhas registradas</span></div>`;
  const restart=card.querySelector('#restartBtn');card.insertBefore(panel,restart);restart.textContent='PRÓXIMA OCORRÊNCIA';restart.onclick=v45NextIncident;
  const end=document.createElement('button');end.className='secondary-shift-btn';end.textContent='ENCERRAR PLANTÃO';end.onclick=v45EndShift;restart.insertAdjacentElement('afterend',end);
};
v45SetupLanding();
