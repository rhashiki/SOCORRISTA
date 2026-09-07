/* Re.Force APH — Build 74 / v74
 * Pedestrian life across expanded districts and park perimeter.
 */
function v74AddPed(a,b,index){
  const root=new THREE.Group(),visual=createFallbackHuman(V57_SHIRTS?.[(index+3)%V57_SHIRTS.length]||0x61717a,{role:'civilian'});root.add(visual);const t=(index*23%87)/100;root.position.set(a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t);scene.add(root);
  const p={root,a:new THREE.Vector3(a[0],0,a[1]),b:new THREE.Vector3(b[0],0,b[1]),dir:index%2?1:-1,speed:.68+(index%5)*.11,bob:index*.43,cross:false,state:'walk',pause:0,v74:true};pedestrians.push(p);
  if(typeof v57DressHuman==='function')v57DressHuman(visual,300+index);if(typeof v63AddFace==='function'&&(V16_PROFILE!=='eco'||index%2===0))v63AddFace(visual,300+index);if(typeof v58AttachShadow==='function')v58AttachShadow(root,.62,.48,.22);return p;
}
function v74BuildOuterPedestrians(){
  const routes=[
    [[-70,-72],[70,-72]], [[70,-58],[-70,-58]], [[-70,72],[70,72]], [[70,58],[-70,58]],
    [[-89,-52],[-89,52]], [[-75,52],[-75,-52]], [[89,-52],[89,52]], [[75,52],[75,-52]],
    [[-94,56],[-66,56]], [[-66,78],[-94,78]]
  ];
  const count=V16_PROFILE==='eco'?8:V16_PROFILE==='high'?18:13;for(let i=0;i<count;i++){const r=routes[i%routes.length];v74AddPed(r[0],r[1],i);}
}
const v74BaseBuildActors=buildActors;
buildActors=function(){v74BaseBuildActors();v74BuildOuterPedestrians();};
