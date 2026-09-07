/* Re.Force APH — Build 23 / v27
 * Ambulance handling polish: dedicated brake, body roll and wheel motion.
 */

let V27_BRAKE=false;
function v27SetupBrake(){
  const hud=document.querySelector('#vehicleHud');if(!hud||document.querySelector('#brakeBtn'))return;
  const b=document.createElement('button');b.id='brakeBtn';b.textContent='FREIO';hud.appendChild(b);
  b.addEventListener('pointerdown',e=>{e.preventDefault();V27_BRAKE=true;b.classList.add('on');});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>{V27_BRAKE=false;b.classList.remove('on');}));
}
function v27AnimateAmbulance(dt){
  if(!ambulance?.visual)return;const inp=inputAxes(),speed=ambulance.speed||0,steer=inp.x||0;
  const targetRoll=-steer*Math.min(.06,Math.abs(speed)*.004),targetPitch=clamp(-inp.y*.025,-.025,.025);
  ambulance.visual.rotation.z=THREE.MathUtils.lerp(ambulance.visual.rotation.z,targetRoll,1-Math.exp(-dt*5));
  ambulance.visual.rotation.x=THREE.MathUtils.lerp(ambulance.visual.rotation.x,targetPitch,1-Math.exp(-dt*4));
  ambulance.visual.traverse(o=>{if(o.isMesh&&o.geometry?.type==='CylinderGeometry'){const p=o.geometry.parameters||{};if((p.radiusTop||0)>.25&&(p.radiusTop||0)<.4)o.rotation.z-=speed*dt*.7;}});
}
const v27BaseVehicle=updateVehicle;
updateVehicle=function(dt){
  v27BaseVehicle(dt);
  if(V27_BRAKE){ambulance.speed*=Math.pow(.88,dt*60);if(Math.abs(ambulance.speed)<.08)ambulance.speed=0;}
  v27AnimateAmbulance(dt);
};
const v27BaseInit=init;
init=async function(){await v27BaseInit();v27SetupBrake();};
