/* Re.Force APH — Build 75 / v75
 * Grid-aware route generation for the expanded city.
 */
const V75_X=[-82,-48,0,48,82],V75_Z=[-65,-30,0,30,65];
function v75Nearest(v,list){let best=list[0],d=Math.abs(v-best);for(const n of list){const nd=Math.abs(v-n);if(nd<d){best=n;d=nd;}}return best;}
function v75SnapToRoad(p){
  const nx=v75Nearest(p.x,V75_X),nz=v75Nearest(p.z,V75_Z),dx=Math.abs(p.x-nx),dz=Math.abs(p.z-nz);
  return dx<dz?{point:new THREE.Vector3(nx,0,p.z),axis:'V',node:new THREE.Vector3(nx,0,v75Nearest(p.z,V75_Z))}:{point:new THREE.Vector3(p.x,0,nz),axis:'H',node:new THREE.Vector3(v75Nearest(p.x,V75_X),0,nz)};
}
function v75PushUnique(arr,p){const last=arr[arr.length-1];if(!last||last.distanceToSquared(p)>.04)arr.push(p.clone());}
function v75GridRoute(from,to){
  const a=v75SnapToRoad(from),b=v75SnapToRoad(to),out=[];v75PushUnique(out,from);v75PushUnique(out,a.point);v75PushUnique(out,a.node);
  // Choose the two valid Manhattan alternatives and prefer fewer direction changes relative to entry axis.
  const viaX=new THREE.Vector3(b.node.x,0,a.node.z),viaZ=new THREE.Vector3(a.node.x,0,b.node.z);
  const costX=a.node.distanceTo(viaX)+viaX.distanceTo(b.node)+(a.axis==='H'?0:.8)+(b.axis==='V'?0:.4);
  const costZ=a.node.distanceTo(viaZ)+viaZ.distanceTo(b.node)+(a.axis==='V'?0:.8)+(b.axis==='H'?0:.4);
  v75PushUnique(out,costX<=costZ?viaX:viaZ);v75PushUnique(out,b.node);v75PushUnique(out,b.point);v75PushUnique(out,to);return out;
}
v17RoutePoints=function(from,to){return v75GridRoute(from,to);};
function v75RouteLength(from,to){const p=v75GridRoute(from,to);let n=0;for(let i=1;i<p.length;i++)n+=p[i-1].distanceTo(p[i]);return n;}
const v75BaseNav=v17UpdateNavigation;
v17UpdateNavigation=function(){v75BaseNav();if(!V17_ARROW||controlled!=='vehicle'||!['EN_ROUTE','AT_SCENE_VEHICLE'].includes(phase))return;const b=V17_ARROW.querySelector('b');if(b)b.textContent=`${Math.round(v75RouteLength(ambulance.root.position,ACCIDENT_POS))} m`;};
