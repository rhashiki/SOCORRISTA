/* Re.Force APH — Build 18 / v22
 * Case-specific SAMPLE interview + classification challenge.
 */

const V22_SAMPLE_BANK={
  x_external:{S:'Dor forte na perna direita e tontura leve.',A:'Relata alergia a dipirona.',M:'Usa medicamento diário para hipertensão.',P:'Refere hipertensão.',L:'Almoçou há cerca de duas horas.',E:'A moto foi atingida lateralmente e a vítima caiu para o lado direito.'},
  a_airway:{S:'Dor de cabeça e dificuldade para organizar as respostas.',A:'Nega alergias conhecidas.',M:'Nega medicação de uso contínuo.',P:'Nega condição crônica relevante.',L:'Fez um lanche há cerca de uma hora.',E:'Perdeu o controle da moto após a colisão e caiu próximo à barreira.'},
  b_breathing:{S:'Relata dor no tórax e sensação de falta de ar.',A:'Nega alergias conhecidas.',M:'Usa medicação inalatória prescrita para asma.',P:'Refere asma controlada.',L:'Comeu há aproximadamente três horas.',E:'Foi atingido no cruzamento e caiu sobre o lado esquerdo.'},
  stable_primary:{S:'Dor no ombro e escoriações leves.',A:'Nega alergias conhecidas.',M:'Nega uso diário de medicamentos.',P:'Nega doenças conhecidas.',L:'Tomou café há cerca de duas horas.',E:'A roda dianteira travou e ocorreu queda sem colisão com outro veículo.'},
  d_neuro:{S:'Dor de cabeça e tontura.',A:'Nega alergias conhecidas.',M:'Usa apenas medicação prescrita para rinite quando necessário.',P:'Nega doença crônica relevante.',L:'Almoçou há cerca de uma hora e meia.',E:'Escorregou na escada e caiu alguns degraus.'},
  c_perfusion:{S:'Tontura, fraqueza e dor difusa após a queda.',A:'Relata alergia a um antibiótico, sem lembrar o nome.',M:'Nega medicação de uso contínuo.',P:'Nega condição crônica conhecida.',L:'Fez uma refeição há cerca de quatro horas.',E:'Foi atingido por um carro em baixa velocidade no cruzamento e caiu ao solo.'}
};
const V22_QUESTIONS={S:'O que você está sentindo agora?',A:'Você tem alguma alergia conhecida?',M:'Usa algum medicamento?',P:'Tem alguma condição de saúde importante?',L:'Quando comeu ou bebeu pela última vez?',E:'Conte o que aconteceu antes e durante o evento.'};
let V22_CLASSIFY=[];
function v22Profile(){return V22_SAMPLE_BANK[ACTIVE_CASE?.id]||V22_SAMPLE_BANK.x_external;}
function v22Shuffle(a){return a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);}

renderSample=function(){
  const profile=v22Profile(),actions=[];
  for(const code of ['S','A','M','P','L','E'])actions.push({label:V22_QUESTIONS[code],done:patient.sample.has(code),fn:()=>{
    if(!patient.sample.has(code)){patient.sample.add(code);reward(1,`SAMPLE: informação ${code} obtida.`);}
    observe(profile[code]);setTimeout(renderSample,850);
  }});
  actions.push({label:'Você acha que a culpa foi de quem?',fn:()=>{penalize(2,'Pergunta sem valor para a história clínica dirigida.');observe('Essa opinião não ajuda a organizar o SAMPLE ou a prioridade clínica.');}});
  actions.push({label:'Qual era a velocidade exata?',fn:()=>{penalize(1,'Pergunta excessivamente específica sem utilidade imediata para esta etapa.');observe('O mecanismo é relevante, mas esse detalhe exato não é necessário para organizar o SAMPLE deste caso.');}});
  if(patient.sample.size===6)actions.push({label:'Organizar as informações em S • A • M • P • L • E',primary:true,fn:v22StartClassification});
  openInteraction('História dirigida','SAMPLE','Faça perguntas úteis e depois demonstre que sabe onde cada resposta pertence no mnemônico.',actions);
};
function v22StartClassification(){
  const profile=v22Profile();V22_CLASSIFY=v22Shuffle(['S','A','M','P','L','E'].map(code=>({code,text:profile[code]})));patient.v22ClassIndex=0;renderSampleClassification();
}
function renderSampleClassification(){
  const i=patient.v22ClassIndex||0;
  if(i>=V22_CLASSIFY.length){clinicalStage='SECONDARY';reward(4,'SAMPLE organizado corretamente por categorias.');startSecondary();return;}
  const item=V22_CLASSIFY[i];
  openInteraction(`Classificação ${i+1}/6`,'SAMPLE',`Em qual campo do SAMPLE esta informação pertence?\n\n“${item.text}”`,['S','A','M','P','L','E'].map(code=>({label:code,primary:code===item.code,fn:()=>{
    if(code===item.code){reward(1,`Classificação correta: ${code}.`);patient.v22ClassIndex=i+1;renderSampleClassification();}
    else{penalize(3,`Classificou uma informação de ${item.code} como ${code}.`);observe('Releia a informação e pense no significado de cada letra do mnemônico.');}
  }})));
}
