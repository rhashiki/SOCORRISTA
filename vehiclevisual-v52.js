/* Re.Force APH — Build 52 / v52
 * Vehicle visual refinement: mirrors, bumpers, lamps, windscreen accents and plates.
 * Build 66 bugfix: ambulance uses its native longitudinal Z axis; civilian cars use X.
 */
let V52_DONE=new WeakSet();
function v52DetailCivilian(root){
  const metal=material(0x33383c,.58,.22),rubber=material(0x17191b,.86,.05),white=material(0xe9ece8,.52,.08),red=material(0xa62b25,.48,.12),amber=material(0xd08a32,.44,.1);
  box([.24,.22,1.62],0x303438,[1.72,.38,0],undefined,root).material=metal;box([.24,.22,1.62],0x303438,[-1.72,.38,0],undefined,root).material=metal;
  for(const z of [-.92,.92])box([.18,.16,.28],0x202428,[.62,1.22,z],undefined,root).material=metal;
  for(const z of [-.55,.55]){
    const f=box([.08,.18,.34],0xf0d8a0,[1.76,.64,z],undefined,root);f.material=amber;f.material.emissive=new THREE.Color(0xffc76d);f.material.emissiveIntensity=.28;
    const r=box([.08,.2,.34],0x9b2520,[-1.76,.62,z],undefined,root);r.material=red;r.material.emissive=new THREE.Color(0x8f1714);r.material.emissiveIntensity=.24;
  }
  box([.04,.18,.52],0xe8e8df,[1.87,.39,0],undefined,root).material=white;box([.05,.22,.72],0x181b1d,[1.88,.58,0],undefined,root).material=rubber;
}
function v52DetailAmbulance(root){
  const metal=material(0x3b4247,.58,.22),rubber=material(0x17191b,.86,.05),glass=material(0x263740,.24,.42),white=material(0xe9ece8,.52,.08),red=material(0xa62b25,.48,.12),amber=material(0xd08a32,.44,.1);
  // Native ambulance front is -Z and rear is +Z.
  box([1.92,.22,.24],0x303438,[0,.34,-3.30],undefined,root).material=metal;box([1.92,.22,.24],0x303438,[0,.34,2.86],undefined,root).material=metal;
  for(const x of [-1.14,1.14])box([.28,.16,.18],0x202428,[x,1.58,-2.48],undefined,root).material=metal;
  for(const x of [-.58,.58]){
    const f=box([.34,.18,.08],0xf0d8a0,[x,.76,-3.30],undefined,root);f.material=amber;f.material.emissive=new THREE.Color(0xffc76d);f.material.emissiveIntensity=.38;
    const r=box([.34,.20,.08],0x9b2520,[x,.68,2.86],undefined,root);r.material=red;r.material.emissive=new THREE.Color(0x8f1714);r.material.emissiveIntensity=.28;
  }
  box([.56,.18,.04],0xe8e8df,[0,.40,-3.38],undefined,root).material=white;box([.82,.22,.05],0x181b1d,[0,.58,-3.39],undefined,root).material=rubber;
  // Windshield depth, wipers and rear step.
  const frame=box([1.68,.76,.045],0x283945,[0,1.70,-3.21],[-.08,0,0],root);frame.material=glass;frame.material.transparent=true;frame.material.opacity=.35;
  for(const x of [-.38,.38])box([.62,.035,.035],0x141719,[x,1.45,-3.255],[0,0,x<0?.24:-.24],root);
  box([1.72,.18,.52],0x51585c,[0,.25,3.02],undefined,root);
  // Reflective side strips.
  for(const x of [-1.085,1.085]){const strip=box([.045,.075,3.9],0xe5c56d,[x,1.02,.10],undefined,root);strip.material.emissive=new THREE.Color(0x5e4616);strip.material.emissiveIntensity=.18;}
}
function v52DetailCar(root,isAmbulance=false){if(!root||V52_DONE.has(root))return;V52_DONE.add(root);if(isAmbulance)v52DetailAmbulance(root);else v52DetailCivilian(root);}
function v52ApplyVehicles(){if(ambulance?.root)v52DetailCar(ambulance.root,true);traffic.forEach(t=>v52DetailCar(t.root||t,false));parkedCars.forEach(c=>v52DetailCar(c,false));}
const v52BaseBuildActors=buildActors;
buildActors=function(){v52BaseBuildActors();v52ApplyVehicles();};
const v52BaseUpdate=update;
update=function(dt){v52BaseUpdate(dt);if((performance.now()|0)%1200<18)v52ApplyVehicles();};
