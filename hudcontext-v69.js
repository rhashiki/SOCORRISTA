/* Re.Force APH — Build 69 / v69
 * Contextual HUD: action label follows nearby affordance and vehicle state.
 */
let V69_LAST='';
function v69ActionLabel(){
  if(controlled==='vehicle')return 'SAIR';
  if(!player?.root)return 'USAR';
  if(phase==='TO_AMBULANCE'&&ambulance?.root&&dist2(player.root.position,ambulance.root.position)<3.8)return 'ENTRAR';
  if(['SCENE','PATIENT'].includes(phase)&&dist2(player.root.position,ACCIDENT_POS)<8.5&&!sceneReady())return 'CENA';
  if(phase==='SCENE'&&sceneReady()&&dist2(player.root.position,ACCIDENT_POS)<8.5)return 'AVANÇAR';
  if(['PATIENT','CLINICAL'].includes(phase)&&patient?.anchor&&dist2(player.root.position,patient.anchor.position)<3.5)return 'ATENDER';
  if(phase==='TRANSPORT_RETURN'&&ambulance?.root&&dist2(player.root.position,ambulance.root.position)<4)return 'VIATURA';
  return 'USAR';
}
function v69UpdateActionLabel(){
  const label=v69ActionLabel();if(actionBtn&&label!==V69_LAST){actionBtn.textContent=label;V69_LAST=label;actionBtn.dataset.context=label.toLowerCase();}
  if(runBtn)runBtn.hidden=controlled==='vehicle';
  if(actionBtn)actionBtn.setAttribute('aria-label',label==='USAR'?'Interagir':label.toLowerCase());
}
const v69BaseUpdate=update;
update=function(dt){v69BaseUpdate(dt);v69UpdateActionLabel();};
const v69BaseInit=init;
init=async function(){V69_LAST='';await v69BaseInit();v69UpdateActionLabel();};
