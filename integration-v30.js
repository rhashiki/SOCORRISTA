/* Re.Force APH — Integration bootstrap v30 */
window.RF_BUILD=30;
window.__RF_BOOT_ERRORS=window.__RF_BOOT_ERRORS||[];

(function(){
  const badge=document.createElement('div');
  badge.textContent='BUILD 30';
  badge.style.cssText='position:fixed;right:8px;bottom:8px;z-index:9999;padding:4px 7px;background:#090b0dcc;border:1px solid #ffffff22;color:#d8a05b;font:700 9px/1.2 system-ui;letter-spacing:.08em;pointer-events:none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(badge),{once:true});

  window.addEventListener('load',()=>{
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js?v=30').catch(err=>console.warn('SW v30:',err));
    }
    const required=['init','buildCity','buildActors','buildAccident','renderX','renderA','renderB','renderC','renderD','renderE','renderSample','startSecondary','finishMission'];
    const missing=required.filter(name=>typeof window[name]!=='function' && typeof globalThis[name]!=='function');
    const bootErrors=window.__RF_BOOT_ERRORS||[];
    if(missing.length||bootErrors.length){
      console.warn('Re.Force v30 integration warning',{missing,bootErrors});
      const t=document.querySelector('#toast');
      if(t){
        t.hidden=false;
        t.textContent='Aviso de integração detectado. Recarregue a página; se persistir, reporte a etapa em que parou.';
        setTimeout(()=>{t.hidden=true;},5000);
      }
    }else{
      console.info('Re.Force APH Build 30 integrada com sucesso.');
    }
  },{once:true});
})();
