/* Re.Force APH — Build 86 / v86
 * Non-graphic patient facial readability: blink, eyelids and breathing-linked mouth posture.
 */
let V86_FACE=null;
function v86BuildPatientFace(){
  const head=patient?.visual?.userData?.rig?.head;if(!head||V86_FACE)return;
  const skin=head.children.find(o=>o.isMesh&&o.geometry?.type==='SphereGeometry')?.material?.color?.getHex?.()||0xb98262;
  const skinMat=new THREE.MeshStandardMaterial({color:skin,roughness:.86,metalness:.01}),mouthMat=new THREE.MeshStandardMaterial({color:0x5b302c,roughness:.9});
  const lids=[];for(const x of [-.064,.064]){const l=new THREE.Mesh(new THREE.BoxGeometry(.052,.022,.012),skinMat.clone());l.position.set(x,.073,.169);head.add(l);lids.push(l);}
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(.085,.014,.012),mouthMat);mouth.position.set(0,-.034,.177);head.add(mouth);
  V86_FACE={lids,mouth,head};
}
function v86UpdateExpression(dt){
  if(!V86_FACE||!ACTIVE_CASE)return;const t=performance.now()*.001,stability=typeof V19_STATE==='object'?(V19_STATE.stability??100):100,severity=THREE.MathUtils.clamp((100-stability)/55,0,1),focus=ACTIVE_CASE.focus;
  const blink=Math.sin(t*.82)>0.985?1:0,drowsy=focus==='D'?0.62:severity*.20,closed=Math.max(blink,drowsy),h=.022+closed*.038;
  V86_FACE.lids.forEach(l=>{l.scale.y=THREE.MathUtils.lerp(l.scale.y,1+closed*2.4,1-Math.exp(-dt*9));l.position.y=.073-closed*.004;});
  const breathOpen=focus==='B'&&typeof v19PriorityResolved==='function'&&!v19PriorityResolved();V86_FACE.mouth.scale.y=THREE.MathUtils.lerp(V86_FACE.mouth.scale.y,breathOpen?2.2:1,1-Math.exp(-dt*5));
  V86_FACE.mouth.rotation.z=THREE.MathUtils.lerp(V86_FACE.mouth.rotation.z,severity*.04,1-Math.exp(-dt*3));
  V86_FACE.head.rotation.y+=Math.sin(t*.48)*.0007*(1+severity);
}
const v86BaseBuildAccident=buildAccident;
buildAccident=function(){v86BaseBuildAccident();V86_FACE=null;v86BuildPatientFace();};
const v86BaseUpdatePatient=updatePatient;
updatePatient=function(dt){v86BaseUpdatePatient(dt);v86UpdateExpression(dt);};
const v86BaseInit=init;
init=async function(){V86_FACE=null;await v86BaseInit();v86BuildPatientFace();};
