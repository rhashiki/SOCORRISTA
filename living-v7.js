/* Re.Force APH — Build 3 / v7
 * Living World & Character Upgrade
 * Adds articulated procedural humans, improved third-person camera,
 * player/world collision, crowd behaviour and ambient witness dialogue.
 */

let v7WalkTime=0;
let v7WitnessClock=0;
let v7CaptionEl=null;
let v7IncidentVariant=null;

function v7MakeMaterial(color,rough=.82,metal=.02){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function v7Mesh(geo,mat,pos=[0,0,0],rot=[0,0,0],parent){const o=new THREE.Mesh(geo,mat);o.position.set(...pos);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}

function createFallbackHuman(color=0x2b343c,options={}){
  const role=options.role||'civilian';
  const skinTone=options.skin||[0x9f694c,0xb98262,0xc58a68,0x86583f][Math.floor(Math.random()*4)];
  const g=new THREE.Group();
  const cloth=v7MakeMaterial(color,.88,.02), dark=v7MakeMaterial(role==='responder'?0x151a1e:0x252a2f,.86,.03), skin=v7MakeMaterial(skinTone,.84,.01), hair=v7MakeMaterial([0x241c18,0x3a2c21,0x17191a][Math.floor(Math.random()*3)],.95,0);
  const boot=v7MakeMaterial(0x111315,.72,.08);

  const pelvis=new THREE.Group(); pelvis.position.y=.78; g.add(pelvis);
  v7Mesh(new THREE.BoxGeometry(.34,.24,.26),dark,[0,0,0],undefined,pelvis);

  const torso=new THREE.Group(); torso.position.y=1.10; g.add(torso);
  const torsoMesh=v7Mesh(new THREE.CapsuleGeometry(.20,.50,5,10),cloth,[0,0,0],undefined,torso); torsoMesh.scale.set(1.08,1,.78);

  const head=new THREE.Group(); head.position.y=1.67; g.add(head);
  const headMesh=v7Mesh(new THREE.SphereGeometry(.17,14,10),skin,[0,.05,0],undefined,head);headMesh.scale.set(.92,1.05,.9);
  const cap=v7Mesh(new THREE.SphereGeometry(.174,12,8,0,Math.PI*2,0,Math.PI*.50),hair,[0,.085,0],undefined,head);cap.scale.set(.93,.74,.91);

  const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-.255,1.36,0);rightArm.position.set(.255,1.36,0);g.add(leftArm,rightArm);
  const leftForearm=new THREE.Group(),rightForearm=new THREE.Group();leftForearm.position.set(0,-.30,0);rightForearm.position.set(0,-.30,0);leftArm.add(leftForearm);rightArm.add(rightForearm);
  v7Mesh(new THREE.CapsuleGeometry(.055,.27,4,8),cloth,[0,-.14,0],undefined,leftArm);v7Mesh(new THREE.CapsuleGeometry(.055,.27,4,8),cloth,[0,-.14,0],undefined,rightArm);
  v7Mesh(new THREE.CapsuleGeometry(.047,.25,4,8),skin,[0,-.13,0],undefined,leftForearm);v7Mesh(new THREE.CapsuleGeometry(.047,.25,4,8),skin,[0,-.13,0],undefined,rightForearm);
  v7Mesh(new THREE.SphereGeometry(.055,8,6),skin,[0,-.30,0],undefined,leftForearm);v7Mesh(new THREE.SphereGeometry(.055,8,6),skin,[0,-.30,0],undefined,rightForearm);

  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();leftLeg.position.set(-.105,.72,0);rightLeg.position.set(.105,.72,0);g.add(leftLeg,rightLeg);
  const leftKnee=new THREE.Group(),rightKnee=new THREE.Group();leftKnee.position.set(0,-.34,0);rightKnee.position.set(0,-.34,0);leftLeg.add(leftKnee);rightLeg.add(rightKnee);
  v7Mesh(new THREE.CapsuleGeometry(.068,.30,4,8),dark,[0,-.17,0],undefined,leftLeg);v7Mesh(new THREE.CapsuleGeometry(.068,.30,4,8),dark,[0,-.17,0],undefined,rightLeg);
  v7Mesh(new THREE.CapsuleGeometry(.058,.29,4,8),dark,[0,-.16,0],undefined,leftKnee);v7Mesh(new THREE.CapsuleGeometry(.058,.29,4,8),dark,[0,-.16,0],undefined,rightKnee);
  v7Mesh(new THREE.BoxGeometry(.15,.09,.27),boot,[0,-.34,-.055],undefined,leftKnee);v7Mesh(new THREE.BoxGeometry(.15,.09,.27),boot,[0,-.34,-.055],undefined,rightKnee);

  if(role==='responder'){
    const vest=v7MakeMaterial(0x202a31,.75,.03),reflect=v7MakeMaterial(0xd8c38d,.48,.05),red=v7MakeMaterial(0xa62a25,.65,.04);
    v7Mesh(new THREE.BoxGeometry(.43,.43,.30),vest,[0,1.16,0],undefined,g);
    v7Mesh(new THREE.BoxGeometry(.45,.055,.315),reflect,[0,1.25,0],undefined,g);
    v7Mesh(new THREE.BoxGeometry(.055,.39,.32),red,[-.175,1.16,0],undefined,g);
    v7Mesh(new THREE.BoxGeometry(.055,.39,.32),red,[.175,1.16,0],undefined,g);
    const helmet=new THREE.Group(); helmet.position.set(0,1.79,0);g.add(helmet);
    const h=v7Mesh(new THREE.SphereGeometry(.185,14,9,0,Math.PI*2,0,Math.PI*.58),v7MakeMaterial(0x171b1e,.55,.12),[0,0,0],undefined,helmet);h.scale.set(1.04,.72,1.03);
  }

  g.userData.rig={pelvis,torso,head,leftArm,rightArm,leftForearm,rightForearm,leftLeg,rightLeg,leftKnee,rightKnee};
  g.userData.role=role;
  g.userData.phase=Math.random()*Math.PI*2;
  return g;
}

function v7AnimateHuman(root,speed,t,{running=false,idleLook=false}={}){
  const rig=root?.userData?.rig;
  if(!rig)return;
  const motion=Math.min(1,Math.abs(speed)/3.5),freq=running?10.8:7.2,phase=(root.userData.phase||0),s=Math.sin(t*freq+phase),c=Math.cos(t*freq+phase);
  const stride=(running?.82:.52)*motion;
  rig.leftLeg.rotation.x=s*stride;rig.rightLeg.rotation.x=-s*stride;
  rig.leftKnee.rotation.x=Math.max(0,-s)*(running?.62:.30)*motion;rig.rightKnee.rotation.x=Math.max(0,s)*(running?.62:.30)*motion;
  rig.leftArm.rotation.x=-s*(running?.72:.48)*motion;rig.rightArm.rotation.x=s*(running?.72:.48)*motion;
  rig.leftForearm.rotation.x=-.12-Math.max(0,s)*.18*motion;rig.rightForearm.rotation.x=-.12-Math.max(0,-s)*.18*motion;
  rig.torso.rotation.z=s*.028*motion;rig.pelvis.rotation.y=c*.035*motion;
  rig.head.rotation.y=idleLook&&motion<.05?Math.sin(t*.7+phase)*.20:THREE.MathUtils.lerp(rig.head.rotation.y,0,.08);
  const breathe=Math.sin(t*1.9+phase)*.012;
  rig.torso.position.y=breathe;
  if(motion<.04){
    rig.leftLeg.rotation.x*=.82;rig.rightLeg.rotation.x*=.82;rig.leftArm.rotation.x*=.82;rig.rightArm.rotation.x*=.82;
  }
}

function buildActors(){
  player.root=new THREE.Group();scene.add(player.root);player.root.position.copy(BASE_POS).add(new THREE.Vector3(2,0,-4));
  player.visual=createFallbackHuman(0x26333d,{role:'responder',skin:0xb98262});player.root.add(player.visual);
  ambulance.root=new THREE.Group();ambulance.root.position.copy(AMB_POS);ambulance.heading=Math.PI/2;scene.add(ambulance.root);buildAmbulanceVisual();
  buildTraffic();buildPedestrians();
}

function createCar(color=0x3d6b8d){
  const g=new THREE.Group(),variant=Math.floor(Math.random()*3),body=v7MakeMaterial(color,.56,.18),glass=v7MakeMaterial(0x293944,.28,.38),rubber=v7MakeMaterial(0x111315,.76,.08);
  const length=variant===1?3.65:variant===2?3.05:3.3,height=variant===1?.88:.72;
  v7Mesh(new THREE.BoxGeometry(length,height,1.58),body,[0,.52,0],undefined,g);
  const cabin=v7Mesh(new THREE.BoxGeometry(variant===2?1.45:1.7,.60,1.32),glass,[variant===1?.05:.18,1.08,0],undefined,g);cabin.material.transparent=true;cabin.material.opacity=.92;
  if(variant===1)v7Mesh(new THREE.BoxGeometry(1.1,.22,1.5),body,[-1.05,.90,0],undefined,g);
  for(const x of [-length*.31,length*.31])for(const z of [-.74,.74])v7Mesh(new THREE.CylinderGeometry(.31,.31,.20,14),rubber,[x,.28,z],[Math.PI/2,0,0],g);
  const h1=v7Mesh(new THREE.BoxGeometry(.12,.18,.34),v7MakeMaterial(0xffe1a8,.3,.12),[length/2+.01,.62,.52],undefined,g),h2=v7Mesh(new THREE.BoxGeometry(.12,.18,.34),v7MakeMaterial(0xffe1a8,.3,.12),[length/2+.01,.62,-.52],undefined,g);[h1,h2].forEach(h=>{h.material.emissive=new THREE.Color(0xffc46f);h.material.emissiveIntensity=.32;});
  g.userData.vehicleRadius=length*.48;return g;
}

function buildPedestrians(){
  const walkways=[[-35,20,35,20],[-35,-20,35,-20],[-60,38,-20,38],[15,38,65,38],[-58,-38,-20,-38],[18,-38,65,-38],[-12,-36,-12,36],[12,36,12,-36]];
  pedestrians.length=0;
  for(let i=0;i<24;i++){
    const w=walkways[i%walkways.length],root=new THREE.Group(),palette=[0x566d7d,0x806050,0x56725a,0x70566d,0x8a744d];
    root.add(createFallbackHuman(palette[i%palette.length],{role:'civilian'}));
    const t=Math.random();root.position.set(w[0]+(w[2]-w[0])*t,0,w[1]+(w[3]-w[1])*t);scene.add(root);
    pedestrians.push({root,a:new THREE.Vector3(w[0],0,w[1]),b:new THREE.Vector3(w[2],0,w[3]),dir:Math.random()<.5?1:-1,speed:.72+Math.random()*.5,bob:Math.random()*6,cross:i>=16,state:'walk',pause:0});
  }
}

function v7WorldBlocked(pos,{includeAmbulance=true}={}){
  if(hitBuilding(pos))return true;
  for(const c of parkedCars)if(dist2(pos,c.position)<1.25)return true;
  for(const t of traffic)if(dist2(pos,t.root.position)<1.15)return true;
  if(includeAmbulance&&ambulance.root&&dist2(pos,ambulance.root.position)<1.35)return true;
  return false;
}

function updatePlayer(dt){
  const inp=inputAxes(),mag=clamp(Math.hypot(inp.x,inp.y),0,1),running=runHeld||keys.ShiftLeft||keys.ShiftRight,speed=(running?6.15:3.35)*mag;player.speed=speed;
  if(mag>.05){
    const f=new THREE.Vector3(-Math.sin(cameraYaw),0,-Math.cos(cameraYaw)),r=new THREE.Vector3(Math.cos(cameraYaw),0,-Math.sin(cameraYaw)),v=f.multiplyScalar(-inp.y).add(r.multiplyScalar(inp.x)).normalize();
    const old=player.root.position.clone(),next=old.clone().addScaledVector(v,speed*dt);next.x=clamp(next.x,-WORLD/2+2,WORLD/2-2);next.z=clamp(next.z,-WORLD/2+2,WORLD/2-2);
    if(!v7WorldBlocked(next,{includeAmbulance:phase!=='TO_AMBULANCE'}))player.root.position.copy(next);
    player.root.rotation.y=lerpAngle(player.root.rotation.y,Math.atan2(v.x,v.z),1-Math.exp(-dt*13));
    if(performance.now()-lastCameraDrag>1100)cameraYaw=lerpAngle(cameraYaw,player.root.rotation.y-Math.PI,1-Math.exp(-dt*1.75));
  }
  v7AnimateHuman(player.visual,speed,performance.now()*.001,{running,idleLook:true});
}

function v7PedestrianAvoidance(p,dir){
  let factor=1;
  for(const other of pedestrians){if(other===p)continue;const d=dist2(p.root.position,other.root.position);if(d<.72){factor=.18;break;}if(d<1.15)factor=Math.min(factor,.55);}
  for(const t of traffic){if(dist2(p.root.position,t.root.position)<1.6)factor=0;}
  return factor;
}

function updatePedestrians(dt){
  const tNow=performance.now()*.001;
  pedestrians.forEach(p=>{
    if(p.pause>0){p.pause-=dt;v7AnimateHuman(p.root.children[0],0,tNow,{idleLook:true});return;}
    const target=p.dir>0?p.b:p.a,dir=target.clone().sub(p.root.position);dir.y=0;
    if(dir.length()<.5){p.dir*=-1;p.pause=.4+Math.random()*1.2;return;}
    dir.normalize();
    const nearRoad=isRoad(p.root.position.x,p.root.position.z),crossAllowed=typeof pedestrianMayCross==='function'?pedestrianMayCross(p):true;
    let step=nearRoad&&!crossAllowed?0:p.speed;
    if(ambulance.siren&&dist2(p.root.position,ambulance.root.position)<9){step*=.25;p.root.lookAt(ambulance.root.position.x,0,ambulance.root.position.z);}
    step*=v7PedestrianAvoidance(p,dir);
    p.root.position.addScaledVector(dir,step*dt);p.root.rotation.y=lerpAngle(p.root.rotation.y,Math.atan2(dir.x,dir.z),1-Math.exp(-dt*8));
    v7AnimateHuman(p.root.children[0],step,tNow,{idleLook:step<.05});
  });
  v7UpdateCrowd(dt,tNow);
}

function v7UpdateCrowd(dt,tNow){
  curiosos.forEach((r,i)=>{
    if(!r.userData.v7Init){
      r.userData.v7Init=true;r.userData.home=r.position.clone();
      const away=r.position.clone().sub(patient.anchor.position).setY(0).normalize();
      r.userData.safe=r.userData.home.clone().addScaledVector(away,2.2+Math.random()*1.8);
      r.userData.phase=Math.random()*6;
    }
    const target=sceneChecks.has('signal')?r.userData.safe:r.userData.home;
    const d=target.clone().sub(r.position);d.y=0;let speed=0;
    if(d.length()>.18){d.normalize();speed=sceneChecks.has('signal')?1.0:.45;r.position.addScaledVector(d,speed*dt);r.rotation.y=lerpAngle(r.rotation.y,Math.atan2(d.x,d.z),1-Math.exp(-dt*6));}
    else if(patient.anchor)r.lookAt(patient.anchor.position.x,0,patient.anchor.position.z);
    v7AnimateHuman(r.children[0],speed,tNow,{idleLook:true});
  });
  if(['SCENE','PATIENT','CLINICAL'].includes(phase)&&player.root&&dist2(player.root.position,ACCIDENT_POS)<13){
    v7WitnessClock+=dt;
    if(v7WitnessClock>11){v7WitnessClock=0;v7AmbientWitness();}
  }
}

function v7AmbientWitness(){
  const lines=[
    'TESTEMUNHA: “A moto caiu depois da batida.”',
    'CURIOSO: “Tem uma pessoa no chão!”',
    'TESTEMUNHA: “Eu vi a colisão no cruzamento.”',
    'CURIOSO: “Vou dar espaço para vocês trabalharem.”'
  ];
  const line=lines[Math.floor(Math.random()*lines.length)];
  if(!v7CaptionEl){v7CaptionEl=document.createElement('div');v7CaptionEl.className='npc-caption';document.querySelector('#game').appendChild(v7CaptionEl);}
  v7CaptionEl.textContent=line;v7CaptionEl.classList.add('show');clearTimeout(v7AmbientWitness.t);v7AmbientWitness.t=setTimeout(()=>v7CaptionEl?.classList.remove('show'),3200);
}

const v7OriginalBuildAccident=buildAccident;
buildAccident=function(){
  v7OriginalBuildAccident();
  if(patient.visual?.userData?.rig)patient.visual.userData.phase=1.7;
  curiosos.forEach((r,i)=>{if(r.children[0])r.children[0].userData.phase=i*.7;});
};

const v7OriginalUpdatePatient=updatePatient;
updatePatient=function(dt){
  v7OriginalUpdatePatient(dt);
  if(patient.visual?.userData?.rig){
    const t=performance.now()*.001,rig=patient.visual.userData.rig;
    rig.torso.rotation.z=Math.sin(t*1.7)*.012;
    rig.head.rotation.y=Math.sin(t*.55)*.035;
  }
};

updateCamera=function(dt){
  let target,dist,shoulder=0,lookAhead=new THREE.Vector3();
  if(controlled==='vehicle'){
    target=ambulance.root.position.clone();target.y=1.35;dist=clamp(cameraDistance,7.2,10.8);
    const f=new THREE.Vector3(Math.sin(ambulance.heading),0,-Math.cos(ambulance.heading));lookAhead.copy(f).multiplyScalar(1.4+Math.min(2.2,Math.abs(ambulance.speed)*.10));
  }else if(bodyZoneMode&&patient.anchor){target=patient.anchor.position.clone();target.y=.75;dist=clamp(cameraDistance,4.2,5.5);}
  else{
    target=player.root.position.clone();target.y=1.28;dist=clamp(cameraDistance,5.8,8.6);shoulder=.28;
    const f=new THREE.Vector3(Math.sin(player.root.rotation.y),0,Math.cos(player.root.rotation.y));lookAhead.copy(f).multiplyScalar(.45);
  }
  target.add(lookAhead);cameraDistance=dist;
  const cp=Math.cos(cameraPitch),sp=Math.sin(cameraPitch),right=new THREE.Vector3(Math.cos(cameraYaw),0,-Math.sin(cameraYaw));
  const desired=new THREE.Vector3(target.x+dist*Math.sin(cameraYaw)*cp,target.y+dist*sp,target.z+dist*Math.cos(cameraYaw)*cp).addScaledVector(right,shoulder);
  const shake=(controlled==='vehicle'?Math.min(.025,Math.abs(ambulance.speed)*.0012):Math.min(.014,Math.abs(player.speed)*.002))*Math.sin(performance.now()*.035);
  desired.y+=shake;
  if(!cameraReady){smoothCamPos.copy(desired);smoothCamTarget.copy(target);cameraReady=true;}
  else{const a=1-Math.exp(-dt*(controlled==='vehicle'?5.2:8.5));smoothCamPos.lerp(desired,a);smoothCamTarget.lerp(target,1-Math.exp(-dt*10));}
  camera.position.copy(smoothCamPos);camera.lookAt(smoothCamTarget);
  const targetFov=controlled==='vehicle'?55+Math.min(8,Math.abs(ambulance.speed)*.38):55;
  if(Math.abs(camera.fov-targetFov)>.03){camera.fov=THREE.MathUtils.lerp(camera.fov,targetFov,1-Math.exp(-dt*4.5));camera.updateProjectionMatrix();}
};

function v7PrepareDispatch(){
  const variants=[
    {title:'COLISÃO CARRO × MOTO',qth:'Av. Central × Rua 4',info:'Trânsito ativo no local'},
    {title:'COLISÃO EM CRUZAMENTO',qth:'Av. Central × Rua 4',info:'Motociclista ao solo; curiosos no local'},
    {title:'SINISTRO VIÁRIO COM MOTO',qth:'Av. Central × Rua 4',info:'Uma vítima confirmada; via parcialmente obstruída'}
  ];
  v7IncidentVariant=variants[Math.floor(Math.random()*variants.length)];
  const card=document.querySelector('.dispatch-card');if(!card)return;
  const h=card.querySelector('h2');if(h)h.textContent=v7IncidentVariant.title;
  const cells=card.querySelectorAll('.dispatch-grid b');if(cells[0])cells[0].textContent=v7IncidentVariant.qth;if(cells[3])cells[3].textContent=v7IncidentVariant.info;
}

const v7OriginalInit=init;
init=async function(){v7PrepareDispatch();return v7OriginalInit();};
