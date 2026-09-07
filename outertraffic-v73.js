/* Re.Force APH — Build 73 / v73
 * Outer-district traffic loops and signal-aware intersections.
 */
const V73_OUTER_PATHS=[
  [[-82,-65],[82,-65],[82,65],[-82,65]],
  [[82,65],[-82,65],[-82,-65],[82,-65]]
];
let V73_LIGHTS_BUILT=false;
function v73AddOuterLights(){
  if(V73_LIGHTS_BUILT)return;V73_LIGHTS_BUILT=true;
  for(const x of [-82,82])for(const z of [-65,65]){
    addTrafficLight(x-6.1,z-6.1,'H');addTrafficLight(x+6.1,z+6.1,'H');addTrafficLight(x-6.1,z+6.1,'V');addTrafficLight(x+6.1,z-6.1,'V');
  }
}
function v73SpawnOuterTraffic(){
  const count=V16_PROFILE==='eco'?6:V16_PROFILE==='high'?12:9;
  for(let i=0;i<count;i++){
    const path=V73_OUTER_PATHS[i%2],seg=i%4,a=path[seg],b=path[(seg+1)%4],t=.12+((i*17)%70)/100;
    let root;if(i%6===0&&typeof v40Van==='function')root=v40Van([0x596b77,0x746453][i%2]);else if(i%7===0&&typeof v40Motorcycle==='function')root=v40Motorcycle(i%2?0x315f78:0x85463c);else root=createCar([0x58758a,0x80564b,0x6f7169,0x4d6756,0x887142][i%5]);
    root.position.set(a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t);scene.add(root);traffic.push({root,path,seg,cruise:4.8+(i%4)*.7,speed:0,v73:true});if(typeof v58AttachShadow==='function')v58AttachShadow(root,3.5,1.75,.23);
  }
}
function v73OuterRed(pos,dir,axis){
  if(signalAllows(axis))return false;
  for(const ix of [-82,82])for(const iz of [-65,65]){const v=new THREE.Vector3(ix-pos.x,0,iz-pos.z),ahead=v.dot(dir),lateral=Math.abs(axis==='H'?iz-pos.z:ix-pos.x);if(ahead>0&&ahead<7.2&&lateral<2.4)return true;}
  return false;
}
const v73BaseApproaching=approachingRedLight;
approachingRedLight=function(pos,dir,axis){return v73BaseApproaching(pos,dir,axis)||v73OuterRed(pos,dir,axis);};
const v73BaseBuildTraffic=buildTraffic;
buildTraffic=function(){v73BaseBuildTraffic();v73AddOuterLights();v73SpawnOuterTraffic();};
