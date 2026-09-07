/* Re.Force APH — Build 78 / v78
 * Proximity-based detail streaming for the expanded districts.
 */
let V78_CLUSTERS=[],V78_ACC=0;
function v78PropCluster(x,z,seed=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.userData.v78Detail=true;scene.add(g);V78_CLUSTERS.push(g);
  const metal=material(0x4b5256,.65,.16),wood=material(0x715a45,.9,.02),green=material(0x48684b,.93,.01);
  // Bench
  box([2.0,.18,.58],0x715a45,[0,.52,0],undefined,g).material=wood;for(const sx of [-.75,.75])box([.14,.5,.14],0x4b5256,[sx,.25,0],undefined,g).material=metal;
  // Bin
  const bin=new THREE.Mesh(new THREE.CylinderGeometry(.28,.32,.78,10),metal);bin.position.set(1.45,.39,.15);g.add(bin);
  // Small planter/tree mass, deliberately simple for mobile.
  box([.9,.34,.9],0x7a7265,[-1.45,.17,.1],undefined,g);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.07,.10,1.45,7),wood);trunk.position.set(-1.45,.95,.1);g.add(trunk);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(.68,8,6),green);crown.position.set(-1.45,1.9,.1);crown.scale.set(1,.82,1);g.add(crown);
  if(seed%2===0){const bollard=material(0x31373b,.6,.2);for(const bz of [-1.25,1.25]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.72,8),bollard);b.position.set(.2,.36,bz);g.add(b);}}
  return g;
}
function v78BuildClusters(){
  V78_CLUSTERS=[];
  const pts=[[-92,-66],[-70,-66],[-42,-66],[-12,-66],[18,-66],[48,-66],[76,-66],[94,-66],[-92,66],[-62,66],[-32,66],[2,66],[32,66],[62,66],[92,66],[-82,-45],[-82,-15],[-82,16],[-82,45],[82,-44],[82,-14],[82,18],[82,46]];
  pts.forEach((p,i)=>v78PropCluster(p[0],p[1],i));
}
function v78ApplyStreaming(){
  if(!camera)return;const actor=controlled==='vehicle'?ambulance.root?.position:player.root?.position;if(!actor)return;
  const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced',far=profile==='eco'?38:profile==='high'?72:55;
  V78_CLUSTERS.forEach(g=>g.visible=dist2(g.position,actor)<far);
  // Landmarks remain visible farther than ordinary props but can be culled on eco.
  V77_LANDMARKS?.forEach?.(g=>{const d=dist2(g.position,actor);g.visible=d<(profile==='eco'?120:180);});
}
const v78BaseBuildCity=buildCity;
buildCity=function(){v78BaseBuildCity();v78BuildClusters();v78ApplyStreaming();};
const v78BaseUpdate=update;
update=function(dt){v78BaseUpdate(dt);V78_ACC+=dt;if(V78_ACC>.32){V78_ACC=0;v78ApplyStreaming();}};
