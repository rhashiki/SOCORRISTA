/* Re.Force APH — Build 34 / v34
 * Operational radio/status layer for mission continuity.
 */

let V34_LAST_PHASE=null,V34_LOG=[];
const V34_STATUS={
  BASE:['BASE','Unidade disponível na base.'],
  TO_AMBULANCE:['DESPACHO','Ocorrência aceita. Preparar deslocamento.'],
  EN_ROUTE:['DESLOCAMENTO','Unidade em deslocamento para a ocorrência.'],
  AT_SCENE_VEHICLE:['CHEGADA','Endereço alcançado. Posicionar a viatura.'],
  SCENE:['NO LOCAL','Equipe no local realizando segurança da cena.'],
  PATIENT:['ABORDAGEM','Equipe iniciando contato com a vítima.'],
  CLINICAL:['ATENDIMENTO','Avaliação da vítima em andamento.'],
  TRANSPORT_RETURN:['TRANSPORTE','Paciente preparado no exercício. Retorno à viatura.'],
  TRANSPORT_HOSPITAL:['EM TRANSPORTE','Unidade em deslocamento ao hospital definido pela simulação.'],
  AT_HOSPITAL:['HOSPITAL','Unidade no hospital de destino.'],
  DONE:['ENCERRADO','Ocorrência encerrada.']
};
function v34EnsureUI(){
  if(document.querySelector('#radioStatus'))return;
  const game=document.querySelector('#game');if(!game)return;
  const el=document.createElement('div');el.id='radioStatus';el.className='radio-status';el.hidden=true;el.innerHTML='<small>RÁDIO RE.FORCE</small><b>—</b><span>—</span>';game.appendChild(el);
}
function v34Announce(phaseName){
  const cfg=V34_STATUS[phaseName];if(!cfg)return;
  const row={time:nowSec(),phase:phaseName,title:cfg[0],text:cfg[1]};V34_LOG.push(row);
  const el=document.querySelector('#radioStatus');if(el){el.querySelector('b').textContent=cfg[0];el.querySelector('span').textContent=cfg[1];el.hidden=false;el.classList.remove('show');requestAnimationFrame(()=>el.classList.add('show'));clearTimeout(v34Announce.t);v34Announce.t=setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.hidden=true,350);},2800);}
  if(typeof radioBeep==='function')radioBeep();
  if(['EN_ROUTE','AT_SCENE_VEHICLE','TRANSPORT_HOSPITAL','AT_HOSPITAL'].includes(phaseName))logEvent(`Rádio: ${cfg[1]}`);
}
function v34WatchPhase(){if(phase===V34_LAST_PHASE)return;V34_LAST_PHASE=phase;v34Announce(phase);}

const v34BaseUpdate=update;
update=function(dt){v34BaseUpdate(dt);v34WatchPhase();};
const v34BaseInit=init;
init=async function(){V34_LOG=[];V34_LAST_PHASE=null;v34EnsureUI();await v34BaseInit();v34WatchPhase();};
