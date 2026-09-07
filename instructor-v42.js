/* Re.Force APH — Build 42 / v42
 * Instructor/QA console for reproducible scenario setup before shift start.
 */

let V42_ENV_FORCE=null;
function v42CaseOptions(){return (V8_CASES||[]).map(c=>`<option value="${c.id}">${c.id} — ${c.title}</option>`).join('');}
function v42Setup(){
  const card=document.querySelector('.landing-card');if(!card||document.querySelector('#instructorConsole'))return;
  const q=new URLSearchParams(location.search),current=q.get('case')||'',env=q.get('env')||'',el=document.createElement('details');el.id='instructorConsole';el.className='instructor-console';
  el.innerHTML=`<summary>CONSOLE DO INSTRUTOR / QA</summary><div class="instructor-grid"><label>Caso<select id="instCase"><option value="">Dinâmico / adaptativo</option>${v42CaseOptions()}</select></label><label>Modo<select id="instMode"><option value="training">Treinamento</option><option value="simulation">Simulação</option><option value="evaluation">Avaliação</option></select></label><label>Ambiente<select id="instEnv"><option value="">Aleatório</option><option value="day">Dia</option><option value="sunset">Fim de tarde</option><option value="night">Noite</option><option value="rain">Chuva leve</option></select></label><label>Gráficos<select id="instGfx"><option value="eco">Econômico</option><option value="balanced">Equilibrado</option><option value="high">Alto</option></select></label></div><div class="instructor-actions"><button id="applyInstructor">APLICAR CONFIGURAÇÃO</button><button id="randomInstructor">LIMPAR / ALEATÓRIO</button></div><small>O console altera somente esta simulação local e é útil para repetir o mesmo cenário durante treinamento.</small>`;
  const btn=card.querySelector('#startShift');card.insertBefore(el,btn);
  el.querySelector('#instCase').value=current;el.querySelector('#instMode').value=V13_MODE;el.querySelector('#instEnv').value=env;el.querySelector('#instGfx').value=V16_PROFILE;
  el.querySelector('#applyInstructor').onclick=()=>{
    const caseId=el.querySelector('#instCase').value,mode=el.querySelector('#instMode').value,envId=el.querySelector('#instEnv').value,gfx=el.querySelector('#instGfx').value,p=new URLSearchParams(location.search);
    if(caseId)p.set('case',caseId);else p.delete('case');p.delete('seed');if(envId)p.set('env',envId);else p.delete('env');history.replaceState(null,'',`${location.pathname}${p.toString()?`?${p}`:''}`);
    V13_MODE=mode;localStorage.setItem(V13_KEY,mode);V16_PROFILE=gfx;localStorage.setItem(V16_KEY,gfx);V42_ENV_FORCE=envId||null;
    document.querySelectorAll('#modeSelector button').forEach(x=>x.classList.toggle('active',x.dataset.mode===mode));document.querySelectorAll('#graphicsSelector button').forEach(x=>x.classList.toggle('active',x.dataset.gfx===gfx));flashLanding('Configuração aplicada ao próximo plantão.');
  };
  el.querySelector('#randomInstructor').onclick=()=>{const p=new URLSearchParams(location.search);['case','seed','env'].forEach(k=>p.delete(k));history.replaceState(null,'',`${location.pathname}${p.toString()?`?${p}`:''}`);el.querySelector('#instCase').value='';el.querySelector('#instEnv').value='';V42_ENV_FORCE=null;flashLanding('Cenário voltou ao modo dinâmico.');};
}
function flashLanding(msg){let x=document.querySelector('#landingToast');if(!x){x=document.createElement('div');x.id='landingToast';x.className='landing-toast';document.querySelector('.landing-card')?.appendChild(x);}x.textContent=msg;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2100);}
const v42BaseEnvPick=v24Pick;
v24Pick=function(){const q=new URLSearchParams(location.search),forced=V42_ENV_FORCE||q.get('env');if(forced){const p=V24_PRESETS.find(x=>x.id===forced);if(p)return p;}return v42BaseEnvPick();};
v42Setup();
