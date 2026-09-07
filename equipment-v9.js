/* Re.Force APH — Build 5 / v9
 * Equipment & Observation System.
 * Tools reveal observations/measurements; they do not replace protocol reasoning.
 */

let V9_EQUIP={used:new Set(),uses:0,efficient:0,last:null};
let v9Panel=null,v9Readout=null;

function v9SetupEquipmentUI(){
  if(document.querySelector('#kitBtn'))return;
  const right=document.querySelector('#rightControls');
  if(right){
    const b=document.createElement('button');b.id='kitBtn';b.className='round kit';b.textContent='KIT';
    b.onclick=v9OpenKit;right.prepend(b);
  }
  const gameEl=document.querySelector('#game');
  if(gameEl){
    v9Readout=document.createElement('div');v9Readout.id='equipmentReadout';v9Readout.className='equipment-readout';v9Readout.hidden=true;gameEl.appendChild(v9Readout);
    v9Panel=document.createElement('div');v9Panel.id='equipmentPanel';v9Panel.className='equipment-panel';v9Panel.hidden=true;
    v9Panel.innerHTML=`<div class="equipment-head"><div><small>MOCHILA APH</small><b>EQUIPAMENTOS</b></div><button id="closeKit">×</button></div><p>Escolha um recurso. O equipamento fornece dados; a decisão clínica continua sendo sua.</p><div id="equipmentGrid" class="equipment-grid"></div>`;
    gameEl.appendChild(v9Panel);v9Panel.querySelector('#closeKit').onclick=()=>v9Panel.hidden=true;
  }
}
function v9CanUsePatientTool(){return patient?.anchor&&['PATIENT','CLINICAL'].includes(phase)&&dist2(player.root.position,patient.anchor.position)<3.5;}
function v9Read(label,value,sub=''){
  if(!v9Readout)return;v9Readout.hidden=false;v9Readout.innerHTML=`<small>${label}</small><b>${value}</b>${sub?`<span>${sub}</span>`:''}`;
  clearTimeout(v9Readout._t);v9Readout._t=setTimeout(()=>v9Readout.hidden=true,5000);
}
function v9Use(id){
  V9_EQUIP.uses++;V9_EQUIP.used.add(id);V9_EQUIP.last=id;
  const c=ACTIVE_CASE||V8_CASES?.[0];
  if(id==='gloves'){
    if(['SCENE','PATIENT','CLINICAL'].includes(phase)){
      const first=!sceneChecks.has('epi');sceneChecks.add('epi');
      if(first){reward(1,'EPI equipado antes do contato com a vítima.');V9_EQUIP.efficient++;}
      v9Read('EPI','LUVAS EQUIPADAS','Proteção de contato registrada.');
    }else v9Read('EPI','DISPONÍVEL','Use quando a situação exigir preparação para contato.');
  }
  if(id==='flashlight'){
    if(v9CanUsePatientTool()){
      V9_EQUIP.efficient++;v9Read('LANTERNA','INSPEÇÃO AUXILIADA',clinicalStage==='D'?'Ajuda a observar face e olhos sem substituir a resposta neurológica.':'Melhora a leitura visual de detalhes da vítima.');
      logEvent('Lanterna utilizada como auxílio de inspeção.');
    }else v9Read('LANTERNA','SEM ALVO PRÓXIMO','Aproxime-se da área que deseja inspecionar.');
  }
  if(id==='spo2'){
    if(v9CanUsePatientTool()){
      const early=['X','A'].includes(clinicalStage);if(early)penalize(1,'Usou uma medida complementar antes de concluir prioridades anteriores.');else V9_EQUIP.efficient++;
      v9Read('OXIMETRIA',`${c?.spo2??96}%`,'Leitura simulada do caso atual.');logEvent(`Oximetria consultada: ${c?.spo2??96}%.`,early?'bad':'good');
    }else v9Read('OXIMETRIA','SEM LEITURA','É necessário estar junto à vítima.');
  }
  if(id==='bp'){
    if(v9CanUsePatientTool()){
      const early=['X','A','B'].includes(clinicalStage);if(early)penalize(1,'Antecipou uma medida complementar antes de concluir prioridades imediatas.');else V9_EQUIP.efficient++;
      v9Read('PRESSÃO ARTERIAL',c?.bp||'118/76','Valor simulado do caso atual.');logEvent(`Pressão arterial verificada: ${c?.bp||'118/76'}.`,early?'bad':'good');
    }else v9Read('PRESSÃO ARTERIAL','SEM LEITURA','É necessário estar junto à vítima.');
  }
  if(id==='thermal'){
    if(v9CanUsePatientTool()&&['SAMPLE','SECONDARY','DONE'].includes(clinicalStage)){
      if(!V9_EQUIP.used.has('thermal_reward')){V9_EQUIP.used.add('thermal_reward');reward(2,'Proteção térmica mantida após a exposição dirigida.');V9_EQUIP.efficient++;}
      v9Read('PROTEÇÃO TÉRMICA','APLICADA','Cuidado ambiental registrado no caso.');
    }else v9Read('PROTEÇÃO TÉRMICA','AGUARDE O MOMENTO','Priorize a sequência clínica antes de ações complementares.');
  }
  if(id==='radio'){
    if(['SCENE','PATIENT','CLINICAL'].includes(phase)){
      V9_EQUIP.efficient++;v9Read('RÁDIO','CENTRAL CIENTE','Atualização operacional registrada.');logEvent('Central atualizada sobre o andamento da ocorrência.');
    }else v9Read('RÁDIO','CANAL OPERACIONAL','Sem atualização relevante neste momento.');
  }
  if(v9Panel)v9Panel.hidden=true;
}
function v9OpenKit(){
  if(!v9Panel)return;const items=[
    ['gloves','LUVAS','EPI / contato'],['flashlight','LANTERNA','Inspeção visual'],['spo2','OXÍMETRO','Medida complementar'],['bp','PRESSÃO','Medida complementar'],['thermal','MANTA','Proteção térmica'],['radio','RÁDIO','Comunicação']
  ];
  const grid=v9Panel.querySelector('#equipmentGrid');grid.innerHTML='';
  items.forEach(([id,name,sub])=>{const b=document.createElement('button');b.innerHTML=`<b>${name}</b><small>${sub}</small>${V9_EQUIP.used.has(id)?'<i>UTILIZADO</i>':''}`;b.onclick=()=>v9Use(id);grid.appendChild(b);});
  v9Panel.hidden=false;
}

const v9BaseShowDebrief=showDebrief;
showDebrief=function(elapsed){
  v9BaseShowDebrief(elapsed);
  const metrics=document.querySelector('#summaryMetrics');
  if(metrics){const d=document.createElement('div');d.innerHTML=`<b>${V9_EQUIP.efficient}/${V9_EQUIP.uses}</b><span>USO EFICIENTE DO KIT</span>`;metrics.appendChild(d);}
  const learningEl=document.querySelector('#learning');
  if(learningEl&&V9_EQUIP.uses===0){const p=document.createElement('p');p.textContent='O kit é opcional, mas equipamentos podem confirmar dados que não devem ser presumidos pela interface.';learningEl.appendChild(p);}
};

v9SetupEquipmentUI();
