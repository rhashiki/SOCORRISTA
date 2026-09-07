/* Re.Force APH — Build 20 / v24
 * Time-of-day and lightweight weather ambience.
 */

let V24_ENV=null,V24_RAIN=null,V24_RAIN_SPEED=0;
const V24_PRESETS=[
  {id:'day',label:'DIA',bg:0x86a9c0,fog:0x86a9c0,hemi:1.85,sun:3.0,rain:false},
  {id:'sunset',label:'FIM DE TARDE',bg:0xb27b65,fog:0x9b7568,hemi:1.35,sun:2.15,rain:false},
  {id:'night',label:'NOITE',bg:0x172331,fog:0x1d2b38,hemi:.72,sun:.65,rain:false},
  {id:'rain',label:'CHUVA LEVE',bg:0x526878,fog:0x526878,hemi:1.05,sun:1.15,rain:true}
];
function v24Pick(){
  const pool=V18_HAZARDS?.includes('visibility')?V24_PRESETS.filter(x=>x.id!=='day'):V24_PRESETS;
  return pool[Math.floor(Math.random()*pool.length)];
}
function v24ApplyLights(){
  if(!scene||!V24_ENV)return;
  scene.background.setHex(V24_ENV.bg);if(scene.fog)scene.fog.color.setHex(V24_ENV.fog);
  const lights=scene.children.filter(x=>x.isLight),hemi=lights.find(x=>x.isHemisphereLight),sun=lights.find(x=>x.isDirectionalLight);if(hemi)hemi.intensity=V24_ENV.hemi;if(sun)sun.intensity=V24_ENV.sun;
  if(['night','sunset','rain'].includes(V24_ENV.id)){
    streetLights.forEach((g,i)=>{if(i%3!==0)return;const bulb=g.children.find(x=>x.isMesh&&x.material?.emissive);if(!bulb)return;const p=new THREE.PointLight(0xffc779,V24_ENV.id==='night'?1.8:1.0,13,2);p.position.copy(g.position).add(new THREE.Vector3(.7,4.0,0));scene.add(p);});
  }
}
function v24BuildRain(){
  if(!V24_ENV?.rain||V16_PROFILE==='eco'||!scene)return;
  const count=V16_PROFILE==='high'?650:320,pos=new Float32Array(count*3);for(let i=0;i<count;i++){pos[i*3]=rand(-60,60);pos[i*3+1]=rand(2,32);pos[i*3+2]=rand(-60,60);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));const mat=new THREE.PointsMaterial({color:0xb9d1df,size:.065,transparent:true,opacity:.52,depthWrite:false});V24_RAIN=new THREE.Points(geo,mat);scene.add(V24_RAIN);V24_RAIN_SPEED=14;
}
function v24UpdateRain(dt){
  if(!V24_RAIN)return;const a=V24_RAIN.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]-=V24_RAIN_SPEED*dt;if(a[i+1]<.3)a[i+1]=rand(20,32);}V24_RAIN.geometry.attributes.position.needsUpdate=true;
}
function v24SetupBadge(){const game=document.querySelector('#game');if(!game||document.querySelector('#envBadge'))return;const b=document.createElement('div');b.id='envBadge';b.className='env-badge';b.textContent=V24_ENV.label;game.appendChild(b);setTimeout(()=>b.classList.add('show'),100);setTimeout(()=>b.classList.remove('show'),2600);}
const v24BaseUpdate=update;
update=function(dt){v24BaseUpdate(dt);v24UpdateRain(dt);};
const v24BaseInit=init;
init=async function(){V24_ENV=v24Pick();await v24BaseInit();v24ApplyLights();v24BuildRain();v24SetupBadge();};
