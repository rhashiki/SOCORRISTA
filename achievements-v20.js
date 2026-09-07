/* Re.Force APH — Build 16 / v20
 * Persistent achievements and per-shift challenges.
 */

const V20_KEY='reforce-achievements-v20';
let V20_DATA=v20Load();
const V20_BADGES={
  scene:{name:'CENA SEGURA',desc:'Concluir os controles de segurança antes da abordagem.'},
  drive:{name:'CONDUÇÃO LIMPA',desc:'Chegar sem registro de colisão.'},
  glasgow:{name:'GLASGOW PRECISO',desc:'Registrar Glasgow corretamente.'},
  sample:{name:'ENTREVISTA EFICIENTE',desc:'Completar SAMPLE sem perguntas irrelevantes.'},
  protocol:{name:'SEQUÊNCIA LIMPA',desc:'Concluir sem erro grave de prioridade.'},
  equipment:{name:'KIT INTELIGENTE',desc:'Usar o kit somente em momentos úteis.'}
};
function v20Load(){try{return Object.assign({unlocked:[],runs:0},JSON.parse(localStorage.getItem(V20_KEY)||'{}'));}catch{return {unlocked:[],runs:0};}}
function v20Save(){localStorage.setItem(V20_KEY,JSON.stringify(V20_DATA));}
function v20Unlock(id,newOnes){if(!V20_DATA.unlocked.includes(id)){V20_DATA.unlocked.push(id);newOnes.push(id);}}
function v20Evaluate(){
  const all=timeline.map(x=>String(x.text||'').toLowerCase()),newOnes=[];
  if(sceneReady()&&!all.some(x=>x.includes('antes de controlar')))v20Unlock('scene',newOnes);
  if(!all.some(x=>x.includes('colisão')||x.includes('veículo estacionado')))v20Unlock('drive',newOnes);
  if(all.some(x=>x.includes('glasgow interpretado corretamente')))v20Unlock('glasgow',newOnes);
  if(patient.sample?.size===6&&!all.some(x=>x.includes('pergunta irrelevante')||x.includes('baixo valor clínico')))v20Unlock('sample',newOnes);
  if(!all.some(x=>x.includes('sem resolver')||x.includes('pulou prioridades')||x.includes('fora de sequência')))v20Unlock('protocol',newOnes);
  if(V9_EQUIP&&V9_EQUIP.uses>0&&V9_EQUIP.efficient>=V9_EQUIP.uses)v20Unlock('equipment',newOnes);
  V20_DATA.runs++;v20Save();return newOnes;
}
function v20SetupLanding(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#achievementSummary'))return;
  const el=document.createElement('div');el.id='achievementSummary';el.className='achievement-summary';el.innerHTML=`<small>CONQUISTAS</small><b>${V20_DATA.unlocked.length}/${Object.keys(V20_BADGES).length}</b><span>${V20_DATA.unlocked.length?V20_DATA.unlocked.slice(-2).map(id=>V20_BADGES[id].name).join(' • '):'Complete desafios durante as ocorrências.'}</span>`;
  const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
}
const v20BaseShowDebrief=showDebrief;
showDebrief=function(elapsed){
  v20BaseShowDebrief(elapsed);const newOnes=v20Evaluate(),card=document.querySelector('.debrief-card');if(!card)return;
  const sec=document.createElement('section');sec.className='achievement-result';sec.innerHTML=`<small>DESAFIOS DO PLANTÃO</small><div>${Object.entries(V20_BADGES).map(([id,b])=>`<article class="${V20_DATA.unlocked.includes(id)?'earned':''}"><b>${b.name}</b><span>${b.desc}</span></article>`).join('')}</div>${newOnes.length?`<strong>NOVA${newOnes.length>1?'S':''} CONQUISTA${newOnes.length>1?'S':''}: ${newOnes.map(id=>V20_BADGES[id].name).join(' • ')}</strong>`:''}`;
  const restart=card.querySelector('#restartBtn');card.insertBefore(sec,restart);
};
v20SetupLanding();
