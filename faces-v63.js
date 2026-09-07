/* Re.Force APH — Build 63 / v63
 * Minimal PS2-style facial readability for procedural humans.
 */
function v63AddFace(visual,index=0){
  if(!visual||visual.userData?.v63Face)return;const rig=visual.userData?.rig;if(!rig?.head)return;visual.userData.v63Face=true;
  const headMesh=rig.head.children.find(x=>x.isMesh&&x.geometry?.type==='SphereGeometry'),skin=headMesh?.material?.color?.getHex?.()||0xa87558;
  const eyeMat=new THREE.MeshStandardMaterial({color:0x17191a,roughness:.72,metalness:.02}),skinMat=new THREE.MeshStandardMaterial({color:skin,roughness:.84,metalness:.01}),mouthMat=new THREE.MeshStandardMaterial({color:0x5c302b,roughness:.9});
  for(const x of [-.064,.064]){const e=new THREE.Mesh(new THREE.SphereGeometry(.018,7,5),eyeMat);e.position.set(x,.073,.151);e.scale.set(1,.82,.52);rig.head.add(e);}
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.022,.065,6),skinMat);nose.rotation.x=Math.PI/2;nose.position.set(0,.025,.172);rig.head.add(nose);
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(.072,.009,.009),mouthMat);mouth.position.set(0,-.032,.163);rig.head.add(mouth);
  if(index%4===0){const browMat=new THREE.MeshStandardMaterial({color:0x30261f,roughness:.95});for(const x of [-.064,.064]){const b=new THREE.Mesh(new THREE.BoxGeometry(.052,.009,.009),browMat);b.position.set(x,.103,.155);b.rotation.z=x<0?.07:-.07;rig.head.add(b);}}
}
function v63ApplyFaces(){
  v63AddFace(player?.visual,0);v63AddFace(patient?.visual,1);if(V28_PARTNER?.visual)v63AddFace(V28_PARTNER.visual,2);
  pedestrians.forEach((p,i)=>{if(V16_PROFILE!=='eco'||i%2===0)v63AddFace(p.root?.children?.[0],10+i);});
  curiosos.forEach((r,i)=>v63AddFace(r?.children?.[0],50+i));
}
const v63BaseBuildActors=buildActors;
buildActors=function(){v63BaseBuildActors();v63AddFace(player?.visual,0);pedestrians.forEach((p,i)=>{if(V16_PROFILE!=='eco'||i%2===0)v63AddFace(p.root?.children?.[0],10+i);});};
const v63BaseBuildAccident=buildAccident;
buildAccident=function(){v63BaseBuildAccident();v63AddFace(patient?.visual,1);curiosos.forEach((r,i)=>v63AddFace(r?.children?.[0],50+i));};
const v63BaseInit=init;
init=async function(){await v63BaseInit();v63ApplyFaces();};
