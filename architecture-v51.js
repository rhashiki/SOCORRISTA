/* Re.Force APH — Build 51 / v51
 * Production-quality city pass: balconies, rooftop equipment, awnings and facade depth.
 */
let V51_ARCH=[];
function v51Add(root,obj){root.add(obj);V51_ARCH.push(obj);return obj;}
function v51BuildingDetail(x,z,w,d,seed=0){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);V51_ARCH.push(g);
  const dark=material(0x34383b,.82,.08),metal=material(0x6e7579,.62,.18),awning=material([0x8d453d,0x385e69,0x735d3f,0x53644d][seed%4],.9,.02);
  const floors=2+(seed%4);
  for(let f=0;f<floors;f++){
    const y=2.5+f*2.9;
    if(seed%2===0){
      const balcony=box([Math.min(w*.65,7),.12,1.05],0x72777a,[0,y,-d/2-.48],undefined,g);balcony.material=metal;
      for(let k=-2;k<=2;k++)box([.045,.62,.045],0x545b60,[k*Math.min(w*.12,1.2),y+.34,-d/2-.96],undefined,g);
      box([Math.min(w*.64,6.8),.045,.045],0x545b60,[0,y+.66,-d/2-.96],undefined,g);
    }
  }
  if(seed%3===0){
    box([Math.min(w*.72,8),.16,1.5],0xffffff,[0,2.7,-d/2-.9],undefined,g).material=awning;
    for(let k=-2;k<=2;k++)box([.06,.95,.06],0x53575a,[k*1.25,2.2,-d/2-1.45],undefined,g);
  }
  const roofY=7+(seed%4)*3;
  const units=1+(seed%3);
  for(let i=0;i<units;i++){
    box([1.35,.75,1.05],0x878d8f,[(i-(units-1)/2)*1.8,roofY+.38,0],undefined,g);
    const fan=cyl(.28,.05,0x303437,[(i-(units-1)/2)*1.8,roofY+.78,0],[Math.PI/2,0,0],g);fan.material=dark;
  }
}
function v51BuildArchitecture(){
  V51_ARCH=[];
  const blocks=[[-25,-48], [25,-48], [-25,-15], [25,-15], [-25,15], [25,15], [-25,48], [25,48], [-65,-15], [65,-15], [-65,15], [65,15], [-65,48], [65,48]];
  blocks.forEach((p,i)=>{if(dist2({x:p[0],z:p[1]},BASE_POS)<18||dist2({x:p[0],z:p[1]},HOSPITAL_POS)<18)return;v51BuildingDetail(p[0],p[1],14+(i%3)*2,12+(i%2)*3,i);});
  // Base canopy and hospital drop-off depth.
  const baseCanopy=new THREE.Group();baseCanopy.position.set(BASE_POS.x-3,0,BASE_POS.z-8.6);scene.add(baseCanopy);V51_ARCH.push(baseCanopy);
  box([12,.18,3.6],0x30373c,[0,3.2,0],undefined,baseCanopy);for(const x of [-5.2,5.2])box([.16,3.2,.16],0x4b5256,[x,1.6,-1.2],undefined,baseCanopy);
  const hosp=new THREE.Group();hosp.position.set(HOSPITAL_POS.x,0,HOSPITAL_POS.z-11.3);scene.add(hosp);V51_ARCH.push(hosp);
  box([14,.22,3.5],0xd2d6d5,[0,3.5,0],undefined,hosp);for(const x of [-6,6])box([.18,3.5,.18],0x737a7e,[x,1.75,-1.1],undefined,hosp);
}
const v51BaseBuildCity=buildCity;
buildCity=function(){v51BaseBuildCity();v51BuildArchitecture();};
