/* Re.Force APH — Build 58 / v58
 * Cheap contact shadows to visually anchor actors and vehicles without heavy shadow maps.
 */
let V58_SHADOW_TEX=null,V58_SHADOWS=[];
function v58ShadowTexture(){
  if(V58_SHADOW_TEX)return V58_SHADOW_TEX;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,5,64,64,60);g.addColorStop(0,'rgba(0,0,0,.72)');g.addColorStop(.45,'rgba(0,0,0,.34)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);V58_SHADOW_TEX=new THREE.CanvasTexture(c);return V58_SHADOW_TEX;
}
function v58AttachShadow(root,sx=1,sz=sx,opacity=.34){
  if(!root||root.userData?.v58Shadow)return root?.userData?.v58Shadow||null;
  const mat=new THREE.MeshBasicMaterial({map:v58ShadowTexture(),color:0x000000,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),mat);sh.rotation.x=-Math.PI/2;sh.position.y=.018;sh.renderOrder=1;sh.frustumCulled=true;root.add(sh);root.userData.v58Shadow=sh;V58_SHADOWS.push(sh);return sh;
}
function v58ApplyContactShadows(){
  if(player?.root)v58AttachShadow(player.root,.78,.58,.30);
  if(ambulance?.root)v58AttachShadow(ambulance.root,4.8,2.25,.31);
  traffic.forEach(t=>v58AttachShadow(t.root,3.5,1.75,.26));
  pedestrians.forEach(p=>v58AttachShadow(p.root,.62,.48,.24));
  curiosos.forEach(r=>v58AttachShadow(r,.62,.48,.24));
  parkedCars.forEach(c=>v58AttachShadow(c,3.5,1.75,.24));
  if(V28_PARTNER?.root)v58AttachShadow(V28_PARTNER.root,.72,.54,.28);
}
const v58BaseBuildCity=buildCity;
buildCity=function(){v58BaseBuildCity();parkedCars.forEach(c=>v58AttachShadow(c,3.5,1.75,.24));};
const v58BaseBuildActors=buildActors;
buildActors=function(){v58BaseBuildActors();v58ApplyContactShadows();};
const v58BaseBuildAccident=buildAccident;
buildAccident=function(){v58BaseBuildAccident();curiosos.forEach(r=>v58AttachShadow(r,.62,.48,.24));};
