/* Re.Force APH — Build 53 / v53
 * Lightweight animation state machine layered over procedural rigs.
 */
const V53_STATE=new WeakMap();
function v53State(root,speed,running){
  if(!root)return 'idle';
  if(root===player?.visual&&['PATIENT','CLINICAL','TRANSPORT_RETURN'].includes(phase)&&patient?.anchor&&dist2(player.root.position,patient.anchor.position)<3.6)return 'clinical';
  if(speed>3.6||running)return 'run';
  if(speed>.18)return 'walk';
  return 'idle';
}
function v53Blend(root,state,dt=.016){
  const rig=root?.userData?.rig;if(!rig)return;
  const data=V53_STATE.get(root)||{state:'idle',blend:1,prev:'idle'};
  if(data.state!==state){data.prev=data.state;data.state=state;data.blend=0;}
  data.blend=Math.min(1,data.blend+dt*5.5);V53_STATE.set(root,data);
  const a=1-Math.exp(-dt*7);
  if(state==='idle'){
    rig.torso.rotation.z=THREE.MathUtils.lerp(rig.torso.rotation.z,0,a);
    rig.pelvis.rotation.y=THREE.MathUtils.lerp(rig.pelvis.rotation.y,0,a);
  }
  if(state==='walk'){
    rig.torso.rotation.x=THREE.MathUtils.lerp(rig.torso.rotation.x,.015,a);
    rig.head.rotation.x=THREE.MathUtils.lerp(rig.head.rotation.x,0,a);
  }
  if(state==='run'){
    rig.torso.rotation.x=THREE.MathUtils.lerp(rig.torso.rotation.x,.085,a);
    rig.head.rotation.x=THREE.MathUtils.lerp(rig.head.rotation.x,-.025,a);
  }
  root.userData.animState=state;root.userData.animBlend=data.blend;
}
const v53BaseAnimate=v7AnimateHuman;
v7AnimateHuman=function(root,speed,t,opts={}){
  const running=!!opts.running,state=v53State(root,speed,running);
  v53BaseAnimate(root,speed,t,opts);
  v53Blend(root,state,1/60);
};
function v53UpdateFacing(){
  if(!player?.visual?.userData?.rig)return;
  const state=player.visual.userData.animState;
  if(state==='idle'&&!uiBlock()&&controlled==='player'){
    const r=player.visual.userData.rig;r.head.rotation.y=THREE.MathUtils.lerp(r.head.rotation.y,Math.sin(performance.now()*.00065)*.13,.025);
  }
}
const v53BaseUpdate=update;
update=function(dt){v53BaseUpdate(dt);v53UpdateFacing();};
