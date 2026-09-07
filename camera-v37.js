/* Re.Force APH — Build 37 / v37
 * Third-person camera collision and short arrival framing.
 */

let V37_PREV_PHASE=null,V37_ARRIVAL=0;
function v37PointHitsBuilding(p){
  if(p.y>24)return false;
  return buildings.some(b=>Math.abs(p.x-b.x)<b.w/2+.35&&Math.abs(p.z-b.z)<b.d/2+.35&&p.y<23);
}
function v37ResolveCamera(){
  if(!camera||!smoothCamTarget)return;
  const target=smoothCamTarget.clone(),desired=camera.position.clone(),delta=desired.clone().sub(target),dist=delta.length();if(dist<.2)return;
  let hitT=1;for(let i=2;i<=22;i++){const t=i/22,p=target.clone().addScaledVector(delta,t);if(v37PointHitsBuilding(p)){hitT=(i-1)/22;break;}}
  if(hitT<1){const safe=Math.max(.12,hitT-.045);camera.position.copy(target).addScaledVector(delta,safe);camera.position.y=Math.max(.72,camera.position.y);camera.lookAt(target);}
}
function v37WatchArrival(dt){
  if(phase!==V37_PREV_PHASE){
    if(phase==='AT_SCENE_VEHICLE'&&V37_PREV_PHASE==='EN_ROUTE'){
      V37_ARRIVAL=2.4;cameraYaw=-ambulance.heading+.52;cameraPitch=.29;cameraDistance=9.6;lastCameraDrag=performance.now()-600;
      flash('Ocorrência à vista.',1600);
    }
    V37_PREV_PHASE=phase;
  }
  if(V37_ARRIVAL>0){V37_ARRIVAL=Math.max(0,V37_ARRIVAL-dt);if(V37_ARRIVAL===0)lastCameraDrag=0;}
}
const v37BaseUpdateCamera=updateCamera;
updateCamera=function(dt){v37BaseUpdateCamera(dt);v37ResolveCamera();};
const v37BaseUpdate=update;
update=function(dt){v37WatchArrival(dt);v37BaseUpdate(dt);};
const v37BaseInit=init;
init=async function(){V37_PREV_PHASE=null;V37_ARRIVAL=0;await v37BaseInit();V37_PREV_PHASE=phase;};
