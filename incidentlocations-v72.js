/* Re.Force APH — Build 72 / v72
 * Expanded incident geography across the 210x210 playable city.
 */
const V72_LOCATION_OVERRIDES={
  x_external:{pos:[48,0,-65],qth:'Setor Sul-Leste • Av. Leste × Av. Sul'},
  a_airway:{pos:[-82,0,-30],qth:'Distrito Oeste • Av. Oeste × Av. Central'},
  b_breathing:{pos:[82,0,30],qth:'Distrito Leste • Av. Leste × Rua Norte'},
  stable_primary:{pos:[-48,0,65],qth:'Setor Norte-Oeste • Rua Principal × Av. Norte'},
  d_neuro:{pos:[-82,0,30],qth:'Distrito Oeste • Galeria Norte'},
  c_perfusion:{pos:[82,0,-30],qth:'Distrito Leste • Av. Leste × Rua Sul'}
};
function v72ApplyLocations(){
  Object.entries(V72_LOCATION_OVERRIDES).forEach(([id,cfg])=>{
    V12_LOCATIONS[id]={pos:[...cfg.pos],qth:cfg.qth};
    const c=V8_CASES.find(x=>x.id===id);if(c)c.qth=cfg.qth;
  });
}
v72ApplyLocations();
function v72DistrictName(pos){
  if(pos.x<-68&&pos.z<-48)return 'DISTRITO SUDOESTE';if(pos.x<-68&&pos.z>48)return 'DISTRITO NOROESTE';if(pos.x>68&&pos.z<-48)return 'DISTRITO SUDESTE';if(pos.x>68&&pos.z>48)return 'DISTRITO NORDESTE';
  if(pos.x<-68)return 'DISTRITO OESTE';if(pos.x>68)return 'DISTRITO LESTE';if(pos.z>52)return 'SETOR NORTE';if(pos.z<-52)return 'SETOR SUL';return null;
}
const v72BaseUpdateDistrict=updateDistrict;
updateDistrict=function(){
  v72BaseUpdateDistrict();const pos=controlled==='vehicle'?ambulance?.root?.position:player?.root?.position;if(!pos)return;const n=v72DistrictName(pos);if(!n)return;
  if(n!==lastDistrict){lastDistrict=n;const el=document.querySelector('#districtBanner');if(el){el.textContent=n;el.hidden=false;el.classList.remove('show');requestAnimationFrame(()=>el.classList.add('show'));clearTimeout(v72BaseUpdateDistrict.t);setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.hidden=true,450);},2100);}}
};
