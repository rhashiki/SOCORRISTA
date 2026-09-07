/* Re.Force APH — Build 44 / v44
 * Pedestrian/crowd behaviour diversity: idle, glance, bus-stop pause and scene reactions.
 */

let V44_CLOCK=0;
function v44EnsurePed(p,i){
  if(p.v44)return p.v44;
  p.v44={kind:['commuter','walker','observer','stroller'][i%4],decision:1+Math.random()*4,pause:0,look:0};return p.v44;
}
function v44Gesture(root,type,t){
  const rig=root?.children?.[0]?.userData?.rig||root?.userData?.rig;if(!rig)return;
  if(type==='observer'){rig.head.rotation.y=Math.sin(t*1.2)*.22;rig.rightArm.rotation.z=.08+Math.sin(t*.9)*.03;}
  if(type==='commuter'){rig.leftForearm.rotation.x=-.45;rig.leftArm.rotation.z=-.08;}
  if(type==='stroller'){rig.torso.rotation.y=Math.sin(t*.45)*.035;}
}
function v44UpdatePedStates(dt){
  V44_CLOCK+=dt;const t=performance.now()*.001;
  pedestrians.forEach((p,i)=>{
    const s=v44EnsurePed(p,i);s.decision-=dt;
    if(s.decision<=0){s.decision=2+Math.random()*6;if(Math.random()<.18&&!isRoad(p.root.position.x,p.root.position.z)){s.pause=.8+Math.random()*2.3;}}
    if(s.pause>0){s.pause-=dt;p.pause=Math.max(p.pause||0,.12);v7AnimateHuman(p.root.children[0],0,t,{idleLook:true});v44Gesture(p.root,s.kind,t);}
    if(s.kind==='commuter'){
      const stop=cityDecor.find(g=>g.children?.length>=3&&dist2(g.position,p.root.position)<3.2);if(stop&&Math.random()<.003){s.pause=2+Math.random()*3;p.root.lookAt(stop.position.x,0,stop.position.z);}
    }
    if(ambulance.siren&&dist2(p.root.position,ambulance.root.position)<8){const away=p.root.position.clone().sub(ambulance.root.position).setY(0).normalize();p.root.position.addScaledVector(away,dt*.38);}
  });
}
function v44SetupCrowd(){
  curiosos.forEach((r,i)=>{r.userData.v44Role=['witness','worried','observer','helper'][i%4];});
}
function v44UpdateCrowdGestures(){
  const t=performance.now()*.001;
  curiosos.forEach((r,i)=>{
    const visual=r.children?.[0],rig=visual?.userData?.rig;if(!rig)return;const role=r.userData.v44Role||'observer';
    if(role==='witness'){rig.rightArm.rotation.x=-.35+Math.sin(t*1.3+i)*.05;rig.rightForearm.rotation.x=-.55;}
    if(role==='worried'){rig.leftArm.rotation.z=-.18;rig.rightArm.rotation.z=.18;rig.head.rotation.y=Math.sin(t*.7+i)*.18;}
    if(role==='observer'){rig.head.rotation.y=Math.sin(t*.9+i)*.12;}
    if(role==='helper'&&sceneChecks.has('signal')){rig.leftArm.rotation.x=.16;rig.rightArm.rotation.x=-.16;}
  });
}
const v44BaseUpdatePedestrians=updatePedestrians;
updatePedestrians=function(dt){v44BaseUpdatePedestrians(dt);v44UpdatePedStates(dt);v44UpdateCrowdGestures();};
const v44BaseBuildAccident=buildAccident;
buildAccident=function(){v44BaseBuildAccident();v44SetupCrowd();};
