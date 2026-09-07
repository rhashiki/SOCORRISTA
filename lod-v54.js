/* Re.Force APH — Build 54 / v54
 * Distance-based visibility/LOD pass for mobile stability as world detail grows.
 */
let V54_ACC=0;
function v54Dist(obj){if(!obj||!camera)return 0;const p=new THREE.Vector3();obj.getWorldPosition(p);return p.distanceTo(camera.position);}
function v54SetVisible(obj,on){if(obj&&obj!==player?.root&&obj!==ambulance?.root&&obj!==patient?.anchor)obj.visible=on;}
function v54ApplyLOD(){
  if(!camera)return;
  const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced';
  const far=profile==='eco'?62:profile==='high'?105:82;
  const pedFar=profile==='eco'?38:profile==='high'?72:55;
  const trafficFar=profile==='eco'?58:profile==='high'?96:76;
  cityDecor.forEach(o=>v54SetVisible(o,v54Dist(o)<far));
  V51_ARCH?.forEach?.(o=>v54SetVisible(o,v54Dist(o)<far+18));
  pedestrians.forEach(p=>v54SetVisible(p.root,v54Dist(p.root)<pedFar));
  traffic.forEach(t=>v54SetVisible(t.root,v54Dist(t.root)<trafficFar));
  parkedCars.forEach(c=>v54SetVisible(c,v54Dist(c)<far));
  curiosos.forEach(c=>v54SetVisible(c,v54Dist(c)<pedFar+18));
}
const v54BaseUpdate=update;
update=function(dt){v54BaseUpdate(dt);V54_ACC+=dt;if(V54_ACC>.24){V54_ACC=0;v54ApplyLOD();}};
const v54BaseInit=init;
init=async function(){V54_ACC=0;await v54BaseInit();v54ApplyLOD();};
