/* Re.Force APH — Integration bootstrap v93 (legacy filename) */
window.RF_BUILD=93;
window.__RF_BOOT_ERRORS=window.__RF_BOOT_ERRORS||[];
(function(){
  const start=document.querySelector('#startShift');
  if(start){start.disabled=true;start.textContent='OTIMIZANDO...';}
  const meta=document.querySelector('meta[name="reforce-build"]');if(meta)meta.content='93';
  const modeBuild=document.querySelector('.mode-row span:last-child');if(modeBuild)modeBuild.textContent='BUILD 93';
  const badge=document.createElement('div');badge.textContent='BUILD 93';badge.style.cssText='position:fixed;right:8px;bottom:8px;z-index:9999;padding:4px 7px;background:#090b0dcc;border:1px solid #ffffff22;color:#d8a05b;font:700 9px/1.2 system-ui;letter-spacing:.08em;pointer-events:none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(badge),{once:true});

  let perfReady=false,pageReady=document.readyState==='complete';
  function audit(){
    if(!perfReady||!pageReady)return;
    if(start){start.disabled=false;start.textContent='INICIAR PLANTÃO';}
    const required=[
      'init','buildCity','buildActors','buildAccident','renderX','renderA','renderB','renderC','renderD','renderE','renderSample','startSecondary','finishMission',
      'v31Texture','v32UpdatePatientVisual','v33ApplyCorridor','v34Announce','v35Hash','v36SetupMap','v36SetVisible','v36OpenMap','v36CloseMap','v37ResolveCamera','v38Apply','v39CreateStretcher','v40SpawnTraffic',
      'v41UpdateAudio','v42Setup','v43Build','v44UpdatePedStates','v45Record','v46UpdatePoses','v47Speak','v48CreateDriverDoor','v49UpdateDrive','v50Banner',
      'v51BuildArchitecture','v52ApplyVehicles','v53UpdateFacing','v54ApplyLOD','v55BuildSceneQuality','v56ApplyTextures','v57ApplyPeople','v58ApplyContactShadows','v59UpdateCameraPolish','v60BuildSkyline',
      'v61BuildRoadWear','v62BuildStreetVehicles','v63ApplyFaces','v64BuildStreetLife','v65ApplyAtmosphere','v66FixTrafficOrientation','v67ResolvePlayerMove','v68BuildWayfinding','v69UpdateActionLabel','v70AdaptivePerformance',
      'v71BuildExpandedDistrict','v72ApplyLocations','v73SpawnOuterTraffic','v74BuildOuterPedestrians','v75GridRoute','v76DrawRoadGrid','v77BuildLandmarks','v78ApplyStreaming','v79AssignOuterLanes','v80SetupVehicleControls',
      'v81ApplyCharacters','v82Motion','v83BuildAmbulanceQuality','v84ApplyTrafficMotion','v85ApplyRenderStyle','v86BuildPatientFace','v87BuildOuterFacades','v88BuildStreetDensity','v89OverlayMap','v90ApplyShadowBudget',
      'v92SetupGlasgowUI','v92SetGlasgowVisible','v92OpenGlasgow','v92CloseGlasgow','v93ApplyPerformanceBudget','v93PixelCap'
    ];
    const missing=required.filter(name=>typeof globalThis[name]!=='function');
    const bootErrors=window.__RF_BOOT_ERRORS||[];
    const mapModal=document.querySelector('#fullMapModal');
    const mapVisibleAtBoot=!!mapModal&&(getComputedStyle(mapModal).display!=='none'||!mapModal.hidden);
    if(mapVisibleAtBoot){bootErrors.push({message:'Mapa em tela cheia visível durante o boot.'});v36SetVisible?.(false);}
    const glasgow=document.querySelector('#glasgowModal');
    const glasgowVisibleAtBoot=!!glasgow&&(getComputedStyle(glasgow).display!=='none'||!glasgow.hidden);
    if(glasgowVisibleAtBoot){bootErrors.push({message:'Glasgow visível fora da etapa D durante o boot.'});v92SetGlasgowVisible?.(false);}
    const hiddenLeaks=[...document.querySelectorAll('[hidden]')].filter(el=>getComputedStyle(el).display!=='none');
    if(hiddenLeaks.length){bootErrors.push({message:`${hiddenLeaks.length} elemento(s) [hidden] continuam visíveis.`});hiddenLeaks.forEach(el=>el.style.display='none');}
    if(missing.length||bootErrors.length){
      console.warn('Re.Force v93 integration warning',{missing,bootErrors});
      const t=document.querySelector('#toast');if(t){t.hidden=false;t.textContent='Aviso de integração detectado. Recarregue a página; se persistir, reporte a etapa em que parou.';setTimeout(()=>t.hidden=true,5500);}
    }else console.info('Re.Force APH Build 93 integrada com sucesso.');
  }

  const perf=document.createElement('script');perf.src='./performancefix-v93.js?v=93';perf.async=false;
  perf.onload=()=>{perfReady=true;audit();};
  perf.onerror=()=>{window.__RF_BOOT_ERRORS.push({message:'Falha ao carregar Performance Rescue v93.'});if(start){start.disabled=false;start.textContent='INICIAR PLANTÃO';}};
  document.head.appendChild(perf);

  window.addEventListener('load',()=>{
    pageReady=true;
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js?v=92').catch(err=>console.warn('SW:',err));
    audit();
  },{once:true});
})();
