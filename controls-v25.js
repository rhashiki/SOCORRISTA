/* Re.Force APH — Build 21 / v25
 * Camera/control preferences: sensitivity, inversion and auto-follow.
 */

const V25_KEY='reforce-controls-v25';
let V25_SETTINGS=v25Load();
function v25Load(){try{return Object.assign({sensitivity:1,invertX:false,invertY:false,autoFollow:true},JSON.parse(localStorage.getItem(V25_KEY)||'{}'));}catch{return {sensitivity:1,invertX:false,invertY:false,autoFollow:true};}}
function v25Save(){localStorage.setItem(V25_KEY,JSON.stringify(V25_SETTINGS));}
function v25SetupUI(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#controlSettings'))return;
  const el=document.createElement('details');el.id='controlSettings';el.className='control-settings';
  el.innerHTML=`<summary>CONTROLES E CÂMERA</summary><div class="control-grid"><label>Sensibilidade<select id="camSens"><option value="0.7">Baixa</option><option value="1">Normal</option><option value="1.35">Alta</option></select></label><label><input type="checkbox" id="invertX"> Inverter horizontal</label><label><input type="checkbox" id="invertY"> Inverter vertical</label><label><input type="checkbox" id="autoFollow"> Auto-follow</label></div>`;
  const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
  el.querySelector('#camSens').value=String(V25_SETTINGS.sensitivity);el.querySelector('#invertX').checked=V25_SETTINGS.invertX;el.querySelector('#invertY').checked=V25_SETTINGS.invertY;el.querySelector('#autoFollow').checked=V25_SETTINGS.autoFollow;
  el.querySelectorAll('input,select').forEach(x=>x.onchange=()=>{V25_SETTINGS.sensitivity=+el.querySelector('#camSens').value;V25_SETTINGS.invertX=el.querySelector('#invertX').checked;V25_SETTINGS.invertY=el.querySelector('#invertY').checked;V25_SETTINGS.autoFollow=el.querySelector('#autoFollow').checked;v25Save();});
}

bindInput=function(){
  $('#acceptCall').onclick=()=>{dispatchModal.hidden=true;phase='TO_AMBULANCE';setObjective('OCORRÊNCIA ACEITA','Entre na ambulância Re.Force e desloque-se para a ocorrência.');logEvent('Ocorrência aceita pela unidade.');flash(`GPS atualizado: ${ACTIVE_CASE?.qth||'ocorrência'}`);};
  $('#closeInteraction').onclick=()=>closeInteraction();
  $('#cameraReset').onclick=()=>{if(controlled==='vehicle')cameraYaw=-ambulance.heading;else cameraYaw=player.root.rotation.y-Math.PI;cameraPitch=.32;lastCameraDrag=0;cameraReady=false;};
  sirenBtn.onclick=()=>{ambulance.siren=!ambulance.siren;setSirenAudio(ambulance.siren);sirenBtn.classList.toggle('on',ambulance.siren);sirenBtn.textContent=ambulance.siren?'SIRENE ON':'SIRENE';};actionBtn.onclick=doContextAction;
  runBtn.addEventListener('pointerdown',e=>{e.preventDefault();runHeld=true;});['pointerup','pointercancel','pointerleave'].forEach(ev=>runBtn.addEventListener(ev,()=>runHeld=false));
  const joyMove=e=>{if(!joy.active||e.pointerId!==joy.id)return;const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=r.width*.34,mag=Math.hypot(dx,dy)||1;if(mag>max){dx=dx/mag*max;dy=dy/mag*max;}joy.x=dx/max;joy.y=dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`;};
  joystick.addEventListener('pointerdown',e=>{joy.active=true;joy.id=e.pointerId;joystick.setPointerCapture?.(e.pointerId);joyMove(e);});joystick.addEventListener('pointermove',joyMove);const joyEnd=e=>{if(e.pointerId!==joy.id)return;joy={x:0,y:0,active:false,id:null};stick.style.transform='translate(0,0)';};joystick.addEventListener('pointerup',joyEnd);joystick.addEventListener('pointercancel',joyEnd);
  canvas.addEventListener('pointerdown',e=>{if(uiBlock())return;cameraPointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!cameraPointer||e.pointerId!==cameraPointer.id||uiBlock())return;const dx=e.clientX-cameraPointer.x,dy=e.clientY-cameraPointer.y;cameraPointer.x=e.clientX;cameraPointer.y=e.clientY;const s=V25_SETTINGS.sensitivity||1;cameraYaw+=(V25_SETTINGS.invertX?1:-1)*dx*.0062*s;cameraPitch=clamp(cameraPitch+(V25_SETTINGS.invertY?1:-1)*dy*.0042*s,.16,.82);lastCameraDrag=performance.now();});
  const camEnd=e=>{if(cameraPointer?.id===e.pointerId)cameraPointer=null;};canvas.addEventListener('pointerup',camEnd);canvas.addEventListener('pointercancel',camEnd);canvas.addEventListener('wheel',e=>{cameraDistance=clamp(cameraDistance+Math.sign(e.deltaY)*.6,4.5,11);},{passive:true});
  addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE')doContextAction();if(e.code==='KeyQ'){ambulance.siren=!ambulance.siren;setSirenAudio(ambulance.siren);sirenBtn.classList.toggle('on',ambulance.siren);}});addEventListener('keyup',e=>keys[e.code]=false);
  $('#saveGlasgow').onclick=saveGlasgow;$('#restartBtn').onclick=()=>location.reload();
};

const v25BaseUpdate=update;
update=function(dt){if(!V25_SETTINGS.autoFollow)lastCameraDrag=performance.now();v25BaseUpdate(dt);};
v25SetupUI();
