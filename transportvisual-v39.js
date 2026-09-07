/* Re.Force APH — Build 39 / v39
 * Non-graphic stretcher/loading visual transition for the exercise transport loop.
 */

let V39={stretcher:null,doors:[],active:false,t:0,start:null,end:null,loaded:false,lastPhase:null};
function v39CreateStretcher(){
  if(V39.stretcher||!scene)return;
  const g=new THREE.Group(),metal=material(0x7b858b,.48,.35),pad=material(0x27343e,.82,.04),blanket=material(0x6f7d82,.88,.02),rubber=material(0x111315,.74,.08);
  box([.78,.12,2.05],0x27343e,[0,.72,0],undefined,g).material=pad;
  box([.68,.16,1.72],0x6f7d82,[0,.86,.04],undefined,g).material=blanket;
  for(const x of [-.34,.34])for(const z of [-.78,.78]){cyl(.025,.68,0x7b858b,[x,.38,z],[0,0,.18*x],g).material=metal;const w=cyl(.09,.045,0x111315,[x,.08,z],[Math.PI/2,0,0],g);w.material=rubber;}
  box([.88,.035,2.12],0x7b858b,[0,.64,0],undefined,g).material=metal;
  g.visible=false;scene.add(g);V39.stretcher=g;
}
function v39CreateDoors(){
  if(V39.doors.length||!ambulance?.root)return;
  const mat=material(0xe8ebea,.62,.08);
  const left=box([.92,1.34,.06],0xe8ebea,[-.50,1.22,2.79],undefined,ambulance.root),right=box([.92,1.34,.06],0xe8ebea,[.50,1.22,2.79],undefined,ambulance.root);left.material=mat.clone();right.material=mat.clone();
  V39.doors=[left,right];
}
function v39RearWorld(){ambulance.root.updateMatrixWorld(true);return ambulance.root.localToWorld(new THREE.Vector3(0,0,3.65));}
function v39StartLoad(){
  if(!V39.stretcher||!patient?.anchor||V39.loaded)return;V39.active=true;V39.t=0;V39.start=patient.anchor.position.clone();V39.end=v39RearWorld();V39.stretcher.position.copy(V39.start);V39.stretcher.rotation.y=ambulance.heading;V39.stretcher.visible=true;
}
function v39Animate(dt){
  const transportReturn=phase==='TRANSPORT_RETURN';
  if(V39.doors.length){const target=transportReturn?.72:0;V39.doors[0].rotation.y=THREE.MathUtils.lerp(V39.doors[0].rotation.y,-target,1-Math.exp(-dt*5));V39.doors[1].rotation.y=THREE.MathUtils.lerp(V39.doors[1].rotation.y,target,1-Math.exp(-dt*5));}
  if(!V39.active||!V39.stretcher)return;
  V39.t=Math.min(1,V39.t+dt/3.2);V39.end=v39RearWorld();const u=V39.t*V39.t*(3-2*V39.t);V39.stretcher.position.lerpVectors(V39.start,V39.end,u);V39.stretcher.position.y=Math.sin(u*Math.PI)*.04;V39.stretcher.rotation.y=lerpAngle(V39.stretcher.rotation.y,ambulance.heading,1-Math.exp(-dt*4));
  if(V39.t>=1){V39.active=false;V39.loaded=true;V39.stretcher.visible=false;logEvent('Maca carregada visualmente na ambulância do exercício.');}
}
function v39Watch(){
  if(phase===V39.lastPhase)return;
  if(phase==='TRANSPORT_RETURN')v39StartLoad();
  if(phase==='TRANSPORT_HOSPITAL'&&V39.stretcher)V39.stretcher.visible=false;
  V39.lastPhase=phase;
}
const v39BaseUpdate=update;
update=function(dt){v39BaseUpdate(dt);v39Watch();v39Animate(dt);};
const v39BaseInit=init;
init=async function(){V39={stretcher:null,doors:[],active:false,t:0,start:null,end:null,loaded:false,lastPhase:null};await v39BaseInit();v39CreateStretcher();v39CreateDoors();V39.lastPhase=phase;};
