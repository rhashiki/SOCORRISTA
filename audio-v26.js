/* Re.Force APH — Build 22 / v26
 * Optional engine audio, master mute and lightweight haptic feedback.
 */

const V26_KEY='reforce-audio-v26';
let V26_AUDIO={muted:localStorage.getItem(V26_KEY)==='muted',engineOsc:null,engineGain:null};
function v26Save(){localStorage.setItem(V26_KEY,V26_AUDIO.muted?'muted':'on');}
function v26SetupUI(){
  const game=document.querySelector('#game');if(!game||document.querySelector('#audioToggle'))return;
  const b=document.createElement('button');b.id='audioToggle';b.className='audio-toggle';b.textContent=V26_AUDIO.muted?'🔇':'🔊';b.onclick=()=>{V26_AUDIO.muted=!V26_AUDIO.muted;v26Save();b.textContent=V26_AUDIO.muted?'🔇':'🔊';if(audioCtx){if(V26_AUDIO.muted){setSirenAudio(false);v26StopEngine();}else if(controlled==='vehicle')v26StartEngine();}};game.appendChild(b);
}
function v26Vibrate(ms=18){if(!V26_AUDIO.muted&&navigator.vibrate)try{navigator.vibrate(ms);}catch{}}
function v26StartEngine(){
  if(V26_AUDIO.muted||!audioCtx||V26_AUDIO.engineOsc)return;
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';o.frequency.value=56;g.gain.value=.0001;o.connect(g).connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.012,audioCtx.currentTime+.15);V26_AUDIO.engineOsc=o;V26_AUDIO.engineGain=g;
}
function v26StopEngine(){
  const {engineOsc:o,engineGain:g}=V26_AUDIO;if(!o||!g)return;try{g.gain.setTargetAtTime(.0001,audioCtx.currentTime,.06);setTimeout(()=>{try{o.stop();}catch{}},260);}catch{}V26_AUDIO.engineOsc=null;V26_AUDIO.engineGain=null;
}
function v26UpdateEngine(){
  if(V26_AUDIO.muted||controlled!=='vehicle'){if(V26_AUDIO.engineOsc)v26StopEngine();return;}if(!V26_AUDIO.engineOsc)v26StartEngine();if(!V26_AUDIO.engineOsc||!audioCtx)return;
  const speed=Math.abs(ambulance.speed||0),freq=52+Math.min(75,speed*4.2);V26_AUDIO.engineOsc.frequency.setTargetAtTime(freq,audioCtx.currentTime,.06);V26_AUDIO.engineGain.gain.setTargetAtTime(.008+Math.min(.012,speed*.0007),audioCtx.currentTime,.08);
}

const v26BaseSiren=setSirenAudio;
setSirenAudio=function(on){if(V26_AUDIO.muted)return v26BaseSiren(false);return v26BaseSiren(on);};
const v26BaseEnter=enterAmbulance;
enterAmbulance=function(){v26BaseEnter();v26StartEngine();v26Vibrate(16);};
const v26BaseExit=exitAmbulance;
exitAmbulance=function(){v26BaseExit();v26StopEngine();v26Vibrate(14);};
const v26BaseFlash=flash;
flash=function(msg,ms){v26BaseFlash(msg,ms);if(/colisão|piora|prioridade|chegada/i.test(String(msg)))v26Vibrate(28);};
const v26BaseUpdate=update;
update=function(dt){v26BaseUpdate(dt);v26UpdateEngine();};
v26SetupUI();
