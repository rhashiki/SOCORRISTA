/* Re.Force APH — Build 32 / v32
 * Non-graphic visual patient cues: breathing effort, posture, responsiveness and perfusion appearance.
 */

let V32_SKIN=[];
function v32CapturePatient(){
  V32_SKIN=[];const root=patient?.visual;if(!root)return;
  root.traverse(o=>{
    if(!o.isMesh||!o.material?.color)return;
    const c=o.material.color,h={h:0,s:0,l:0};c.getHSL(h);
    if((h.h<.12||h.h>.97)&&h.s>.18&&h.l>.22&&h.l<.78){
      const mat=o.material=o.material.clone();V32_SKIN.push({mat,base:mat.color.clone(),rough:mat.roughness});
    }
  });
  if(root.userData?.rig){
    root.userData.v32Base={
      headZ:root.userData.rig.head.rotation.z,
      headX:root.userData.rig.head.rotation.x,
      torsoY:root.userData.rig.torso.position.y
    };
  }
}

const v32BaseBuildAccident=buildAccident;
buildAccident=function(){v32BaseBuildAccident();v32CapturePatient();};

function v32UpdatePatientVisual(dt){
  if(!patient?.visual||!ACTIVE_CASE)return;
  const rig=patient.visual.userData?.rig;if(!rig)return;
  const t=performance.now()*.001,s=typeof V19_STATE==='object'?V19_STATE.stability:100,severity=THREE.MathUtils.clamp((100-s)/55,0,1);
  const unresolved=typeof v19PriorityResolved==='function'?!v19PriorityResolved():false;

  let breathAmp=.012,breathFreq=2.0;
  if(ACTIVE_CASE.focus==='B'&&unresolved){breathAmp=.055+.018*severity;breathFreq=4.0+.9*severity;}
  else if(ACTIVE_CASE.focus==='A'&&unresolved){breathAmp=.022;breathFreq=2.8;}
  const breathe=Math.sin(t*breathFreq)*breathAmp;
  rig.torso.position.y=breathe;
  rig.torso.rotation.x=THREE.MathUtils.lerp(rig.torso.rotation.x,ACTIVE_CASE.focus==='B'&&unresolved?-.04:0,1-Math.exp(-dt*4));

  const neuro=ACTIVE_CASE.focus==='D'&&clinicalStage==='D';
  const responsiveness=neuro?.07:(unresolved?.035:.015);
  rig.head.rotation.z=THREE.MathUtils.lerp(rig.head.rotation.z,responsiveness+severity*.055+Math.sin(t*.75)*.012,1-Math.exp(-dt*3));
  rig.head.rotation.x=THREE.MathUtils.lerp(rig.head.rotation.x,neuro?.06:0,1-Math.exp(-dt*3));

  const pale=new THREE.Color(0xd2b4a3);
  for(const x of V32_SKIN){
    const amount=THREE.MathUtils.clamp((ACTIVE_CASE.focus==='X'||ACTIVE_CASE.focus==='C')?severity*.58:severity*.26,0,.65);
    x.mat.color.copy(x.base).lerp(pale,amount);
    if('roughness' in x.mat)x.mat.roughness=Math.max(.35,(x.rough??.8)-severity*.18);
  }

  if(rig.leftArm&&rig.rightArm){
    const tension=unresolved?(ACTIVE_CASE.focus==='B'?.09:.04):0;
    rig.leftArm.rotation.z=THREE.MathUtils.lerp(rig.leftArm.rotation.z,-tension,1-Math.exp(-dt*3));
    rig.rightArm.rotation.z=THREE.MathUtils.lerp(rig.rightArm.rotation.z,tension,1-Math.exp(-dt*3));
  }
}

const v32BaseUpdatePatient=updatePatient;
updatePatient=function(dt){v32BaseUpdatePatient(dt);v32UpdatePatientVisual(dt);};

const v32BaseInit=init;
init=async function(){V32_SKIN=[];await v32BaseInit();if(patient?.visual&&!V32_SKIN.length)v32CapturePatient();};
