/* Re.Force APH — Build 67 / v67
 * Player collision polish: slide along obstacles instead of sticking on contact.
 */
function v67ResolvePlayerMove(old,next){
  if(!v7WorldBlocked(next,{includeAmbulance:phase!=='TO_AMBULANCE'}))return next;
  const xOnly=old.clone();xOnly.x=next.x;if(!v7WorldBlocked(xOnly,{includeAmbulance:phase!=='TO_AMBULANCE'}))return xOnly;
  const zOnly=old.clone();zOnly.z=next.z;if(!v7WorldBlocked(zOnly,{includeAmbulance:phase!=='TO_AMBULANCE'}))return zOnly;
  return old;
}
updatePlayer=function(dt){
  const inp=inputAxes(),mag=clamp(Math.hypot(inp.x,inp.y),0,1),running=runHeld||keys.ShiftLeft||keys.ShiftRight,speed=(running?6.15:3.35)*mag;player.speed=speed;
  if(mag>.05){
    const f=new THREE.Vector3(-Math.sin(cameraYaw),0,-Math.cos(cameraYaw)),r=new THREE.Vector3(Math.cos(cameraYaw),0,-Math.sin(cameraYaw)),v=f.multiplyScalar(-inp.y).add(r.multiplyScalar(inp.x)).normalize();
    const old=player.root.position.clone(),next=old.clone().addScaledVector(v,speed*dt);next.x=clamp(next.x,-WORLD/2+2,WORLD/2-2);next.z=clamp(next.z,-WORLD/2+2,WORLD/2-2);player.root.position.copy(v67ResolvePlayerMove(old,next));
    player.root.rotation.y=lerpAngle(player.root.rotation.y,Math.atan2(v.x,v.z),1-Math.exp(-dt*13));
    if(performance.now()-lastCameraDrag>1100&&V25_SETTINGS?.autoFollow!==false)cameraYaw=lerpAngle(cameraYaw,player.root.rotation.y-Math.PI,1-Math.exp(-dt*1.75));
  }
  v7AnimateHuman(player.visual,speed,performance.now()*.001,{running,idleLook:true});
};
