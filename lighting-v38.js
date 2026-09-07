/* Re.Force APH — Build 38 / v38
 * Vehicle headlights and wet-road material response for darker environments.
 */

let V38_LIGHTS=[];
function v38IsDark(){return V24_ENV&&['night','sunset','rain'].includes(V24_ENV.id);}
function v38AddAmbulanceHeadlights(){
  if(!ambulance?.root||ambulance.root.userData.v38Lights)return;
  const lights=[];
  for(const x of [-.62,.62]){
    const spot=new THREE.SpotLight(0xffe7bd,v38IsDark()?3.1:1.0,24,.38,.55,1.25);spot.position.set(x,.86,-3.18);spot.castShadow=V16_PROFILE==='high';
    const target=new THREE.Object3D();target.position.set(x,.25,-12);ambulance.root.add(target);spot.target=target;ambulance.root.add(spot);lights.push(spot);
  }
  ambulance.root.userData.v38Lights=lights;V38_LIGHTS.push(...lights);
}
function v38AddTrafficGlow(){
  if(!v38IsDark()||V16_PROFILE==='eco')return;
  traffic.slice(0,V16_PROFILE==='high'?10:6).forEach((t,i)=>{
    if(t.root.userData.v38Glow)return;const p=new THREE.PointLight(0xffd7a0,.48,5.5,2);p.position.set(1.45,.62,0);t.root.add(p);t.root.userData.v38Glow=p;V38_LIGHTS.push(p);
  });
}
function v38WetRoads(){
  if(V24_ENV?.id!=='rain'||!scene)return;
  scene.traverse(o=>{
    if(!o.isMesh||!o.material)return;const mats=Array.isArray(o.material)?o.material:[o.material];
    mats.forEach(m=>{if(m.color){const h=m.color.getHex();if([0x2f3337,0x34383c,0x17191b].includes(h)){m.roughness=.48;m.metalness=Math.max(.08,m.metalness||0);}}});
  });
}
function v38Apply(){v38AddAmbulanceHeadlights();v38AddTrafficGlow();v38WetRoads();}
const v38BaseInit=init;
init=async function(){V38_LIGHTS=[];await v38BaseInit();v38Apply();};
