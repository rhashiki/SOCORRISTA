/* Re.Force APH — Build 77 / v77
 * District landmarks for spatial identity and wayfinding in the expanded city.
 */
let V77_LANDMARKS=[];
function v77Mat(color,rough=.82,metal=.04,emissive=null,intensity=0){
  const m=new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
  if(emissive!=null){m.emissive=new THREE.Color(emissive);m.emissiveIntensity=intensity;}
  return m;
}
function v77Box(parent,size,pos,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function v77Landmark(label,x,z,builder){
  const g=new THREE.Group();g.position.set(x,0,z);g.userData.v77Label=label;scene.add(g);V77_LANDMARKS.push(g);builder(g);return g;
}
function v77BuildLandmarks(){
  V77_LANDMARKS=[];
  // Oeste: relógio urbano no parque.
  v77Landmark('PARQUE OESTE',-79,67,g=>{
    const stone=v77Mat(0x7c7770,.96,.01),metal=v77Mat(0x343b40,.55,.22),face=v77Mat(0xe6dfc9,.68,.03,0x6d5a32,.18);
    v77Box(g,[2.8,.35,2.8],[0,.18,0],stone);v77Box(g,[.48,5.2,.48],[0,2.75,0],stone);
    const clock=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,.22,24),face);clock.rotation.x=Math.PI/2;clock.position.set(0,5.0,-.18);g.add(clock);
    for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.08,.75,.05),metal);arm.position.set(0,5.0,-.32);arm.rotation.z=a;g.add(arm);}
    v77Box(g,[2.5,.15,.35],[0,3.8,0],metal);
  });
  // Norte: torre de água industrial.
  v77Landmark('TORRE NORTE',18,91,g=>{
    const leg=v77Mat(0x596268,.58,.18),tank=v77Mat(0x8c989c,.62,.14),band=v77Mat(0xb74a3d,.52,.10);
    for(const x of [-1.5,1.5])for(const z of [-1.5,1.5]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,7.5,8),leg);p.position.set(x,3.75,z);g.add(p);}
    const t=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.25,3.0,18),tank);t.position.y=8.2;t.castShadow=true;g.add(t);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.55,.12,8,24),band);ring.rotation.x=Math.PI/2;ring.position.y=8.2;g.add(ring);
  });
  // Leste: prédio comercial de esquina com letreiro luminoso.
  v77Landmark('CENTRO COMERCIAL LESTE',91,31,g=>{
    const shell=v77Mat(0x746f70,.84,.03),glass=v77Mat(0x263b49,.28,.42,0x172833,.16),sign=v77Mat(0xe0d5b7,.55,.06,0xb75b2e,.55);
    v77Box(g,[12,13,10],[0,6.5,0],shell);
    for(let f=0;f<4;f++)for(const x of [-4,-2,0,2,4])v77Box(g,[1.3,1.35,.08],[x,2.0+f*2.7,-5.05],glass);
    v77Box(g,[7,.65,.22],[0,3.0,-5.28],sign);v77Box(g,[3.2,2.8,.12],[0,1.45,-5.18],glass);
  });
  // Sul: terminal urbano/cobertura longa.
  v77Landmark('TERMINAL SUL',-26,-91,g=>{
    const roof=v77Mat(0x424c52,.58,.18),post=v77Mat(0x6c7377,.62,.16),glass=v77Mat(0x2b3f49,.26,.34);
    v77Box(g,[18,.28,5.2],[0,3.6,0],roof);
    for(const x of [-7.5,-2.5,2.5,7.5])v77Box(g,[.18,3.5,.18],[x,1.75,0],post);
    for(const x of [-5,0,5])v77Box(g,[4.2,2.1,.10],[x,1.7,2.15],glass);
    v77Box(g,[10,.42,.20],[0,3.15,-2.72],v77Mat(0xd7c391,.52,.04,0x5b431c,.22));
  });
}
const v77BaseBuildCity=buildCity;
buildCity=function(){v77BaseBuildCity();v77BuildLandmarks();};
