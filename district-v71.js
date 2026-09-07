/* Re.Force APH — Build 71 / v71
 * Expanded playable city: outer avenues, blocks, park and mixed-use districts.
 */
let V71_DISTRICT=[];
function v71Mat(color,kind=null,rx=2,ry=2,rough=.88){const m=new THREE.MeshStandardMaterial({color,roughness:rough,metalness:.02});if(kind&&typeof v56CloneMap==='function'){m.map=v56CloneMap(kind,rx,ry);m.needsUpdate=true;}return m;}
function v71Plane(w,h,color,x,z,kind='asphalt'){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),v71Mat(color,kind,Math.max(1,w/16),Math.max(1,h/16),kind==='asphalt'?.96:.92));m.rotation.x=-Math.PI/2;m.position.set(x,.012,z);m.receiveShadow=true;scene.add(m);V71_DISTRICT.push(m);return m;}
function v71Building(x,z,w,d,h,color,seed=0){
  const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);V71_DISTRICT.push(root);const shell=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),v71Mat(color,'wall',Math.max(1,w/7),Math.max(1,h/4),.84));shell.position.y=h/2;shell.castShadow=true;shell.receiveShadow=true;root.add(shell);buildings.push({x,z,w,d});
  const dark=new THREE.MeshStandardMaterial({color:0x26343d,roughness:.36,metalness:.22,emissive:0x10161a,emissiveIntensity:.22}),floors=Math.max(2,Math.floor(h/3));
  for(let f=0;f<floors;f++)for(let k=-2;k<=2;k++){const wx=k*w*.145,y=1.7+f*2.75;if(y>h-.5)continue;const win=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.12),dark.clone());win.position.set(wx,y,-d/2-.012);if((f+k+seed)%4===0){win.material.emissive.setHex(0x503b1e);win.material.emissiveIntensity=.42;}root.add(win);}
  if(seed%2===0){const aw=new THREE.Mesh(new THREE.BoxGeometry(Math.min(w*.7,7),.16,1.2),v71Mat([0x805148,0x476878,0x66563d][seed%3],null,1,1,.9));aw.position.set(0,2.55,-d/2-.72);root.add(aw);}
  if(seed%3===0){const ac=new THREE.Mesh(new THREE.BoxGeometry(1.3,.7,1.0),v71Mat(0x818789,null,1,1,.65));ac.position.set(0,h+.35,0);root.add(ac);}
  return root;
}
function v71StreetLight(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);V71_DISTRICT.push(g);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.065,.08,4.4,8),v71Mat(0x4c5357,null,1,1,.58));pole.position.y=2.2;g.add(pole);const arm=new THREE.Mesh(new THREE.BoxGeometry(.9,.07,.07),pole.material);arm.position.set(.4,4.25,0);g.add(arm);const lamp=new THREE.Mesh(new THREE.BoxGeometry(.3,.09,.2),new THREE.MeshStandardMaterial({color:0xffd99a,emissive:0xffc86a,emissiveIntensity:1.05,roughness:.5}));lamp.position.set(.82,4.18,0);g.add(lamp);streetLights.push(g);}
function v71Park(){
  const x=-79,z=67;v71Plane(30,24,0x66815d,x,z,'grass');
  const pathMat=v71Mat(0xb0aaa0,'concrete',3,2,.96);for(const [px,pz,w,h] of [[x,z,28,2.2],[x,z,2.2,22]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),pathMat.clone());p.rotation.x=-Math.PI/2;p.position.set(px,.02,pz);scene.add(p);V71_DISTRICT.push(p);}
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=8+(i%3)*2;addPalm(x+Math.cos(a)*r,z+Math.sin(a)*r,.8+(i%2)*.15);}
  for(const [bx,bz,rot] of [[-87,67,0],[-71,67,Math.PI],[-79,59,Math.PI/2]]){const g=new THREE.Group();g.position.set(bx,0,bz);g.rotation.y=rot;scene.add(g);V71_DISTRICT.push(g);box([2.2,.22,.65],0x755943,[0,.52,0],undefined,g);box([.16,.55,.16],0x44494c,[-.8,.27,0],undefined,g);box([.16,.55,.16],0x44494c,[.8,.27,0],undefined,g);}
}
function v71BuildExpandedDistrict(){
  V71_DISTRICT=[];
  // New east/west avenues and north/south connectors.
  for(const z of [-65,65]){v71Plane(WORLD,11,0x303438,0,z,'asphalt');for(const edge of [-5.35,5.35])v71Plane(WORLD,2.5,0xa5a29a,0,z+edge,'concrete');for(let x=-98;x<=98;x+=9)v71Plane(3,.12,0xe1cf92,x,z,'concrete');}
  for(const x of [-82,82]){v71Plane(11,WORLD,0x303438,x,0,'asphalt');for(const edge of [-5.35,5.35])v71Plane(2.5,WORLD,0xa5a29a,x+edge,0,'concrete');for(let z=-98;z<=98;z+=9)v71Plane(.12,3,0xe1cf92,x,z,'concrete');}
  // Outer mixed-use blocks. Deliberately leave incident pockets open near arterials.
  const blocks=[[-80,-82,22,18,14],[-52,-82,18,18,20],[-20,-82,20,17,12],[20,-82,22,18,18],[52,-82,18,18,15],[80,-82,22,18,22],[-52,82,20,17,15],[-22,82,22,18,21],[22,82,20,17,13],[52,82,19,18,19],[80,82,20,18,16],[-96,-40,16,21,14],[-96,-12,18,20,20],[-96,18,17,20,15],[-96,44,17,18,17],[96,-42,18,20,19],[96,-14,17,19,14],[96,18,18,20,21],[96,46,17,18,16]];
  const palette=[0xb88a6b,0x8e9da5,0xc0ad8c,0x8d8e94,0xa76b62,0xb7a99a];blocks.forEach((b,i)=>v71Building(b[0],b[1],b[2],b[3],b[4],palette[i%palette.length],i));
  v71Park();
  for(const z of [-72,-58,58,72])for(let x=-98;x<=98;x+=18)v71StreetLight(x,z,x>0?Math.PI:0);
  for(const x of [-89,-75,75,89])for(let z=-96;z<=96;z+=20)v71StreetLight(x,z,z>0?-Math.PI/2:Math.PI/2);
}
const v71BaseBuildCity=buildCity;
buildCity=function(){v71BaseBuildCity();v71BuildExpandedDistrict();};
