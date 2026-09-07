/* Re.Force APH — Build 50 / v50
 * Original mission banners for dispatch, arrival, transport and completion.
 */

let V50_BANNER=null,V50_SEEN=new Set();
function v50Setup(){
  if(V50_BANNER||!document.querySelector('#game'))return;V50_BANNER=document.createElement('div');V50_BANNER.id='missionBanner';V50_BANNER.className='mission-banner';V50_BANNER.hidden=true;V50_BANNER.innerHTML='<small></small><b></b><span></span>';document.querySelector('#game').appendChild(V50_BANNER);
}
function v50Banner(key,kicker,title,sub='',ms=2500){
  if(V50_SEEN.has(key))return;V50_SEEN.add(key);v50Setup();if(!V50_BANNER)return;V50_BANNER.querySelector('small').textContent=kicker;V50_BANNER.querySelector('b').textContent=title;V50_BANNER.querySelector('span').textContent=sub;V50_BANNER.hidden=false;V50_BANNER.classList.remove('show');requestAnimationFrame(()=>V50_BANNER.classList.add('show'));clearTimeout(v50Banner.t);v50Banner.t=setTimeout(()=>{V50_BANNER.classList.remove('show');setTimeout(()=>V50_BANNER.hidden=true,350);},ms);
}
const v50BaseSetObjective=setObjective;
setObjective=function(label,text){
  v50BaseSetObjective(label,text);
  const l=String(label||'');
  if(l==='OCORRÊNCIA ACEITA')v50Banner('dispatch','CENTRAL RE.FORCE',ACTIVE_CASE?.title||'NOVA OCORRÊNCIA',ACTIVE_CASE?.qth||'Destino atualizado');
  else if(l==='CHEGADA À CENA'||l==='NA CENA')v50Banner('arrival','NO LOCAL','OCORRÊNCIA À VISTA','Controle a cena e leia o ambiente');
  else if(l==='TRANSPORTE')v50Banner('transport','MISSÃO','TRANSPORTE INICIADO','Destino definido pela simulação');
  else if(l==='CHEGADA AO HOSPITAL')v50Banner('hospital','DESTINO','HOSPITAL ALCANÇADO','Finalize a ocorrência com segurança');
};
const v50BaseShow=showDebrief;
showDebrief=function(elapsed){v50Banner('complete','RE.FORCE','OCORRÊNCIA CONCLUÍDA',`Pontuação ${score}/100`,1900);setTimeout(()=>v50BaseShow(elapsed),520);};
const v50BaseInit=init;
init=async function(){V50_SEEN=new Set();v50Setup();await v50BaseInit();};
v50Setup();
