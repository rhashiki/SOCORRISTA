/* Re.Force APH — Build 6 / v10
 * Persistent career progression, ranks and mission performance history.
 */

const V10_PROFILE_KEY='reforce-career-v10';
const V10_RANKS=[
  {name:'RECRUTA',xp:0},{name:'SOCORRISTA',xp:250},{name:'OPERACIONAL',xp:650},{name:'SOCORRISTA SÊNIOR',xp:1200},{name:'INSTRUTOR',xp:2000}
];
let V10_PROFILE=v10LoadProfile();
let v10Awarded=false;

function v10LoadProfile(){
  try{return Object.assign({xp:0,missions:0,best:0,streak:0,lastScore:0,cases:{}},JSON.parse(localStorage.getItem(V10_PROFILE_KEY)||'{}'));}
  catch{return {xp:0,missions:0,best:0,streak:0,lastScore:0,cases:{}};}
}
function v10SaveProfile(){localStorage.setItem(V10_PROFILE_KEY,JSON.stringify(V10_PROFILE));}
function v10RankFor(xp=V10_PROFILE.xp){let r=V10_RANKS[0];for(const x of V10_RANKS)if(xp>=x.xp)r=x;return r;}
function v10NextRank(){const r=v10RankFor();return V10_RANKS.find(x=>x.xp>V10_PROFILE.xp)||r;}
function v10SetupLanding(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#careerCard'))return;
  const rank=v10RankFor(),next=v10NextRank(),pct=next===rank?100:Math.round(((V10_PROFILE.xp-rank.xp)/(next.xp-rank.xp))*100);
  const el=document.createElement('div');el.id='careerCard';el.className='career-card';
  el.innerHTML=`<div><small>CARREIRA</small><b>${rank.name}</b></div><div class="career-xp"><span>${V10_PROFILE.xp} XP</span><span>${V10_PROFILE.missions} ocorrências</span></div><div class="career-progress"><i style="width:${pct}%"></i></div><div class="career-stats"><span>Melhor nota <b>${V10_PROFILE.best}</b></span><span>Sequência ≥80 <b>${V10_PROFILE.streak}</b></span></div>`;
  const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
}
function v10MissionXP(finalScore){
  let xp=Math.max(20,Math.round(finalScore*.8));
  if(sceneReady())xp+=12;
  if(timeline.filter(x=>x.type==='bad').length===0)xp+=20;
  if(V9_EQUIP&&V9_EQUIP.uses>0&&V9_EQUIP.efficient===V9_EQUIP.uses)xp+=8;
  return xp;
}
function v10AwardCareer(finalScore){
  if(v10Awarded)return null;v10Awarded=true;
  const before=v10RankFor().name,xp=v10MissionXP(finalScore);
  V10_PROFILE.xp+=xp;V10_PROFILE.missions++;V10_PROFILE.best=Math.max(V10_PROFILE.best,finalScore);V10_PROFILE.lastScore=finalScore;
  V10_PROFILE.streak=finalScore>=80?V10_PROFILE.streak+1:0;
  const cid=ACTIVE_CASE?.id||'legacy';
  V10_PROFILE.cases[cid]=Object.assign({runs:0,best:0},V10_PROFILE.cases[cid]||{});
  V10_PROFILE.cases[cid].runs++;V10_PROFILE.cases[cid].best=Math.max(V10_PROFILE.cases[cid].best,finalScore);
  v10SaveProfile();
  const after=v10RankFor().name;
  return {xp,before,after,promoted:before!==after};
}

const v10BaseShowDebrief=showDebrief;
showDebrief=function(elapsed){
  v10BaseShowDebrief(elapsed);
  const finalScore=Number(document.querySelector('#finalScore')?.textContent||score||0);
  const award=v10AwardCareer(finalScore);if(!award)return;
  const card=document.querySelector('.debrief-card');
  if(card){
    const panel=document.createElement('section');panel.className='career-result';
    const rank=v10RankFor(),next=v10NextRank(),left=next===rank?0:Math.max(0,next.xp-V10_PROFILE.xp);
    panel.innerHTML=`<small>PROGRESSÃO DE CARREIRA</small><div class="career-award"><b>+${award.xp} XP</b><span>${rank.name}</span></div>${award.promoted?`<strong>PROMOÇÃO: ${award.after}</strong>`:''}<p>${next===rank?'Patente máxima atual alcançada.':`Faltam ${left} XP para ${next.name}.`}</p>`;
    const restart=card.querySelector('#restartBtn');card.insertBefore(panel,restart);
  }
};

const v10BaseInit=init;
init=async function(){v10Awarded=false;await v10BaseInit();};

v10SetupLanding();
