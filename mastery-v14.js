/* Re.Force APH — Build 10 / v14
 * Adaptive debrief and persistent mastery map.
 */

const V14_KEY='reforce-mastery-v14';
let V14_MASTERY=v14Load();
const V14_AREAS=['X','A','B','C','D','E','SAMPLE','SECUNDÁRIA'];

function v14Load(){try{return Object.assign({},JSON.parse(localStorage.getItem(V14_KEY)||'{}'));}catch{return {};}}
function v14Save(){localStorage.setItem(V14_KEY,JSON.stringify(V14_MASTERY));}
function v14ClampScore(v){return Math.max(0,Math.min(100,Math.round(v)));}
function v14AreaSignals(){
  const text=timeline.map(x=>({text:String(x.text||'').toLowerCase(),type:x.type}));
  const out={};V14_AREAS.forEach(a=>out[a]={good:0,bad:0});
  const map={
    X:['hemorrag','ameaça externa','varredura x','prioridade em x'],
    A:['via aérea','prioridade em a'],
    B:['respira','prioridade em b'],
    C:['circula','perfusão'],
    D:['glasgow','neurol'],
    E:['exposição','proteção térmica'],
    SAMPLE:['sample','história','pergunta irrelevante','medicamento','alergia'],
    'SECUNDÁRIA':['secundária','cabeça aos pés','fora de sequência']
  };
  for(const [area,terms] of Object.entries(map))for(const row of text)if(terms.some(t=>row.text.includes(t)))out[area][row.type==='bad'?'bad':'good']++;
  return out;
}
function v14UpdateMastery(finalScore){
  const sig=v14AreaSignals();
  for(const area of V14_AREAS){
    const prev=V14_MASTERY[area]?.score??50, s=sig[area];
    let runScore=finalScore;
    if(s.good||s.bad)runScore=v14ClampScore(70+s.good*8-s.bad*16);
    const score=v14ClampScore(prev*.68+runScore*.32);
    V14_MASTERY[area]={score,runs:(V14_MASTERY[area]?.runs||0)+1};
  }
  v14Save();return sig;
}
function v14Weakest(){return V14_AREAS.slice().sort((a,b)=>(V14_MASTERY[a]?.score??50)-(V14_MASTERY[b]?.score??50))[0]||'X';}
function v14SetupLanding(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#masteryTip'))return;
  const weak=v14Weakest(),score=V14_MASTERY[weak]?.score??50;
  const el=document.createElement('div');el.id='masteryTip';el.className='mastery-tip';el.innerHTML=`<small>FOCO RECOMENDADO</small><b>${weak}</b><span>Domínio estimado: ${score}%</span>`;
  const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
}

const v14BaseShowDebrief=showDebrief;
showDebrief=function(elapsed){
  v14BaseShowDebrief(elapsed);
  const finalScore=Number(document.querySelector('#finalScore')?.textContent||score||0);v14UpdateMastery(finalScore);
  const card=document.querySelector('.debrief-card');if(!card)return;
  const section=document.createElement('section');section.className='mastery-section';
  section.innerHTML=`<small>MAPA DE DOMÍNIO</small><h3>PROTOCOLOS</h3><div class="mastery-grid">${V14_AREAS.map(a=>{const s=V14_MASTERY[a]?.score??50;return `<div><span>${a}</span><i><b style="width:${s}%"></b></i><strong>${s}%</strong></div>`;}).join('')}</div><p>Próximo foco sugerido: <b>${v14Weakest()}</b>. O indicador combina desempenho recente e histórico, não substituindo avaliação formal.</p>`;
  const restart=card.querySelector('#restartBtn');card.insertBefore(section,restart);
};

v14SetupLanding();
