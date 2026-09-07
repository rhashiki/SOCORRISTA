/* Re.Force APH — Build 83 / v83
 * Ambulance 2.0: body segmentation, grille, glazing, compartments, hubs and emergency markings.
 */
let V83_DONE=false;
function v83B(parent,size,pos,color,rot=[0,0,0],rough=.72,metal=.08){const m=box(size,color,pos,rot,parent);m.material.roughness=rough;m.material.metalness=metal;m.castShadow=true;m.receiveShadow=true;return m;}
function v83BuildAmbulanceQuality(){
  if(V83_DONE||!ambulance?.root)return;V83_DONE=true;const r=ambulance.root;
  const dark=0x252c31,glass=0x263a45,white=0xe8ebe9,red=0xb42e28,silver=0x7b858a,black=0x141719;
  // Front fascia and grille, native front = -Z.
  v83B(r,[1.72,.34,.12],[0,.63,-3.43],dark,[0,0,0],.52,.24);
  for(let x=-.64;x<=.64;x+=.22)v83B(r,[.08,.20,.035],[x,.63,-3.505],silver,[0,0,0],.46,.30);
  v83B(r,[.72,.10,.035],[0,.87,-3.505],red,[0,0,0],.58,.08);
  // Windshield divider and side glazing.
  v83B(r,[.055,.72,.055],[0,1.71,-3.27],black,[0,0,0],.7,.12);
  for(const x of [-1.07,1.07]){
    const side=v83B(r,[.045,.66,.94],[x,1.72,-2.55],glass,[0,0,0],.24,.36);side.material.transparent=true;side.material.opacity=.56;
    v83B(r,[.065,.055,.92],[x,1.40,-2.55],black);
  }
  // Side service door / equipment-compartment seams and handles.
  for(const x of [-1.112,1.112]){
    for(const z of [-.75,.55,1.58]){
      v83B(r,[.032,1.18,.04],[x,1.35,z],0x6e7578,[0,0,0],.7,.18);
      v83B(r,[.038,.05,1.00],[x,1.93,z],0x6e7578,[0,0,0],.7,.18);
      v83B(r,[.055,.08,.22],[x+(x<0?-.018:.018),1.53,z-.34],dark,[0,0,0],.55,.22);
    }
  }
  // Rear doors, windows and high-level lamps.
  for(const x of [-.48,.48]){
    const rw=v83B(r,[.72,.55,.035],[x,1.80,2.89],glass,[0,0,0],.24,.34);rw.material.transparent=true;rw.material.opacity=.58;
    v83B(r,[.06,1.72,.04],[x<0?-.88:.88,1.37,2.91],0x6f777b);
    const lamp=v83B(r,[.22,.18,.04],[x,2.33,2.94],red,[0,0,0],.42,.08);lamp.material.emissive=new THREE.Color(0x751814);lamp.material.emissiveIntensity=.42;
  }
  // Roof equipment and side scene lights.
  v83B(r,[1.15,.26,1.25],[0,2.62,.55],white,[0,0,0],.82,.03);
  v83B(r,[.78,.12,.88],[0,2.77,.55],silver,[0,0,0],.62,.16);
  for(const x of [-1.115,1.115])for(const z of [-.85,.55]){const s=v83B(r,[.035,.22,.54],[x,2.18,z],0xf0e6bd,[0,0,0],.5,.06);s.material.emissive=new THREE.Color(0x6b5e38);s.material.emissiveIntensity=.22;}
  // Wheel hubs and wheel-arch accents.
  for(const x of [-1.0,1.0])for(const z of [-1.65,1.65]){
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.235,14),new THREE.MeshStandardMaterial({color:0x8c9599,roughness:.42,metalness:.45}));hub.position.set(x,.38,z);hub.rotation.z=Math.PI/2;r.add(hub);
  }
  // High-visibility rear chevrons, deliberately fictional Re.Force pattern.
  for(let i=0;i<7;i++){const x=-.72+i*.24;const c=i%2?0xe5c666:red;v83B(r,[.19,.07,.035],[x,.95,2.965],c,[0,0,(i%2?.38:-.38)],.55,.05);}
  // Body shadow break to reduce the single-box look.
  v83B(r,[2.13,.045,4.72],[0,.78,.32],0x8b9294,[0,0,0],.72,.12);
}
const v83BaseBuildActors=buildActors;
buildActors=function(){v83BaseBuildActors();v83BuildAmbulanceQuality();};
const v83BaseInit=init;
init=async function(){await v83BaseInit();v83BuildAmbulanceQuality();};
