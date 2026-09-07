/* Re.Force APH — Build 64 / v64
 * Street-life layer: small conversation groups and waiting pedestrians.
 */
let V64_NPCS=[];
function v64SpawnCivilian(x,z,rot,index,kind='idle'){
  const root=new THREE.Group(),visual=createFallbackHuman(V57_SHIRTS?.[(index+2)%V57_SHIRTS.length]||0x66717a,{role:'civilian'});root.add(visual);root.position.set(x,0,z);root.rotation.y=rot;root.userData.v64Kind=kind;scene.add(root);V64_NPCS.push({root,visual,kind,index,phase:Math.random()*6});
  if(typeof v57DressHuman==='function')v57DressHuman(visual,200+index,{crowd:false});if(typeof v63AddFace==='function')v63AddFace(visual,200+index);if(typeof v58AttachShadow==='function')v58AttachShadow(root,.62,.48,.22);return root;
}
function v64BuildStreetLife(){
  V64_NPCS=[];
  // Conversation pairs, bus-stop waiters and storefront observers.
  v64SpawnCivilian(-18,8,.7,0,'talk');v64SpawnCivilian(-17.2,8.7,-2.2,1,'talk');
  v64SpawnCivilian(16,-8,-.4,2,'wait');v64SpawnCivilian(17,-8.6,2.6,3,'wait');
  v64SpawnCivilian(-58,25,1.7,4,'wait');v64SpawnCivilian(58,-25,-1.5,5,'wait');
  v64SpawnCivilian(-26,-20,0,6,'window');v64SpawnCivilian(26,20,Math.PI,7,'window');
}
function v64UpdateStreetLife(dt){
  const t=performance.now()*.001;
  V64_NPCS.forEach((n,i)=>{
    const rig=n.visual?.userData?.rig;if(!rig)return;v7AnimateHuman(n.visual,0,t,{idleLook:true});
    if(n.kind==='talk'){
      rig.head.rotation.y=Math.sin(t*.7+n.phase)*.14;rig.rightArm.rotation.z=.10+Math.sin(t*.85+n.phase)*.06;rig.rightForearm.rotation.x=-.22-Math.max(0,Math.sin(t*.9+n.phase))*.32;
    }else if(n.kind==='wait'){
      rig.head.rotation.y=Math.sin(t*.38+n.phase)*.28;rig.torso.rotation.y=Math.sin(t*.25+n.phase)*.025;
    }else if(n.kind==='window'){
      rig.head.rotation.y=Math.sin(t*.22+n.phase)*.08;rig.head.rotation.x=.06+Math.sin(t*.3+n.phase)*.03;
    }
    if(ambulance.siren&&ambulance.root&&dist2(n.root.position,ambulance.root.position)<9)n.root.lookAt(ambulance.root.position.x,0,ambulance.root.position.z);
  });
}
const v64BaseBuildActors=buildActors;
buildActors=function(){v64BaseBuildActors();v64BuildStreetLife();};
const v64BaseUpdate=update;
update=function(dt){v64BaseUpdate(dt);v64UpdateStreetLife(dt);};
