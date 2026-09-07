/* Re.Force APH — Build 65 / v65
 * Urban atmosphere pass: emissive commercial signs and environment-aware fill lights.
 */
let V65_SIGNS=[],V65_LIGHTS=[];
function v65SignTexture(text,color='#f1c66d'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle='rgba(12,15,18,.92)';x.fillRect(0,0,512,128);x.strokeStyle=color;x.lineWidth=5;x.strokeRect(8,8,496,112);x.shadowBlur=14;x.shadowColor=color;x.fillStyle=color;x.font='900 50px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,66);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function v65AddSign(text,x,y,z,color=0xf0b85f,scale=4.6){
  const tex=v65SignTexture(text,'#'+new THREE.Color(color).getHexString()),mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false});mat.color.setHex(0xffffff);const s=new THREE.Sprite(mat);s.position.set(x,y,z);s.scale.set(scale,1.15,1);scene.add(s);V65_SIGNS.push(s);return s;
}
function v65BuildNightLife(){
  V65_SIGNS=[];
  [['CAFÉ',-26,3.5,-21,0xe0a052],['MERCADO',25,3.6,-21,0x67b7c6],['OFICINA',-59,3.4,7,0xe46d55],['FARMÁCIA',59,3.5,-7,0x69b881],['LANCHES',-25,3.5,21,0xd1a45d],['HOTEL',25,6.5,21,0xb990d6]].forEach(v=>v65AddSign(v[0],v[1],v[2],v[3],v[4],v[0]==='MERCADO'?5.3:4.3));
}
function v65ApplyAtmosphere(){
  if(!scene||!renderer)return;const id=V24_ENV?.id||'day',night=['night','rain','sunset'].includes(id);renderer.toneMappingExposure=id==='night'?1.18:id==='rain'?1.08:id==='sunset'?1.10:1.03;
  V65_SIGNS.forEach(s=>{s.material.opacity=night?1:.76;});
  if(!night||V16_PROFILE==='eco')return;
  const pts=[[-26,3.2,-19,0xe0a052],[25,3.2,-19,0x67b7c6],[-57,3.1,7,0xe46d55],[57,3.1,-7,0x69b881]];
  pts.forEach(([x,y,z,c])=>{const l=new THREE.PointLight(c,id==='night'?1.15:.72,9,2);l.position.set(x,y,z);l.castShadow=false;scene.add(l);V65_LIGHTS.push(l);});
}
const v65BaseBuildCity=buildCity;
buildCity=function(){v65BaseBuildCity();v65BuildNightLife();};
const v65BaseInit=init;
init=async function(){V65_SIGNS=[];V65_LIGHTS=[];await v65BaseInit();v65ApplyAtmosphere();};
