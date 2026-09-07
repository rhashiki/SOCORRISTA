/* Re.Force APH — Build 13 / v17
 * GTA-like navigation guidance: minimap route, destination marker and bearing cue.
 */

let V17_MARKER=null,V17_ARROW=null;
function v17RoutePoints(from,to){
  const pts=[from.clone()];
  const horizontalFirst=Math.abs(from.x-to.x)>Math.abs(from.z-to.z);
  if(horizontalFirst)pts.push(new THREE.Vector3(to.x,0,from.z));
  else pts.push(new THREE.Vector3(from.x,0,to.z));
  pts.push(to.clone());return pts;
}
function v17SetupWorldMarker(){
  if(V17_MARKER||!scene)return;
  const g=new THREE.Group();
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,.12,8,36),new THREE.MeshBasicMaterial({color:0xd64b3f,transparent:true,opacity:.76}));ring.rotation.x=Math.PI/2;ring.position.y=.08;g.add(ring);
  const column=new THREE.Mesh(new THREE.CylinderGeometry(.08,.9,8,1,true),new THREE.MeshBasicMaterial({color:0xd64b3f,transparent:true,opacity:.14,side:THREE.DoubleSide}));column.position.y=2.5;column.scale.set(3.5,5,3.5);g.add(column);
  g.position.copy(ACCIDENT_POS);scene.add(g);V17_MARKER=g;
  const game=document.querySelector('#game');V17_ARROW=document.createElement('div');V17_ARROW.className='gps-bearing';V17_ARROW.innerHTML='<span>▲</span><b>OCORRÊNCIA</b>';V17_ARROW.hidden=true;game?.appendChild(V17_ARROW);
}
function v17UpdateNavigation(){
  if(V17_MARKER){V17_MARKER.position.x=ACCIDENT_POS.x;V17_MARKER.position.z=ACCIDENT_POS.z;const t=performance.now()*.001,s=1+Math.sin(t*2.2)*.08;V17_MARKER.scale.set(s,1,s);V17_MARKER.visible=['TO_AMBULANCE','EN_ROUTE','AT_SCENE_VEHICLE'].includes(phase);}
  if(!V17_ARROW)return;
  const active=['EN_ROUTE','AT_SCENE_VEHICLE'].includes(phase)&&controlled==='vehicle';V17_ARROW.hidden=!active;if(!active)return;
  const dx=ACCIDENT_POS.x-ambulance.root.position.x,dz=ACCIDENT_POS.z-ambulance.root.position.z,bearing=Math.atan2(dx,-dz),delta=((bearing-ambulance.heading+Math.PI)%(Math.PI*2))-Math.PI;
  V17_ARROW.querySelector('span').style.transform=`rotate(${delta}rad)`;V17_ARROW.querySelector('b').textContent=`${Math.round(Math.hypot(dx,dz))} m`;
}

const v17BaseDrawMinimap=drawMinimap;
drawMinimap=function(){
  v17BaseDrawMinimap();
  if(!['TO_AMBULANCE','EN_ROUTE','AT_SCENE_VEHICLE'].includes(phase))return;
  const actor=controlled==='vehicle'?ambulance.root?.position:player.root?.position;if(!actor)return;
  const w=mini.width,h=mini.height,scale=w/WORLD,tx=x=>(x+WORLD/2)*scale,tz=z=>(z+WORLD/2)*scale,route=v17RoutePoints(actor,ACCIDENT_POS);
  mctx.save();mctx.beginPath();mctx.arc(w/2,h/2,w/2-4,0,Math.PI*2);mctx.clip();mctx.strokeStyle='#d8b369';mctx.lineWidth=3;mctx.setLineDash([6,4]);mctx.beginPath();route.forEach((p,i)=>i?mctx.lineTo(tx(p.x),tz(p.z)):mctx.moveTo(tx(p.x),tz(p.z)));mctx.stroke();mctx.restore();
};

const v17BaseUpdate=update;
update=function(dt){v17BaseUpdate(dt);v17UpdateNavigation();};
const v17BaseInit=init;
init=async function(){await v17BaseInit();v17SetupWorldMarker();};
