/* Re.Force APH — Build 87 / v87
 * Expanded-district facade pass: storefront glazing, doors, awnings and signage rhythm.
 */
let V87_FACADES=[];
function v87Mat(color,rough=.82,metal=.03,emissive=null,intensity=0){const m=new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});if(emissive!=null){m.emissive=new THREE.Color(emissive);m.emissiveIntensity=intensity;}return m;}
function v87Add(root,size,pos,mat){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;}
function v87FacadeFor(b,i){
  if(Math.abs(b.x)<70&&Math.abs(b.z)<55)return;
  const g=new THREE.Group();g.position.set(b.x,0,b.z);scene.add(g);V87_FACADES.push(g);
  const front=-b.d/2-.08,glass=v87Mat(0x29414d,.28,.36,0x15242b,.14),frame=v87Mat(0x32383c,.62,.18),sign=v87Mat([0xb45b45,0x5d8794,0x8b7044,0x6f7d59][i%4],.68,.04,0x3a2619,.22),door=v87Mat(0x202b31,.34,.28);
  const cols=Math.max(2,Math.min(4,Math.floor(b.w/5)));
  for(let c=0;c<cols;c++){
    const x=-b.w*.34+(cols===1?0:c*(b.w*.68/(cols-1)));
    v87Add(g,[Math.min(2.0,b.w/cols*.62),1.75,.06],[x,1.45,front],glass);
    v87Add(g,[.07,1.9,.08],[x-Math.min(.9,b.w/cols*.28),1.45,front-.03],frame);
  }
  v87Add(g,[Math.min(3.2,b.w*.24),2.05,.08],[0,1.35,front-.03],door);
  v87Add(g,[Math.min(7,b.w*.68),.48,.13],[0,3.15,front-.12],sign);
  if(i%2===0)v87Add(g,[Math.min(7.8,b.w*.72),.16,1.15],[0,2.72,front-.62],v87Mat(i%4===0?0x8a4e45:0x546b75,.86,.03));
  if(i%3===0){const lamp=v87Add(g,[.30,.18,.18],[b.w*.32,3.45,front-.18],v87Mat(0xf0dfb2,.5,.06,0xc49d52,.55));lamp.castShadow=false;}
}
function v87BuildOuterFacades(){V87_FACADES=[];let i=0;buildings.forEach(b=>v87FacadeFor(b,i++));}
const v87BaseBuildCity=buildCity;
buildCity=function(){v87BaseBuildCity();v87BuildOuterFacades();};
