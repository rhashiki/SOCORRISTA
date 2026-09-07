/* Re.Force APH — Build 60 / v60
 * Low-cost distant skyline outside the playable area to increase perceived city scale.
 */
let V60_SKYLINE=null;
function v60BuildSkyline(){
  if(!scene||V60_SKYLINE)return;
  V60_SKYLINE=new THREE.Group();V60_SKYLINE.name='v60-skyline';scene.add(V60_SKYLINE);
  const skirt=new THREE.Mesh(new THREE.PlaneGeometry(270,270),new THREE.MeshStandardMaterial({color:0x4e6c4e,roughness:1,metalness:0}));skirt.rotation.x=-Math.PI/2;skirt.position.y=-.075;skirt.receiveShadow=false;V60_SKYLINE.add(skirt);
  const geo=new THREE.BoxGeometry(1,1,1),mat=new THREE.MeshStandardMaterial({color:0x657079,roughness:.95,metalness:.01,emissive:0x11161a,emissiveIntensity:.18});
  const count=72,inst=new THREE.InstancedMesh(geo,mat,count);inst.castShadow=false;inst.receiveShadow=false;const m=new THREE.Matrix4();
  for(let i=0;i<count;i++){
    const side=i%4,slot=Math.floor(i/4),along=-105+slot*12+(i%3)*1.7;let x=0,z=0;
    if(side===0){x=along;z=-92-(i%4)*2;}else if(side===1){x=along;z=92+(i%4)*2;}else if(side===2){x=-92-(i%4)*2;z=along;}else{x=92+(i%4)*2;z=along;}
    const w=6+(i*7%9),d=6+(i*11%8),h=9+(i*13%28);m.compose(new THREE.Vector3(x,h/2,z),new THREE.Quaternion(),new THREE.Vector3(w,h,d));inst.setMatrixAt(i,m);
  }
  inst.instanceMatrix.needsUpdate=true;V60_SKYLINE.add(inst);
  const roofGeo=new THREE.BoxGeometry(1,1,1),roofMat=new THREE.MeshStandardMaterial({color:0x444b50,roughness:.92});const roofs=new THREE.InstancedMesh(roofGeo,roofMat,24);
  for(let i=0;i<24;i++){
    const a=(i/24)*Math.PI*2,r=96+(i%4)*3,x=Math.cos(a)*r,z=Math.sin(a)*r,h=18+(i*9%20);m.compose(new THREE.Vector3(x,h,z),new THREE.Quaternion(),new THREE.Vector3(3+(i%3),1.2,3+(i%4)));roofs.setMatrixAt(i,m);
  }
  roofs.instanceMatrix.needsUpdate=true;roofs.castShadow=false;V60_SKYLINE.add(roofs);
}
const v60BaseBuildCity=buildCity;
buildCity=function(){v60BaseBuildCity();v60BuildSkyline();};
const v60BaseInit=init;
init=async function(){V60_SKYLINE=null;await v60BaseInit();};
