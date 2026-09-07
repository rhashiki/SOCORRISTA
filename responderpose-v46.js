/* Re.Force APH — Build 46 / v46
 * Contextual responder poses near the patient. Visual only; no procedural technique animation.
 */

function v46ClinicalPose(visual,amount=1,side=1){
  const r=visual?.userData?.rig;if(!r)return;
  const a=THREE.MathUtils.clamp(amount,0,1);
  r.torso.rotation.x=THREE.MathUtils.lerp(r.torso.rotation.x,.12,a*.18);
  r.torso.position.y=THREE.MathUtils.lerp(r.torso.position.y,-.18,a*.20);
  r.leftLeg.rotation.x=THREE.MathUtils.lerp(r.leftLeg.rotation.x,-.55,a*.2);r.rightLeg.rotation.x=THREE.MathUtils.lerp(r.rightLeg.rotation.x,-.18,a*.2);
  r.leftKnee.rotation.x=THREE.MathUtils.lerp(r.leftKnee.rotation.x,.88,a*.22);r.rightKnee.rotation.x=THREE.MathUtils.lerp(r.rightKnee.rotation.x,.45,a*.22);
  r.leftArm.rotation.x=THREE.MathUtils.lerp(r.leftArm.rotation.x,-.35,a*.2);r.rightArm.rotation.x=THREE.MathUtils.lerp(r.rightArm.rotation.x,-.28,a*.2);
  r.leftArm.rotation.z=THREE.MathUtils.lerp(r.leftArm.rotation.z,-.12*side,a*.18);r.rightArm.rotation.z=THREE.MathUtils.lerp(r.rightArm.rotation.z,.12*side,a*.18);
  r.head.rotation.x=THREE.MathUtils.lerp(r.head.rotation.x,.18,a*.18);
}
function v46UpdatePoses(){
  if(!player?.visual)return;const close=patient?.anchor&&dist2(player.root.position,patient.anchor.position)<3.4,engaged=close&&['PATIENT','CLINICAL','TRANSPORT_RETURN'].includes(phase)&&(!interactionPanel.hidden||bodyZoneMode||clinicalStage==='SECONDARY');
  if(engaged)v46ClinicalPose(player.visual,1,1);
  const p=V28_PARTNER?.visual,proot=V28_PARTNER?.root;if(p&&proot&&patient?.anchor&&['PATIENT','CLINICAL','TRANSPORT_RETURN'].includes(phase)&&dist2(proot.position,patient.anchor.position)<4)v46ClinicalPose(p,.92,-1);
}
const v46BaseUpdate=update;
update=function(dt){v46BaseUpdate(dt);v46UpdatePoses();};
