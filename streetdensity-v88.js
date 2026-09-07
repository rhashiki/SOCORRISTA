/* Re.Force APH — Build 88 / v88
 * Outer-district street density: curbside parked vehicles with profile-aware count.
 */
let V88_PARKED=[];
function v88SpawnCar(x,z,rot,color,type='car'){
  let root;if(type==='van'&&typeof v40Van==='function')root=v40Van(color);else root=createCar(color);
  root.position.set(x,0,z);root.rotation.y=rot;root.userData.v88Outer=true;scene.add(root);parkedCars.push(root);V88_PARKED.push(root);
  if(typeof v52DetailCar==='function')v52DetailCar(root,false);if(typeof v58AttachShadow==='function')v58AttachShadow(root,3.4,1.7,.22);return root;
}
function v88BuildStreetDensity(){
  V88_PARKED=[];const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced',max=profile==='eco'?8:profile==='high'?18:13;
  const pts=[[-61,-70,0],[-33,-70,0],[-4,-70,0],[29,-70,0],[58,-70,0],[88,-70,0],[-70,70,Math.PI],[ -38,70,Math.PI],[-7,70,Math.PI],[27,70,Math.PI],[58,70,Math.PI],[88,70,Math.PI],[-87,-43,Math.PI/2],[-87,-9,Math.PI/2],[-87,28,Math.PI/2],[87,-38,-Math.PI/2],[87,2,-Math.PI/2],[87,39,-Math.PI/2]];
  const colors=[0x526f80,0x7d5149,0x666b68,0x475e50,0x8a7241,0x55575e];
  pts.slice(0,max).forEach((p,i)=>v88SpawnCar(p[0],p[1],p[2],colors[i%colors.length],i%7===3?'van':'car'));
}
const v88BaseBuildCity=buildCity;
buildCity=function(){v88BaseBuildCity();v88BuildStreetDensity();};
