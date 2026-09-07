/* Re.Force APH — Build 8 / v12
 * Multi-location scene generator: incident location and composition vary by case.
 */

const V12_LOCATIONS={
  x_external:{pos:[42,0,-28],qth:'Av. Central × Rua 4'},
  a_airway:{pos:[-4,0,-28],qth:'Setor Sul • Av. Central'},
  b_breathing:{pos:[46,0,2],qth:'Bairro Leste • Av. Norte'},
  stable_primary:{pos:[-46,0,2],qth:'Bairro Oeste • Rua Principal'}
};

const v12BasePick=v8PickCase;
v8PickCase=function(){
  const c=v12BasePick();const cfg=V12_LOCATIONS[c.id]||V12_LOCATIONS.x_external;
  ACCIDENT_POS.set(...cfg.pos);c.qth=cfg.qth;return c;
};

function v12Cone(x,z,rot=0){
  const g=new THREE.Group();mesh(new THREE.ConeGeometry(.23,.62,10),material(0xd45c24),[0,.34,0],undefined,g);box([.55,.05,.55],0x202020,[0,.04,0],undefined,g);g.position.copy(ACCIDENT_POS).add(new THREE.Vector3(x,0,z));g.rotation.y=rot;scene.add(g);return g;
}
function v12Bike(offset=[-1.6,.02,.8],rot=[.1,.35,.45]){
  const bike=new THREE.Group();
  for(const x of [-.65,.65])mesh(new THREE.TorusGeometry(.38,.045,8,20),material(0x111111),[x,.38,0],[Math.PI/2,0,0],bike);
  cyl(.035,1.15,0xa63229,[0,.48,0],[0,0,Math.PI/2],bike);cyl(.028,.7,0x555d63,[.22,.60,0],[0,0,.55],bike);
  bike.position.copy(ACCIDENT_POS).add(new THREE.Vector3(...offset));bike.rotation.set(...rot);scene.add(bike);return bike;
}
function v12Debris(count=8,spread=2){for(let i=0;i<count;i++)box([rand(.05,.18),rand(.03,.08),rand(.05,.18)],0x4d4b48,[ACCIDENT_POS.x+rand(-spread,spread),.05,ACCIDENT_POS.z+rand(-1.4,1.4)],[rand(0,.5),rand(0,3),rand(0,.5)]);}
function v12Skid(x,z,len=1.4,angle=0){const m=plane(len,.10,0x17191b,[ACCIDENT_POS.x+x,.025,ACCIDENT_POS.z+z]);m.rotation.z=angle;return m;}
function v12Barrier(x,z,rot=0){const g=new THREE.Group();box([2.4,.12,.12],0xe3e1d7,[0,.65,0],undefined,g);box([.16,1.3,.16],0x555b60,[-.9,.55,0],undefined,g);box([.16,1.3,.16],0x555b60,[.9,.55,0],undefined,g);for(const sx of [-.65,0,.65])box([.28,.14,.14],0xc84637,[sx,.66,.01],undefined,g);g.position.copy(ACCIDENT_POS).add(new THREE.Vector3(x,0,z));g.rotation.y=rot;scene.add(g);return g;}

function buildAccident(){
  clinicalZones.length=0;curiosos.length=0;
  const type=ACTIVE_CASE?.id||'x_external';

  if(type==='x_external'){
    const car=createCar(0x7f322c);car.position.copy(ACCIDENT_POS).add(new THREE.Vector3(2.5,0,-.7));car.rotation.y=.45;scene.add(car);
    v12Bike();v12Cone(-3,-2);v12Cone(-1,-3);v12Cone(2,-3);v12Skid(1.1,-1.4,2.0,.2);v12Debris(10,2.1);
  }else if(type==='a_airway'){
    v12Bike([-.8,.02,.5],[.05,-.25,.62]);v12Barrier(2.4,-1.1,.2);v12Cone(-2.5,-1.8);v12Cone(-1.6,-2.5);v12Debris(5,1.4);
    const car=createCar(0x4e6474);car.position.copy(ACCIDENT_POS).add(new THREE.Vector3(5.2,0,-2.2));car.rotation.y=-.05;scene.add(car);
  }else if(type==='b_breathing'){
    const car=createCar(0x845444);car.position.copy(ACCIDENT_POS).add(new THREE.Vector3(1.8,0,-.2));car.rotation.y=.72;scene.add(car);
    v12Bike([-2.1,.02,1.0],[.2,.8,.52]);v12Skid(-.2,-1.5,2.6,-.25);v12Skid(1,-1.2,2.0,-.2);v12Cone(-3,-2.2);v12Cone(3,-2.0);v12Debris(12,2.5);
  }else{
    v12Bike([-.9,.02,.65],[.15,.15,.5]);v12Cone(-2.3,-1.7);v12Cone(1.8,-2.0);v12Debris(3,1.0);
    const parked=createCar(0x627a66);parked.position.copy(ACCIDENT_POS).add(new THREE.Vector3(5.6,0,2.0));parked.rotation.y=Math.PI/2;scene.add(parked);
  }

  patient.anchor=new THREE.Group();patient.anchor.position.copy(ACCIDENT_POS).add(new THREE.Vector3(-.1,.05,1.2));patient.anchor.rotation.z=-Math.PI/2;scene.add(patient.anchor);
  patient.visual=createFallbackHuman(type==='stable_primary'?0x45536a:0x343c43,{role:'civilian',skin:[0xa86f50,0xb98262,0x8f6047][Math.floor(Math.random()*3)]});patient.anchor.add(patient.visual);

  const stainMat=new THREE.MeshStandardMaterial({color:0x5f1715,roughness:1,transparent:true,opacity:.80});
  patient.pool=mesh(new THREE.CircleGeometry(.55,24),stainMat,[ACCIDENT_POS.x-.9,.017,ACCIDENT_POS.z+1.2],[-Math.PI/2,0,0]);
  const patchMat=new THREE.MeshBasicMaterial({color:0x731d19,transparent:true,opacity:.86,depthTest:true});
  patient.patch=mesh(new THREE.PlaneGeometry(.38,.22),patchMat,[0,.34,.18],[0,0,0],patient.anchor);

  const zones=[['head',1.65],['neck',1.43],['chest',1.15],['abdomen',.93],['pelvis',.72],['limbs',.38],['back',1.08]];
  zones.forEach(([name,y])=>{const z=mesh(new THREE.BoxGeometry(name==='limbs'?.65:.45,name==='limbs'?.55:.28,.55),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),[0,y,name==='back'?-.28:0],[0,0,0],patient.anchor);z.userData.region=name;clinicalZones.push(z);});

  const crowdCount=type==='stable_primary'?4:6+Math.floor(Math.random()*3);
  for(let i=0;i<crowdCount;i++){
    const a=(i/crowdCount)*Math.PI*2+rand(-.3,.3),radius=3.2+rand(0,1.8),r=new THREE.Group();
    r.add(createFallbackHuman([0x5c6166,0x6f5a52,0x536b62,0x6a6175][i%4],{role:'civilian'}));
    r.position.copy(ACCIDENT_POS).add(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius));r.lookAt(patient.anchor.position);scene.add(r);curiosos.push(r);
  }
}

const v12BaseUpdateDistrict=updateDistrict;
updateDistrict=function(){v12BaseUpdateDistrict();if(['SCENE','PATIENT','CLINICAL'].includes(phase)&&ACTIVE_CASE){const el=document.querySelector('#districtBanner');if(el&&el.hidden===false)el.textContent=ACTIVE_CASE.qth.toUpperCase();}};
