/* Re.Force APH — Build 70 / v70
 * Runtime performance governor: adjusts render pixel ratio conservatively on sustained FPS pressure.
 */
let V70_PERF={ema:60,clock:0,lastAdjust:0,qualityDrops:0,recoveries:0};
function v70ProfileCap(){const d=Math.min(devicePixelRatio||1,2);if(V16_PROFILE==='eco')return Math.min(d,1.15);if(V16_PROFILE==='high')return Math.min(d,1.7);return Math.min(d,1.45);}
function v70ResizeRenderer(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight,false);}
function v70AdaptivePerformance(dt){
  if(!renderer||dt<=0)return;const fps=Math.min(90,1/dt);V70_PERF.ema=THREE.MathUtils.lerp(V70_PERF.ema,fps,.035);V70_PERF.clock+=dt;
  if(V70_PERF.clock-V70_PERF.lastAdjust<4)return;const current=renderer.getPixelRatio?.()||1,cap=v70ProfileCap();
  if(V70_PERF.ema<37&&current>.86){const next=Math.max(.85,current-.14);renderer.setPixelRatio(next);v70ResizeRenderer();V70_PERF.lastAdjust=V70_PERF.clock;V70_PERF.qualityDrops++;}
  else if(V70_PERF.ema>56&&current<cap-.05){const next=Math.min(cap,current+.08);renderer.setPixelRatio(next);v70ResizeRenderer();V70_PERF.lastAdjust=V70_PERF.clock;V70_PERF.recoveries++;}
  window.RF_PERFORMANCE={fps:Math.round(V70_PERF.ema),pixelRatio:+(renderer.getPixelRatio?.()||1).toFixed(2),drops:V70_PERF.qualityDrops,recoveries:V70_PERF.recoveries,profile:V16_PROFILE};
}
const v70BaseUpdate=update;
update=function(dt){v70BaseUpdate(dt);v70AdaptivePerformance(dt);};
const v70BaseInit=init;
init=async function(){V70_PERF={ema:60,clock:0,lastAdjust:0,qualityDrops:0,recoveries:0};await v70BaseInit();const cap=v70ProfileCap();if(renderer&&(renderer.getPixelRatio?.()||1)>cap){renderer.setPixelRatio(cap);v70ResizeRenderer();}};
