/* Re.Force APH — Build 66 / v66
 * Fixes moving traffic orientation: vehicle local longitudinal axis is X, while legacy heading assumed Z.
 */
function v66TrafficHeading(t){
  const path=t?.path;if(!path?.length)return null;const a=path[t.seg%path.length],b=path[(t.seg+1)%path.length];if(!a||!b)return null;const dx=b[0]-a[0],dz=b[1]-a[1];if(Math.hypot(dx,dz)<.001)return null;return Math.atan2(-dz,dx);
}
function v66FixTrafficOrientation(dt=.016){
  traffic.forEach(t=>{const target=v66TrafficHeading(t);if(target==null||!t.root)return;t.root.rotation.y=lerpAngle(t.root.rotation.y,target,1-Math.exp(-dt*14));
    const braking=(t.userData?.v66LastSpeed??t.speed||0)-(t.speed||0)>.12;t.root.userData.v66LastSpeed=t.speed||0;
    t.root.traverse?.(m=>{if(!m.isMesh||!m.material?.emissive)return;const c=m.material.emissive.getHex();if((c&0xff0000)>0x400000&&(c&0x00ffff)<0x3030)m.material.emissiveIntensity=braking?.9:.24;});
  });
}
const v66BaseUpdateTraffic=updateTraffic;
updateTraffic=function(dt){v66BaseUpdateTraffic(dt);v66FixTrafficOrientation(dt);};
