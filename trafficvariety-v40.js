/* Re.Force APH — Build 40 / v40
 * Mixed traffic classes for a more believable city flow.
 */

const V40_PATHS=[
  [[-68,-31],[68,-31],[68,31],[-68,31]],
  [[68,-29],[-68,-29],[-68,29],[68,29]],
  [[-49,-68],[-49,68],[49,68],[49,-68]],
  [[-47,68],[-47,-68],[47,-68],[47,68]]
];
function v40Wheel(parent,x,z,r=.28){const w=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.18,14),material(0x111315,.72,.08));w.position.set(x,.28,z);w.rotation.x=Math.PI/2;w.castShadow=true;parent.add(w);return w;}
function v40Motorcycle(color=0x7d3029){
  const g=new THREE.Group(),body=material(color,.55,.16),dark=material(0x171b1e,.72,.08);
  for(const x of [-.62,.62]){const w=new THREE.Mesh(new THREE.TorusGeometry(.34,.05,8,18),dark);w.position.set(x,.34,0);w.rotation.x=Math.PI/2;w.castShadow=true;g.add(w);}
  const frame=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.05,8),body);frame.position.set(0,.52,0);frame.rotation.z=Math.PI/2;g.add(frame);
  box([.42,.22,.34],color,[.05,.62,0],undefined,g);box([.26,.08,.30],0x20262b,[-.20,.79,0],undefined,g);g.userData.vehicleClass='moto';return g;
}
function v40Van(color=0x637483){
  const g=new THREE.Group();box([3.8,1.45,1.72],color,[0,.95,0],undefined,g);box([1.25,.52,1.50],0x31434f,[1.15,1.52,0],undefined,g);for(const x of [-1.15,1.15])for(const z of [-.78,.78])v40Wheel(g,x,z,.31);g.userData.vehicleClass='van';return g;
}
function v40Bus(color=0x8d6a3d){
  const g=new THREE.Group();box([5.0,1.65,1.82],color,[0,1.05,0],undefined,g);for(const x of [-1.65,1.65])for(const z of [-.82,.82])v40Wheel(g,x,z,.34);for(const x of [-1.2,0,1.2]){const w=box([.06,.58,.55],0x263844,[x,1.48,.92],undefined,g);w.material.transparent=true;w.material.opacity=.88;}g.userData.vehicleClass='micro';return g;
}
function v40SpawnTraffic(){
  const specs=[['moto',0,8.2],['moto',1,7.6],['van',2,5.7],['micro',3,5.0]];
  specs.forEach(([type,pi,speed],i)=>{
    const path=V40_PATHS[pi],seg=(i+1)%path.length,a=path[seg],b=path[(seg+1)%path.length],t=.25+.16*i;
    const root=type==='moto'?v40Motorcycle(i?0x345d7b:0x8b3e34):type==='van'?v40Van():v40Bus();root.position.set(a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t);scene.add(root);traffic.push({root,path,seg,cruise:speed,speed:0,v40:true});
  });
}
const v40BaseBuildTraffic=buildTraffic;
buildTraffic=function(){v40BaseBuildTraffic();v40SpawnTraffic();};
