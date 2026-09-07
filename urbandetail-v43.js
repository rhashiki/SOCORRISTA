/* Re.Force APH — Build 43 / v43
 * Urban detail pass: signs, benches, bins, hydrants, bollards and parking marks.
 */

let V43_PROPS=[];
function v43Add(parent){scene.add(parent);V43_PROPS.push(parent);return parent;}
function v43Bench(x,z,rot=0){const g=new THREE.Group();box([1.5,.12,.38],0x704f35,[0,.58,0],undefined,g);box([1.5,.58,.10],0x704f35,[0,.88,.16],[-.12,0,0],g);for(const sx of [-.58,.58])box([.10,.55,.10],0x343b40,[sx,.28,0],undefined,g);g.position.set(x,0,z);g.rotation.y=rot;return v43Add(g);}
function v43Bin(x,z){const g=new THREE.Group();cyl(.28,.72,0x3d4b47,[0,.36,0],undefined,g);cyl(.31,.08,0x22292c,[0,.75,0],undefined,g);g.position.set(x,0,z);return v43Add(g);}
function v43Hydrant(x,z){const g=new THREE.Group();cyl(.19,.62,0xb83e35,[0,.31,0],undefined,g);cyl(.25,.10,0xc54b40,[0,.63,0],undefined,g);cyl(.08,.34,0xb83e35,[.24,.38,0],[0,0,Math.PI/2],g);g.position.set(x,0,z);return v43Add(g);}
function v43Bollard(x,z){const g=new THREE.Group();cyl(.08,.82,0x4f565b,[0,.41,0],undefined,g);box([.18,.08,.18],0x2a2e31,[0,.04,0],undefined,g);g.position.set(x,0,z);return v43Add(g);}
function v43StreetSign(x,z,textA,textB){const g=new THREE.Group();cyl(.045,2.7,0x4e565b,[0,1.35,0],undefined,g);const make=(txt,y,rot)=>{const c=document.createElement('canvas');c.width=420;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#225943';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#e8eee9';ctx.lineWidth=8;ctx.strokeRect(4,4,c.width-8,c.height-8);ctx.fillStyle='#f5f6f2';ctx.font='800 34px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,210,48);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex}));sp.position.set(0,y,0);sp.scale.set(2.8,.64,1);sp.material.rotation=rot;g.add(sp);};make(textA,2.55,0);make(textB,2.28,Math.PI/2);g.position.set(x,0,z);return v43Add(g);}
function v43Parking(x,z,count=5,vertical=false){for(let i=0;i<count;i++){const px=x+(vertical?0:i*2.5),pz=z+(vertical?i*2.5:0),m=vertical?plane(.08,2.0,0xe5e3da,[px,.024,pz]):plane(2.0,.08,0xe5e3da,[px,.024,pz]);m.material.opacity=.6;m.material.transparent=true;V43_PROPS.push(m);}}
function v43Build(){
  V43_PROPS=[];
  [[-34,-22,0],[22,-22,Math.PI],[34,22,Math.PI],[ -18,22,0]].forEach(p=>v43Bench(...p));
  [[-37,-22],[25,-22],[37,22],[-21,22],[58,22],[-58,-22]].forEach(p=>v43Bin(...p));
  [[-8,-8],[8,8],[-56,8],[56,-8]].forEach(p=>v43Hydrant(...p));
  for(const [x,z,axis] of [[-7,-7,'h'],[7,7,'h'],[-55,-7,'v'],[55,7,'v']])for(let i=-1;i<=1;i++)v43Bollard(x+(axis==='h'?i*.55:0),z+(axis==='v'?i*.55:0));
  v43StreetSign(7,-7,'AV. CENTRAL','RUA 4');v43StreetSign(-55,7,'BAIRRO OESTE','AV. NORTE');v43StreetSign(55,-7,'BAIRRO LESTE','RUA PRINCIPAL');
  v43Parking(-30,-40,5,false);v43Parking(16,40,5,false);v43Parking(62,-18,5,true);
}
const v43BaseBuildCity=buildCity;
buildCity=function(){v43BaseBuildCity();v43Build();};
