/* Re.Force APH — Build 56 / v56
 * Lightweight procedural texture pass inspired by early-3D/PS2 readability.
 * No external image dependency; keeps mobile memory predictable.
 */
let V56_TEX={};
function v56NoiseTexture(kind='wall'){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const base=kind==='asphalt'?48:kind==='concrete'?185:kind==='grass'?118:220;
  x.fillStyle=`rgb(${base},${base},${base})`;x.fillRect(0,0,256,256);
  const count=kind==='asphalt'?2500:kind==='grass'?1800:950;
  for(let i=0;i<count;i++){
    const d=(Math.random()-.5)*(kind==='asphalt'?42:kind==='grass'?54:26),a=kind==='wall'?.08:.15;
    x.fillStyle=`rgba(${Math.max(0,base+d)},${Math.max(0,base+d)},${Math.max(0,base+d)},${a})`;
    const s=kind==='grass'?1+Math.random()*3:1+Math.random()*1.5;x.fillRect(Math.random()*256,Math.random()*256,s,s);
  }
  if(kind==='asphalt'){
    x.strokeStyle='rgba(20,20,20,.15)';x.lineWidth=1;
    for(let i=0;i<9;i++){x.beginPath();let px=Math.random()*256,py=Math.random()*256;x.moveTo(px,py);for(let k=0;k<5;k++){px+=Math.random()*32-16;py+=Math.random()*28;x.lineTo(px,py);}x.stroke();}
  }
  if(kind==='concrete'){
    x.strokeStyle='rgba(80,80,80,.12)';x.lineWidth=1;x.beginPath();x.moveTo(128,0);x.lineTo(128,256);x.moveTo(0,128);x.lineTo(256,128);x.stroke();
  }
  if(kind==='wall'){
    x.strokeStyle='rgba(70,70,70,.07)';for(let y=32;y<256;y+=32){x.beginPath();x.moveTo(0,y);x.lineTo(256,y);x.stroke();}
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer?.capabilities?.getMaxAnisotropy?.()||1);return t;
}
function v56Get(kind){if(!V56_TEX[kind])V56_TEX[kind]=v56NoiseTexture(kind);return V56_TEX[kind];}
function v56CloneMap(kind,rx=2,ry=2){const t=v56Get(kind).clone();t.needsUpdate=true;t.repeat.set(rx,ry);return t;}
function v56ApplyTextures(){
  if(!scene)return;let wallCount=0,groundCount=0;
  scene.traverse(o=>{
    if(!o.isMesh||!o.material||Array.isArray(o.material))return;
    const m=o.material,g=o.geometry,p=g?.parameters||{},hex=m.color?.getHex?.();
    if(g?.type==='PlaneGeometry'&&Math.abs(o.rotation.x+Math.PI/2)<.08){
      if(hex===0x2f3337||hex===0x4b4e50){m.map=v56CloneMap('asphalt',6,6);m.roughness=.96;groundCount++;}
      else if(hex===0xa4a29b||hex===0xc2beb6){m.map=v56CloneMap('concrete',4,4);m.roughness=.92;groundCount++;}
      else if(hex===0x5b7d55){m.map=v56CloneMap('grass',8,8);m.roughness=1;groundCount++;}
      if(m.map)m.needsUpdate=true;
      return;
    }
    if(g?.type==='BoxGeometry'&&!m.map){
      const w=p.width||0,h=p.height||0,d=p.depth||0;
      if(h>=6&&(w>=8||d>=8)){m.map=v56CloneMap('wall',Math.max(1,w/7),Math.max(1,h/4));m.roughness=Math.max(.72,m.roughness||.8);m.needsUpdate=true;wallCount++;}
    }
  });
  window.V56_TEXTURE_STATS={walls:wallCount,ground:groundCount};
}
const v56BaseBuildCity=buildCity;
buildCity=function(){v56BaseBuildCity();v56ApplyTextures();};
