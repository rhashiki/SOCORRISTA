/* Re.Force APH — Build 52 / v52
 * Vehicle visual refinement: mirrors, bumpers, lamps, windscreen accents and plates.
 */
let V52_DONE=new WeakSet();
function v52DetailCar(root,isAmbulance=false){
  if(!root||V52_DONE.has(root))return;V52_DONE.add(root);
  const metal=material(0x33383c,.58,.22),rubber=material(0x17191b,.86,.05),glass=material(0x263740,.24,.42),white=material(0xe9ece8,.52,.08),red=material(0xa62b25,.48,.12),amber=material(0xd08a32,.44,.1);
  // bumpers
  box([.24,.22,1.62],0x303438,[1.72,.38,0],undefined,root).material=metal;
  box([.24,.22,1.62],0x303438,[-1.72,.38,0],undefined,root).material=metal;
  // mirrors
  for(const z of [-.92,.92]){box([.18,.16,.28],0x202428,[.62,1.22,z],undefined,root).material=metal;}
  // lamps
  for(const z of [-.55,.55]){
    const f=box([.08,.18,.34],0xf0d8a0,[1.76,.64,z],undefined,root);f.material=amber;f.material.emissive=new THREE.Color(0xffc76d);f.material.emissiveIntensity=.28;
    const r=box([.08,.2,.34],0x9b2520,[-1.76,.62,z],undefined,root);r.material=red;r.material.emissive=new THREE.Color(0x8f1714);r.material.emissiveIntensity=.24;
  }
  // plate and lower grille
  box([.04,.18,.52],0xe8e8df,[1.87,.39,0],undefined,root).material=white;
  box([.05,.22,.72],0x181b1d,[1.88,.58,0],undefined,root).material=rubber;
  if(isAmbulance){
    // front windscreen frame + wipers + rear step
    box([.05,.84,1.38],0x283945,[1.15,1.62,0],undefined,root).material=glass;
    for(const z of [-.38,.38])box([.035,.035,.72],0x141719,[1.19,1.38,z],[0,0,z<0?-.35:.35],root);
    box([.52,.18,1.55],0x51585c,[-2.18,.28,0],undefined,root);
    box([.05,.52,1.35],0xe9ece8,[-2.22,1.34,0],undefined,root).material=white;
    // reflective side bars
    for(const z of [-.86,.86]){const strip=box([2.8,.07,.05],0xe5c56d,[-.35,1.05,z],undefined,root);strip.material.emissive=new THREE.Color(0x5e4616);strip.material.emissiveIntensity=.18;}
  }
}
function v52ApplyVehicles(){
  if(ambulance?.root)v52DetailCar(ambulance.root,true);
  traffic.forEach(t=>v52DetailCar(t.root||t,false));
  parkedCars.forEach(c=>v52DetailCar(c,false));
}
const v52BaseBuildActors=buildActors;
buildActors=function(){v52BaseBuildActors();v52ApplyVehicles();};
const v52BaseUpdate=update;
update=function(dt){v52BaseUpdate(dt);if((performance.now()|0)%1200<18)v52ApplyVehicles();};
