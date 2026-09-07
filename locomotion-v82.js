/* Re.Force APH — Build 82 / v82
 * Locomotion polish: acceleration lean, turn-in-place, stride damping and upper-body counter motion.
 */
const V82_MOTION=new WeakMap();
function v82Motion(root,speed,t,opts={}){
  const rig=root?.userData?.rig;if(!rig)return;
  const prev=V82_MOTION.get(root)||{speed:0,turn:0,lastYaw:0};
  const dt=1/60,accel=THREE.MathUtils.clamp((speed-prev.speed)/dt,-7,7),a=1-Math.exp(-dt*8);
  let actorYaw=0;
  if(root===player?.visual)actorYaw=player.root?.rotation?.y||0;
  else if(root===V28_PARTNER?.visual)actorYaw=V28_PARTNER.root?.rotation?.y||0;
  const dy=((actorYaw-prev.lastYaw+Math.PI)%(Math.PI*2))-Math.PI;
  prev.turn=THREE.MathUtils.lerp(prev.turn,THREE.MathUtils.clamp(dy/dt,-2.2,2.2),.12);
  prev.lastYaw=actorYaw;prev.speed=THREE.MathUtils.lerp(prev.speed,speed,.22);V82_MOTION.set(root,prev);
  const state=root.userData.animState||'idle';
  const lean=state==='run'?.08:state==='walk'?.035:0;
  rig.torso.rotation.x=THREE.MathUtils.lerp(rig.torso.rotation.x,lean-accel*.004,a);
  rig.torso.rotation.y=THREE.MathUtils.lerp(rig.torso.rotation.y,-prev.turn*.035,a);
  rig.head.rotation.y+=prev.turn*.012;
  rig.pelvis.rotation.z=THREE.MathUtils.lerp(rig.pelvis.rotation.z,prev.turn*.018,a);
  if(state==='idle'&&Math.abs(prev.turn)>.18){
    const step=Math.sin(t*5.5)*Math.min(.16,Math.abs(prev.turn)*.07);
    rig.leftLeg.rotation.y=THREE.MathUtils.lerp(rig.leftLeg.rotation.y,step,a);
    rig.rightLeg.rotation.y=THREE.MathUtils.lerp(rig.rightLeg.rotation.y,-step,a);
  }else{
    rig.leftLeg.rotation.y*=.88;rig.rightLeg.rotation.y*=.88;
  }
  // Reduce skating by adding a subtle vertical settle only while actually moving.
  const motion=Math.min(1,Math.abs(speed)/3.6),settle=Math.abs(Math.sin(t*(opts.running?10.8:7.2)+(root.userData.phase||0)))*.018*motion;
  root.position.y=THREE.MathUtils.lerp(root.position.y||0,settle,.28);
}
const v82BaseAnimate=v7AnimateHuman;
v7AnimateHuman=function(root,speed,t,opts={}){v82BaseAnimate(root,speed,t,opts);v82Motion(root,speed,t,opts);};
function v82ResetWhenHidden(){if(controlled==='vehicle'&&player?.visual){player.visual.position.y=0;}}
const v82BaseUpdate=update;
update=function(dt){v82BaseUpdate(dt);v82ResetWhenHidden();};
