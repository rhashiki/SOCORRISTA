/* Re.Force APH — Build 17 / v21
 * Circulation-focused case pack and dynamic C decision.
 */

V8_CASES.forEach(c=>{if(!c.circulation)c.circulation='Pulso um pouco acelerado, perfusão periférica preservada e sem sinal de piora circulatória importante no momento.';});
V8_CASES.push({
  id:'c_perfusion',title:'PEDESTRE ATINGIDO EM CRUZAMENTO',qth:'Centro • Av. Principal',priority:'ALTA',info:'Pedestre consciente no solo; veículo parado no local',
  focus:'C',visual:'Não há hemorragia externa importante evidente na varredura inicial.',
  airway:'A vítima responde verbalmente de forma compreensível.',breathing:'Expansão torácica simétrica, sem esforço respiratório marcado.',
  circulation:'A vítima está pálida, com pulso rápido e perfusão periférica reduzida apesar de não haver hemorragia externa importante visível.',
  spo2:96,bp:'98/62',witness:'“Ela ficou bem pálida logo depois de cair.”',
  gcs:{E:4,V:5,M:6,eEye:'Olhos abertos espontaneamente.',eVerbal:'Responde de forma orientada às perguntas.',eMotor:'Obedece ao comando motor solicitado.'}
});
V12_LOCATIONS.c_perfusion={pos:[4,0,2],qth:'Centro • Av. Principal'};
V18_POOLS.c_perfusion=['traffic','crowd'];

const v21BaseBuildAccident=buildAccident;
buildAccident=function(){
  if(ACTIVE_CASE?.id!=='c_perfusion')return v21BaseBuildAccident();
  clinicalZones.length=0;curiosos.length=0;
  const car=createCar(0x3f596b);car.position.copy(ACCIDENT_POS).add(new THREE.Vector3(4.2,0,-1.4));car.rotation.y=.05;scene.add(car);
  v12Cone(-2.7,-2.2);v12Cone(-1.5,-2.8);v12Cone(2.4,-2.4);v12Debris(3,1.1);
  patient.anchor=new THREE.Group();patient.anchor.position.copy(ACCIDENT_POS).add(new THREE.Vector3(-.2,.05,1.0));patient.anchor.rotation.z=-Math.PI/2;scene.add(patient.anchor);
  patient.visual=createFallbackHuman(0x59677a,{role:'civilian',skin:0xb98262});patient.anchor.add(patient.visual);
  const hidden=new THREE.MeshStandardMaterial({color:0x5f1715,transparent:true,opacity:0});patient.pool=mesh(new THREE.CircleGeometry(.2,16),hidden,[ACCIDENT_POS.x,.017,ACCIDENT_POS.z+1],[-Math.PI/2,0,0]);patient.pool.visible=false;
  patient.patch=mesh(new THREE.PlaneGeometry(.1,.1),new THREE.MeshBasicMaterial({transparent:true,opacity:0}),[0,.3,0],[0,0,0],patient.anchor);patient.patch.visible=false;
  const zones=[['head',1.65],['neck',1.43],['chest',1.15],['abdomen',.93],['pelvis',.72],['limbs',.38],['back',1.08]];
  zones.forEach(([name,y])=>{const z=mesh(new THREE.BoxGeometry(name==='limbs'?.65:.45,name==='limbs'?.55:.28,.55),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),[0,y,name==='back'?-.28:0],[0,0,0],patient.anchor);z.userData.region=name;clinicalZones.push(z);});
  for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2,r=new THREE.Group();r.add(createFallbackHuman([0x5a6872,0x725e55,0x5b6e5c,0x6d5c72][i%4],{role:'civilian'}));r.position.copy(ACCIDENT_POS).add(new THREE.Vector3(Math.cos(a)*(3.4+rand(0,.8)),0,Math.sin(a)*(3.1+rand(0,.8))));r.lookAt(patient.anchor.position);scene.add(r);curiosos.push(r);}
};

const v21BaseRenderC=renderC;
renderC=function(){
  if(!ACTIVE_CASE?.circulation)return v21BaseRenderC();
  const observed=patient.v21CObserved;
  openInteraction('Avaliação primária','CIRCULAÇÃO','Avalie perfusão e circulação antes de decidir se existe uma prioridade em C.',[
    {label:'Avaliar pulso, perfusão e aspecto geral',done:observed,fn:()=>{patient.v21CObserved=true;observe(ACTIVE_CASE.circulation);logEvent('Circulação e perfusão avaliadas.');setTimeout(renderC,900);}},
    {label:'Reconhecer alteração circulatória e priorizar suporte previsto no protocolo',primary:ACTIVE_CASE.focus==='C',locked:!observed,fn:()=>{
      if(ACTIVE_CASE.focus!=='C'){penalize(5,'Classificou como prioridade circulatória um conjunto de achados que não indicava essa gravidade.');observe('Os achados deste caso não sustentam essa prioridade em C.');return;}
      patient.v21CResolved=true;clinicalStage='D';reward(5,'Alteração prioritária em C reconhecida e encaminhada conforme protocolo de treinamento.');renderD();
    }},
    {label:'Avançar para avaliação neurológica',primary:ACTIVE_CASE.focus!=='C',locked:!observed,fn:()=>{
      if(ACTIVE_CASE.focus==='C'){penalize(8,'Avançou para D sem resolver a prioridade identificada em C.');observe('Os sinais de perfusão permanecem prioritários.');return;}
      clinicalStage='D';reward(3,'C sem ameaça imediata; avanço correto para D.');renderD();
    }},
    {label:'Começar SAMPLE',fn:()=>wrongClinical('Antecipou a história antes de concluir a avaliação primária.',4)}
  ]);
};

const v21BasePriorityResolved=v19PriorityResolved;
v19PriorityResolved=function(){if(ACTIVE_CASE?.focus==='C')return patient.v21CResolved===true||['D','E','SAMPLE','SECONDARY','DONE'].includes(clinicalStage);return v21BasePriorityResolved();};
