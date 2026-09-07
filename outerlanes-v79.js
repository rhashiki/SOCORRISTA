/* Re.Force APH — Build 79 / v79
 * Proper opposing lanes and lane markings for the expanded outer ring.
 */
const V79_RING_A=[[-84.2,-67.2],[84.2,-67.2],[84.2,67.2],[-84.2,67.2]];
const V79_RING_B=[[-79.8,-62.8],[-79.8,62.8],[79.8,62.8],[79.8,-62.8]];
let V79_MARKINGS=[];
function v79ClosestOnPath(pos,path){
  let best={d:Infinity,seg:0,p:new THREE.Vector3()};
  for(let i=0;i<path.length;i++){
    const a=new THREE.Vector3(path[i][0],0,path[i][1]),b=new THREE.Vector3(path[(i+1)%path.length][0],0,path[(i+1)%path.length][1]),ab=b.clone().sub(a),len2=ab.lengthSq()||1;
    const t=clamp(pos.clone().sub(a).dot(ab)/len2,0,1),p=a.clone().addScaledVector(ab,t),d=p.distanceTo(pos);if(d<best.d)best={d,seg:i,p};
  }
  return best;
}
function v79AssignOuterLanes(){
  let i=0;traffic.forEach(t=>{if(!t.v73||!t.root)return;const path=(i++%2===0)?V79_RING_A:V79_RING_B,hit=v79ClosestOnPath(t.root.position,path);t.path=path;t.seg=hit.seg;t.root.position.x=hit.p.x;t.root.position.z=hit.p.z;});
}
function v79Mark(x,z,w,h){const p=plane(w,h,0xe5e1d5,[x,.028,z]);p.material.transparent=true;p.material.opacity=.62;p.receiveShadow=false;V79_MARKINGS.push(p);return p;}
function v79BuildLaneMarkings(){
  V79_MARKINGS=[];
  for(const z of [-65,65])for(let x=-98;x<=98;x+=8){v79Mark(x,z-2.6,3.4,.09);v79Mark(x,z+2.6,3.4,.09);}
  for(const x of [-82,82])for(let z=-98;z<=98;z+=8){v79Mark(x-2.6,z,.09,3.4);v79Mark(x+2.6,z,.09,3.4);}
}
const v79BaseBuildTraffic=buildTraffic;
buildTraffic=function(){v79BaseBuildTraffic();v79AssignOuterLanes();};
const v79BaseBuildCity=buildCity;
buildCity=function(){v79BaseBuildCity();v79BuildLaneMarkings();};
