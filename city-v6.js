function buildCity(){
  plane(WORLD,WORLD,0x5b7d55,[0,-.04,0]);
  const roadMat=material(0x2f3337,.96,.03), walkMat=material(0xa4a29b,.94,.01);
  const roads=[{x:0,z:-30,w:WORLD,h:12},{x:0,z:0,w:WORLD,h:12},{x:0,z:30,w:WORLD,h:12},{x:-48,z:0,w:12,h:WORLD},{x:0,z:0,w:12,h:WORLD},{x:48,z:0,w:12,h:WORLD}];
  roads.forEach(r=>mesh(new THREE.PlaneGeometry(r.w,r.h),roadMat,[r.x,.001,r.z],[-Math.PI/2,0,0]));
  [-36,-24,-6,6,24,36].forEach(z=>{mesh(new THREE.PlaneGeometry(WORLD,2.7),walkMat,[0,.018,z],[-Math.PI/2,0,0]);box([WORLD,.16,.12],0xc2beb6,[0,.08,z-1.36]);box([WORLD,.16,.12],0xc2beb6,[0,.08,z+1.36]);});
  [-54,-42,-6,6,42,54].forEach(x=>{mesh(new THREE.PlaneGeometry(2.7,WORLD),walkMat,[x,.019,0],[-Math.PI/2,0,0]);box([.12,.16,WORLD],0xc2beb6,[x-1.36,.08,0]);box([.12,.16,WORLD],0xc2beb6,[x+1.36,.08,0]);});
  for(const z of [-30,0,30]){for(let x=-70;x<=70;x+=8)plane(3,.12,0xe3d29b,[x,.022,z]);for(const edge of [-5.2,5.2])plane(WORLD,.08,0xe7e5df,[0,.021,z+edge]);}
  for(const x of [-48,0,48]){for(let z=-70;z<=70;z+=8)plane(.12,3,0xe3d29b,[x,.023,z]);for(const edge of [-5.2,5.2])plane(.08,WORLD,0xe7e5df,[x+edge,.022,0]);}
  for(const ix of [-48,0,48]) for(const iz of [-30,0,30]) addIntersection(ix,iz);
  const blocks=[[-25,-48],[25,-48],[-25,-15],[25,-15],[-25,15],[25,15],[-25,48],[25,48],[-65,-15],[65,-15],[-65,15],[65,15],[-65,48],[65,48]];
  blocks.forEach((p,i)=>{if(dist2({x:p[0],z:p[1]},BASE_POS)<18||dist2({x:p[0],z:p[1]},ACCIDENT_POS)<20||dist2({x:p[0],z:p[1]},HOSPITAL_POS)<18)return;makeBuilding(p[0],p[1],i);});
  box([22,8,16],0x252a2f,[BASE_POS.x-3,4,BASE_POS.z+2]);box([13,.24,3.3],0x11151a,[BASE_POS.x-3,2.1,BASE_POS.z-6.15]);
  for(let i=-2;i<=2;i++)box([2.1,2.8,.2],0x2f373e,[BASE_POS.x-3+i*2.4,1.65,BASE_POS.z-7.82]);
  addLabel('RE.FORCE • BASE',[BASE_POS.x-3,8.5,BASE_POS.z-6.1],0xe6d1ae);box([8,4,3],0x34383e,[BASE_POS.x+7,2,BASE_POS.z-7]);plane(17,10,0x4b4e50,[BASE_POS.x-3,.02,BASE_POS.z-11]);
  box([24,12,18],0xe3e4df,[HOSPITAL_POS.x,6,HOSPITAL_POS.z]);box([18,4,4],0xcfd7d9,[HOSPITAL_POS.x,2,HOSPITAL_POS.z-10]);addLabel('HOSPITAL',[HOSPITAL_POS.x,12.7,HOSPITAL_POS.z-9.2],0xcc3e36);box([3,7,.3],0xcc3b35,[HOSPITAL_POS.x,8,HOSPITAL_POS.z-9.45]);box([7,3,.3],0xcc3b35,[HOSPITAL_POS.x,8,HOSPITAL_POS.z-9.46]);
  for(let i=0;i<44;i++){let x=rand(-70,70),z=rand(-70,70);if(isRoad(x,z)||dist2({x,z},ACCIDENT_POS)<11)continue;addPalm(x,z,.85+Math.random()*.45);}
  for(const z of [-36,-24,24,36])for(let x=-65;x<70;x+=15)addStreetLight(x,z);
  for(const x of [-54,-42,42,54])for(let z=-65;z<70;z+=17)addStreetLight(x,z);
  [[-18,-22],[-8,-22],[17,-22],[28,-22],[-20,22],[18,22],[30,22],[-60,-8],[-60,10],[60,9],[60,-10]].forEach((p,i)=>addParkedCar(p[0],p[1],i%2?Math.PI/2:0,i));
  [[-18,8],[16,-8],[-58,26],[58,-26]].forEach(p=>addBusStop(p[0],p[1]));
}
function makeBuilding(x,z,i){
  const w=rand(12,20),d=rand(10,18),h=rand(7,22),palette=[0xc58f69,0xaab3b6,0xd8c39b,0x909fa9,0xb9665d,0xc7b6a4],color=palette[i%palette.length];
  const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);box([w,h,d],color,[0,h/2,0],undefined,root);buildings.push({x,z,w,d});
  const dark=material(0x23323c,.35,.35),floors=Math.max(2,Math.floor(h/3));
  for(let f=0;f<floors;f++){const y=1.7+f*2.8;for(const side of [-1,1]){const xx=side*(w/2+.015);for(let k=-1;k<=1;k++){const win=mesh(new THREE.PlaneGeometry(1.2,1.25),dark,[xx,y,k*d*.22],[0,side*Math.PI/2,0],root);win.material.emissive=new THREE.Color((f+i+k)%3===0?0x2b2517:0x101820);win.material.emissiveIntensity=.35;}}for(const k of [-1,0,1]){const win=mesh(new THREE.PlaneGeometry(1.25,1.2),dark,[k*w*.22,y,-d/2-.016],[0,0,0],root);win.material.emissive=new THREE.Color((f+i+k)%4===0?0x342714:0x101820);win.material.emissiveIntensity=.32;}}
  if(i%3===0){box([w*.62,.18,1.4],0x443526,[0,2.1,-d/2-1.0],undefined,root);addFacadeSign(root,['CAFÉ','MERCADO','FARMÁCIA','OFICINA'][i%4],[0,3.35,-d/2-.12],w*.48);}
  if(i%4===0){for(const bx of [-w*.26,w*.26])box([w*.28,.15,1.0],0x646b70,[bx,h+0.2,0],undefined,root);}if(i%5===0)cyl(.65,1.0,0x73777a,[0,h+.5,0],undefined,root);
}
function addFacadeSign(parent,text,pos,width=4){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#15191d';ctx.fillRect(0,0,512,128);ctx.fillStyle='#e7cf9e';ctx.font='900 54px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));sp.position.set(...pos);sp.scale.set(width,1,1);parent.add(sp);}
function addIntersection(x,z){for(let k=-4;k<=4;k++){plane(.38,4.5,0xf5f2ea,[x+k*.72,.026,z-6.2]);plane(.38,4.5,0xf5f2ea,[x+k*.72,.026,z+6.2]);plane(4.5,.38,0xf5f2ea,[x-6.2,.026,z+k*.72]);plane(4.5,.38,0xf5f2ea,[x+6.2,.026,z+k*.72]);}addTrafficLight(x-6.4,z-6.4,'H');addTrafficLight(x+6.4,z+6.4,'H');addTrafficLight(x-6.4,z+6.4,'V');addTrafficLight(x+6.4,z-6.4,'V');}
function addTrafficLight(x,z,axis){const g=new THREE.Group();cyl(.08,3.7,0x3c4246,[0,1.85,0],undefined,g);box([.55,1.25,.35],0x171b1e,[0,3.55,0],undefined,g);const red=mesh(new THREE.SphereGeometry(.12,10,8),material(0x5b1513),[0,3.9,.19],undefined,g),amber=mesh(new THREE.SphereGeometry(.12,10,8),material(0x5a4612),[0,3.55,.19],undefined,g),green=mesh(new THREE.SphereGeometry(.12,10,8),material(0x183f1d),[0,3.2,.19],undefined,g);[red,amber,green].forEach(m=>{m.material.emissive=m.material.color.clone();m.material.emissiveIntensity=.12;});g.position.set(x,0,z);scene.add(g);trafficLights.push({root:g,axis,red,amber,green,x,z});}
function addPalm(x,z,s=1){const g=new THREE.Group();cyl(.18*s,2.8*s,0x72513a,[0,1.4*s,0],undefined,g);for(let i=0;i<7;i++){const leaf=mesh(new THREE.ConeGeometry(.18*s,1.8*s,5),material(0x3c7545),[0,3.05*s,0],[Math.PI/2,0,i*Math.PI/3.5],g);leaf.scale.set(1,.6,1);}g.position.set(x,0,z);scene.add(g);cityDecor.push(g);}
function addParkedCar(x,z,rot=0,i=0){const c=createCar([0x4e7086,0x8e5548,0x777970,0x556b50][i%4]);c.position.set(x,0,z);c.rotation.y=rot;scene.add(c);parkedCars.push(c);}
function addBusStop(x,z){const g=new THREE.Group();box([3.2,.12,1.2],0x2d3338,[0,2.4,0],undefined,g);box([.1,2.4,1.2],0x515a60,[-1.45,1.2,0],undefined,g);box([.1,2.4,1.2],0x515a60,[1.45,1.2,0],undefined,g);box([2.2,.35,.55],0x765944,[0,.48,0],undefined,g);g.position.set(x,0,z);scene.add(g);cityDecor.push(g);}
function isRoad(x,z){return Math.abs(z+30)<7||Math.abs(z)<7||Math.abs(z-30)<7||Math.abs(x+48)<7||Math.abs(x)<7||Math.abs(x-48)<7;}
function addStreetLight(x,z){const g=new THREE.Group();cyl(.08,4.2,0x4e5357,[0,2.1,0],[0,0,0],g);box([.8,.08,.08],0x4e5357,[.35,4.15,0],undefined,g);const bulb=box([.32,.10,.22],0xffe1a6,[.74,4.1,0],undefined,g);bulb.material.emissive=new THREE.Color(0xffd38c);bulb.material.emissiveIntensity=1.1;g.position.set(x,0,z);scene.add(g);streetLights.push(g);}
function addLabel(text,pos,color=0xffffff){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='rgba(10,12,14,.88)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#'+new THREE.Color(color).getHexString();ctx.font='900 42px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));sp.position.set(...pos);sp.scale.set(8,1.5,1);scene.add(sp);return sp;}