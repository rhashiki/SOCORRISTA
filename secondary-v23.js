/* Re.Force APH — Build 19 / v23
 * Case-specific secondary-assessment findings and recognition challenge.
 */

const V23_FINDINGS={
  x_external:{abnormal:'limbs',map:{head:'Sem alteração evidente na inspeção dirigida.',neck:'Sem queixa nova durante a inspeção.',chest:'Sem assimetria evidente.',abdomen:'Sem achado novo evidente.',pelvis:'Sem achado novo evidente.',limbs:'Perna direita com dor importante e alteração local compatível com o mecanismo.',back:'Sem achado novo evidente.'}},
  a_airway:{abnormal:'head',map:{head:'Queixa de dor de cabeça e sensibilidade local após a queda.',neck:'Sem achado novo evidente.',chest:'Sem assimetria evidente.',abdomen:'Sem achado novo evidente.',pelvis:'Sem achado novo evidente.',limbs:'Sem deformidade aparente.',back:'Sem achado novo evidente.'}},
  b_breathing:{abnormal:'chest',map:{head:'Sem achado novo evidente.',neck:'Sem achado novo evidente.',chest:'Dor localizada e expansão menos confortável no lado do impacto.',abdomen:'Sem achado novo evidente.',pelvis:'Sem achado novo evidente.',limbs:'Sem achado novo relevante.',back:'Sem achado novo evidente.'}},
  stable_primary:{abnormal:'limbs',map:{head:'Sem achado novo evidente.',neck:'Sem achado novo evidente.',chest:'Sem achado novo evidente.',abdomen:'Sem achado novo evidente.',pelvis:'Sem achado novo evidente.',limbs:'Dor e limitação no ombro após a queda.',back:'Sem achado novo evidente.'}},
  d_neuro:{abnormal:'head',map:{head:'Dor e sensibilidade local após a queda na escada.',neck:'Sem achado novo evidente.',chest:'Sem achado novo evidente.',abdomen:'Sem achado novo evidente.',pelvis:'Sem achado novo evidente.',limbs:'Sem achado novo relevante.',back:'Sem achado novo evidente.'}},
  c_perfusion:{abnormal:'pelvis',map:{head:'Sem achado novo evidente.',neck:'Sem achado novo evidente.',chest:'Sem achado novo evidente.',abdomen:'Desconforto difuso, sem achado visual marcante.',pelvis:'Dor importante à avaliação dirigida da região pélvica.',limbs:'Sem hemorragia externa importante visível.',back:'Sem achado novo evidente.'}}
};
function v23Profile(){return V23_FINDINGS[ACTIVE_CASE?.id]||V23_FINDINGS.x_external;}

secondaryClickOnce=function(e){
  if(!bodyZoneMode)return;
  const ray=new THREE.Raycaster(),p=new THREE.Vector2(),r=canvas.getBoundingClientRect();p.x=((e.clientX-r.left)/r.width)*2-1;p.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(p,camera);
  const hit=ray.intersectObjects(clinicalZones,false)[0];if(!hit)return;const region=hit.object.userData.region;
  if(patient.secondaryOrder.includes(region)){flash(`${REGION_NAME[region]} já examinada.`);return;}
  const expected=SECONDARY[patient.secondaryOrder.length];patient.secondaryOrder.push(region);const finding=v23Profile().map[region]||'Sem achado novo evidente.';
  if(region===expected){reward(1,`Secundária: ${REGION_NAME[region]} examinada em sequência.`);flash(`${REGION_NAME[region]}: ${finding}`,2800);}else{penalize(4,`Avaliação secundária fora de sequência: examinou ${REGION_NAME[region]} antes de ${REGION_NAME[expected]}.`);flash(`${REGION_NAME[region]}: ${finding} • fora da sequência sistemática.`,3000);}
  if(patient.secondaryOrder.length===SECONDARY.length){bodyZoneMode=false;canvas.removeEventListener('click',secondaryClickOnce);setTimeout(v23SecondaryReview,600);}
};
function v23SecondaryReview(){
  const profile=v23Profile(),options=v22Shuffle(['head','neck','chest','abdomen','pelvis','limbs','back']).slice(0,4);if(!options.includes(profile.abnormal))options[0]=profile.abnormal;
  openInteraction('Revisão da secundária','ACHADOS','Qual região apresentou o achado secundário mais relevante deste caso?',options.map(region=>({label:REGION_NAME[region],primary:region===profile.abnormal,fn:()=>{
    if(region===profile.abnormal){reward(4,`Achado secundário relevante reconhecido em ${REGION_NAME[region]}.`);clinicalStage='DONE';openInteraction('Atendimento concluído','ENCERRAMENTO','Você completou a avaliação primária, história e avaliação secundária.',[{label:'Encerrar ocorrência e revisar desempenho',primary:true,fn:finishMission}]);}
    else{penalize(3,`Selecionou ${REGION_NAME[region]} como principal achado secundário, mas o achado relevante estava em ${REGION_NAME[profile.abnormal]}.`);observe('Relembre os achados apresentados durante a varredura e tente novamente.');}
  }})));
}
