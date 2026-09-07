/* Re.Force APH — Build 25 / v29
 * Mission loop extension: return to ambulance and transport to the exercise hospital.
 * Transport destination is predefined by the simulation; no real-world triage guidance is implied.
 */

let V29_TRANSPORT={started:false,done:false};
function v29BeginTransport(){
  if(V29_TRANSPORT.started)return;V29_TRANSPORT.started=true;closeInteraction();bodyZoneMode=false;
  if(patient?.anchor)patient.anchor.visible=false;
  phase='TRANSPORT_RETURN';setObjective('TRANSPORTE','Neste exercício, a Central definiu o hospital como destino. Retorne à ambulância.');logEvent('Avaliação concluída; paciente preparado para transporte no exercício.');flash('Destino definido pela simulação: Hospital Re.Force.',3000);
}
function v29EnterTransport(){
  enterAmbulance();phase='TRANSPORT_HOSPITAL';mapMode.textContent='TRANSPORTE';setObjective('TRANSPORTE','Conduza com segurança até o hospital indicado no GPS.');logEvent('Transporte iniciado em direção ao hospital.');cameraReady=false;
}
function v29TransportRoute(){return HOSPITAL_POS;}
function v29UpdateTransport(){
  if(phase==='TRANSPORT_HOSPITAL'&&controlled==='vehicle'){
    const d=dist2(ambulance.root.position,HOSPITAL_POS);
    distanceLabel.textContent=`${Math.round(d)} m`;
    if(d<12){phase='AT_HOSPITAL';setObjective('CHEGADA AO HOSPITAL','Reduza a velocidade e pare a ambulância para finalizar o exercício.');logEvent('Unidade chegou ao hospital de destino.');flash('Hospital alcançado. Pare a viatura.',2400);}
  }
  if(phase==='AT_HOSPITAL'&&controlled==='vehicle'){
    distanceLabel.textContent='HOSPITAL';actionBtn.textContent=Math.abs(ambulance.speed)<.8?'FINALIZAR':'PARE';
  }
}

const v29BaseFinish=finishMission;
finishMission=function(){
  if(!V29_TRANSPORT.done&&clinicalStage==='DONE'&&!['TRANSPORT_RETURN','TRANSPORT_HOSPITAL','AT_HOSPITAL'].includes(phase)){v29BeginTransport();return;}
  return v29BaseFinish();
};
const v29BaseContext=updateContext;
updateContext=function(){
  v29BaseContext();
  if(controlled==='player'&&phase==='TRANSPORT_RETURN'&&dist2(player.root.position,ambulance.root.position)<3.5)actionBtn.textContent='EMBARCAR';
  if(controlled==='vehicle'&&phase==='AT_HOSPITAL')actionBtn.textContent=Math.abs(ambulance.speed)<.8?'FINALIZAR':'PARE';
};
const v29BaseAction=doContextAction;
doContextAction=function(){
  if(uiBlock())return;
  if(controlled==='player'&&phase==='TRANSPORT_RETURN'){
    if(dist2(player.root.position,ambulance.root.position)<3.5){v29EnterTransport();return;}flash('Retorne à ambulância para iniciar o transporte.');return;
  }
  if(controlled==='vehicle'&&phase==='TRANSPORT_HOSPITAL'){flash('Transporte em andamento. Siga ao hospital indicado.');return;}
  if(controlled==='vehicle'&&phase==='AT_HOSPITAL'){
    if(Math.abs(ambulance.speed)>=.8){flash('Pare a ambulância antes de finalizar o exercício.');return;}
    V29_TRANSPORT.done=true;logEvent('Transporte concluído no hospital do exercício.');finishMission();return;
  }
  return v29BaseAction();
};
const v29BaseUpdate=update;
update=function(dt){v29BaseUpdate(dt);v29UpdateTransport();};

const v29BaseDraw=drawMinimap;
drawMinimap=function(){
  v29BaseDraw();if(!['TRANSPORT_RETURN','TRANSPORT_HOSPITAL','AT_HOSPITAL'].includes(phase))return;
  const actor=controlled==='vehicle'?ambulance.root?.position:player.root?.position;if(!actor)return;const w=mini.width,scale=w/WORLD,tx=x=>(x+WORLD/2)*scale,tz=z=>(z+WORLD/2)*scale;
  mctx.save();mctx.beginPath();mctx.arc(w/2,w/2,w/2-4,0,Math.PI*2);mctx.clip();mctx.strokeStyle='#72a8d6';mctx.lineWidth=3;mctx.setLineDash([6,4]);mctx.beginPath();mctx.moveTo(tx(actor.x),tz(actor.z));mctx.lineTo(tx(HOSPITAL_POS.x),tz(actor.z));mctx.lineTo(tx(HOSPITAL_POS.x),tz(HOSPITAL_POS.z));mctx.stroke();mctx.restore();
};

const v29BaseV17Update=typeof v17UpdateNavigation==='function'?v17UpdateNavigation:null;
v17UpdateNavigation=function(){
  if(['TRANSPORT_RETURN','TRANSPORT_HOSPITAL','AT_HOSPITAL'].includes(phase)){
    if(V17_MARKER){V17_MARKER.position.copy(HOSPITAL_POS);V17_MARKER.visible=phase!=='AT_HOSPITAL';}
    if(V17_ARROW){const active=phase==='TRANSPORT_HOSPITAL'&&controlled==='vehicle';V17_ARROW.hidden=!active;if(active){const dx=HOSPITAL_POS.x-ambulance.root.position.x,dz=HOSPITAL_POS.z-ambulance.root.position.z,b=Math.atan2(dx,-dz),delta=((b-ambulance.heading+Math.PI)%(Math.PI*2))-Math.PI;V17_ARROW.querySelector('span').style.transform=`rotate(${delta}rad)`;V17_ARROW.querySelector('b').textContent=`HOSPITAL • ${Math.round(Math.hypot(dx,dz))} m`;}}return;
  }
  if(v29BaseV17Update)v29BaseV17Update();
};
const v29BaseInit=init;
init=async function(){V29_TRANSPORT={started:false,done:false};await v29BaseInit();};
