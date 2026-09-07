/* Re.Force APH — Build 92 / v92
 * Hotfix: global Glasgow modal flow, PT-BR labels and guarded opening.
 * Internal E/V/M keys are preserved for compatibility; UI uses AO/RV/RM.
 */
function v92SetupGlasgowUI(){
  const modal=document.querySelector('#glasgowModal');
  if(!modal)return;
  modal.hidden=true;
  modal.style.display='none';
  modal.setAttribute('aria-hidden','true');
  const labels=modal.querySelectorAll('.select-grid label');
  if(labels[0]){labels[0].childNodes[0].nodeValue='AO — Abertura Ocular ';}
  if(labels[1]){labels[1].childNodes[0].nodeValue='RV — Resposta Verbal ';}
  if(labels[2]){labels[2].childNodes[0].nodeValue='RM — Resposta Motora ';}
  const save=modal.querySelector('#saveGlasgow');
  if(save)save.textContent='REGISTRAR PONTUAÇÃO';
  if(!modal.querySelector('#cancelGlasgow')){
    const back=document.createElement('button');
    back.id='cancelGlasgow';
    back.type='button';
    back.textContent='VOLTAR À OBSERVAÇÃO';
    back.style.cssText='width:100%;min-height:46px;margin-top:8px;border:1px solid #ffffff25;background:#161b20;color:#e8e2d7;font-weight:850;letter-spacing:.05em';
    back.addEventListener('click',v92CloseGlasgow);
    save?.insertAdjacentElement('afterend',back);
  }
}
function v92SetGlasgowVisible(on){
  const modal=document.querySelector('#glasgowModal');if(!modal)return;
  modal.hidden=!on;modal.style.display=on?'grid':'none';modal.setAttribute('aria-hidden',on?'false':'true');
}
function v92OpenGlasgow(){
  const ev=patient?.gcsEvidence;
  if(clinicalStage!=='D'||!ev||!['E','V','M'].every(k=>ev.has(k))){
    v92SetGlasgowVisible(false);
    flash('Complete primeiro as três observações neurológicas.');
    return;
  }
  const g=ACTIVE_CASE?.gcs||{eEye:'Abertura ocular observada.',eVerbal:'Resposta verbal observada.',eMotor:'Resposta motora observada.'};
  const evidence=document.querySelector('#glasgowEvidence');
  if(evidence)evidence.textContent=`${g.eEye} ${g.eVerbal} ${g.eMotor}`;
  closeInteraction();
  v92SetGlasgowVisible(true);
}
function v92CloseGlasgow(){
  v92SetGlasgowVisible(false);
  if(clinicalStage==='D')renderD();
}
renderD=function(){
  const g=ACTIVE_CASE?.gcs||{E:4,V:4,M:6,eEye:'Olhos abertos espontaneamente.',eVerbal:'Responde, mas está confuso quanto ao local.',eMotor:'Obedece a comando motor simples.'};
  const ev=patient.gcsEvidence;
  openInteraction('Avaliação neurológica','PACIENTE','Observe abertura ocular, resposta verbal e resposta motora antes de registrar a Escala de Coma de Glasgow.',[
    {label:'Observar abertura ocular (AO)',done:ev.has('E'),fn:()=>{ev.add('E');observe(g.eEye);setTimeout(()=>{if(clinicalStage==='D'&&document.querySelector('#glasgowModal')?.hidden)renderD();},780);}},
    {label:'Avaliar resposta verbal (RV)',done:ev.has('V'),fn:()=>{ev.add('V');observe(g.eVerbal);setTimeout(()=>{if(clinicalStage==='D'&&document.querySelector('#glasgowModal')?.hidden)renderD();},780);}},
    {label:'Avaliar resposta motora (RM)',done:ev.has('M'),fn:()=>{ev.add('M');observe(g.eMotor);setTimeout(()=>{if(clinicalStage==='D'&&document.querySelector('#glasgowModal')?.hidden)renderD();},780);}},
    {label:'Registrar Escala de Glasgow',primary:true,locked:ev.size<3,fn:v92OpenGlasgow}
  ]);
};
saveGlasgow=function(){
  if(clinicalStage!=='D'){v92SetGlasgowVisible(false);return;}
  const ao=+document.querySelector('#gE')?.value,rv=+document.querySelector('#gV')?.value,rm=+document.querySelector('#gM')?.value;
  if(!ao||!rv||!rm){flash('Preencha AO, RV e RM.');return;}
  const g=ACTIVE_CASE?.gcs||{E:4,V:4,M:6};
  v92SetGlasgowVisible(false);
  if(ao===g.E&&rv===g.V&&rm===g.M)reward(5,`Glasgow interpretado corretamente: AO${g.E} RV${g.V} RM${g.M} = ${g.E+g.V+g.M}.`);
  else penalize(8,`Glasgow registrado como AO${ao} RV${rv} RM${rm}; as respostas observadas correspondiam a AO${g.E} RV${g.V} RM${g.M}.`);
  clinicalStage='E';renderE();
};
const v92BaseInit=init;
init=async function(){
  v92SetupGlasgowUI();v92SetGlasgowVisible(false);
  await v92BaseInit();
  v92SetupGlasgowUI();v92SetGlasgowVisible(false);
  const save=document.querySelector('#saveGlasgow');if(save)save.onclick=saveGlasgow;
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',v92SetupGlasgowUI,{once:true});else v92SetupGlasgowUI();
