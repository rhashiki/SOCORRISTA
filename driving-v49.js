/* Re.Force APH — Build 49 / v49
 * Game-only driving telemetry: smoothness, hard braking, collisions and route efficiency.
 */

let V49_DRIVE={distance:0,routeStart:0,hardBrake:0,collisions:0,lastSpeed:0,lastPos:null,score:100,started:false};
function v49BeginDrive(){if(V49_DRIVE.started||!ambulance?.root)return;V49_DRIVE.started=true;V49_DRIVE.routeStart=dist2(ambulance.root.position,ACCIDENT_POS);V49_DRIVE.lastPos=ambulance.root.position.clone();}
function v49UpdateDrive(dt){
  if(controlled!=='vehicle'||!ambulance?.root)return;if(!V49_DRIVE.started)v49BeginDrive();
  if(V49_DRIVE.lastPos){const step=ambulance.root.position.distanceTo(V49_DRIVE.lastPos);if(step<3)V49_DRIVE.distance+=step;V49_DRIVE.lastPos.copy(ambulance.root.position);}
  const s=Math.abs(ambulance.speed||0),drop=V49_DRIVE.lastSpeed-s;if(drop>4.2&&V49_DRIVE.lastSpeed>6){V49_DRIVE.hardBrake++;V49_DRIVE.score=Math.max(55,V49_DRIVE.score-2);}V49_DRIVE.lastSpeed=s;
}
const v49BasePenalize=penalize;
penalize=function(points,reason){
  if(/colisão|veículo estacionado/i.test(String(reason))){V49_DRIVE.collisions++;V49_DRIVE.score=Math.max(35,V49_DRIVE.score-7);}
  return v49BasePenalize(points,reason);
};
const v49BaseUpdate=update;
update=function(dt){v49BaseUpdate(dt);v49UpdateDrive(dt);};
const v49BaseInit=init;
init=async function(){V49_DRIVE={distance:0,routeStart:0,hardBrake:0,collisions:0,lastSpeed:0,lastPos:null,score:100,started:false};await v49BaseInit();};
const v49BaseShow=showDebrief;
showDebrief=function(elapsed){
  v49BaseShow(elapsed);
  const direct=Math.max(1,V49_DRIVE.routeStart||1),eff=Math.round(Math.min(100,direct/Math.max(direct,V49_DRIVE.distance)*100)),drive=Math.max(0,Math.round(V49_DRIVE.score*.75+eff*.25));
  const metrics=document.querySelector('#summaryMetrics');if(metrics){const d=document.createElement('div');d.innerHTML=`<b>${drive}%</b><span>CONDUÇÃO</span>`;metrics.appendChild(d);}
  const learn=document.querySelector('#learning');if(learn){const p=document.createElement('p');p.textContent=`Telemetria do jogo: ${V49_DRIVE.collisions} colisões registradas, ${V49_DRIVE.hardBrake} frenagens bruscas e ${eff}% de eficiência de rota.`;learn.appendChild(p);}
};
