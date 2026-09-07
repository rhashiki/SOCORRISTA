/* Re.Force APH — Build 81 / v81
 * Character quality pass: responder gear, civilian silhouette variation and readable accessories.
 */
const V81_DONE=new WeakSet();
function v81M(color,rough=.82,metal=.03){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function v81Box(parent,size,pos,mat,rot=[0,0,0]){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);o.position.set(...pos);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function v81EnhanceHuman(root,index=0){
  if(!root||V81_DONE.has(root)||!root.userData?.rig)return;V81_DONE.add(root);
  const role=root.userData.role||'civilian',rig=root.userData.rig;
  if(role==='responder'){
    const dark=v81M(0x14191d,.72,.08),fabric=v81M(0x273740,.86,.02),reflect=v81M(0xe0ca83,.52,.05),red=v81M(0xa62b25,.68,.04),screen=v81M(0x263a42,.38,.22);
    // Utility belt, pouches and chest radio.
    v81Box(root,[.46,.10,.31],[0,.86,0],dark);
    v81Box(root,[.13,.20,.10],[-.20,.77,.14],fabric);v81Box(root,[.13,.20,.10],[.20,.77,.14],fabric);
    const radio=v81Box(root,[.09,.18,.06],[.15,1.38,-.17],dark,[-.08,0,.06]);
    v81Box(radio,[.025,.12,.025],[0,.13,0],dark);
    const display=v81Box(root,[.055,.035,.008],[.15,1.40,-.205],screen);display.material.emissive=new THREE.Color(0x21474f);display.material.emissiveIntensity=.45;
    // Shoulder identifiers and reflective lower-leg bands.
    v81Box(root,[.12,.08,.28],[-.255,1.43,0],red);v81Box(root,[.12,.08,.28],[.255,1.43,0],red);
    for(const x of [-.105,.105])v81Box(root,[.13,.055,.19],[x,.30,-.005],reflect);
    // Compact response bag on the back, visually readable but not interactive.
    v81Box(root,[.38,.42,.15],[0,1.17,.22],fabric);v81Box(root,[.28,.045,.165],[0,1.28,.225],reflect);
    // Gloves.
    const glove=v81M(0x22272a,.78,.05);if(rig.leftForearm?.children?.length)rig.leftForearm.children.at(-1).material=glove;if(rig.rightForearm?.children?.length)rig.rightForearm.children.at(-1).material=glove;
  }else{
    const palettes=[0x3d5361,0x6f5346,0x4d6650,0x684f64,0x746238,0x41474d];
    const accent=v81M(palettes[index%palettes.length],.9,.01);
    // Shirts/jackets get a second layer so civilians stop sharing the same capsule silhouette.
    if(index%3===0)v81Box(root,[.40,.30,.30],[0,1.18,.01],accent);
    if(index%4===1){const bag=v81M(0x42382f,.9,.02);v81Box(root,[.22,.30,.11],[.24,1.04,.17],bag,[0,0,-.12]);}
    if(index%5===2){const cap=v81M(0x30363a,.86,.03);const brim=v81Box(root,[.28,.045,.22],[0,1.78,-.09],cap);brim.rotation.x=-.08;}
  }
}
function v81ApplyCharacters(){
  v81EnhanceHuman(player?.visual,0);v81EnhanceHuman(V28_PARTNER?.visual,1);
  pedestrians.forEach((p,i)=>v81EnhanceHuman(p.root?.children?.[0],i+2));
  curiosos.forEach((p,i)=>v81EnhanceHuman(p.children?.[0],i+20));
  if(patient?.visual)v81EnhanceHuman(patient.visual,40);
}
const v81BaseBuildActors=buildActors;
buildActors=function(){v81BaseBuildActors();v81ApplyCharacters();};
const v81BaseInit=init;
init=async function(){await v81BaseInit();v81ApplyCharacters();};
const v81BaseUpdate=update;
update=function(dt){v81BaseUpdate(dt);if((performance.now()|0)%1500<18)v81ApplyCharacters();};
