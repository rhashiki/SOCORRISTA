/* Re.Force APH — Build 12 / v16
 * Mobile graphics/performance profiles.
 */

const V16_KEY='reforce-graphics-v16';
let V16_PROFILE=localStorage.getItem(V16_KEY)||'balanced';
const V16_PRESETS={
  eco:{label:'ECONÔMICO',pixel:1.0,shadows:false,pedStep:2,trafficStep:2,fog:115},
  balanced:{label:'EQUILIBRADO',pixel:1.35,shadows:true,pedStep:1,trafficStep:1,fog:145},
  high:{label:'ALTO',pixel:1.7,shadows:true,pedStep:1,trafficStep:1,fog:175}
};

function v16SetupUI(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#graphicsSelector'))return;
  const el=document.createElement('div');el.id='graphicsSelector';el.className='graphics-selector';
  el.innerHTML=`<small>QUALIDADE 3D</small><div>${Object.entries(V16_PRESETS).map(([id,p])=>`<button data-gfx="${id}" class="${id===V16_PROFILE?'active':''}">${p.label}</button>`).join('')}</div>`;
  const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>{V16_PROFILE=b.dataset.gfx;localStorage.setItem(V16_KEY,V16_PROFILE);el.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));});
}
function v16Apply(){
  const p=V16_PRESETS[V16_PROFILE]||V16_PRESETS.balanced;if(!renderer)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,p.pixel));renderer.shadowMap.enabled=p.shadows;
  if(scene?.fog)scene.fog.far=p.fog;
  pedestrians.forEach((x,i)=>x.root.visible=p.pedStep===1||i%p.pedStep===0);
  traffic.forEach((x,i)=>x.root.visible=p.trafficStep===1||i%p.trafficStep===0);
  const badge=document.createElement('div');badge.className='gfx-badge';badge.textContent=`3D ${p.label}`;document.querySelector('#game')?.appendChild(badge);setTimeout(()=>badge.remove(),2200);
}
const v16BaseInit=init;
init=async function(){await v16BaseInit();v16Apply();};
v16SetupUI();
