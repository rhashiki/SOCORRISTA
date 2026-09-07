/* Re.Force APH — Build 48 / v48
 * Visual ambulance door feedback on enter/exit transitions.
 */

let V48_DOOR={pivot:null,panel:null,target:0,hold:0,mode:null};
function v48CreateDriverDoor(){
  if(V48_DOOR.pivot||!ambulance?.root)return;
  const pivot=new THREE.Group();pivot.position.set(-1.08,1.35,-2.42);ambulance.root.add(pivot);
  const panel=box([.08,1.12,.95],0xe9eceb,[0,0,.47],undefined,pivot);box([.085,.42,.66],0x293b47,[0,.24,.45],undefined,pivot);box([.09,.08,.18],0x22272b,[-.02,-.05,.87],undefined,pivot);
  V48_DOOR={pivot,panel,target:0,hold:0,mode:null};
}
function v48PulseDoor(mode){v48CreateDriverDoor();V48_DOOR.mode=mode;V48_DOOR.target=-1.05;V48_DOOR.hold=.72;}
function v48UpdateDoor(dt){
  const d=V48_DOOR;if(!d.pivot)return;d.pivot.rotation.y=THREE.MathUtils.lerp(d.pivot.rotation.y,d.target,1-Math.exp(-dt*8));
  if(d.hold>0){d.hold-=dt;if(d.hold<=0)d.target=0;}
}
const v48BaseEnter=enterAmbulance;
enterAmbulance=function(){v48PulseDoor('enter');v48BaseEnter();};
const v48BaseExit=exitAmbulance;
exitAmbulance=function(){v48BaseExit();v48PulseDoor('exit');};
const v48BaseUpdate=update;
update=function(dt){v48BaseUpdate(dt);v48UpdateDoor(dt);};
const v48BaseInit=init;
init=async function(){V48_DOOR={pivot:null,panel:null,target:0,hold:0,mode:null};await v48BaseInit();v48CreateDriverDoor();};
