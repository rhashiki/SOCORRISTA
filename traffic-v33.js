/* Re.Force APH — Build 33 / v33
 * Emergency corridor behaviour and readable brake-light feedback.
 */

function v33EnsureCarState(t){
  if(t.v33)return t.v33;
  const rearMat=new THREE.MeshStandardMaterial({color:0x5c1614,roughness:.5,metalness:.08,emissive:0x250000,emissiveIntensity:.15});
  const a=new THREE.Mesh(new THREE.BoxGeometry(.08,.16,.28),rearMat.clone()),b=new THREE.Mesh(new THREE.BoxGeometry(.08,.16,.28),rearMat.clone());
  a.position.set(-1.62,.58,.48);b.position.set(-1.62,.58,-.48);t.root.add(a,b);
  t.v33={offset:0,side:new THREE.Vector3(0,0,0),seg:t.seg,prevSpeed:t.speed,brakes:[a,b]};return t.v33;
}
function v33TrafficDirection(t){
  const p=t.path,a=p[t.seg%p.length],b=p[(t.seg+1)%p.length];
  return new THREE.Vector3(b[0]-a[0],0,b[1]-a[1]).normalize();
}
function v33ApplyCorridor(t,dt){
  const s=v33EnsureCarState(t),dir=v33TrafficDirection(t);
  if(s.seg!==t.seg){s.offset=0;s.seg=t.seg;s.side.set(-dir.z,0,dir.x);}
  if(s.side.lengthSq()===0)s.side.set(-dir.z,0,dir.x);

  const d=ambulance?.root?dist2(t.root.position,ambulance.root.position):999;
  let target=0;
  if(ambulance?.siren&&['EN_ROUTE','AT_SCENE_VEHICLE'].includes(phase)&&d<18){
    const away=t.root.position.clone().sub(ambulance.root.position).setY(0);
    const sign=away.dot(s.side)>=0?1:-1;target=.78*sign;
  }
  const next=THREE.MathUtils.lerp(s.offset,target,1-Math.exp(-dt*(target?3.8:2.2)));
  const delta=next-s.offset;t.root.position.addScaledVector(s.side,delta);s.offset=next;

  const braking=t.speed<s.prevSpeed-.08||t.speed<.7;
  s.brakes.forEach(l=>{l.material.emissive.setHex(braking?0xff1f16:0x250000);l.material.emissiveIntensity=braking?2.1:.15;l.material.color.setHex(braking?0xb52a24:0x5c1614);});
  s.prevSpeed=t.speed;
}

const v33BaseUpdateTraffic=updateTraffic;
updateTraffic=function(dt){v33BaseUpdateTraffic(dt);traffic.forEach(t=>v33ApplyCorridor(t,dt));};

const v33BaseShowDebrief=showDebrief;
showDebrief=function(elapsed){
  v33BaseShowDebrief(elapsed);
  const learningEl=document.querySelector('#learning');
  if(learningEl&&ambulance?.siren){const p=document.createElement('p');p.textContent='Durante o deslocamento, o tráfego simulou abertura progressiva de corredor para a viatura com sinais sonoros ativos.';learningEl.appendChild(p);}
};
