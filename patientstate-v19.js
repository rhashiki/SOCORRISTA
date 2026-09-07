/* Re.Force APH — Build 15 / v19
 * Dynamic patient state tied to unresolved priorities and elapsed clinical time.
 */

let V19_STATE={stability:100,min:100,warn70:false,warn50:false,lastTick:0};
function v19PriorityResolved(){
  if(!ACTIVE_CASE)return true;
  if(ACTIVE_CASE.focus==='X')return patient.bleedActive===false;
  if(ACTIVE_CASE.focus==='A')return patient.v8AResolved===true||!['A'].includes(clinicalStage);
  if(ACTIVE_CASE.focus==='B')return patient.v8BResolved===true||!['B'].includes(clinicalStage);
  if(ACTIVE_CASE.focus==='D')return ['E','SAMPLE','SECONDARY','DONE'].includes(clinicalStage);
  return true;
}
function v19UpdateVitals(dt){
  if(!patient?.clinicalStart||!ACTIVE_CASE)return;
  const unresolved=!v19PriorityResolved();
  const rate={X:.34,A:.27,B:.30,D:.14,NONE:.02}[ACTIVE_CASE.focus]??.08;
  if(unresolved)V19_STATE.stability=Math.max(35,V19_STATE.stability-rate*dt*10);
  else V19_STATE.stability=Math.min(100,V19_STATE.stability+.035*dt*10);
  V19_STATE.min=Math.min(V19_STATE.min,V19_STATE.stability);

  const s=V19_STATE.stability;
  if(ACTIVE_CASE.focus==='B')ACTIVE_CASE.spo2=s<60?88:s<78?90:91;
  else if(ACTIVE_CASE.focus==='A')ACTIVE_CASE.spo2=s<60?91:s<78?93:94;
  else if(ACTIVE_CASE.focus==='X')ACTIVE_CASE.spo2=s<60?93:96;
  if(ACTIVE_CASE.focus==='X')ACTIVE_CASE.bp=s<60?'94/60':s<78?'100/64':'108/70';
  else if(ACTIVE_CASE.focus==='B')ACTIVE_CASE.bp=s<60?'104/66':'112/72';

  if(patientStateEl&&!patientStateEl.closest('[hidden]'))patientStateEl.textContent=s>=88?'Estável no momento':s>=72?'Exige atenção':s>=55?'Deteriorando':'Estado preocupante';
  if(!V19_STATE.warn70&&s<70){V19_STATE.warn70=true;penalize(3,'A prioridade permaneceu sem resolução por tempo suficiente para piorar o estado clínico.');flash('A vítima apresenta piora perceptível. Reavalie sua prioridade.',3000);}
  if(!V19_STATE.warn50&&s<50){V19_STATE.warn50=true;penalize(5,'Demora prolongada diante de uma prioridade não resolvida.');flash('A resposta da vítima está mais lenta. A prioridade continua pendente.',3200);}

  const rig=patient.visual?.userData?.rig,t=performance.now()*.001;
  if(rig){
    const respiratory=ACTIVE_CASE.focus==='B'&&!v19PriorityResolved(),amp=respiratory?.045:.015,freq=respiratory?4.6:2.0;
    rig.torso.scale.y=1+Math.sin(t*freq)*amp;
    rig.head.rotation.z=Math.sin(t*.8)*.018+(s<65?.04:0);
  }
}

const v19BaseUpdatePatient=updatePatient;
updatePatient=function(dt){v19BaseUpdatePatient(dt);v19UpdateVitals(dt);};
const v19BaseInit=init;
init=async function(){V19_STATE={stability:100,min:100,warn70:false,warn50:false,lastTick:0};await v19BaseInit();};

const v19BaseShowDebrief=showDebrief;
showDebrief=function(elapsed){
  v19BaseShowDebrief(elapsed);
  const metrics=document.querySelector('#summaryMetrics');if(metrics){const d=document.createElement('div');d.innerHTML=`<b>${Math.round(V19_STATE.min)}%</b><span>MENOR ESTABILIDADE</span>`;metrics.appendChild(d);}
  const learningEl=document.querySelector('#learning');if(learningEl&&V19_STATE.min<72){const p=document.createElement('p');p.textContent='O caso mostrou deterioração enquanto uma prioridade permanecia pendente. No simulador, tempo e sequência influenciam a evolução do paciente.';learningEl.appendChild(p);}
};
