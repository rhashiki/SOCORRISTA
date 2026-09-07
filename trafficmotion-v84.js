/* Re.Force APH — Build 84 / v84
 * Traffic motion feedback: wheel spin, brake lamps and indicators near route turns.
 */
const V84_DONE=new WeakSet();
function v84Lamp(root,pos,color){const m=box([.07,.12,.20],color,pos,undefined,root);m.material.emissive=new THREE.Color(color);m.material.emissiveIntensity=.08;m.userData.v84Lamp=true;return m;}
function v84PrepareCar(t){
  const root=t?.root;if(!root||V84_DONE.has(root))return;V84_DONE.add(root);
  const lamps={rearL:v84Lamp(root,[-1.79,.62,-.53],0x9f201b),rearR:v84Lamp(root,[-1.79,.62,.53],0x9f201b),indFL:v84Lamp(root,[1.80,.60,-.61],0xd9902e),indFR:v84Lamp(root,[1.80,.60,.61],0xd9902e),indRL:v84Lamp(root,[-1.80,.60,-.61],0xd9902e),indRR:v84Lamp(root,[-1.80,.60,.61],0xd9902e)};
  root.userData.v84={lamps,lastSpeed:t.speed||0};
}
function v84TurnIntent(t){
  const p=t.path;if(!p?.length)return 0;const i=t.seg%p.length,a=p[i],b=p[(i+1)%p.length],c=p[(i+2)%p.length];if(!a||!b||!c)return 0;
  const d1=new THREE.Vector2(b[0]-a[0],b[1]-a[1]).normalize(),d2=new THREE.Vector2(c[0]-b[0],c[1]-b[1]).normalize();
  const cross=d1.x*d2.y-d1.y*d2.x,dist=Math.hypot(t.root.position.x-b[0],t.root.position.z-b[1]);
  if(dist>9||Math.abs(cross)<.2)return 0;return cross>0?1:-1;
}
function v84SpinWheels(root,speed,dt){
  root.traverse(o=>{if(!o.isMesh||o.userData.v84Lamp||o.geometry?.type!=='CylinderGeometry')return;const p=o.geometry.parameters||{},r=p.radiusTop||0;if(r>.24&&r<.42)o.rotation.z-=speed*dt*.9;});
}
function v84UpdateCar(t,dt,time){
  v84PrepareCar(t);const root=t.root,data=root.userData.v84;if(!data)return;
  const speed=t.speed||0,braking=data.lastSpeed-speed>.08||speed<.25,dataL=data.lamps;data.lastSpeed=speed;
  const brakeI=braking?1.25:.18;dataL.rearL.material.emissiveIntensity=brakeI;dataL.rearR.material.emissiveIntensity=brakeI;
  const turn=v84TurnIntent(t),blink=Math.sin(time*8)>0?1.35:.05;
  dataL.indFL.material.emissiveIntensity=turn<0?blink:.05;dataL.indRL.material.emissiveIntensity=turn<0?blink:.05;
  dataL.indFR.material.emissiveIntensity=turn>0?blink:.05;dataL.indRR.material.emissiveIntensity=turn>0?blink:.05;
  v84SpinWheels(root,speed,dt);
}
function v84ApplyTrafficMotion(dt){const time=performance.now()*.001;traffic.forEach(t=>v84UpdateCar(t,dt,time));}
const v84BaseBuildTraffic=buildTraffic;
buildTraffic=function(){v84BaseBuildTraffic();traffic.forEach(v84PrepareCar);};
const v84BaseUpdateTraffic=updateTraffic;
updateTraffic=function(dt){v84BaseUpdateTraffic(dt);v84ApplyTrafficMotion(dt);};
