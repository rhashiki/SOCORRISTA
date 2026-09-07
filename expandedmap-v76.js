/* Re.Force APH — Build 76 / v76
 * Full-map rendering for the expanded road grid and grid-aware route.
 */
function v76DrawRoadGrid(c,pad,scale,tx,tz,w,h){
  c.fillStyle='#293138';
  for(const z of V75_Z)c.fillRect(pad,tz(z)-5.6*scale,w-pad*2,11.2*scale);
  for(const x of V75_X)c.fillRect(tx(x)-5.6*scale,pad,11.2*scale,h-pad*2);
  c.strokeStyle='#d7bf7c55';c.lineWidth=1.5;c.setLineDash([5,5]);
  for(const z of V75_Z){c.beginPath();c.moveTo(pad,tz(z));c.lineTo(w-pad,tz(z));c.stroke();}
  for(const x of V75_X){c.beginPath();c.moveTo(tx(x),pad);c.lineTo(tx(x),h-pad);c.stroke();}
  c.setLineDash([]);
}
function v76DistrictLabels(c,tx,tz){
  c.fillStyle='#aeb8bd';c.font='700 11px system-ui';c.textAlign='center';
  [['OESTE',-82,0],['LESTE',82,0],['NORTE',0,65],['SUL',0,-65],['CENTRO',0,0]].forEach(([n,x,z])=>c.fillText(n,tx(x),tz(z)-8));c.textAlign='start';
}
v36DrawMap=function(){
  if(!V36_CTX||!V36_CANVAS)return;const c=V36_CTX,w=V36_CANVAS.width,h=V36_CANVAS.height,pad=24,scale=(w-pad*2)/WORLD,tx=x=>pad+(x+WORLD/2)*scale,tz=z=>pad+(z+WORLD/2)*scale;
  c.clearRect(0,0,w,h);c.fillStyle='#10161b';c.fillRect(0,0,w,h);c.fillStyle='#18231a';c.fillRect(pad,pad,w-pad*2,h-pad*2);v76DrawRoadGrid(c,pad,scale,tx,tz,w,h);
  c.fillStyle='#3b4348';for(const b of buildings)c.fillRect(tx(b.x-b.w/2),tz(b.z-b.d/2),b.w*scale,b.d*scale);v76DistrictLabels(c,tx,tz);
  c.strokeStyle='#626b70';c.lineWidth=1;c.strokeRect(pad,pad,w-pad*2,h-pad*2);
  const actor=controlled==='vehicle'?ambulance.root?.position:player.root?.position,target=v36Target();
  if(actor&&target){const route=v75GridRoute(actor,target);c.strokeStyle=phase.startsWith('TRANSPORT')?'#72a8d6':'#d8b369';c.lineWidth=4;c.setLineDash([10,7]);c.beginPath();route.forEach((p,i)=>i?c.lineTo(tx(p.x),tz(p.z)):c.moveTo(tx(p.x),tz(p.z)));c.stroke();c.setLineDash([]);}
  function pin(pos,color,r=8){c.fillStyle=color;c.beginPath();c.arc(tx(pos.x),tz(pos.z),r,0,Math.PI*2);c.fill();c.strokeStyle='#0a0c0e';c.lineWidth=3;c.stroke();}
  pin(BASE_POS,'#5aa665',7);pin(HOSPITAL_POS,'#72a8d6',7);pin(ACCIDENT_POS,'#e34c42',9);
  if(actor){c.save();c.translate(tx(actor.x),tz(actor.z));const ang=controlled==='vehicle'?ambulance.heading:player.root.rotation.y;c.rotate(-ang);c.fillStyle='#fff';c.beginPath();c.moveTo(0,-11);c.lineTo(8,8);c.lineTo(-8,8);c.closePath();c.fill();c.restore();}
  c.fillStyle='#e8e2d7';c.font='700 14px system-ui';c.fillText('N',w-35,40);c.beginPath();c.moveTo(w-28,47);c.lineTo(w-34,60);c.lineTo(w-22,60);c.closePath();c.fill();
  const status=document.querySelector('#fullMapStatus');if(status){const d=actor?Math.round(v75RouteLength(actor,target)):0;status.textContent=`${phase} • rota ${d} m • ${target===HOSPITAL_POS?'hospital':'ocorrência'} • ${V24_ENV?.label||'ambiente padrão'}`;}
};
