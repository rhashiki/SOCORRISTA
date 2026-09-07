/* Re.Force APH — Build 80 / v80
 * Mobile driving controls: steering stays on the left joystick; throttle and brake/reverse use dedicated pedals.
 */
let V80_ACCEL=false,V80_BRAKE_HELD=false,V80_BRAKE_SINCE=0,V80_UI=null;
function v80SetupVehicleControls(){
  if(document.querySelector('#drivePedals')){V80_UI=document.querySelector('#drivePedals');return;}
  const game=document.querySelector('#game');if(!game)return;
  const wrap=document.createElement('div');wrap.id='drivePedals';wrap.className='drive-pedals';wrap.hidden=true;
  wrap.innerHTML='<button id="vehicleBrakePedal" aria-label="Freio e ré">FREIO<br>RÉ</button><button id="vehicleAccelPedal" aria-label="Acelerador">ACELERAR</button>';
  game.appendChild(wrap);V80_UI=wrap;
  const accel=wrap.querySelector('#vehicleAccelPedal'),brake=wrap.querySelector('#vehicleBrakePedal');
  const accelOn=e=>{e.preventDefault();V80_ACCEL=true;accel.classList.add('on');};
  const accelOff=()=>{V80_ACCEL=false;accel.classList.remove('on');};
  accel.addEventListener('pointerdown',accelOn);['pointerup','pointercancel','pointerleave'].forEach(ev=>accel.addEventListener(ev,accelOff));
  brake.addEventListener('pointerdown',e=>{e.preventDefault();V80_BRAKE_HELD=true;V80_BRAKE_SINCE=performance.now();V27_BRAKE=true;brake.classList.add('on');});
  const brakeOff=()=>{V80_BRAKE_HELD=false;V27_BRAKE=false;brake.classList.remove('on');};
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>brake.addEventListener(ev,brakeOff));
}
function v80UpdateVehicleUI(){
  if(!V80_UI)return;const veh=controlled==='vehicle';V80_UI.hidden=!veh;document.body.classList.toggle('rf-vehicle-mode',veh);
  if(!veh){V80_ACCEL=false;V80_BRAKE_HELD=false;V27_BRAKE=false;}
}
const v80BaseInputAxes=inputAxes;
inputAxes=function(){
  const base=v80BaseInputAxes();if(controlled!=='vehicle')return base;
  const keyAccel=!!keys.KeyW,keyReverse=!!keys.KeyS;
  let y=0;if(V80_ACCEL||keyAccel)y=-1;
  const heldMs=V80_BRAKE_HELD?performance.now()-V80_BRAKE_SINCE:0;
  const reverseReady=V80_BRAKE_HELD&&Math.abs(ambulance.speed||0)<.35&&heldMs>420;
  if(reverseReady||keyReverse){y=1;V27_BRAKE=false;}else if(V80_BRAKE_HELD){y=0;V27_BRAKE=true;}
  return{x:base.x,y};
};
const v80BaseUpdate=update;
update=function(dt){v80BaseUpdate(dt);v80UpdateVehicleUI();};
const v80BaseInit=init;
init=async function(){v80SetupVehicleControls();await v80BaseInit();v80UpdateVehicleUI();};
v80SetupVehicleControls();
