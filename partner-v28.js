/* Re.Force APH — Build 24 / v28
 * AI crew partner that follows the responder and stages near the patient.
 */

let V28_PARTNER={root:null,visual:null,lastHint:0};
function v28CreatePartner(){
  if(V28_PARTNER.root||!scene||!player.root)return;
  const root=new THREE.Group(),visual=createFallbackHuman(0x32414b,{role:'responder',skin:0x9f694c});root.add(visual);root.position.copy(player.root.position).add(new THREE.Vector3(-1.2,0,.8));scene.add(root);V28_PARTNER={root,visual,lastHint:0};
}
function v28PartnerTarget(){
  if(!V28_PARTNER.root)return null;
  if(['PATIENT','CLINICAL'].includes(phase)&&patient?.anchor){const side=new THREE.Vector3(1.5,0,-.5);return patient.anchor.position.clone().add(side);}
  if(controlled==='player'&&player?.root){const behind=new THREE.Vector3(-Math.sin(player.root.rotation.y),0,-Math.cos(player.root.rotation.y)).multiplyScalar(-1.35);return player.root.position.clone().add(behind).add(new THREE.Vector3(-.55,0,.35));}
  return null;
}
function v28UpdatePartner(dt){
  const p=V28_PARTNER.root;if(!p)return;
  if(controlled==='vehicle'){p.visible=false;return;}p.visible=true;
  const target=v28PartnerTarget();if(!target)return;const d=target.clone().sub(p.position);d.y=0;let speed=0;
  if(d.length()>2.8){p.position.copy(target);}
  else if(d.length()>.38){d.normalize();speed=Math.min(4.2,1.4+d.length()*1.2);p.position.addScaledVector(d,speed*dt);p.rotation.y=lerpAngle(p.rotation.y,Math.atan2(d.x,d.z),1-Math.exp(-dt*8));}
  else if(patient?.anchor&&['PATIENT','CLINICAL'].includes(phase))p.lookAt(patient.anchor.position.x,0,patient.anchor.position.z);
  v7AnimateHuman(V28_PARTNER.visual,speed,performance.now()*.001,{running:speed>3.2,idleLook:true});
  if(V13_MODE==='training'&&phase==='CLINICAL'&&performance.now()-V28_PARTNER.lastHint>28000){V28_PARTNER.lastHint=performance.now();flash(`EQUIPE: ${v13HintForStage()}`,3200);}
}
const v28BaseUpdate=update;
update=function(dt){v28BaseUpdate(dt);v28UpdatePartner(dt);};
const v28BaseInit=init;
init=async function(){await v28BaseInit();v28CreatePartner();};
