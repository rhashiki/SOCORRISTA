/* Re.Force APH — Build 11 / v15
 * Neurological case pack + variable Glasgow evidence.
 */

V8_CASES.forEach(c=>{if(!c.gcs)c.gcs={E:4,V:4,M:6,eEye:'Olhos abertos espontaneamente.',eVerbal:'Responde, mas está confuso quanto ao local.',eMotor:'Obedece a comando motor simples.'};});
V8_CASES.push({
  id:'d_neuro',title:'QUEDA EM ESCADA',qth:'Setor Norte • Galeria Central',priority:'ALTA',info:'Vítima caída em acesso de pedestres',
  focus:'D',visual:'Não há hemorragia externa importante evidente na varredura inicial.',
  airway:'A vítima mantém resposta vocal quando chamada.',breathing:'Expansão torácica simétrica, sem esforço respiratório importante.',
  spo2:96,bp:'118/76',witness:'“Ela caiu alguns degraus e ficou sonolenta logo depois.”',
  gcs:{E:3,V:4,M:6,eEye:'Os olhos permanecem fechados em repouso e abrem quando a vítima é chamada.',eVerbal:'A vítima responde, mas apresenta confusão sobre o local.',eMotor:'Obedece ao comando motor simples solicitado.'}
});
V12_LOCATIONS.d_neuro={pos:[-4,0,32],qth:'Setor Norte • Galeria Central'};

const v15BaseBuildAccident=buildAccident;
buildAccident=function(){
  if(ACTIVE_CASE?.id!=='d_neuro')return v15BaseBuildAccident();
  clinicalZones.length=0;curiosos.length=0;
  for(let i=0;i<7;i++)box([5,.25,.72],0x77746f,[ACCIDENT_POS.x,.13+i*.25,ACCIDENT_POS.z-1.9+i*.62]);
  box([.10,2.2,4.6],0x555a5e,[ACCIDENT_POS.x-2.25,1.4,ACCIDENT_POS.z+.3],[0,0,.0]);
  box([.10,2.2,4.6],0x555a5e,[ACCIDENT_POS.x+2.25,1.4,ACCIDENT_POS.z+.3],[0,0,.0]);
  v12Cone(-2.7,-2.4);v12Cone(2.7,-2.4);
  patient.anchor=new THREE.Group();patient.anchor.position.copy(ACCIDENT_POS).add(new THREE.Vector3(.3,.05,2.0));patient.anchor.rotation.z=-Math.PI/2;scene.add(patient.anchor);
  patient.visual=createFallbackHuman(0x48566a,{role:'civilian',skin:0xa96f51});patient.anchor.add(patient.visual);
  const stainMat=new THREE.MeshStandardMaterial({color:0x5f1715,roughness:1,transparent:true,opacity:0});patient.pool=mesh(new THREE.CircleGeometry(.3,18),stainMat,[ACCIDENT_POS.x,.017,ACCIDENT_POS.z+2],[-Math.PI/2,0,0]);patient.pool.visible=false;
  const patchMat=new THREE.MeshBasicMaterial({color:0x731d19,transparent:true,opacity:0});patient.patch=mesh(new THREE.PlaneGeometry(.2,.12),patchMat,[0,.34,.18],[0,0,0],patient.anchor);patient.patch.visible=false;
  const zones=[['head',1.65],['neck',1.43],['chest',1.15],['abdomen',.93],['pelvis',.72],['limbs',.38],['back',1.08]];
  zones.forEach(([name,y])=>{const z=mesh(new THREE.BoxGeometry(name==='limbs'?.65:.45,name==='limbs'?.55:.28,.55),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),[0,y,name==='back'?-.28:0],[0,0,0],patient.anchor);z.userData.region=name;clinicalZones.push(z);});
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2,r=new THREE.Group();r.add(createFallbackHuman([0x586878,0x725f55,0x5d6f60][i%3],{role:'civilian'}));r.position.copy(ACCIDENT_POS).add(new THREE.Vector3(Math.cos(a)*3.6,0,Math.sin(a)*3.1));r.lookAt(patient.anchor.position);scene.add(r);curiosos.push(r);}
};

const v15BaseRenderD=renderD;
renderD=function(){
  const g=ACTIVE_CASE?.gcs;if(!g)return v15BaseRenderD();
  const ev=patient.gcsEvidence;
  openInteraction('Avaliação neurológica','PACIENTE','Obtenha as três respostas observáveis antes de registrar Glasgow.',[
    {label:'Observar abertura ocular',done:ev.has('E'),fn:()=>{ev.add('E');observe(g.eEye);setTimeout(renderD,780);}},
    {label:'Perguntar nome e local',done:ev.has('V'),fn:()=>{ev.add('V');observe(g.eVerbal);setTimeout(renderD,780);}},
    {label:'Pedir um comando motor simples',done:ev.has('M'),fn:()=>{ev.add('M');observe(g.eMotor);setTimeout(renderD,780);}},
    {label:'Registrar Glasgow',primary:true,locked:ev.size<3,fn:()=>{$('#glasgowEvidence').textContent=`${g.eEye} ${g.eVerbal} ${g.eMotor}`;$('#glasgowModal').hidden=false;}}
  ]);
};

saveGlasgow=function(){
  const e=+$('#gE').value,v=+$('#gV').value,m=+$('#gM').value;if(!e||!v||!m){flash('Preencha E, V e M.');return;}
  $('#glasgowModal').hidden=true;const g=ACTIVE_CASE?.gcs||{E:4,V:4,M:6};
  if(e===g.E&&v===g.V&&m===g.M)reward(5,`Glasgow interpretado corretamente: E${g.E} V${g.V} M${g.M} = ${g.E+g.V+g.M}.`);
  else penalize(8,`Glasgow registrado como E${e} V${v} M${m}; as respostas observadas correspondiam a E${g.E} V${g.V} M${g.M}.`);
  clinicalStage='E';renderE();
};
