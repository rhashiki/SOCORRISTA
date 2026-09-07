/* Re.Force APH — Build 31 / v31
 * Procedural PS2-style material pass: asphalt, concrete, grass and facades.
 */

const V31_TEX_CACHE=new Map();
const V31_SURFACES={
  road:new Set([0x2f3337,0x34383c,0x17191b,0x151b20]),
  grass:new Set([0x5b7d55,0x517443,0x3d6a3e,0x3c7545]),
  concrete:new Set([0xa4a29b,0x90918d,0xc2beb6,0x77746f,0x73777a]),
  wall:new Set([0xc58f69,0xaab3b6,0xd8c39b,0x909fa9,0xb9665d,0xc7b6a4,0xe3e4df,0x252a2f])
};
function v31TypeFor(color){for(const [type,set] of Object.entries(V31_SURFACES))if(set.has(Number(color)))return type;return null;}
function v31ColorCss(hex,delta=0){const c=new THREE.Color(hex);c.offsetHSL(0,0,delta);return `#${c.getHexString()}`;}
function v31Texture(color,type){
  const key=`${Number(color)}:${type}`;if(V31_TEX_CACHE.has(key))return V31_TEX_CACHE.get(key);
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle=v31ColorCss(color,0);x.fillRect(0,0,128,128);
  let seed=(Number(color)^0x9e3779b9)>>>0;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  if(type==='road'){
    for(let i=0;i<950;i++){const v=rnd()>.52?1:-1,a=.025+rnd()*.045;x.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${a})`;const s=.5+rnd()*1.6;x.fillRect(rnd()*128,rnd()*128,s,s);}
    x.strokeStyle='rgba(255,255,255,.025)';for(let i=0;i<12;i++){x.beginPath();x.moveTo(0,rnd()*128);x.lineTo(128,rnd()*128);x.stroke();}
  }else if(type==='grass'){
    for(let i=0;i<700;i++){x.strokeStyle=`rgba(${30+Math.floor(rnd()*45)},${70+Math.floor(rnd()*65)},${25+Math.floor(rnd()*40)},.22)`;const px=rnd()*128,py=rnd()*128;x.beginPath();x.moveTo(px,py);x.lineTo(px+(rnd()-.5)*3,py-1-rnd()*4);x.stroke();}
  }else if(type==='concrete'){
    for(let i=0;i<500;i++){const q=120+Math.floor(rnd()*90),a=.025+rnd()*.05;x.fillStyle=`rgba(${q},${q},${q},${a})`;x.fillRect(rnd()*128,rnd()*128,1+rnd()*2,1+rnd()*2);}
    x.strokeStyle='rgba(40,40,40,.08)';x.lineWidth=1;x.beginPath();x.moveTo(64,0);x.lineTo(64,128);x.moveTo(0,64);x.lineTo(128,64);x.stroke();
  }else if(type==='wall'){
    for(let y=0;y<128;y+=16){x.fillStyle=y%32===0?'rgba(255,255,255,.025)':'rgba(0,0,0,.025)';x.fillRect(0,y,128,8);}
    for(let i=0;i<180;i++){const a=.02+rnd()*.04;x.fillStyle=`rgba(0,0,0,${a})`;x.fillRect(rnd()*128,rnd()*128,1+rnd()*2,1+rnd()*3);}
  }
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  const repeat=type==='road'?6:type==='grass'?5:type==='concrete'?3:2;tex.repeat.set(repeat,repeat);V31_TEX_CACHE.set(key,tex);return tex;
}

const v31BaseMaterial=material;
material=function(color,rough=.78,metal=.03){
  const m=v31BaseMaterial(color,rough,metal),type=v31TypeFor(color);
  if(type){m.map=v31Texture(color,type);m.roughness=type==='road'?.96:type==='grass'?.94:type==='concrete'?.9:.82;m.needsUpdate=true;}
  return m;
};

const v31BaseInit=init;
init=async function(){
  await v31BaseInit();
  const max=renderer?.capabilities?.getMaxAnisotropy?.()||1;
  V31_TEX_CACHE.forEach(t=>{t.anisotropy=Math.min(4,max);t.needsUpdate=true;});
  logEvent('Build 31: materiais urbanos texturizados carregados.');
};
