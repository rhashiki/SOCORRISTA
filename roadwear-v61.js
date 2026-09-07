/* Re.Force APH — Build 61 / v61
 * Road surface readability: patches, manholes, drains and optional wet reflections.
 */
let V61_ROAD=[];
function v61Disc(r,color,x,z,y=.03,opacity=1){const mat=new THREE.MeshStandardMaterial({color,roughness:.88,metalness:.08,transparent:opacity<1,opacity});const m=new THREE.Mesh(new THREE.CircleGeometry(r,18),mat);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;scene.add(m);V61_ROAD.push(m);return m;}
function v61Patch(w,h,x,z,rot=0){const mat=new THREE.MeshStandardMaterial({color:0x25292c,roughness:.98,metalness:.01});const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.rotation.set(-Math.PI/2,0,rot);m.position.set(x,.027,z);m.receiveShadow=true;scene.add(m);V61_ROAD.push(m);return m;}
function v61BuildRoadWear(){
  V61_ROAD=[];
  [[-24,-30],[22,-30],[-20,0],[26,0],[-18,30],[31,30],[-48,-17],[-48,19],[0,-18],[0,18],[48,-16],[48,17]].forEach((p,i)=>{
    const m=v61Disc(.42,0x394046,p[0],p[1],.031);m.material.metalness=.28;m.material.roughness=.63;
    for(let k=0;k<6;k++){const a=k*Math.PI/3;const bolt=v61Disc(.025,0x1b1e20,p[0]+Math.cos(a)*.27,p[1]+Math.sin(a)*.27,.034);bolt.material.roughness=.55;}
    if(i%2===0)v61Patch(2.2+(i%3)*.5,.8,p[0]+3,p[1]+(i%4-2)*.7,(i%3)*.08);
  });
  const drains=[[-5.45,-22],[5.45,16],[-42.5,-5.4],[42.5,5.4],[-5.45,37],[53.5,-5.4]];
  drains.forEach(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,.034,z);scene.add(g);V61_ROAD.push(g);for(let k=-2;k<=2;k++){const bar=new THREE.Mesh(new THREE.BoxGeometry(i%2?.06:.65,.02,i%2?.65:.06),new THREE.MeshStandardMaterial({color:0x31373a,roughness:.7,metalness:.32}));bar.position.set(i%2?k*.12:0,.01,i%2?0:k*.12);g.add(bar);}});
  if(V24_ENV?.id==='rain'){
    [[-10,-30],[18,0],[-46,14],[46,-18]].forEach(([x,z],i)=>{const p=v61Disc(1.6+(i%2)*.7,0x506d7d,x,z,.035,.28);p.scale.y=.55;p.material.roughness=.22;p.material.metalness=.32;});
  }
}
const v61BaseBuildCity=buildCity;
buildCity=function(){v61BaseBuildCity();v61BuildRoadWear();};
