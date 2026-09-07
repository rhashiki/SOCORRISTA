/* Re.Force APH — Build 89 / v89
 * Expanded-map labels for landmarks and arterial streets.
 */
function v89OverlayMap(){
  if(!V36_CTX||!V36_CANVAS)return;const c=V36_CTX,w=V36_CANVAS.width,h=V36_CANVAS.height,pad=24,scale=(w-pad*2)/WORLD,tx=x=>pad+(x+WORLD/2)*scale,tz=z=>pad+(z+WORLD/2)*scale;
  c.save();c.font='700 9px system-ui';c.textAlign='center';c.textBaseline='bottom';
  const marks=V77_LANDMARKS||[];for(const g of marks){if(!g?.userData?.v77Label)continue;const x=tx(g.position.x),z=tz(g.position.z);c.fillStyle='#d6b56f';c.beginPath();c.moveTo(x,z-5);c.lineTo(x+5,z);c.lineTo(x,z+5);c.lineTo(x-5,z);c.closePath();c.fill();c.fillStyle='#e8e2d7';c.fillText(g.userData.v77Label,x,z-8);}
  c.font='600 8px system-ui';c.fillStyle='#8fa1aa';
  [['AV. OESTE',-82,-3,-Math.PI/2],['AV. LESTE',82,-3,-Math.PI/2],['AV. NORTE',0,65,0],['AV. SUL',0,-65,0]].forEach(([t,x,z,r])=>{c.save();c.translate(tx(x),tz(z));c.rotate(r);c.fillText(t,0,-3);c.restore();});
  c.restore();
}
const v89BaseDrawMap=v36DrawMap;
v36DrawMap=function(){v89BaseDrawMap();v89OverlayMap();};
