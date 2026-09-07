/* Re.Force APH — Build 55 / v55
 * Scene composition pass: contextual, non-graphic props and readable focal lighting.
 */
let V55_PROPS=[];
function v55PropBox(size,color,pos,rot=[0,0,0]){const o=box(size,color,pos,rot);V55_PROPS.push(o);return o;}
function v55AddBag(x,z,color=0x3b4650){
  const g=new THREE.Group();g.position.set(x,.08,z);scene.add(g);V55_PROPS.push(g);
  box([.65,.22,.48],color,[0,.14,0],[.08,.2,.03],g);box([.07,.28,.5],0x20262b,[-.27,.20,0],[0,0,.18],g);box([.07,.28,.5],0x20262b,[.27,.20,0],[0,0,-.18],g);return g;
}
function v55AddHelmet(x,z,color=0x2f3a42){
  const g=new THREE.Group();g.position.set(x,.12,z);scene.add(g);V55_PROPS.push(g);
  const h=mesh(new THREE.SphereGeometry(.28,14,9,0,Math.PI*2,0,Math.PI*.62),material(color,.55,.12),[0,.16,0],[.15,.3,.2],g);h.scale.set(1.08,.78,1);box([.38,.04,.06],0x1d2022,[.05,.05,.18],[0,.3,0],g);return g;
}
function v55BuildSceneQuality(){
  V55_PROPS=[];if(!ACTIVE_CASE||!patient?.anchor)return;
  const x=ACCIDENT_POS.x,z=ACCIDENT_POS.z,id=ACTIVE_CASE.id;
  if(['x_external','a_airway','b_breathing','stable_primary'].includes(id)){
    v55AddHelmet(x-2.2,z+1.8,id==='stable_primary'?0x345c73:0x2b3035);
    v55AddBag(x+2.5,z+2.1,0x41474d);
    for(let i=0;i<6;i++)v55PropBox([rand(.05,.16),rand(.025,.07),rand(.05,.14)],[0x454749,0x67615b,0x2e3235][i%3],[x+rand(-2.8,2.8),.045,z+rand(-1.7,1.7)],[rand(0,.4),rand(0,3),rand(0,.4)]);
  }
  if(id==='d_neuro'){
    v55AddBag(x-1.5,z+2.7,0x55606b);v55PropBox([.32,.035,.18],0x171a1c,[x+.75,.05,z+2.4],[0,.8,0]);
  }
  if(id==='c_perfusion'){
    v55AddBag(x+1.7,z+1.8,0x4b554b);v55AddHelmet(x-1.9,z+.9,0x70443a);
  }
  // subtle scene illumination that points to the work area without exposing the answer.
  if(typeof V16_PROFILE==='undefined'||V16_PROFILE!=='eco'){
    const light=new THREE.SpotLight(0xffe3bb,.75,20,Math.PI/5,.5,1.7);light.position.set(x-5,7,z-4);light.target=patient.anchor;scene.add(light);V55_PROPS.push(light);
  }
}
const v55BaseBuildAccident=buildAccident;
buildAccident=function(){v55BaseBuildAccident();v55BuildSceneQuality();};
