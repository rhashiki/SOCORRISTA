/* Re.Force APH — Build 68 / v68
 * Urban wayfinding: street-name boards and district identifiers at key intersections.
 */
let V68_SIGNS=[];
function v68BoardTexture(text,bg='#244f64',fg='#f4f4ef'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,512,128);x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=7;x.strokeRect(7,7,498,114);x.fillStyle=fg;x.font='900 48px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,66);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function v68StreetSign(text,x,z,rot=0,color='#244f64'){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);V68_SIGNS.push(g);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,2.65,8),new THREE.MeshStandardMaterial({color:0x51585c,roughness:.62,metalness:.32}));pole.position.y=1.325;g.add(pole);
  const mat=new THREE.MeshBasicMaterial({map:v68BoardTexture(text,color),transparent:false,side:THREE.DoubleSide}),board=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.55),mat);board.position.set(0,2.42,0);g.add(board);return g;
}
function v68BuildWayfinding(){
  V68_SIGNS=[];
  v68StreetSign('AV. CENTRAL',-7,-36,0,'#315b6d');v68StreetSign('RUA 4',7,-36,Math.PI/2,'#315b6d');
  v68StreetSign('AV. CENTRAL',-7,6,0,'#315b6d');v68StreetSign('RUA NORTE',7,6,Math.PI/2,'#4a5d3c');
  v68StreetSign('RUA HOSPITAL',41,23,Math.PI/2,'#6d4444');v68StreetSign('BASE RE.FORCE',-41,23,Math.PI/2,'#4e3f34');
  v68StreetSign('SETOR LESTE',41,-7,Math.PI/2,'#4a536c');v68StreetSign('SETOR OESTE',-41,-7,Math.PI/2,'#4a536c');
}
const v68BaseBuildCity=buildCity;
buildCity=function(){v68BaseBuildCity();v68BuildWayfinding();};
