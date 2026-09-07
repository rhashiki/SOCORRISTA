/* Re.Force APH — Build 59 / v59
 * Camera polish: contextual look-ahead, speed-aware framing and softer return after manual input.
 */
let V59_LOOK=new THREE.Vector3();
function v59CameraForward(){
  if(controlled==='vehicle'){
    const sign=(ambulance.speed||0)<-.15?-1:1;return new THREE.Vector3(Math.sin(ambulance.heading)*sign,0,-Math.cos(ambulance.heading)*sign);
  }
  if(player?.root)return new THREE.Vector3(Math.sin(player.root.rotation.y),0,Math.cos(player.root.rotation.y));
  return new THREE.Vector3(0,0,-1);
}
function v59UpdateCameraPolish(dt){
  if(!camera||!smoothCamTarget)return;
  const manual=Math.max(0,1-(performance.now()-lastCameraDrag)/1300),speed=controlled==='vehicle'?Math.abs(ambulance.speed||0):Math.abs(player.speed||0);
  const maxLead=controlled==='vehicle'?Math.min(3.2,.55+speed*.14):Math.min(1.25,speed*.18);
  const lead=maxLead*(1-manual*.88),desired=smoothCamTarget.clone().addScaledVector(v59CameraForward(),lead);
  V59_LOOK.lerp(desired,1-Math.exp(-dt*(controlled==='vehicle'?4.2:6.8)));
  if(!Number.isFinite(V59_LOOK.x))V59_LOOK.copy(smoothCamTarget);
  camera.lookAt(V59_LOOK);
  if(controlled==='vehicle'){
    const lift=Math.min(.32,speed*.012)*(1-manual*.5);camera.position.y+=lift;
  }
}
const v59BaseUpdateCamera=updateCamera;
updateCamera=function(dt){v59BaseUpdateCamera(dt);v59UpdateCameraPolish(dt);};
const v59BaseInit=init;
init=async function(){V59_LOOK.set(0,0,0);await v59BaseInit();if(smoothCamTarget)V59_LOOK.copy(smoothCamTarget);};
