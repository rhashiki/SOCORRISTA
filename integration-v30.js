/* Re.Force APH — Integration bootstrap v85 (legacy filename) */
window.RF_BUILD=85;
window.__RF_BOOT_ERRORS=window.__RF_BOOT_ERRORS||[];
(function(){
  const badge=document.createElement('div');badge.textContent='BUILD 85';badge.style.cssText='position:fixed;right:8px;bottom:8px;z-index:9999;padding:4px 7px;background:#090b0dcc;border:1px solid #ffffff22;color:#d8a05b;font:700 9px/1.2 system-ui;letter-spacing:.08em;pointer-events:none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(badge),{once:true});
  window.addEventListener('load',()=>{
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js?v=85').catch(err=>console.warn('SW v85:',err));
    const required=[
      'init','buildCity','buildActors','buildAccident','renderX','renderA','renderB','renderC','renderD','renderE','renderSample','startSecondary','finishMission',
      'v31Texture','v32UpdatePatientVisual','v33ApplyCorridor','v34Announce','v35Hash','v36SetupMap','v37ResolveCamera','v38Apply','v39CreateStretcher','v40SpawnTraffic',
      'v41UpdateAudio','v42Setup','v43Build','v44UpdatePedStates','v45Record','v46UpdatePoses','v47Speak','v48CreateDriverDoor','v49UpdateDrive','v50Banner',
      'v51BuildArchitecture','v52ApplyVehicles','v53UpdateFacing','v54ApplyLOD','v55BuildSceneQuality','v56ApplyTextures','v57ApplyPeople','v58ApplyContactShadows','v59UpdateCameraPolish','v60BuildSkyline',
      'v61BuildRoadWear','v62BuildStreetVehicles','v63ApplyFaces','v64BuildStreetLife','v65ApplyAtmosphere','v66FixTrafficOrientation','v67ResolvePlayerMove','v68BuildWayfinding','v69UpdateActionLabel','v70AdaptivePerformance',
      'v71BuildExpandedDistrict','v72ApplyLocations','v73SpawnOuterTraffic','v74BuildOuterPedestrians','v75GridRoute',
      'v76DrawRoadGrid','v77BuildLandmarks','v78ApplyStreaming','v79AssignOuterLanes','v80SetupVehicleControls',
      'v81ApplyCharacters','v82Motion','v83BuildAmbulanceQuality','v84ApplyTrafficMotion','v85ApplyRenderStyle'
    ];
    const missing=required.filter(name=>typeof globalThis[name]!=='function');
    const bootErrors=window.__RF_BOOT_ERRORS||[];
    if(missing.length||bootErrors.length){
      console.warn('Re.Force v85 integration warning',{missing,bootErrors});
      const t=document.querySelector('#toast');if(t){t.hidden=false;t.textContent='Aviso de integração detectado. Recarregue a página; se persistir, reporte a etapa em que parou.';setTimeout(()=>t.hidden=true,5500);}
    }else console.info('Re.Force APH Build 85 integrada com sucesso.');
  },{once:true});
})();
