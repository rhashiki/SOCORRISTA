/* Re.Force APH — Build 47 / v47
 * In-world patient dialogue/subtitles for neurological and SAMPLE interactions.
 */

let V47_BUBBLE=null,V47_TIMER=null;
function v47SetupDialogue(){
  if(V47_BUBBLE||!document.querySelector('#game'))return;
  V47_BUBBLE=document.createElement('div');V47_BUBBLE.id='patientDialogue';V47_BUBBLE.className='patient-dialogue';V47_BUBBLE.hidden=true;V47_BUBBLE.innerHTML='<small>VÍTIMA</small><b></b>';document.querySelector('#game').appendChild(V47_BUBBLE);
}
function v47Speak(text,label='VÍTIMA',ms=2700){
  v47SetupDialogue();if(!V47_BUBBLE)return;V47_BUBBLE.querySelector('small').textContent=label;V47_BUBBLE.querySelector('b').textContent=String(text).replace(/^“|”$/g,'');V47_BUBBLE.hidden=false;V47_BUBBLE.classList.remove('show');requestAnimationFrame(()=>V47_BUBBLE.classList.add('show'));clearTimeout(V47_TIMER);V47_TIMER=setTimeout(()=>{V47_BUBBLE.classList.remove('show');setTimeout(()=>V47_BUBBLE.hidden=true,250);},ms);
}
function v47LooksLikeSpeech(msg){
  const s=String(msg||'');
  if(clinicalStage==='SAMPLE')return !/informação|pergunta|prioridade|ação/i.test(s);
  if(clinicalStage==='D')return /olhos|responde|diz|obedece|confus/i.test(s);
  if(['A','B','C'].includes(clinicalStage))return /vítima|responde|fala/i.test(s);
  return false;
}
const v47BaseObserve=observe;
observe=function(msg){v47BaseObserve(msg);if(['PATIENT','CLINICAL'].includes(phase)&&v47LooksLikeSpeech(msg))v47Speak(msg);};
const v47BaseOpenWitness=typeof v11OpenWitness==='function'?v11OpenWitness:null;
if(v47BaseOpenWitness){v11OpenWitness=function(){v47BaseOpenWitness();const w=V11_WITNESS?.nearest;if(w)setTimeout(()=>{const box=document.querySelector('#observationBox');if(box&&!box.hidden)v47Speak(box.textContent.split('\n')[0],'TESTEMUNHA',2500);},80);};}
v47SetupDialogue();
