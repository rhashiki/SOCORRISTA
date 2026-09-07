/* Re.Force APH — Build 57 / v57
 * Civilian visual variety: clothing palettes, accessories and subtle silhouette variation.
 */
const V57_SHIRTS=[0x526f80,0x80584c,0x5f7658,0x765670,0x8b7548,0x4f5c6f,0x786552,0x3f6f69];
const V57_ACCENTS=[0x252a2d,0x45362f,0x35424b,0x62503b,0x483b50];
function v57AccessoryMat(color){return new THREE.MeshStandardMaterial({color,roughness:.88,metalness:.02});}
function v57DressHuman(visual,index=0,{crowd=false}={}){
  if(!visual||visual.userData?.v57Styled||visual.userData?.role==='responder')return;
  visual.userData.v57Styled=true;const rig=visual.userData.rig;if(!rig)return;
  const shirt=V57_SHIRTS[index%V57_SHIRTS.length],accent=V57_ACCENTS[(index*3)%V57_ACCENTS.length];
  const torsoMesh=rig.torso.children.find(x=>x.isMesh);if(torsoMesh?.material){torsoMesh.material=torsoMesh.material.clone();torsoMesh.material.color.setHex(shirt);}
  [rig.leftArm,rig.rightArm].forEach(a=>{const m=a.children.find(x=>x.isMesh);if(m?.material){m.material=m.material.clone();m.material.color.setHex(shirt);}});
  const scaleY=.95+(index%6)*.018;visual.scale.set(.97+(index%3)*.018,scaleY,.97+(index%4)*.012);
  if(index%3===0){
    const bag=new THREE.Group();bag.position.set(0,1.13,.20);visual.add(bag);
    const b=new THREE.Mesh(new THREE.BoxGeometry(.28,.34,.12),v57AccessoryMat(accent));b.position.set(0,0,.08);b.castShadow=true;bag.add(b);
    for(const x of [-.105,.105]){const strap=new THREE.Mesh(new THREE.BoxGeometry(.025,.38,.025),v57AccessoryMat(0x25282a));strap.position.set(x,.05,-.02);bag.add(strap);}
  }
  if(index%4===1){
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.18,.19,.08,12),v57AccessoryMat(accent));cap.position.set(0,.185,0);cap.castShadow=true;rig.head.add(cap);
    const brim=new THREE.Mesh(new THREE.BoxGeometry(.24,.025,.12),v57AccessoryMat(accent));brim.position.set(0,.175,-.13);rig.head.add(brim);
  }
  if(index%5===2){
    const glass=v57AccessoryMat(0x171a1c);for(const x of [-.075,.075]){const lens=new THREE.Mesh(new THREE.BoxGeometry(.10,.045,.018),glass);lens.position.set(x,.055,-.155);rig.head.add(lens);}const bridge=new THREE.Mesh(new THREE.BoxGeometry(.055,.014,.014),glass);bridge.position.set(0,.055,-.157);rig.head.add(bridge);
  }
  if(crowd&&index%2===0){
    const phone=new THREE.Mesh(new THREE.BoxGeometry(.055,.105,.018),v57AccessoryMat(0x1b1e21));phone.position.set(.055,-.31,-.03);rig.rightForearm.add(phone);
  }
}
function v57ApplyPeople(){
  pedestrians.forEach((p,i)=>v57DressHuman(p.root?.children?.[0],i));
  curiosos.forEach((r,i)=>v57DressHuman(r?.children?.[0],100+i,{crowd:true}));
}
const v57BaseBuildActors=buildActors;
buildActors=function(){v57BaseBuildActors();pedestrians.forEach((p,i)=>v57DressHuman(p.root?.children?.[0],i));};
const v57BaseBuildAccident=buildAccident;
buildAccident=function(){v57BaseBuildAccident();curiosos.forEach((r,i)=>v57DressHuman(r?.children?.[0],100+i,{crowd:true}));};
