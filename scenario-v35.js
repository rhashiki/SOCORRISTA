/* Re.Force APH — Build 35 / v35
 * Reproducible scenario codes for training, QA and instructor use.
 */

let V35_SCENARIO={forced:false,code:'ALEATÓRIO',seed:null};
function v35Hash(text){let h=2166136261>>>0;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function v35PrepareCase(c){
  if(!c)return null;
  const loc=typeof V12_LOCATIONS==='object'?(V12_LOCATIONS[c.id]||V12_LOCATIONS.x_external):null;
  if(loc){ACCIDENT_POS.set(...loc.pos);c.qth=loc.qth;}
  if(typeof V18_POOLS==='object'&&typeof V18_INFO==='object'){
    V18_HAZARDS=[...(V18_POOLS[c.id]||['traffic'])];
    const clean=String(c.info||'').split(' • Trânsito ativo próximo')[0].split(' • Curiosos comprimindo')[0].split(' • Visibilidade ruim')[0].split(' • Acesso estreito')[0];
    c.info=`${clean} • ${V18_HAZARDS.map(h=>V18_INFO[h]?.label||h).join(' • ')}`;
  }
  localStorage.setItem('reforce-last-case',c.id);return c;
}
const v35BasePick=v8PickCase;
v8PickCase=function(){
  const q=new URLSearchParams(location.search),forced=q.get('case'),seed=q.get('seed');
  if(forced){
    const c=V8_CASES.find(x=>x.id===forced);if(c){V35_SCENARIO={forced:true,code:forced.toUpperCase(),seed:null};return v35PrepareCase(c);}
  }
  if(seed){
    const h=v35Hash(seed),c=V8_CASES[h%V8_CASES.length];V35_SCENARIO={forced:true,code:`SEED-${String(h).slice(-6)}`,seed};return v35PrepareCase(c);
  }
  const c=v35BasePick();V35_SCENARIO={forced:false,code:(c?.id||'RANDOM').toUpperCase(),seed:null};return c;
};
function v35SetupLanding(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#scenarioCode'))return;
  const el=document.createElement('div');el.id='scenarioCode';el.className='scenario-code';
  const q=new URLSearchParams(location.search),forced=q.get('case'),seed=q.get('seed');
  el.innerHTML=`<small>CENÁRIO</small><b>${forced?forced.toUpperCase():seed?`SEED ${seed}`:'DINÂMICO'}</b><span>${forced||seed?'Repetição reproduzível ativa':'O Incident Director escolherá o caso ao iniciar'}</span>`;
  const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
}
const v35BaseShow=showDebrief;
showDebrief=function(elapsed){
  v35BaseShow(elapsed);
  const metrics=document.querySelector('#summaryMetrics');if(metrics){const d=document.createElement('div');d.innerHTML=`<b>${V35_SCENARIO.code}</b><span>CÓDIGO DO CENÁRIO</span>`;metrics.appendChild(d);}
};
v35SetupLanding();
