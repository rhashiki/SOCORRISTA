/* Re.Force APH — Build 41 / v41
 * Lightweight procedural city ambience and responder footsteps.
 */

let V41_AUDIO={noise:null,noiseGain:null,filter:null,lastStep:0,stepSide:0};
function v41StartAmbience(){
  if(V26_AUDIO?.muted||!audioCtx||V41_AUDIO.noise)return;
  const length=Math.floor(audioCtx.sampleRate*2),buffer=audioCtx.createBuffer(1,length,audioCtx.sampleRate),data=buffer.getChannelData(0);let last=0;
  for(let i=0;i<length;i++){const white=Math.random()*2-1;last=last*.985+white*.015;data[i]=white*.12+last*.88;}
  const src=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),gain=audioCtx.createGain();src.buffer=buffer;src.loop=true;filter.type='bandpass';filter.frequency.value=V24_ENV?.id==='night'?420:620;filter.Q.value=.35;gain.gain.value=.0045;src.connect(filter).connect(gain).connect(audioCtx.destination);src.start();V41_AUDIO={noise:src,noiseGain:gain,filter,lastStep:0,stepSide:0};
}
function v41StopAmbience(){const a=V41_AUDIO;if(a.noise){try{a.noise.stop();}catch{}}V41_AUDIO={noise:null,noiseGain:null,filter:null,lastStep:0,stepSide:0};}
function v41Footstep(){
  if(V26_AUDIO?.muted||!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();o.type='triangle';o.frequency.setValueAtTime(V41_AUDIO.stepSide?92:105,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(58,audioCtx.currentTime+.07);f.type='lowpass';f.frequency.value=480;g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.018,audioCtx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.09);o.connect(f).connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.1);V41_AUDIO.stepSide^=1;
}
function v41UpdateAudio(){
  if(V26_AUDIO?.muted){if(V41_AUDIO.noise)v41StopAmbience();return;}if(audioCtx&&!V41_AUDIO.noise)v41StartAmbience();
  if(V41_AUDIO.noiseGain){const vehicle=controlled==='vehicle',sceneClose=dist2(controlled==='vehicle'?ambulance.root.position:player.root.position,ACCIDENT_POS)<14;let level=vehicle?.0028:.0045;if(sceneClose)level+=.0015;V41_AUDIO.noiseGain.gain.setTargetAtTime(level,audioCtx.currentTime,.5);}
  if(controlled==='player'&&!uiBlock()&&Math.abs(player.speed||0)>.45){const now=performance.now(),running=player.speed>4.4,interval=running?285:430;if(now-V41_AUDIO.lastStep>interval){V41_AUDIO.lastStep=now;v41Footstep();}}
}
const v41BaseInit=init;
init=async function(){await v41BaseInit();if(!V26_AUDIO?.muted)v41StartAmbience();};
const v41BaseUpdate=update;
update=function(dt){v41BaseUpdate(dt);v41UpdateAudio();};
