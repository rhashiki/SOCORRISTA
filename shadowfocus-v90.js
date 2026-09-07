/* Re.Force APH — Build 90 / v90
 * Local shadow focus for the expanded city: keeps useful shadow resolution near the active actor.
 */
let V90_SUN=null,V90_ACC=0,V90_TARGET=null;
function v90FindSun(){if(V90_SUN)return V90_SUN;scene?.traverse?.(o=>{if(!V90_SUN&&o.isDirectionalLight&&o.castShadow)V90_SUN=o;});return V90_SUN;}
function v90ApplyShadowBudget(force=false){
  const sun=v90FindSun();if(!sun||!renderer)return;const actor=controlled==='vehicle'?ambulance.root?.position:player.root?.position;if(!actor)return;
  const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced',range=profile==='eco'?42:profile==='high'?66:54,size=profile==='eco'?512:profile==='high'?2048:1024;
  if(force||sun.shadow.mapSize.x!==size){sun.shadow.mapSize.set(size,size);sun.shadow.map?.dispose?.();sun.shadow.map=null;}
  if(!V90_TARGET){V90_TARGET=new THREE.Object3D();scene.add(V90_TARGET);sun.target=V90_TARGET;}
  V90_TARGET.position.set(actor.x,0,actor.z);sun.position.set(actor.x-34,64,actor.z+30);
  const cam=sun.shadow.camera;cam.left=-range;cam.right=range;cam.top=range;cam.bottom=-range;cam.near=1;cam.far=150;cam.updateProjectionMatrix();sun.shadow.bias=-.00028;sun.shadow.normalBias=.032;sun.shadow.radius=profile==='eco'?1:2;
}
const v90BaseInit=init;
init=async function(){V90_SUN=null;V90_TARGET=null;await v90BaseInit();v90ApplyShadowBudget(true);};
const v90BaseUpdate=update;
update=function(dt){v90BaseUpdate(dt);V90_ACC+=dt;if(V90_ACC>.30){V90_ACC=0;v90ApplyShadowBudget(false);}};
