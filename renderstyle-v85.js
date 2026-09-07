/* Re.Force APH — Build 85 / v85
 * PS2-inspired open-world render polish: distance haze, balanced exposure, softer shadows and sun glow.
 */
let V85_SUN=null,V85_APPLIED='';
function v85SunTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,2,64,64,60);g.addColorStop(0,'rgba(255,241,190,.95)');g.addColorStop(.18,'rgba(255,208,128,.60)');g.addColorStop(.55,'rgba(255,174,96,.16)');g.addColorStop(1,'rgba(255,160,80,0)');x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function v85FindLights(){let hemi=null,sun=null;scene?.traverse?.(o=>{if(o.isHemisphereLight&&!hemi)hemi=o;if(o.isDirectionalLight&&o.castShadow&&!sun)sun=o;});return{hemi,sun};}
function v85ApplyRenderStyle(force=false){
  if(!scene||!renderer||!camera)return;const id=V24_ENV?.id||'day';if(!force&&V85_APPLIED===id)return;V85_APPLIED=id;
  const presets={
    day:{bg:0x89abc0,fog:0x91adba,near:92,far:215,exp:1.04,hemi:1.72,sun:2.65},
    sunset:{bg:0xc58e72,fog:0xc09a84,near:74,far:188,exp:1.08,hemi:1.48,sun:2.30},
    night:{bg:0x273746,fog:0x344551,near:62,far:165,exp:1.14,hemi:1.22,sun:1.15},
    rain:{bg:0x687882,fog:0x71808a,near:58,far:158,exp:1.06,hemi:1.38,sun:1.45}
  },p=presets[id]||presets.day;
  scene.background=new THREE.Color(p.bg);scene.fog=new THREE.Fog(p.fog,p.near,p.far);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const profile=typeof V16_PROFILE==='string'?V16_PROFILE:'balanced';renderer.toneMappingExposure=p.exp+(profile==='eco'?-.015:profile==='high'?.02:0);
  renderer.shadowMap.enabled=profile!=='eco';renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const {hemi,sun}=v85FindLights();if(hemi){hemi.intensity=p.hemi;hemi.color.setHex(id==='sunset'?0xffd1b2:id==='night'?0x9db6cc:0xddeeff);hemi.groundColor.setHex(id==='night'?0x252c31:0x5d4b39);}
  if(sun){sun.intensity=p.sun;sun.color.setHex(id==='sunset'?0xffc08a:id==='night'?0xa9bfd0:0xffe5bd);sun.shadow.bias=-.00035;sun.shadow.normalBias=.035;sun.shadow.radius=2.0;}
  if(!V85_SUN&&id!=='night'&&id!=='rain'){
    const mat=new THREE.SpriteMaterial({map:v85SunTexture(),transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,opacity:id==='sunset'?.88:.58});V85_SUN=new THREE.Sprite(mat);V85_SUN.scale.set(22,22,1);scene.add(V85_SUN);
  }
  if(V85_SUN){V85_SUN.visible=id!=='night'&&id!=='rain';V85_SUN.material.opacity=id==='sunset'?.88:.52;V85_SUN.position.set(id==='sunset'?-72:-92,id==='sunset'?30:58,id==='sunset'?108:132);}
}
const v85BaseInit=init;
init=async function(){await v85BaseInit();v85ApplyRenderStyle(true);};
const v85BaseUpdate=update;
update=function(dt){v85BaseUpdate(dt);if((performance.now()|0)%1400<18)v85ApplyRenderStyle(false);};
