/* Re.Force APH — Build 62 / v62
 * Parked urban vehicle variety: taxis, delivery/service cars and utility vans.
 */
let V62_VEHICLES=[];
function v62RoofSign(root,text='TÁXI',color=0xe4c04a){const g=new THREE.Group(),base=new THREE.Mesh(new THREE.BoxGeometry(.52,.18,.22),new THREE.MeshStandardMaterial({color,roughness:.58,metalness:.08}));base.position.set(0,1.47,0);base.castShadow=true;g.add(base);root.add(g);return g;}
function v62DeliveryBox(root,color=0xe7e8e4){const mat=new THREE.MeshStandardMaterial({color,roughness:.82,metalness:.04}),b=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.12,1.48),mat);b.position.set(-.62,1.12,0);b.castShadow=true;b.receiveShadow=true;root.add(b);const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.28,.16,1.51),new THREE.MeshStandardMaterial({color:0xb23d34,roughness:.72}));stripe.position.set(-.62,1.22,0);root.add(stripe);return b;}
function v62UtilityRack(root){const mat=new THREE.MeshStandardMaterial({color:0x4b5257,roughness:.66,metalness:.35});for(const z of [-.55,.55]){const rail=new THREE.Mesh(new THREE.BoxGeometry(2.25,.06,.06),mat);rail.position.set(0,1.55,z);root.add(rail);}for(const x of [-.85,.85]){const bar=new THREE.Mesh(new THREE.BoxGeometry(.06,.08,1.18),mat);bar.position.set(x,1.58,0);root.add(bar);}}
function v62Spawn(type,x,z,rot=0,i=0){
  const colors={taxi:0xd8b83f,delivery:0xe6e7e4,service:0x536f7c,utility:0x666a64},root=createCar(colors[type]||0x68727a);root.position.set(x,0,z);root.rotation.y=rot;scene.add(root);
  if(type==='taxi')v62RoofSign(root);if(type==='delivery')v62DeliveryBox(root);if(type==='service'){v62UtilityRack(root);const lamp=new THREE.Mesh(new THREE.BoxGeometry(.46,.10,.16),new THREE.MeshStandardMaterial({color:0xe89b33,emissive:0xa95a13,emissiveIntensity:.35}));lamp.position.set(0,1.5,0);root.add(lamp);}if(type==='utility')v62UtilityRack(root);
  root.userData.v62Type=type;parkedCars.push(root);cityDecor.push(root);V62_VEHICLES.push(root);return root;
}
function v62BuildStreetVehicles(){
  V62_VEHICLES=[];
  [['taxi',-28,-22,0],['delivery',24,22,Math.PI],['service',-60,8,Math.PI/2],['utility',60,-9,-Math.PI/2],['taxi',-28,38,Math.PI],['delivery',28,-38,0]].forEach((v,i)=>v62Spawn(v[0],v[1],v[2],v[3],i));
}
const v62BaseBuildCity=buildCity;
buildCity=function(){v62BaseBuildCity();v62BuildStreetVehicles();};
