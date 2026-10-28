(()=>{'use strict';
const $=id=>document.getElementById(id), host=$('oyun');
if(!window.THREE){$('basla').textContent='Three.js yüklenemedi';$('basla').disabled=true;return;}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8bcff8);scene.fog=new THREE.Fog(0x8bcff8,30,105);
const camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.1,130);scene.add(camera);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd9f3ff,0x62714c,2));const sun=new THREE.DirectionalLight(0xfff2d6,2.2);sun.position.set(-25,40,15);scene.add(sun);
// Soft blocky clouds drift slowly above the mountains.
const cloudGroups=[];
for(let ci=0;ci<9;ci++){
 const group=new THREE.Group();const cx=(ci*23)%150-65,cz=(ci*37)%150-65,cy=24+(ci%3)*3;
 const cloudMat=new THREE.MeshLambertMaterial({color:0xf4fbff,transparent:true,opacity:.88});
 [[0,0,0],[1.4,0,0],[-1.3,0,.1],[.4,.35,.1]].forEach(([x,y,z])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.7,1.6),cloudMat);m.position.set(x,y,z);group.add(m);});
 group.position.set(cx,cy,cz);group.userData.baseX=cx;scene.add(group);cloudGroups.push(group);
}

const colors={grass:0x65a947,dirt:0x87502d,stone:0x858b91,wood:0x80522e,leaves:0x2d7e3a,sand:0xd9c27a,coal:0x34383d,iron:0xb5a28b,gold:0xf2c542,diamond:0x43e1d0,snow:0xf4fbff,bedrock:0x292d31};const names={grass:'Çimen',dirt:'Toprak',stone:'Taş',wood:'Odun',leaves:'Yaprak',sand:'Kum',coal:'Kömür cevheri',iron:'Demir cevheri',gold:'Altın cevheri',diamond:'Elmas cevheri',snow:'Kar',bedrock:'Ana kaya',plank:'Tahta kalas',stick:'Çubuk'};
// Procedural pixel-art texture atlas: no external image files required.
function makeAtlas(){
 const size=64, canvas=document.createElement('canvas');canvas.width=size*4;canvas.height=size*4;
 const ctx=canvas.getContext('2d');let seed=781923;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 function tile(tx,ty,base,accent,detail=280){
  const ox=tx*size,oy=ty*size;ctx.fillStyle=base;ctx.fillRect(ox,oy,size,size);
  for(let i=0;i<detail;i++){
   const shade=rand();ctx.fillStyle=shade>.66?accent:(shade>.35?'rgba(255,255,255,.10)':'rgba(0,0,0,.13)');
   const w=2+Math.floor(rand()*6),h=2+Math.floor(rand()*5);
   ctx.fillRect(ox+Math.floor(rand()*(size-w)),oy+Math.floor(rand()*(size-h)),w,h);
  }
  // restrained pixel seams give the textures a crisp voxel-art look
  ctx.strokeStyle='rgba(0,0,0,.10)';ctx.lineWidth=1;
  for(let i=8;i<size;i+=16){ctx.beginPath();ctx.moveTo(ox+i,oy);ctx.lineTo(ox+i,oy+size);ctx.stroke();}
 }
 tile(0,0,'#58ad35','#83d34d',360); // grass top
 tile(1,0,'#80502d','#a66b3c',300); // grass side base
 // distinct grass fringe on the side texture
 ctx.fillStyle='#5ebc39';ctx.fillRect(64,0,64,12);
 for(let i=0;i<24;i++){const x=64+Math.floor(rand()*64),h=4+Math.floor(rand()*13);ctx.fillStyle=rand()>.5?'#4b9d2f':'#75ca43';ctx.fillRect(x,10,2,h);}
 tile(2,0,'#80502d','#a87549',320);tile(3,0,'#777f86','#a2aab0',360);
 tile(0,1,'#80522e','#b07a49',180); // bark
 for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#5f3b23':'#c08a52';ctx.fillRect(i*5,64,2,64);}
 tile(1,1,'#2f8135','#55a944',280); // leaves
 for(let i=0;i<42;i++){ctx.clearRect(64+Math.floor(rand()*64),64+Math.floor(rand()*64),2+Math.floor(rand()*3),2+Math.floor(rand()*3));}
 tile(2,1,'#d9c27a','#f0df9c',250);tile(3,1,'#6c8f3c','#8bac4b',230);
 // Ore tiles use large readable mineral clusters on a stony background.
 const ore=(tx,ty,base,light,dark)=>{tile(tx,ty,base,'#969da2',180);for(let i=0;i<16;i++){const x=tx*64+Math.floor(rand()*13)*4,y=ty*64+Math.floor(rand()*13)*4;ctx.fillStyle=dark;ctx.fillRect(x,y,8,8);ctx.fillStyle=light;ctx.fillRect(x+2,y+1,4,5);}};
 ore(0,2,'#777e84','#252a2e','#454b50');ore(1,2,'#777e84','#d2b99a','#9b8067');ore(2,2,'#777e84','#ffd84d','#b77b17');ore(3,2,'#777e84','#61f3df','#168e91');
 // Give ores a more natural, recognizable vein pattern: darker outline, bright core,
 // and a few tiny glints. Keep all pixels inside their own atlas tile.
 function oreGlints(tx,ty,light){for(let i=0;i<9;i++){const x=tx*64+4+Math.floor(rand()*14)*4,y=ty*64+4+Math.floor(rand()*14)*3;ctx.fillStyle=light;ctx.fillRect(x,y,2,2);}}
 oreGlints(0,2,'#b4b9bd');oreGlints(1,2,'#f1d8b8');oreGlints(2,2,'#fff1a0');oreGlints(3,2,'#c4fff5');
 tile(0,3,'#292d31','#4b5157',250); // bedrock
 for(let i=0;i<18;i++){ctx.fillStyle=i%2?'#171a1d':'#62696e';ctx.fillRect(Math.floor(rand()*64),192+Math.floor(rand()*64),3+Math.floor(rand()*8),3+Math.floor(rand()*5));}
 tile(1,3,'#6c8f3c','#8bac4b',220);tile(2,3,'#8c969d','#b9c2c8',220);tile(3,3,'#eff8ff','#ffffff',120);
 const tex=new THREE.CanvasTexture(canvas);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestMipmapNearestFilter;tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;return tex;
}
const atlas=makeAtlas();
const cube=new THREE.BoxGeometry(1,1,1), chunks=new Map(), edits=new Map(), counts={grass:0,dirt:0,stone:0,wood:0,leaves:0,sand:0,coal:0,iron:0,gold:0,diamond:0,snow:0,bedrock:0,plank:0,stick:0};const items={wooden_sword:0,stone_sword:0,iron_sword:0,iron_armor:0,obsidian:0,portal_kit:0,blaze_rod:0,ender_pearl:0,eye_of_ender:0,end_key:0};let selected='grass',selectedItem=null,selectedIngredient=null,craftGrid=Array(16).fill(null),started=false,yaw=0,pitch=0,px=0,pz=0,py=5,vy=0,onGround=false,hp=10,hunger=10,clock=new THREE.Clock(),lastX=null,lastY=null,thirdPerson=false,dimension='overworld',dragonHP=12,gameWon=false;const pressed=new Set();let target=null;
const ck=(x,z)=>`${Math.floor(x/16)},${Math.floor(z/16)}`, bk=(x,y,z)=>`${x},${y},${z}`;
function terrain(x,z){const broad=Math.sin(x*.024)*4.2+Math.cos(z*.028)*3.8;const hills=Math.sin(x*.073+z*.052)*2.4+Math.cos(z*.091-x*.047)*2.1;const ridge=(1-Math.abs(Math.sin(x*.045+z*.031)))*3.8;const detail=Math.sin(x*.31)*.42+Math.cos(z*.29)*.42;return Math.floor(3+broad+hills+ridge+detail);}
function hash(x,z){const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n)}
function treeBlockAt(x,y,z){
 // Trees are deterministic world voxels, not decorative geometry. This makes
 // leaves and trunks raycastable, breakable, and consistent across chunks.
 for(let tx=x-2;tx<=x+2;tx++)for(let tz=z-2;tz<=z+2;tz++){
  if(hash(tx,tz)<=.986)continue;
  const h=terrain(tx,tz),dy=y-h;
  if(x===tx&&z===tz&&dy>=1&&dy<=4)return 'wood';
  if(dy>=3&&dy<=6&&Math.abs(x-tx)<=2&&Math.abs(z-tz)<=2){
   const d=Math.abs(x-tx)+Math.abs(z-tz);
   if(d<=3 && !(x===tx&&z===tz&&dy<=4))return 'leaves';
  }
 }
 return null;
}
function typeAt(x,y,z){
 const k=bk(x,y,z);if(edits.has(k))return edits.get(k);
 const h=terrain(x,z);
 if(y < -32)return null;
 if(y === -32)return 'bedrock';
 if(y>h){return treeBlockAt(x,y,z);}
 if(y===h)return h<1?'sand':(h>=13?'snow':'grass');
 if(y>=h-2)return h<1?'sand':(h>=13&&y===h-1?'stone':'dirt');
 const depth=h-y;
 // Deterministic 3D cave pockets, carved only deep below the surface.
 const caveNoise=Math.sin(x*.21+y*.34)*Math.cos(z*.19-y*.13)+Math.sin(z*.17+x*.09+y*.29);
 if(depth>5 && caveNoise>1.22)return null;
 // Deterministic ore veins embedded in underground stone.
 const vein=hash(Math.floor(x/2)+y*17,Math.floor(z/2)-y*11);
 if(depth>15&&vein>.987)return 'diamond';
 if(depth>10&&vein>.978)return 'gold';
 if(depth>5&&vein>.952)return 'iron';
 if(depth>3&&vein>.915)return 'coal';
 return 'stone';
}
function faceData(arr,x,y,z,side,type){const faces=[
 {n:[0,1,0],v:[[0,1,0],[1,1,0],[1,1,1],[0,1,1]]},{n:[0,-1,0],v:[[0,0,1],[1,0,1],[1,0,0],[0,0,0]]},
 {n:[1,0,0],v:[[1,0,0],[1,0,1],[1,1,1],[1,1,0]]},{n:[-1,0,0],v:[[0,0,1],[0,0,0],[0,1,0],[0,1,1]]},
 {n:[0,0,1],v:[[1,0,1],[0,0,1],[0,1,1],[1,1,1]]},{n:[0,0,-1],v:[[0,0,0],[1,0,0],[1,1,0],[0,1,0]]}];
 const f=faces[side], shade=[1,.72,.86,.78,.92,.7][side];
 let tx=0,ty=0;if(type==='grass'){if(side===0){tx=0;ty=0}else if(side===1){tx=2;ty=0}else{tx=1;ty=0}}else if(type==='dirt'){tx=2;ty=0}else if(type==='stone'){tx=3;ty=0}else if(type==='wood'){tx=0;ty=1}else if(type==='leaves'){tx=1;ty=1}else if(type==='sand'){tx=2;ty=1}
 if(type==='coal'){tx=0;ty=2}else if(type==='iron'){tx=1;ty=2}else if(type==='gold'){tx=2;ty=2}else if(type==='diamond'){tx=3;ty=2}else if(type==='snow'){tx=3;ty=3}else if(type==='bedrock'){tx=0;ty=3}
 const inset=.002, u0=tx/4+inset,u1=(tx+1)/4-inset,v0=1-(ty+1)/4+inset,v1=1-ty/4-inset;
 // Keep the top of each side texture aligned with the top of the block.
 // The previous shared UV order flipped several side faces upside down.
 let uvs;
 if(side===0){ // top face: texture laid flat
   uvs=[[u0,v1],[u1,v1],[u1,v0],[u0,v0]];
 }else if(side===1){ // bottom face
   uvs=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
 }else if(side===2){ // +X face
   uvs=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
 }else if(side===3){ // -X face, keep texture upright while mirroring horizontally
   uvs=[[u1,v0],[u0,v0],[u0,v1],[u1,v1]];
 }else if(side===4){ // +Z face
   uvs=[[u1,v0],[u0,v0],[u0,v1],[u1,v1]];
 }else{ // -Z face
   uvs=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
 }
 const c=new THREE.Color(0xffffff).multiplyScalar(shade);for(let i=0;i<4;i++){const v=f.v[i];arr.p.push(x+v[0],y+v[1],z+v[2]);arr.n.push(...f.n);arr.c.push(c.r,c.g,c.b);arr.uv.push(...uvs[i]);}const start=arr.p.length/3-4;arr.i.push(start,start+2,start+1,start,start+3,start+2);}

function buildChunk(cx,cz){
 const id=`${cx},${cz}`,old=chunks.get(id);
 if(old){scene.remove(old.mesh);old.mesh.geometry.dispose();chunks.delete(id);}
 const a={p:[],n:[],c:[],uv:[],i:[]},minX=cx*16,minZ=cz*16;
 let maxEditedY=0;
 for(const [k,t] of edits){if(t===null)continue;const q=k.split(',').map(Number);if(Math.floor(q[0]/16)===cx&&Math.floor(q[2]/16)===cz)maxEditedY=Math.max(maxEditedY,q[1]);}
 const dirs=[[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];
 const ores=new Set(['coal','iron','gold','diamond']);
 const minWorldY=-32;
 for(let x=minX;x<minX+16;x++)for(let z=minZ;z<minZ+16;z++){
  const h=terrain(x,z),top=Math.max(h+6,maxEditedY);
  for(let y=minWorldY;y<=top;y++){
   const type=typeAt(x,y,z);if(!type)continue;
   for(let side=0;side<6;side++){const d=dirs[side],neighbor=typeAt(x+d[0],y+d[1],z+d[2]);
    // Solid blocks hide internal faces; ore faces remain visible against stone so veins can be mined.
    if(neighbor===null || (ores.has(type)&&neighbor==='stone'))faceData(a,x,y,z,side,type);
   }
  }
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(a.p,3));
 geo.setAttribute('normal',new THREE.Float32BufferAttribute(a.n,3));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(a.c,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(a.uv,2));geo.setIndex(a.i);geo.computeBoundingSphere();
 const mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:atlas,vertexColors:true}));
 mesh.userData={cx,cz};mesh.castShadow=false;mesh.receiveShadow=true;scene.add(mesh);chunks.set(id,{mesh,cx,cz});
}
function updateChunks(){const cx=Math.floor(px/16),cz=Math.floor(pz/16),radius=3;for(let x=cx-radius;x<=cx+radius;x++)for(let z=cz-radius;z<=cz+radius;z++)if(!chunks.has(`${x},${z}`))buildChunk(x,z);for(const [id,ch] of [...chunks])if(Math.abs(ch.cx-cx)>radius||Math.abs(ch.cz-cz)>radius){scene.remove(ch.mesh);ch.mesh.geometry.dispose();chunks.delete(id);}}
function rebuildAround(x,z){const cx=Math.floor(x/16),cz=Math.floor(z/16);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const id=`${cx+dx},${cz+dz}`;if(chunks.has(id))buildChunk(cx+dx,cz+dz);}}
function toast(t){const m=$('mesaj');m.textContent=t;m.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>m.style.display='none',1400)}
function rayTarget(){camera.updateMatrixWorld();const dir=new THREE.Vector3();camera.getWorldDirection(dir);const ray=new THREE.Raycaster(camera.position,dir,0,6);const hits=ray.intersectObjects([...chunks.values()].map(c=>c.mesh),false);target=hits.length?hits[0]:null;}
function hitVoxel(hit){if(!hit)return null;const p=hit.point.clone().addScaledVector(hit.face.normal,-.01);return {x:Math.floor(p.x),y:Math.floor(p.y),z:Math.floor(p.z)};}
const effects=[];
// Kırılan bloklar önce fizik ile yere düşen küçük küpler olur; yaklaşınca toplanırlar.
const drops=[];
function spawnDrop(x,y,z,type){
 const mat=new THREE.MeshLambertMaterial({color:colors[type]||0xffffff});
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.28),mat);
 mesh.position.set(x+.5,y+.65,z+.5);mesh.castShadow=true;scene.add(mesh);
 drops.push({mesh,type,vx:(Math.random()-.5)*1.5,vy:2.1+Math.random()*1.1,vz:(Math.random()-.5)*1.5,age:0,rest:false});
}
function burstAt(x,y,z,type){
 const mat=new THREE.MeshLambertMaterial({map:atlas,color:colors[type]||0xffffff});
 for(let i=0;i<14;i++){
  const m=new THREE.Mesh(new THREE.BoxGeometry(.09+Math.random()*.08,.09+Math.random()*.08,.09+Math.random()*.08),mat.clone());
  m.position.set(x+.15+Math.random()*.7,y+.15+Math.random()*.7,z+.15+Math.random()*.7);
  scene.add(m);effects.push({mesh:m,v:new THREE.Vector3((Math.random()-.5)*3.6,1.2+Math.random()*2.8,(Math.random()-.5)*3.6),life:.55});
 }
}
// A subtle selection outline and crack lines make mining feedback visible.
const targetOutline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.012,1.012,1.012)),new THREE.LineBasicMaterial({color:0x171717,transparent:true,opacity:.82}));targetOutline.visible=false;scene.add(targetOutline);
let mining=null,crackLines=null;
function clearCracks(){if(crackLines){scene.remove(crackLines);crackLines.geometry.dispose();crackLines.material.dispose();crackLines=null;}}
function drawCracks(v,normal,stage){
 clearCracks();if(stage<=0)return;
 // Crack segments lie on the struck cube face, slightly above its surface.
 const n=normal||new THREE.Vector3(0,1,0),center=new THREE.Vector3(v.x+.5,v.y+.5,v.z+.5).addScaledVector(n,.507);
 let u=new THREE.Vector3(1,0,0);if(Math.abs(n.x)>.5)u.set(0,0,1);const w=new THREE.Vector3().crossVectors(n,u).normalize();
 const pts=[];const paths=[[[0,0],[.13,.1],[.05,.23],[.19,.36]],[[.13,.1],[.29,.04],[.38,.16]],[[.05,.23],[-.12,.3],[-.2,.43]],[[.19,.36],[.27,.48],[.12,.5]],[[.29,.04],[.43,-.12]], [[-.12,.3],[-.28,.18]]];
 const count=Math.min(paths.length,stage+1);
 for(let i=0;i<count;i++)for(let j=0;j<paths[i].length-1;j++){
  for(const q of [paths[i][j],paths[i][j+1]])pts.push(center.x+u.x*q[0]+w.x*q[1],center.y+u.y*q[0]+w.y*q[1],center.z+u.z*q[0]+w.z*q[1]);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));crackLines=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x101010,transparent:true,opacity:.95,depthTest:false}));crackLines.renderOrder=5;scene.add(crackLines);
}
function finishBreak(v,t){burstAt(v.x,v.y,v.z,t);spawnDrop(v.x,v.y,v.z,t);edits.set(bk(v.x,v.y,v.z),null);rebuildAround(v.x,v.z);toast((names[t]||t)+' düştü');mining=null;clearCracks();targetOutline.visible=false;}
function breakBlock(){
 if(dimension==='end'){attackDragon();return}
 if(dimension==='nether'&&Math.hypot(px-mob.position.x,pz-mob.position.z)<3){items.blaze_rod=(items.blaze_rod||0)+1;items.ender_pearl=(items.ender_pearl||0)+1;updateInventory();toast('Blaze çubuğu ve ender incisi aldın');return}
 rayTarget();const v=hitVoxel(target);if(!v){toast('Yakında blok yok');return}
 const t=typeAt(v.x,v.y,v.z);if(!t||t==='bedrock'){toast(t==='bedrock'?'Ana kaya kırılamaz':'Bu blok kırılamaz');return}
 if(mining&&bk(mining.v.x,mining.v.y,mining.v.z)===bk(v.x,v.y,v.z))return;
 mining={v,t,elapsed:0,duration:.48,normal:target.face?.normal?.clone()||new THREE.Vector3(0,1,0)};drawCracks(v,mining.normal,0);
}
function placeBlock(){rayTarget();if(!target){toast('Önce bir bloğa bak');return}const p=target.point.clone().addScaledVector(target.face.normal,.02);const x=Math.floor(p.x),y=Math.floor(p.y),z=Math.floor(p.z);if(playerIntersectsBlock(x,y,z)){toast('Kendi oyuncunun içine blok koyamazsın');return}if(typeAt(x,y,z)){toast('Burada blok var');return}edits.set(bk(x,y,z),selected);rebuildAround(x,z);const glow=new THREE.Mesh(new THREE.BoxGeometry(.98,.98,.98),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,wireframe:true}));glow.position.set(x+.5,y+.5,z+.5);scene.add(glow);effects.push({mesh:glow,v:new THREE.Vector3(0,0,0),life:.22});toast((names[selected]||selected)+' yerleştirildi');}
const itemNames={wooden_sword:'Tahta kılıç',stone_sword:'Taş kılıç',iron_sword:'Demir kılıç',iron_armor:'Demir zırh',obsidian:'Obsidyen',portal_kit:'Nether portal seti',blaze_rod:'Blaze çubuğu',ender_pearl:'Ender incisi',eye_of_ender:'Ender gözü',end_key:'End geçidi anahtarı'};
const icons={grass:'🟩',dirt:'🟫',stone:'🪨',wood:'🪵',leaves:'🌿',sand:'🟨',coal:'⚫',iron:'🔘',gold:'🟡',diamond:'💎',snow:'⬜',bedrock:'⬛',plank:'🟫',stick:'🪵',wooden_sword:'🗡️',stone_sword:'⚔️',iron_sword:'⚔️',iron_armor:'🛡️',obsidian:'🟪',portal_kit:'🟣',blaze_rod:'🟠',ender_pearl:'🟢',eye_of_ender:'🟣',end_key:'🌌'};
// Tarifler 4x4 tablaya oyuncunun kendi yerleştirdiği malzemelerle yapılır.
// Her tarifte koordinatlar satır/sütun şeklindedir; desen tablaya farklı yerlere konabilir.
const recipes=[
 {id:'plank',name:'Tahta kalas ×4',pattern:[[0,0,'wood']],out:{kind:'count',key:'plank',n:4}},
 {id:'stick',name:'Çubuk ×4',pattern:[[0,0,'plank'],[1,0,'plank']],out:{kind:'count',key:'stick',n:4}},
 {id:'wooden_sword',name:'Tahta kılıç',pattern:[[0,0,'plank'],[1,0,'plank'],[2,0,'stick']],out:{kind:'item',key:'wooden_sword',n:1}},
 {id:'stone_sword',name:'Taş kılıç',pattern:[[0,0,'stone'],[1,0,'stone'],[2,0,'stick']],out:{kind:'item',key:'stone_sword',n:1}},
 {id:'iron_sword',name:'Demir kılıç',pattern:[[0,0,'iron'],[1,0,'iron'],[2,0,'stick']],out:{kind:'item',key:'iron_sword',n:1}},
 {id:'iron_armor',name:'Demir zırh',pattern:[[0,0,'iron'],[0,1,'iron'],[0,2,'iron'],[1,0,'iron'],[1,1,'iron'],[1,2,'iron'],[2,0,'iron'],[2,2,'iron']],out:{kind:'item',key:'iron_armor',n:1}},
 {id:'obsidian',name:'Obsidyen ×4',pattern:[[0,0,'stone'],[0,1,'stone'],[1,0,'stone'],[1,1,'diamond']],out:{kind:'item',key:'obsidian',n:4}},
 {id:'portal_kit',name:'Nether geçit seti',pattern:[[0,0,'obsidian'],[0,1,'obsidian'],[1,0,'obsidian'],[1,1,'obsidian']],out:{kind:'item',key:'portal_kit',n:1}},
 {id:'eye_of_ender',name:'Ender gözü',pattern:[[0,0,'blaze_rod'],[0,1,'ender_pearl']],out:{kind:'item',key:'eye_of_ender',n:1}},
 {id:'end_key',name:'End geçidi anahtarı',pattern:[[0,0,'eye_of_ender'],[1,0,'eye_of_ender'],[2,0,'eye_of_ender']],out:{kind:'item',key:'end_key',n:1}}
];
function itemCount(k){return (counts[k]||0)+(items[k]||0)}
function removeOne(k){if((counts[k]||0)>0)counts[k]--;else if((items[k]||0)>0)items[k]--;}
function addOne(k,n=1){if(k in counts)counts[k]=(counts[k]||0)+n;else items[k]=(items[k]||0)+n;}
function samePattern(recipe){
 const cells=craftGrid.map((k,i)=>k?{r:Math.floor(i/4),c:i%4,k}:null).filter(Boolean);if(cells.length!==recipe.pattern.length)return false;
 const minR=Math.min(...recipe.pattern.map(p=>p[0])),minC=Math.min(...recipe.pattern.map(p=>p[1]));
 for(let dr=0;dr<4;dr++)for(let dc=0;dc<4;dc++){
  const expected=recipe.pattern.map(([r,c,k])=>`${r+dr-minR},${c+dc-minC},${k}`).sort().join('|');
  if(recipe.pattern.some(([r,c])=>r+dr-minR>3||c+dc-minC>3))continue;
  const actual=cells.map(q=>`${q.r},${q.c},${q.k}`).sort().join('|');if(expected===actual)return true;
 }
 return false;
}
function currentRecipe(){return recipes.find(samePattern)||null;}
function craftFromGrid(){const r=currentRecipe();if(!r){toast('Bu dizilimde tarif yok');return;}for(const k of craftGrid)if(k)removeOne(k);addOne(r.out.key,r.out.n);craftGrid=Array(16).fill(null);updateInventory();toast(r.name+' üretildi!');}
function drawCraftGrid(){const g=$('craftGrid');if(!g)return;g.innerHTML=craftGrid.map((k,i)=>`<button class="craft-cell ${k?'filled':''}" data-cell="${i}" title="${k?names[k]||itemNames[k]||k:'Boş yuva'}">${k?(icons[k]||'◆'):'+'}${k?`<small>${(names[k]||itemNames[k]||k).slice(0,8)}</small>`:''}</button>`).join('');g.querySelectorAll('[data-cell]').forEach(b=>{b.onclick=()=>{const i=Number(b.dataset.cell);if(craftGrid[i]){addOne(craftGrid[i]);craftGrid[i]=null;}else if(selectedIngredient&&itemCount(selectedIngredient)>0){removeOne(selectedIngredient);craftGrid[i]=selectedIngredient;}else{toast('Önce soldan bir malzeme seç');return;}updateInventory();};b.oncontextmenu=e=>{e.preventDefault();const i=Number(b.dataset.cell);if(craftGrid[i]){addOne(craftGrid[i]);craftGrid[i]=null;updateInventory();}};});const r=currentRecipe(),out=$('craftOutput');if(out){out.innerHTML=r?`<button id="craftResult" class="craft-result"><span>${icons[r.out.key]||'◆'}</span><b>${itemNames[r.out.key]||names[r.out.key]||r.out.key} ×${r.out.n}</b><small>Üretmek için tıkla</small></button>`:'<div class="craft-result empty">Sonuç<br><small>Tarif bulunamadı</small></div>';const btn=$('craftResult');if(btn)btn.onclick=craftFromGrid;}}
function updateInventory(){
 $('kaynaklar').innerHTML=[...Object.keys(counts).filter(k=>counts[k]>0),...Object.keys(items).filter(k=>items[k]>0)].map(k=>`<button class="resource-chip ${selectedIngredient===k?'picked':''}" data-resource="${k}" title="${names[k]||itemNames[k]||k}"><span>${icons[k]||'◆'}</span><b>${counts[k]||items[k]||0}</b></button>`).join('')||'<div class="mini">Henüz kaynak yok. Kırdığın blokları yere düşerken yaklaşıp topla.</div>';
 $('envanterSlotlari').innerHTML=[...Object.keys(items).filter(k=>items[k]>0).map(k=>({k,n:items[k]})),...Object.keys(counts).filter(k=>counts[k]>0).map(k=>({k,n:counts[k]}))].map(o=>`<button class="inv-slot" title="${itemNames[o.k]||names[o.k]||o.k}"><span>${icons[o.k]||'◆'}</span><small>${o.n}</small></button>`).join('')||'<div class="mini">Envanter boş</div>';
 $('blokSecimi').innerHTML=['grass','dirt','stone','wood','leaves','sand'].map(k=>`<button class="block-choice" data-build="${k}"><span>${icons[k]}</span> ${names[k]}</button>`).join('');
 document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>{selected=b.dataset.build;selectedItem=null;toast(names[selected]+' seçildi')});
 document.querySelectorAll('[data-resource]').forEach(b=>b.onclick=()=>{selectedIngredient=b.dataset.resource;updateInventory();toast((names[selectedIngredient]||itemNames[selectedIngredient]||selectedIngredient)+' seçildi; sonra 4×4 yuvaya bas')});
 document.querySelectorAll('.item-slot').forEach((b,i)=>{const list=Object.keys(items).filter(k=>items[k]>0);const item=list[i];b.innerHTML=item?`${icons[item]||'◆'}<small>${items[item]}</small>`:`□<small>${i+1}</small>`;b.classList.toggle('has-item',!!item);b.classList.toggle('secili',!!item&&selectedItem===item);b.onclick=()=>{if(item){selectedItem=item;selected=item==='obsidian'?'stone':'stone';document.querySelectorAll('.item-slot').forEach(x=>x.classList.remove('secili'));b.classList.add('secili');toast((itemNames[item]||item)+' seçildi')}}});
 if(typeof heldTool!=='undefined'){heldTool.visible=!!selectedItem&&['wooden_sword','stone_sword','iron_sword'].includes(selectedItem);if(heldTool.visible){toolHead.material.color.set(selectedItem==='iron_sword'?0xd9e7ed:selectedItem==='stone_sword'?0x888e94:0x9c7044)}}
 $('durum').textContent=`❤️ ${hp}　🍗 ${hunger}　📍 ${Math.floor(px)}, ${Math.floor(pz)}`;
 $('maceraDurumu').textContent=gameWon?'🏆 Ejderha yenildi! Oyunu bitirdin!':dimension==='nether'?'🔥 Nether: düşman yaratığa yaklaşınca blaze çubuğu/ender incisi topla. End anahtarı üretip R ile End’e geç.':dimension==='end'?`🐉 Ender Ejderhası: ${dragonHP}/12 can. Kılıçla KIR düğmesine basarak yakındayken saldır.`:`1) Kaynak topla  2) 4×4 üretim tablosunda kalas/çubuk/kılıç üret  3) Portal seti hazırla  4) Nether ve End macerası.`;
 drawCraftGrid();
}
$('kir').onclick=breakBlock;$('koy').onclick=placeBlock;$('envanter').onclick=()=>{$('envanterPanel').classList.remove('gizli');updateInventory()};$('envanterKapat').onclick=()=>$('envanterPanel').classList.add('gizli');$('gorunum').onclick=()=>{thirdPerson=!thirdPerson;handGroup.visible=!thirdPerson;avatar.visible=thirdPerson;toast(thirdPerson?'Üçüncü şahıs':'Birinci şahıs')};$('portal').onclick=travelDimension;
$('hotbar').addEventListener('wheel',e=>{e.preventDefault();const slots=[...document.querySelectorAll('.item-slot')];if(!slots.length)return;let i=slots.findIndex(s=>s.classList.contains('secili'));i=(i+(e.deltaY>0?1:-1)+slots.length)%slots.length;slots[i].click()},{passive:false});
const keymap={KeyW:'ileri',KeyS:'geri',KeyA:'sol',KeyD:'sag',ArrowUp:'ileri',ArrowDown:'geri',ArrowLeft:'sol',ArrowRight:'sag',Space:'zipla'};addEventListener('keydown',e=>{if(e.code==='Escape'&&started){if(!$('envanterPanel').classList.contains('gizli')){$('envanterPanel').classList.add('gizli');return;}if(document.pointerLockElement===canvas){document.exitPointerLock?.();}else{canvas.requestPointerLock?.();}return;}if(keymap[e.code]){pressed.add(keymap[e.code]);e.preventDefault()}if(e.code==='KeyF')breakBlock();if(e.code==='KeyG')placeBlock();if(e.code==='KeyE'){const panel=$('envanterPanel');panel.classList.toggle('gizli');if(!panel.classList.contains('gizli'))updateInventory()}if(e.code==='KeyC'){thirdPerson=!thirdPerson;handGroup.visible=!thirdPerson;avatar.visible=thirdPerson;toast(thirdPerson?'Üçüncü şahıs':'Birinci şahıs')}if(e.code==='KeyR')travelDimension()});addEventListener('keyup',e=>{if(keymap[e.code])pressed.delete(keymap[e.code])});document.querySelectorAll('[data-move]').forEach(b=>{const k=b.dataset.move;const down=e=>{e.preventDefault();pressed.add(k)};const up=e=>{e.preventDefault();pressed.delete(k)};b.addEventListener('pointerdown',down);['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,up));});
const canvas=renderer.domElement;canvas.addEventListener('click',()=>{if(started&&matchMedia('(pointer:fine)').matches&&document.pointerLockElement!==canvas)canvas.requestPointerLock?.();});canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;lastX=e.clientX;lastY=e.clientY;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});canvas.addEventListener('pointermove',e=>{if(document.pointerLockElement===canvas||lastX===null||!started)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.0045;pitch=Math.max(-1.35,Math.min(1.35,pitch-dy*.0045));});['pointerup','pointercancel'].forEach(ev=>canvas.addEventListener(ev,()=>{lastX=null;lastY=null}));
function start(){started=true;$('baslangic').style.display='none';updateChunks();py=terrain(0,0)+1+EYE_HEIGHT;updateInventory();if(matchMedia('(pointer:fine)').matches)canvas.requestPointerLock?.();}
$('basla').onclick=start;document.addEventListener('mousemove',e=>{if(started&&document.pointerLockElement===canvas){yaw-=e.movementX*.0025;pitch=Math.max(-1.35,Math.min(1.35,pitch-e.movementY*.0025));}});
// Player capsule-like AABB collision. The camera is at eye height; feet are 1.62 units below.
const PLAYER_RADIUS=.29, PLAYER_HEIGHT=1.78, EYE_HEIGHT=1.62;
// First-person hand/arm; C toggles to a visible two-block-tall avatar.
const handGroup=new THREE.Group();
const sleeve=new THREE.Mesh(new THREE.BoxGeometry(.22,.48,.22),new THREE.MeshLambertMaterial({color:0xc18a5d}));sleeve.position.set(.38,-.34,-.48);handGroup.add(sleeve);
const handMesh=new THREE.Mesh(new THREE.BoxGeometry(.19,.18,.2),new THREE.MeshLambertMaterial({color:0xd8a77d}));handMesh.position.set(.39,-.62,-.5);handGroup.add(handMesh);
const heldTool=new THREE.Group();const toolHandle=new THREE.Mesh(new THREE.BoxGeometry(.055,.34,.055),new THREE.MeshLambertMaterial({color:0x82552d}));toolHandle.position.y=-.18;heldTool.add(toolHandle);const toolHead=new THREE.Mesh(new THREE.BoxGeometry(.28,.1,.08),new THREE.MeshLambertMaterial({color:0xb7c0c5}));toolHead.position.y=-.02;heldTool.add(toolHead);heldTool.position.set(.43,-.39,-.62);handGroup.add(heldTool);camera.add(handGroup);
const avatar=new THREE.Group();
function avatarPart(w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);m.castShadow=true;avatar.add(m);return m;}
avatarPart(.62,.72,.32,0x3976a8,0,1.32,0);avatarPart(.58,.58,.32,0xd8a77d,0,1.97,0);avatarPart(.22,.68,.24,0x3976a8,-.43,1.35,0);avatarPart(.22,.68,.24,0x3976a8,.43,1.35,0);const legL=avatarPart(.25,.68,.27,0x303b66,-.17,.68,0),legR=avatarPart(.25,.68,.27,0x303b66,.17,.68,0);avatar.visible=false;scene.add(avatar);
const dragon=new THREE.Group();
const dragonMat=new THREE.MeshLambertMaterial({color:0x201b2c}),wingMat=new THREE.MeshLambertMaterial({color:0x38284c,side:THREE.DoubleSide});
function dragonBox(w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);dragon.add(m);return m;}
dragonBox(2.8,.8,1.2,dragonMat,0,0,0);dragonBox(1.4,.55,.65,dragonMat,1.8,.35,0);dragonBox(.5,.25,.45,dragonMat,2.45,.55,0);dragonBox(1.2,.35,.45,dragonMat,-1.8,.05,0);dragonBox(1.2,.3,.4,dragonMat,-2.7,.1,0);
const wingL=dragonBox(2.2,.08,1.5,wingMat,-.2,.45,-1.35),wingR=dragonBox(2.2,.08,1.5,wingMat,-.2,.45,1.35);wingL.rotation.z=.2;wingR.rotation.z=-.2;
dragon.position.set(0,11,-8);dragon.visible=false;scene.add(dragon);
function travelDimension(){
 if(dimension==='overworld'){
  if((items.portal_kit||0)<1){toast('Önce envanterden Nether portal seti üret');return}
  items.portal_kit--;dimension='nether';scene.background.set(0x351d25);scene.fog.color.set(0x351d25);scene.fog.near=22;scene.fog.far=78;px=0;pz=0;py=terrain(0,0)+EYE_HEIGHT+1;toast('Nether’a girdin!');updateInventory();
 }else if(dimension==='nether'){
  if((items.end_key||0)>0){items.end_key--;dimension='end';scene.background.set(0x100b20);scene.fog.color.set(0x100b20);scene.fog.near=30;scene.fog.far=110;px=0;pz=0;py=8;toast('End’e girdin! Ejderhayı yen!');}
  else{dimension='overworld';scene.background.set(0x8bcff8);scene.fog.color.set(0x8bcff8);scene.fog.near=30;scene.fog.far=105;px=0;pz=0;py=terrain(0,0)+EYE_HEIGHT+1;toast('Dünyaya döndün');}
  updateInventory();
 }else{dimension='nether';scene.background.set(0x351d25);scene.fog.color.set(0x351d25);scene.fog.near=22;scene.fog.far=78;px=0;pz=0;py=terrain(0,0)+EYE_HEIGHT+1;toast('Nether’a döndün');updateInventory();}
}
function attackDragon(){if(dimension!=='end'||gameWon)return;const hasSword=['wooden_sword','stone_sword','iron_sword'].some(k=>(items[k]||0)>0);if(!hasSword){toast('Önce bir kılıç üret!');return}dragonHP--;toast('Ejderhaya vurdun! '+dragonHP+' can kaldı');if(dragonHP<=0){gameWon=true;toast('🏆 TEBRİKLER! BLOCKCRAFT’I BİTİRDİN!');}updateInventory();}

function solidAt(x,y,z){return typeAt(Math.floor(x),Math.floor(y),Math.floor(z))!==null;}
function playerIntersectsBlock(x,y,z){
 const minX=px-PLAYER_RADIUS,maxX=px+PLAYER_RADIUS,minZ=pz-PLAYER_RADIUS,maxZ=pz+PLAYER_RADIUS;
 const feet=py-EYE_HEIGHT,head=feet+PLAYER_HEIGHT;
 return maxX>x && minX<x+1 && maxZ>z && minZ<z+1 && head>y && feet<y+1;
}
function collidesAt(nx,nz,eyeY=py){
 const feet=eyeY-EYE_HEIGHT,head=feet+PLAYER_HEIGHT;
 const xs=[nx-PLAYER_RADIUS+.03,nx+PLAYER_RADIUS-.03],zs=[nz-PLAYER_RADIUS+.03,nz+PLAYER_RADIUS-.03];
 for(const x of xs)for(const z of zs)for(let y=Math.floor(feet+.03);y<=Math.floor(head-.03);y++)if(solidAt(x,y,z))return true;
 return false;
}
function surfaceBelow(x,z,feetY){
 const samples=[[x,z],[x-PLAYER_RADIUS+.04,z-PLAYER_RADIUS+.04],[x+PLAYER_RADIUS-.04,z-PLAYER_RADIUS+.04],[x-PLAYER_RADIUS+.04,z+PLAYER_RADIUS-.04],[x+PLAYER_RADIUS-.04,z+PLAYER_RADIUS-.04]];
 let best=-Infinity;
 for(const [sx,sz] of samples){
  const bx=Math.floor(sx),bz=Math.floor(sz);
  for(let y=Math.floor(feetY+.12);y>=Math.max(-32,Math.floor(feetY-5));y--){
   if(typeAt(bx,y,bz)!==null && typeAt(bx,y+1,bz)===null){best=Math.max(best,y+1);break;}
  }
 }
 return best;
}
function loop(zaman=performance.now()){
 requestAnimationFrame(loop);
 const dt=Math.min(clock.getDelta(),.035);
 for(const c of cloudGroups){c.position.x=c.userData.baseX+Math.sin(zaman*.000025+c.position.z)*3;}dragon.visible=dimension==='end'&&!gameWon;if(dragon.visible){dragon.position.y=10+Math.sin(zaman*.002)*.8;wingL.rotation.x=Math.sin(zaman*.012)*.45;wingR.rotation.x=-Math.sin(zaman*.012)*.45;dragon.rotation.y=Math.sin(zaman*.0007)*.6;}
 for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;e.mesh.position.addScaledVector(e.v,dt);e.v.y-=7*dt;e.mesh.scale.setScalar(Math.max(.01,e.life/.55));if(e.life<=0){scene.remove(e.mesh);e.mesh.geometry.dispose();if(e.mesh.material.dispose)e.mesh.material.dispose();effects.splice(i,1);}}
 // Düşen blok küpleri fizik ile yere iner, oyuncu yaklaşınca envantere alınır.
 for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.age+=dt;d.mesh.rotation.x+=dt*1.4;d.mesh.rotation.y+=dt*1.8;if(!d.rest){d.vy-=10*dt;d.mesh.position.x+=d.vx*dt;d.mesh.position.y+=d.vy*dt;d.mesh.position.z+=d.vz*dt;const floor=surfaceBelow(d.mesh.position.x,d.mesh.position.z,d.mesh.position.y);if(floor!==-Infinity&&d.mesh.position.y-.14<=floor){d.mesh.position.y=floor+.14;d.vy=0;d.vx*=.65;d.vz*=.65;d.rest=true;}}if(started&&Math.hypot(px-d.mesh.position.x,pz-d.mesh.position.z)<1.35&&Math.abs((py-EYE_HEIGHT)-d.mesh.position.y)<2.5){addOne(d.type);scene.remove(d.mesh);d.mesh.geometry.dispose();d.mesh.material.dispose();drops.splice(i,1);updateInventory();toast((names[d.type]||d.type)+' envantere eklendi');}}
 if(started){
  rayTarget();
  if(target){const tv=hitVoxel(target);if(tv){targetOutline.position.set(tv.x+.5,tv.y+.5,tv.z+.5);targetOutline.visible=true;}else targetOutline.visible=false;}else targetOutline.visible=false;
  if(mining){
   const current=hitVoxel(target);
   if(!current||bk(current.x,current.y,current.z)!==bk(mining.v.x,mining.v.y,mining.v.z)){mining=null;clearCracks();}
   else {mining.elapsed+=dt;const stage=Math.min(5,Math.floor(mining.elapsed/mining.duration*6));drawCracks(mining.v,mining.normal,stage);if(mining.elapsed>=mining.duration)finishBreak(mining.v,mining.t);}
  }
  const f=(pressed.has('ileri')?1:0)-(pressed.has('geri')?1:0);
  const s=(pressed.has('sag')?1:0)-(pressed.has('sol')?1:0);
  const mag=Math.hypot(f,s)||1, speed=4.5*dt;
  const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)/mag*speed;
  const dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)/mag*speed;
  // Resolve axes separately so walls don't freeze all movement.
  if(!collidesAt(px+dx,pz))px+=dx;
  if(!collidesAt(px,pz+dz))pz+=dz;
  if(pressed.has('zipla')&&onGround){vy=7;onGround=false;}
  vy-=19*dt;
  const oldFeet=py-EYE_HEIGHT;
  let nextPy=py+vy*dt;
  if(vy<=0){
   const floor=surfaceBelow(px,pz,nextPy-EYE_HEIGHT);
   if(floor!==-Infinity && nextPy-EYE_HEIGHT<=floor+.04 && oldFeet>=floor-.2){nextPy=floor+EYE_HEIGHT;vy=0;onGround=true;}
   else onGround=false;
  }else onGround=false;
  if(!collidesAt(px,pz,nextPy))py=nextPy;
  else if(vy>0){vy=0;}
  // Keep the player from falling through terrain or newly placed blocks.
  const floorNow=surfaceBelow(px,pz,py-EYE_HEIGHT+.08);
  if(floorNow!==-Infinity && py-EYE_HEIGHT<floorNow){py=floorNow+EYE_HEIGHT;vy=0;onGround=true;}
  updateChunks();
  if(thirdPerson){const back=new THREE.Vector3(Math.sin(yaw)*4,2.2,Math.cos(yaw)*4);camera.position.set(px+back.x,py+back.y,pz+back.z);camera.lookAt(px,py-.25,pz);avatar.position.set(px,py-EYE_HEIGHT,pz);avatar.rotation.y=yaw;legL.rotation.x=Math.sin(zaman*.012)*.45*(Math.abs(f)+Math.abs(s));legR.rotation.x=-legL.rotation.x;}else{camera.position.set(px,py,pz);camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;}
  if(typeof heldTool!=='undefined'){heldTool.visible=!!selectedItem&&['wooden_sword','stone_sword','iron_sword'].includes(selectedItem);if(heldTool.visible){toolHead.material.color.set(selectedItem==='iron_sword'?0xd9e7ed:selectedItem==='stone_sword'?0x888e94:0x9c7044)}}
 $('durum').textContent=`❤️ ${hp}　🍗 ${hunger}　📍 ${Math.floor(px)}, ${Math.floor(pz)}`;
 }
 renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
// Create a small friendly-looking wandering creature in the starting region.
const mob=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),new THREE.MeshLambertMaterial({color:0x64d65b}));mob.position.set(4,terrain(4,4)+.4,4);scene.add(mob);const oldLoop=loop;function mobLoop(){if(started){mob.visible=dimension==='nether';mob.position.x=4+Math.sin(performance.now()*.00035)*2;mob.position.z=4+Math.cos(performance.now()*.0003)*2;mob.position.y=terrain(Math.round(mob.position.x),Math.round(mob.position.z))+.4;}requestAnimationFrame(mobLoop)}mobLoop();loop();
})();