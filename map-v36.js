/* Re.Force APH — Build 36 / v36
 * Full-screen tactical city map and route overview.
 */

let V36_MAP_OPEN=false,V36_CANVAS=null,V36_CTX=null;
function v36SetupMap(){
  if(document.querySelector('#fullMapBtn'))return;
  const wrap=document.querySelector('.minimap-wrap');if(wrap){const b=document.createElement('button');b.id='fullMapBtn';b.className='full-map-btn';b.textContent='MAPA';wrap.appendChild(b);b.onclick=v36OpenMap;}
  const game=document.querySelector('#game');if(!game)return;
  const modal=document.createElement('div');modal.id='fullMapModal';modal.className='full-map-modal';modal.hidden=true;
  modal.innerHTML=`<div class="full-map-card"><div class="full-map-head"><div><small>RE.FORCE • GPS OPERACIONAL</small><b>MAPA DA CIDADE</b></div><button id="closeFullMap">×</button></div><canvas id="fullMapCanvas" width="520" height="520"></canvas><div class="full-map-legend"><span><i class="you"></i>UNIDADE</span><span><i class="call"></i>OCORRÊNCIA</span><span><i class="hospital"></i>HOSPITAL</span><span><i class="base"></i>BASE</span></div><p id="fullMapStatus">—</p></div>`;
  game.appendChild(modal);V36_CANVAS=modal.querySelector('#fullMapCanvas');V36_CTX=V36_CANVAS.getContext('2d');modal.querySelector('#closeFullMap').onclick=v36CloseMap;
}
function v36OpenMap(){V36_MAP_OPEN=true;const m=document.querySelector('#fullMapModal');if(m)m.hidden=false;v36DrawMap();}
function v36CloseMap(){V36_MAP_OPEN=false;const m=document.querySelector('#fullMapModal');if(m)m.hidden=true;}
function v36Target(){return ['TRANSPORT_RETURN','TRANSPORT_HOSPITAL','AT_HOSPITAL'].includes(phase)?HOSPITAL_POS:ACCIDENT_POS;}
function v36DrawMap(){
  if(!V36_CTX||!V36_CANVAS)return;const c=V36_CTX,w=V36_CANVAS.width,h=V36_CANVAS.height,pad=24,scale=(w-pad*2)/WORLD,tx=x=>pad+(x+WORLD/2)*scale,tz=z=>pad+(z+WORLD/2)*scale;
  c.clearRect(0,0,w,h);c.fillStyle='#10161b';c.fillRect(0,0,w,h);
  c.fillStyle='#18231a';c.fillRect(pad,pad,w-pad*2,h-pad*2);
  c.fillStyle='#293138';[-30,0,30].forEach(z=>c.fillRect(pad,tz(z)-6*scale,w-pad*2,12*scale));[-48,0,48].forEach(x=>c.fillRect(tx(x)-6*scale,pad,12*scale,h-pad*2));
  c.fillStyle='#3b4348';for(const b of buildings)c.fillRect(tx(b.x-b.w/2),tz(b.z-b.d/2),b.w*scale,b.d*scale);
  c.strokeStyle='#626b70';c.lineWidth=1;c.strokeRect(pad,pad,w-pad*2,h-pad*2);

  const actor=controlled==='vehicle'?ambulance.root?.position:player.root?.position,target=v36Target();
  if(actor&&target){c.strokeStyle=phase.startsWith('TRANSPORT')?'#72a8d6':'#d8b369';c.lineWidth=4;c.setLineDash([10,7]);c.beginPath();c.moveTo(tx(actor.x),tz(actor.z));c.lineTo(tx(target.x),tz(actor.z));c.lineTo(tx(target.x),tz(target.z));c.stroke();c.setLineDash([]);}
  function pin(pos,color,r=8){c.fillStyle=color;c.beginPath();c.arc(tx(pos.x),tz(pos.z),r,0,Math.PI*2);c.fill();c.strokeStyle='#0a0c0e';c.lineWidth=3;c.stroke();}
  pin(BASE_POS,'#5aa665',7);pin(HOSPITAL_POS,'#72a8d6',7);pin(ACCIDENT_POS,'#e34c42',9);
  if(actor){c.save();c.translate(tx(actor.x),tz(actor.z));const ang=controlled==='vehicle'?ambulance.heading:player.root.rotation.y;c.rotate(-ang);c.fillStyle='#fff';c.beginPath();c.moveTo(0,-11);c.lineTo(8,8);c.lineTo(-8,8);c.closePath();c.fill();c.restore();}
  c.fillStyle='#e8e2d7';c.font='700 14px system-ui';c.fillText('N',w-35,40);c.beginPath();c.moveTo(w-28,47);c.lineTo(w-34,60);c.lineTo(w-22,60);c.closePath();c.fill();
  const status=document.querySelector('#fullMapStatus');if(status){const d=actor?Math.round(dist2(actor,target)):0;status.textContent=`${phase} • ${d} m até ${target===HOSPITAL_POS?'hospital':'ocorrência'} • ${V24_ENV?.label||'ambiente padrão'}`;}
}
const v36BaseUiBlock=uiBlock;
uiBlock=function(){return V36_MAP_OPEN||v36BaseUiBlock();};
const v36BaseUpdate=update;
update=function(dt){v36BaseUpdate(dt);if(V36_MAP_OPEN)v36DrawMap();};
const v36BaseInit=init;
init=async function(){v36SetupMap();await v36BaseInit();};
v36SetupMap();
