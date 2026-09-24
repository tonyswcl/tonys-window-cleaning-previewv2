/* Tony's quick quote: the 3D preview. Loaded on demand, after three.min.js.
   window.__tq3dInit(core) builds the scene once and returns {open, close, hero, sync, pref}.
   Modes: show (hero model home), home (build your own), win, sol, scr, pig.
   Every animation is a function of time since the mode started, so nothing drifts or resets.
   Source lives in _quote/src. Run _quote/build.py after editing. */
(function(){
"use strict";
window.__tq3dInit=function(C){
var T=window.THREE,doc=document,$=C.$,$$=C.$$,st=C.st,P=C.P,money=C.money,track=C.track,reduce=C.reduce;
if(!T)throw new Error("three.js missing");
var ov=$("ov"),stageEl=$("stage"),heroHost=$("h3host"),heroLay=heroHost.parentNode;
var small=Math.min(screen.width,screen.height)<700;

/* ---------- renderer, scene, sky, light ---------- */
var R=new T.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
R.setPixelRatio(Math.min(window.devicePixelRatio||1,small?1.75:2));
R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=.95;
R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
var ANI=Math.min(8,R.capabilities.getMaxAnisotropy()||1);
var scene=new T.Scene(),cam=new T.PerspectiveCamera(34,1,.05,1500);
var UP=new T.Vector3(0,1,0);
function V(x,y,z){return new T.Vector3(x,y,z);}
function clamp01(x){return x<0?0:x>1?1:x;}
function smooth(x){x=clamp01(x);return x*x*(3-2*x);}
function lerp(a,b,t){return a+(b-a)*t;}
function rng(s){s=(Math.abs(Math.floor(s))%2147483646)+1;return function(){s=s*16807%2147483647;return (s-1)/2147483646;};}

/* sky: a real desert sky photo (Poly Haven "Quarry 01", CC0), turned so its sun sits where our sun light is.
   Until it loads, and if it never does, a painted gradient stands in. */
var skyU={top:{value:new T.Color(0x3f86c6)},hor:{value:new T.Color(0xd3dadd)},bot:{value:new T.Color(0xc9b793)},map:{value:null},has:{value:0},off:{value:.2465}};
scene.add(new T.Mesh(new T.SphereGeometry(900,48,24),new T.ShaderMaterial({uniforms:skyU,side:T.BackSide,depthWrite:false,
  vertexShader:"varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
  fragmentShader:"uniform vec3 top;uniform vec3 hor;uniform vec3 bot;uniform sampler2D map;uniform float has;uniform float off;varying vec3 vP;"+
    "void main(){vec3 d=normalize(vP);float h=d.y;vec3 c=h>0.0?mix(hor,top,pow(h,0.55)):mix(hor,bot,pow(-h,0.35));"+
    "if(has>0.5&&h>-0.02){float u=fract(atan(d.z,d.x)/6.2831853+off);float v=clamp(1.0-asin(clamp(h,0.0,1.0))/1.5707963,0.002,0.998);"+
    "vec3 s=texture2D(map,vec2(u,1.0-v)).rgb;c=mix(hor,s,smoothstep(0.005,0.11,h));}gl_FragColor=vec4(c,1.0);}"})));
new T.TextureLoader().load("assets/quote/sky.jpg",function(t){t.wrapS=T.RepeatWrapping;t.minFilter=T.LinearFilter;t.generateMipmaps=false;skyU.map.value=t;skyU.has.value=1;});
function envFace(kind,sun){var c=doc.createElement("canvas");c.width=c.height=64;var g=c.getContext("2d");
  if(kind==="top"){g.fillStyle="#5d9ed6";g.fillRect(0,0,64,64);}
  else if(kind==="bot"){g.fillStyle="#a8966f";g.fillRect(0,0,64,64);}
  else{var gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,"#6aa6da");gr.addColorStop(.48,"#e9f1f5");gr.addColorStop(.52,"#cdbb96");gr.addColorStop(1,"#a8966f");g.fillStyle=gr;g.fillRect(0,0,64,64);
    if(sun){var sg=g.createRadialGradient(20,14,0,20,14,12);sg.addColorStop(0,"#fff");sg.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=sg;g.fillRect(0,0,64,64);}}
  return c;}
var cube=new T.CubeTexture([envFace("side"),envFace("side",true),envFace("top"),envFace("bot"),envFace("side",true),envFace("side")]);
cube.encoding=T.sRGBEncoding;cube.needsUpdate=true;scene.environment=cube;
scene.fog=new T.Fog(0xd3dadd,90,420);
scene.add(new T.HemisphereLight(0xe4f0ff,0x8a7455,.55));
var sun=new T.DirectionalLight(0xfff0d6,2.2);sun.position.set(-14,22,16);sun.castShadow=true;
var SM=small?1024:2048;sun.shadow.mapSize.set(SM,SM);sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;
scene.add(sun);scene.add(sun.target);

/* ---------- textures, all painted on canvas ---------- */
function cv(w,h,f){var c=doc.createElement("canvas");c.width=w;c.height=h;f(c.getContext("2d"),w,h);return c;}
function tx(c,rep,lin){var t=new T.CanvasTexture(c);if(!lin)t.encoding=T.sRGBEncoding;t.anisotropy=ANI;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;}return t;}
function dots(g,w,h,r,n,rgb,a0,a1,s0,s1){for(var i=0;i<n;i++){var s=s0+r()*(s1-s0);g.fillStyle="rgba("+rgb+","+(a0+r()*(a1-a0)).toFixed(3)+")";g.fillRect(r()*w,r()*h,s,s);}}
function blot(g,w,h,r,n,rgb,a,rad){for(var i=0;i<n;i++){var x=r()*w,y=r()*h,rr=rad*(.5+r()),gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,"rgba("+rgb+","+a+")");gr.addColorStop(1,"rgba("+rgb+",0)");g.fillStyle=gr;g.fillRect(x-rr,y-rr,2*rr,2*rr);}}
var TX={};
(function(){
  var r=rng(11);
  TX.stucco=tx(cv(256,256,function(g,w,h){g.fillStyle="#fff";g.fillRect(0,0,w,h);blot(g,w,h,r,26,"0,0,0",.035,40);dots(g,w,h,r,5200,"90,80,70",.03,.11,1,2.5);dots(g,w,h,r,2600,"255,255,255",.2,.5,1,2);}),true);
  TX.stuccoB=tx(cv(256,256,function(g,w,h){g.fillStyle="#808080";g.fillRect(0,0,w,h);dots(g,w,h,r,9000,"0,0,0",.1,.35,1,2.5);dots(g,w,h,r,9000,"255,255,255",.1,.35,1,2.5);}),true,true);
  TX.siding=tx(cv(256,256,function(g,w,h){g.fillStyle="#fff";g.fillRect(0,0,w,h);for(var y=0;y<h;y+=32){var gr=g.createLinearGradient(0,y,0,y+32);gr.addColorStop(0,"rgba(255,255,255,.35)");gr.addColorStop(.85,"rgba(0,0,0,0)");gr.addColorStop(1,"rgba(0,0,0,.2)");g.fillStyle=gr;g.fillRect(0,y,w,32);g.fillStyle="rgba(0,0,0,.28)";g.fillRect(0,y+30,w,2);}dots(g,w,h,r,1500,"80,70,60",.03,.08,1,3);}),true);
  TX.gravel=tx(cv(256,256,function(g,w,h){g.fillStyle="#b39f7a";g.fillRect(0,0,w,h);blot(g,w,h,r,14,"120,100,70",.12,50);dots(g,w,h,r,9000,"92,76,52",.15,.45,1,3);dots(g,w,h,r,5000,"232,220,192",.2,.5,1,2.5);}),true);
  TX.gravelB=tx(cv(256,256,function(g,w,h){g.fillStyle="#808080";g.fillRect(0,0,w,h);dots(g,w,h,r,12000,"0,0,0",.2,.5,1,3);dots(g,w,h,r,8000,"255,255,255",.2,.5,1,3);}),true,true);
  TX.concrete=tx(cv(256,256,function(g,w,h){g.fillStyle="#d9d5cc";g.fillRect(0,0,w,h);dots(g,w,h,r,5000,"120,115,105",.04,.14,1,2);dots(g,w,h,r,2000,"255,255,255",.2,.4,1,2);g.fillStyle="rgba(0,0,0,.22)";g.fillRect(0,0,w,2);g.fillRect(0,0,2,h);}),true);
  TX.asphalt=tx(cv(256,256,function(g,w,h){g.fillStyle="#56595d";g.fillRect(0,0,w,h);dots(g,w,h,r,9000,"30,30,32",.2,.5,1,2.5);dots(g,w,h,r,5000,"150,150,150",.15,.35,1,2);}),true);
  TX.cmu=tx(cv(256,128,function(g,w,h){g.fillStyle="#bba98a";g.fillRect(0,0,w,h);for(var y=0;y<h;y+=32)for(var x=((y/32)%2)*32-64;x<w;x+=64){var v=200+((r()*20)|0);g.fillStyle="rgb("+v+","+(v-18)+","+(v-48)+")";g.fillRect(x+2,y+2,60,28);}dots(g,w,h,r,4000,"90,75,55",.08,.2,1,2);}),true);
  TX.brick=tx(cv(128,128,function(g,w,h){g.fillStyle="#9a8878";g.fillRect(0,0,w,h);for(var y=0;y<h;y+=16)for(var x=((y/16)%2)*16-32;x<w;x+=32){var v=120+((r()*40)|0);g.fillStyle="rgb("+v+","+(v*.45|0)+","+(v*.35|0)+")";g.fillRect(x+1,y+1,30,14);}}),true);
  TX.garage=tx(cv(256,128,function(g,w,h){g.fillStyle="#f4f2ed";g.fillRect(0,0,w,h);for(var y=0;y<h;y+=32){g.fillStyle="rgba(0,0,0,.16)";g.fillRect(0,y,w,2);for(var x=0;x<w;x+=64){g.fillStyle="rgba(0,0,0,.06)";g.fillRect(x+8,y+7,48,2);g.fillRect(x+8,y+24,48,2);g.fillStyle="rgba(255,255,255,.7)";g.fillRect(x+8,y+9,48,1);}}}));
  TX.wood=tx(cv(256,256,function(g,w,h){for(var y=0;y<h;y+=32){for(var x=((y/32)%3)*70-140;x<w;x+=210){var v=150+((r()*40)|0);g.fillStyle="rgb("+v+","+(v*.72|0)+","+(v*.5|0)+")";g.fillRect(x,y,208,31);g.fillStyle="rgba(0,0,0,.25)";g.fillRect(x+208,y,2,32);}g.fillStyle="rgba(0,0,0,.3)";g.fillRect(0,y+31,w,1);}dots(g,w,h,r,3000,"80,50,30",.05,.15,1,6);}),true);
  TX.cells=tx(cv(128,212,function(g,w,h){g.fillStyle="#0e1726";g.fillRect(0,0,w,h);for(var i=0;i<6;i++)for(var j=0;j<10;j++){var gr=g.createLinearGradient(i*w/6,j*h/10,(i+1)*w/6,(j+1)*h/10);gr.addColorStop(0,"#1a2a44");gr.addColorStop(1,"#101b2e");g.fillStyle=gr;g.fillRect(i*w/6+1,j*h/10+1,w/6-2,h/10-2);}
    g.strokeStyle="rgba(200,210,225,.35)";g.lineWidth=.8;for(var k=1;k<4;k++){g.beginPath();g.moveTo(k*w/4,0);g.lineTo(k*w/4,h);g.stroke();}}));
  TX.pmesh=tx(cv(64,64,function(g,w,h){g.strokeStyle="#16181b";g.lineWidth=3;for(var i=0;i<=w;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}}),true);TX.pmesh.repeat.set(6,2);
  TX.gran=tx(cv(128,128,function(g,w,h){g.fillStyle="#fff";g.fillRect(0,0,w,h);dots(g,w,h,r,5000,"0,0,0",.05,.3,1,2);dots(g,w,h,r,3000,"255,255,255",.3,.6,1,2);}),true);TX.gran.repeat.set(2,2);
  /* a fine woven tile; screen UVs run in 10 cm steps, so this is about 3 mm between strands */
  function screenTex(line,col,fill){return tx(cv(128,128,function(g,w,h){if(fill){g.fillStyle=fill;g.fillRect(0,0,w,h);}
    g.strokeStyle=col;g.lineWidth=line;for(var i=0;i<w;i+=4){g.beginPath();g.moveTo(i+.5,0);g.lineTo(i+.5,h);g.stroke();g.beginPath();g.moveTo(0,i+.5);g.lineTo(w,i+.5);g.stroke();}}),true);}
  TX.scrOld=screenTex(1,"rgba(140,131,114,.66)","rgba(160,150,128,.16)");
  TX.scrC=screenTex(1.4,"rgba(28,30,34,.92)","rgba(18,20,24,.28)");
  TX.scrA=screenTex(1.8,"rgba(12,13,15,.94)","rgba(8,9,11,.3)");
  /* what years of sun do to builder mesh: chalky fade, a sag line, a torn corner, dust in the bottom */
  TX.scrDmg=tx(cv(256,256,function(g,w,h){blot(g,w,h,r,10,"196,184,160",.22,60);
    var gr=g.createLinearGradient(0,h*.7,0,h);gr.addColorStop(0,"rgba(170,152,120,0)");gr.addColorStop(1,"rgba(170,152,120,.55)");g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.fillStyle="rgba(30,26,20,.85)";g.beginPath();g.moveTo(40,150);g.lineTo(58,134);g.lineTo(71,146);g.lineTo(96,120);g.lineTo(104,128);g.lineTo(80,160);g.lineTo(62,156);g.lineTo(46,170);g.closePath();g.fill();
    g.strokeStyle="rgba(214,204,182,.9)";g.lineWidth=1.2;for(var k=0;k<26;k++){var x=46+k*2.2+r()*3,y=168-k*1.8+r()*6;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*7,y+(r()-.5)*7);g.stroke();}
    g.fillStyle="rgba(30,26,20,.8)";g.beginPath();g.moveTo(188,24);g.lineTo(214,20);g.lineTo(208,40);g.closePath();g.fill();
    g.strokeStyle="rgba(120,110,92,.5)";g.lineWidth=2;g.beginPath();g.moveTo(16,96);g.bezierCurveTo(90,110,170,86,240,100);g.stroke();}));
  TX.dust=tx(cv(64,106,function(g,w,h){g.fillStyle="rgba(198,180,142,.8)";g.fillRect(0,0,w,h);blot(g,w,h,r,8,"160,140,100",.3,18);dots(g,w,h,r,700,"120,100,70",.2,.45,1,2);dots(g,w,h,r,500,"240,230,205",.3,.6,1,2);}));
  TX.shadow=tx(cv(128,128,function(g,w,h){var gr=g.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);gr.addColorStop(0,"rgba(0,0,0,.42)");gr.addColorStop(.62,"rgba(0,0,0,.2)");gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(0,0,w,h);}));
})();
function hazeCanvas(w,h,seed){var r=rng(seed);return cv(w,h,function(g){g.clearRect(0,0,w,h);g.fillStyle="rgba(206,196,174,.6)";g.fillRect(0,0,w,h);blot(g,w,h,r,16,"175,160,130",.25,40);
  for(var i=0;i<40;i++){var x=r()*w,y=r()*h,rr=2+r()*5;g.strokeStyle="rgba(255,255,255,"+(.25+r()*.3)+")";g.lineWidth=1.2;g.beginPath();g.arc(x,y,rr,0,7);g.stroke();}
  for(var k=0;k<10;k++){var sx=r()*w;g.strokeStyle="rgba(240,235,222,.35)";g.lineWidth=2+r()*2;g.beginPath();g.moveTo(sx,h*.2+r()*h*.3);g.lineTo(sx+(r()-.5)*6,h);g.stroke();}});}
/* muddy water standing in the window track: brown pools, grit, a dirt line where it dried, and a wet shine */
function puddleCanvas(){var r=rng(77);return cv(256,32,function(g,w,h){g.clearRect(0,0,w,h);
  g.fillStyle="rgba(120,96,64,.55)";g.fillRect(6,5,w-12,h-10);
  for(var i=0;i<12;i++){var x=14+r()*228,rr=16+r()*34,gr=g.createRadialGradient(x,16,0,x,16,rr);gr.addColorStop(0,"rgba(74,55,34,.95)");gr.addColorStop(.6,"rgba(96,74,46,.85)");gr.addColorStop(1,"rgba(110,86,56,0)");g.fillStyle=gr;g.fillRect(x-rr,2,2*rr,h-4);}
  g.strokeStyle="rgba(60,44,26,.8)";g.lineWidth=2;g.strokeRect(5,4,w-10,h-8);
  dots(g,w,h,r,900,"40,30,18",.35,.7,.6,1.4);dots(g,w,h,r,60,"190,170,130",.3,.5,.6,1.2);
  g.fillStyle="rgba(255,255,255,.5)";for(var k=0;k<9;k++)g.fillRect(14+r()*220,7+r()*6,12+r()*22,1.5);});}

/* ---------- materials ---------- */
function Std(o){return new T.MeshStandardMaterial(o);}
var WC=[0xe3d5bb,0xf1eee8,0xc9c5bd,0xd2ae8c],TC=[0xf5f3ee,0xe9dcc0,0x5b4a3b];
var PAL=[[[.72,.37,.24],[.62,.30,.20],[.80,.46,.30]],[[.44,.32,.25],[.35,.25,.20],[.53,.39,.29]],[[.27,.28,.29],[.21,.22,.23],[.33,.34,.35]],[[.77,.67,.51],[.70,.60,.44],[.83,.74,.58]]];
TX.gravel.repeat.set(240,240);TX.gravelB.repeat.set(240,240);
var M={
  under:Std({color:0x3e332b,roughness:1,side:T.DoubleSide}),
  glass:Std({color:0x1d2a36,metalness:.9,roughness:.06,envMapIntensity:1.15}),
  door:Std({color:0x7a5a3e,roughness:.55}),
  concrete:Std({map:TX.concrete,roughness:.95}),asphalt:Std({map:TX.asphalt,roughness:.95}),curb:Std({color:0xcfccc4,roughness:.9}),
  cmu:Std({map:TX.cmu,roughness:.95}),cap:Std({color:0xcbb895,roughness:.9}),brick:Std({map:TX.brick,roughness:.9}),
  shrub:Std({color:0x5f6e3e,roughness:1,flatShading:true}),shrub2:Std({color:0x7a8450,roughness:1,flatShading:true}),shrub3:Std({color:0x4f5c34,roughness:1,flatShading:true}),rock:Std({color:0x8a6d54,roughness:1,flatShading:true}),rock2:Std({color:0xa08a6c,roughness:1,flatShading:true}),rock3:Std({color:0x76604b,roughness:1,flatShading:true}),
  agave:Std({color:0x7d9a8a,roughness:.8}),jtrunk:Std({color:0x6e6250,roughness:1}),jleaf:Std({color:0x5a6d42,roughness:.9}),
  tile:Std({roughness:.72,side:T.DoubleSide}),shingle:Std({map:TX.gran,roughness:.95}),
  pframe:Std({color:0x1c1e21,metalness:.7,roughness:.35}),cell:Std({map:TX.cells,metalness:.3,roughness:.1,envMapIntensity:1.4}),rail:Std({color:0xa3a9b0,metalness:.8,roughness:.4}),
  pmesh:Std({map:TX.pmesh,transparent:true,alphaTest:.35,side:T.DoubleSide,metalness:.4,roughness:.6}),clip:Std({color:0x2a2c30,metalness:.5,roughness:.5}),
  bird:Std({color:0x7d8693,roughness:.8}),wing:Std({color:0x626b77,roughness:.85}),neck:Std({color:0x5b7f70,metalness:.45,roughness:.35}),head:Std({color:0x4c5461,roughness:.7}),beak:Std({color:0x2a2a2a}),leg:Std({color:0xc4767a}),
  blade:Std({color:0xffffff,metalness:1,roughness:.04}),bladeR:Std({color:0xd23a2c,metalness:.6,roughness:.2}),pole:Std({color:0x9aa0a8,metalness:.7,roughness:.35}),
  vent:Std({color:0x2e3135,roughness:.6}),flash:Std({color:0x8c9096,metalness:.5,roughness:.5}),clampM:Std({color:0xd9dde2,metalness:1,roughness:.2}),
  sframe:Std({color:0xb9bec4,metalness:.6,roughness:.4}),sframeOld:Std({color:0xa39d92,metalness:.3,roughness:.7}),
  scrOld:Std({map:TX.scrOld,transparent:true,roughness:.9,depthWrite:false,side:T.DoubleSide}),
  scrC:Std({map:TX.scrC,transparent:true,roughness:.8,depthWrite:false,side:T.DoubleSide}),
  scrA:Std({map:TX.scrA,transparent:true,roughness:.5,metalness:.1,depthWrite:false,side:T.DoubleSide}),
  scrDmg:Std({map:TX.scrDmg,transparent:true,roughness:1,depthWrite:false,side:T.DoubleSide}),
  shades:Std({color:0x16181b,metalness:.6,roughness:.15}),hair:Std({color:0x2b2119,roughness:.9}),lip:Std({color:0x9c6450,roughness:.7}),
  shadow:new T.MeshBasicMaterial({map:TX.shadow,transparent:true,depthWrite:false}),
  water:new T.PointsMaterial({color:0xcfeaff,size:.035,transparent:true,opacity:.85,depthWrite:false}),
  tank:Std({color:0x2f6fb0,roughness:.5}),cart:Std({color:0x3a3d42,roughness:.6}),hose:Std({color:0x2b2b2e,roughness:.7}),
  shirt:Std({color:0x2f5f9f,roughness:.85}),pants:Std({color:0x4a4f57,roughness:.9}),skin:Std({color:0xb98262,roughness:.7}),
  hat:Std({color:0xd9c08a,roughness:.95}),band:Std({color:0x6b4f2a,roughness:.8}),shoe:Std({color:0x2a2a2a,roughness:.8}),
  rubber:Std({color:0x111111,roughness:.9}),chan:Std({color:0xc7ccd2,metalness:.8,roughness:.3}),towel:Std({color:0x3d7fd1,roughness:1}),
  iwall:Std({color:0xefe9df,roughness:.95}),ifloor:Std({map:TX.wood,roughness:.6}),vinyl:Std({color:0xf7f7f4,roughness:.5}),
  iglass:Std({color:0xdfeef7,metalness:.1,roughness:.05,transparent:true,opacity:.14,envMapIntensity:1.2,depthWrite:false}),
  alum:Std({color:0xb8bcc0,metalness:.8,roughness:.35})
};
M.dust=Std({map:TX.dust,transparent:true,depthWrite:false,roughness:1});
M.ground=Std({map:TX.gravel,bumpMap:TX.gravelB,bumpScale:.02,roughness:1});
var ground=new T.Mesh(new T.PlaneGeometry(2400,2400),M.ground);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
var matCache={};
function houseMats(cfg){
  var key=cfg.style+"-"+cfg.wc+"-"+cfg.tc+"-"+cfg.rc;if(matCache[key])return matCache[key];
  var siding=STY[cfg.style].siding,wc=new T.Color(WC[cfg.wc]),tc=new T.Color(TC[cfg.tc]),p=PAL[cfg.rc][0];
  var m={wall:Std({map:siding?TX.siding:TX.stucco,bumpMap:siding?null:TX.stuccoB,bumpScale:.012,color:wc,roughness:.95}),
    base:Std({color:wc.clone().multiplyScalar(.82),roughness:.95}),trim:Std({color:tc,roughness:.6}),
    garage:Std({map:TX.garage,color:cfg.tc===2?0xd9d3c6:0xffffff,roughness:.55}),
    ridge:Std({color:new T.Color().setRGB(p[0]*.85,p[1]*.85,p[2]*.85).convertSRGBToLinear(),roughness:.75}),
    porch:Std({color:new T.Color().setRGB(p[0],p[1],p[2]).convertSRGBToLinear(),roughness:.8})};
  if(siding){m.wall.map=TX.siding;}
  matCache[key]=m;return m;
}

/* ---------- geometry helpers ---------- */
/* lumpy shapes for desert rock and brush: shared points move together, so there are no cracks */
function lumpy(detail,amt,seed){var g=new T.IcosahedronGeometry(1,detail),p=g.attributes.position,r=rng(seed),m={};
  for(var i=0;i<p.count;i++){var x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*999)+","+Math.round(y*999)+","+Math.round(z*999);if(!(k in m))m[k]=1+(r()-.5)*2*amt;p.setXYZ(i,x*m[k],y*m[k],z*m[k]);}
  g.computeVertexNormals();return g;}
var G={rock:[lumpy(1,.26,11),lumpy(1,.3,23),lumpy(1,.22,37)],bush:[lumpy(2,.16,5),lumpy(2,.2,9)],box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(1,1,1,14),ball:new T.SphereGeometry(1,16,12),plane:new T.PlaneGeometry(1,1),
  frame:new T.BoxGeometry(1,.045,1.7),cell:new T.PlaneGeometry(.95,1.64),clip:new T.BoxGeometry(.06,.07,.04),
  blade:new T.BoxGeometry(.5,.012,.14),vent:new T.CylinderGeometry(.06,.06,.36,14),flash:new T.CylinderGeometry(.2,.24,.02,16),clamp:new T.TorusGeometry(.075,.011,6,18),
  beak:new T.ConeGeometry(.018,.05,6),tail:new T.BoxGeometry(.1,.02,.15),leg:new T.CylinderGeometry(.008,.008,.08,5),cone:new T.ConeGeometry(1,1,6)};
G.cell.rotateX(-Math.PI/2);
var sT=new T.CylinderGeometry(.14,.14,.44,12,1,true,0,Math.PI);sT.rotateZ(Math.PI/2);sT.rotateY(Math.PI/2);
var TILE=[{geo:sT,dx:.3,dz:.38,h:.14,tilt:-.07,stag:0},{geo:new T.BoxGeometry(.3,.035,.42),dx:.31,dz:.34,h:.05,tilt:-.06,stag:.155},{geo:new T.BoxGeometry(.98,.014,.34),dx:1,dz:.15,h:.035,tilt:-.035,stag:.333}];
function box(w,h,d,m,x,y,z,par,noCast){var o=new T.Mesh(G.box,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=!noCast;o.receiveShadow=true;par.add(o);return o;}
function cylBetween(a,b,r,m,par){var o=new T.Mesh(G.cyl,m);setBone(o,a,b);o.scale.x=o.scale.z=r;o.castShadow=true;par.add(o);return o;}
var tmpV=new T.Vector3();
function setBone(o,a,b){tmpV.copy(b).sub(a);var l=tmpV.length()||1e-4;o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(UP,tmpV.multiplyScalar(1/l));o.scale.y=l;}
function inPoly(x,z,p){var c=false;for(var i=0,j=p.length-1;i<p.length;j=i++){var xi=p[i][0],zi=p[i][1],xj=p[j][0],zj=p[j][1];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))c=!c;}return c;}
function spanAt(p,z){var lo=1e9,hi=-1e9;for(var i=0,j=p.length-1;i<p.length;j=i++){var zi=p[i][1],zj=p[j][1];if((zi<=z&&zj>=z)||(zj<=z&&zi>=z)){var t=zj===zi?0:(z-zi)/(zj-zi),x=p[i][0]+(p[j][0]-p[i][0])*t;lo=Math.min(lo,x);hi=Math.max(hi,x);}}return [lo,hi];}
function toWorld(o,x,y,z){o.updateMatrixWorld(true);return o.localToWorld(V(x,y,z));}

/* ---------- house styles ---------- */
var STY=[
  {id:"new",roof:"gable",pitch:.4,story:2.8,minW:13,siding:false,front:["gar2","door","win","win"]},
  {id:"ranch",roof:"hip",pitch:.32,story:2.7,minW:16,siding:false,front:["win","win","door","win","gar2"]},
  {id:"classic",roof:"gable",pitch:.52,story:2.7,minW:12,siding:true,front:["win","win","porch","win","win"],chimney:true},
  {id:"estate",roof:"hip",pitch:.36,story:3.2,minW:19,siding:false,front:["win","win","entry","win","gar2","gar1"],big:true}
];
var PW=1.02,PD=1.72,H=.2,TOP=.07,OV=.5,RAKE=.35;
var h3={style:0,roof:0,rc:0,wc:0,tc:0,grids:false,view:0,stage:2,cov:true,spinOv:null,estateLarge:false};
var ORDER=[[1,0],[-1,0],[1,-.32],[-1,.32],[1,.32],[-1,-.32],[1,-.44],[-1,.44],[1,.16],[-1,-.16]];

function makeHouse(cfg,main){
  var S=STY[cfg.style],r=rng(cfg.n*97+cfg.style*13+cfg.stories*7+cfg.arrays*3+(main?1:5)),mats=houseMats(cfg);
  var h={cfg:cfg,S:S,r:r,mats:mats,g:new T.Group(),main:main,wins:[],front1:[],edges:[],panels:[],skirt:[],clips:[],vents:[],rects:{"1":[],"-1":[]},faces:{}};
  var story=S.story,wallH=story*cfg.stories,a=S.pitch,tile=TILE[cfg.roof];h.TT=TOP+tile.h;h.tile=tile;
  var n=Math.max(1,cfg.n),A=Math.min(cfg.arrays,n),sizes=[],i;
  for(i=0;i<A;i++)sizes.push(cfg.sizes&&cfg.sizes.length===A?cfg.sizes[i]:Math.floor(n/A)+(i<n%A?1:0));
  var faceOf=A===1?[1]:A===2?[1,-1]:[1,1,-1];
  var groups=sizes.map(function(ng,k){var c=ng<3?ng:Math.max(2,Math.min(10,Math.round(Math.sqrt(2.2*ng))));return {n:ng,idx:k,face:faceOf[k],cols:c,rows:Math.ceil(ng/c)};});
  var need=0;[1,-1].forEach(function(sg){var gs=groups.filter(function(q){return q.face===sg;});var tw=gs.reduce(function(s,q){return s+q.cols*PW;},0)+Math.max(0,gs.length-1)*1.4;need=Math.max(need,tw);
    var x=-tw/2;gs.forEach(function(q){q.cx=x+q.cols*PW/2;x+=q.cols*PW+1.4;});});
  var maxRows=Math.max.apply(null,groups.map(function(q){return q.rows;}));
  var L=Math.max(S.big?6.6:5.4,maxRows*PD+2.6),run=L*Math.cos(a),rise=L*Math.sin(a),D=2*run;
  var items=S.front.slice();if(cfg.more){var li=items.lastIndexOf("win");items.splice(li+1,0,"win");}
  var iw={win:S.big?1.9:1.6,door:1.4,porch:3.4,entry:2.8,gar2:5.1,gar1:3.0};
  var frontW=items.reduce(function(s,k){return s+iw[k];},0)+(items.length+1)*.45;
  var W=Math.max(S.minW,frontW,S.roof==="gable"?need+4.5:Math.max(need+1+2*run-2.4*Math.cos(a),D+2.2));
  h.W=W;h.D=D;h.L=L;h.run=run;h.rise=rise;h.wallH=wallH;h.pitch=a;h.story=story;h.groups=groups;
  var g=h.g,trim=mats.trim;
  /* walls */
  box(W,wallH,D,mats.wall,0,wallH/2,0,g);
  box(W+.03,.14,D+.03,mats.base,0,.07,0,g,true);
  for(var s=1;s<cfg.stories;s++)box(W+.08,.14,D+.08,trim,0,story*s,0,g);
  /* windows */
  function win(x,y,z,ang,gw,gh,o){
    o=o||{};var w=new T.Group();w.position.set(x,y,z);w.rotation.y=ang;g.add(w);
    box(gw+.2,gh+.2,.1,trim,0,0,.03,w);
    var gl=box(gw,gh,.06,M.glass,0,0,.07,w,true);
    box(.05,gh,.08,trim,0,0,.09,w,true);
    if(cfg.grids){[-1,1].forEach(function(sd){var cx=sd*gw/4;box(.022,gh,.02,trim,cx,0,.105,w,true);box(gw/2-.05,.022,.02,trim,cx,0,.105,w,true);});}
    var sillM=main&&o.demo?trim.clone():trim,sill=box(gw+.32,.08,.2,sillM,0,-gh/2-.14,.08,w);if(sillM!==trim)sill.userData.dyn=true;
    if(o.arch){var ag=new T.CircleGeometry(gw/2,24,0,Math.PI),am=new T.Mesh(ag,M.glass);am.position.set(0,gh/2+.1,.072);w.add(am);
      var ring=new T.Mesh(new T.RingGeometry(gw/2,gw/2+.1,24,1,0,Math.PI),trim);ring.position.set(0,gh/2+.1,.08);w.add(ring);box(gw+.2,.1,.1,trim,0,gh/2+.08,.03,w);}
    var rec={g:w,gw:gw,gh:gh,gl:gl,sill:sill,sillM:sillM,ang:ang};h.wins.push(rec);return rec;
  }
  var gy0=S.big?1.55:1.5,gw1=S.big?1.5:1.3,gh1=S.big?1.7:1.08;
  var sum=items.reduce(function(q,k){return q+iw[k];},0),gap=(W-sum)/(items.length+1),x=-W/2+gap;
  var nWin=items.filter(function(k){return k==="win";}).length,wi=0;
  items.forEach(function(k){var cx=x+iw[k]/2,z=D/2;x+=iw[k]+gap;
    if(k==="win"){wi++;h.front1.push(win(cx,gy0,z,0,gw1,gh1,{arch:S.big,demo:wi===1||wi===nWin}));}
    else if(k==="door"){box(1.0,2.15,.08,M.door,cx,1.075,z+.04,g);box(1.2,.1,.1,trim,cx,2.2,z+.05,g);box(.08,2.2,.1,trim,cx-.56,1.1,z+.05,g);box(.08,2.2,.1,trim,cx+.56,1.1,z+.05,g);box(.1,.2,.08,M.pframe,cx+.72,1.9,z+.06,g);h.doorX=cx;}
    else if(k==="porch"){box(1.0,2.15,.08,M.door,cx,1.075,z+.04,g);box(1.2,.1,.1,trim,cx,2.2,z+.05,g);
      box(3.2,.16,2.2,M.concrete,cx,.08,z+1.1,g);[-1.45,1.45].forEach(function(px){box(.14,2.45,.14,trim,cx+px,1.3,z+2.0,g);});
      var pr=box(3.7,.1,2.6,mats.porch,cx,2.62,z+1.2,g);pr.rotation.x=.12;h.doorX=cx;}
    else if(k==="entry"){box(1.3,2.6,.08,M.door,cx,1.3,z+.04,g);[-1.05,1.05].forEach(function(px){var c=new T.Mesh(G.cyl,trim);c.scale.set(.16,2.9,.16);c.position.set(cx+px,1.45,z+.4);c.castShadow=true;g.add(c);});
      box(2.7,.32,.7,trim,cx,3.04,z+.3,g);box(2.9,.12,1.1,M.concrete,cx,.06,z+.55,g);h.doorX=cx;}
    else if(k==="gar2"||k==="gar1"){var gw=k==="gar2"?4.6:2.6;box(gw,2.3,.1,mats.garage,cx,1.15,z+.05,g);box(gw+.2,.12,.12,trim,cx,2.36,z+.06,g);
      box(.1,2.36,.12,trim,cx-gw/2-.05,1.18,z+.06,g);box(.1,2.36,.12,trim,cx+gw/2+.05,1.18,z+.06,g);(h.garages=h.garages||[]).push([cx,gw]);}
  });
  for(s=0;s<cfg.stories;s++){
    var y=s*story+gy0;
    if(s>0){var nf=(S.big?4:3)+(cfg.more?1:0);for(i=0;i<nf;i++)win(-W/2+W*(i+1)/(nf+1),y,D/2,0,S.big?1.4:1.3,S.big?1.3:1.08,{arch:false});}
    var nb=3+(cfg.more?1:0)+(S.big?1:0);for(i=0;i<nb;i++)win(-W/2+W*(i+1)/(nb+1),y,-D/2,Math.PI,1.3,1.08);
    [1,-1].forEach(function(sx){(D>7?[-.22,.22]:[0]).forEach(function(fz){win(sx*W/2,y,fz*D,sx>0?Math.PI/2:-Math.PI/2,1.3,1.08);});});
  }
  /* roof */
  var oc=OV*Math.cos(a),top=wallH;
  function face(poly,yaw,px,py,pz,name,gable){
    var f=new T.Group();f.rotation.order="YXZ";f.rotation.set(a,yaw,0);f.position.set(px,py,pz);g.add(f);
    var shp=new T.Shape(poly.map(function(p){return new T.Vector2(p[0],-p[1]);}));var sg=new T.ShapeGeometry(shp);sg.rotateX(-Math.PI/2);
    var um=new T.Mesh(sg,M.under);um.position.y=TOP-.02;um.castShadow=true;um.receiveShadow=true;f.add(um);
    var xs=poly.map(function(p){return p[0];}),zs=poly.map(function(p){return p[1];}),x0=Math.min.apply(null,xs),x1=Math.max.apply(null,xs),z0=Math.min.apply(null,zs),z1=Math.max.apply(null,zs);
    var nx=Math.ceil((x1-x0)/tile.dx)+2,nz=Math.ceil((z1-z0)/tile.dz)+1,im=new T.InstancedMesh(tile.geo,cfg.roof===2?M.shingle:M.tile,nx*nz),dm=new T.Object3D(),col=new T.Color(),cnt=0,pal=PAL[cfg.rc];
    for(var zi=0;zi<nz;zi++)for(var xi=0;xi<nx;xi++){var off=tile.stag?((zi*tile.stag)%1)*tile.dx:0,tx0=x0+tile.dx/2+xi*tile.dx-off,tz=z0+tile.dz/2+zi*tile.dz;
      if(!inPoly(tx0,tz,poly))continue;dm.position.set(tx0,TOP+(cfg.roof===0?0:tile.h/2),tz);dm.rotation.set(tile.tilt,0,0);dm.updateMatrix();im.setMatrixAt(cnt,dm.matrix);
      var pp=cfg.roof===0?pal[(r()*3)|0]:pal[r()<.8?0:(r()*3)|0],v=cfg.roof===0?.9+r()*.18:.95+r()*.09;col.setRGB(pp[0]*v,pp[1]*v,pp[2]*v).convertSRGBToLinear();im.setColorAt(cnt,col);cnt++;}
    im.count=cnt;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.receiveShadow=true;im.castShadow=!small;f.add(im);
    var ev=poly.filter(function(p){return Math.abs(p[1]-z1)<1e-6;}),ex0=Math.min(ev[0][0],ev[ev.length-1][0]),ex1=Math.max(ev[0][0],ev[ev.length-1][0]);
    box(ex1-ex0,.24,.05,trim,(ex0+ex1)/2,TOP-.12,z1,f);
    if(gable){box(.05,.24,z1-z0,trim,x0,TOP-.12,(z0+z1)/2,f);box(.05,.24,z1-z0,trim,x1,TOP-.12,(z0+z1)/2,f);}
    f.userData={poly:poly,name:name};h.faces[name]=f;return f;
  }
  if(S.roof==="gable"){
    var gp=[[-W/2-RAKE,-L/2],[W/2+RAKE,-L/2],[W/2+RAKE,L/2+OV],[-W/2-RAKE,L/2+OV]];
    h.F=face(gp,0,0,top+rise/2,run/2,"F",true);h.B=face(gp,Math.PI,0,top+rise/2,-run/2,"B",true);
    var gs=new T.Shape();gs.moveTo(-run,0);gs.lineTo(run,0);gs.lineTo(0,rise);gs.lineTo(-run,0);
    [1,-1].forEach(function(sx){var gm=new T.Mesh(new T.ShapeGeometry(gs),mats.wall);gm.material=mats.wall;gm.rotation.y=sx>0?Math.PI/2:-Math.PI/2;gm.position.set(sx*W/2,top,0);gm.castShadow=true;gm.receiveShadow=true;g.add(gm);});
    var rg=new T.Mesh(G.cyl,mats.ridge);rg.scale.set(.18,W+2*RAKE,.18);rg.rotation.z=Math.PI/2;rg.position.set(0,top+rise+TOP+.04,0);rg.castShadow=true;g.add(rg);
  }else{
    var rh=W/2-run;
    var fp=[[-rh,-L/2],[rh,-L/2],[W/2+oc,L/2+OV],[-W/2-oc,L/2+OV]],sp=[[0,-L/2],[D/2+oc,L/2+OV],[-D/2-oc,L/2+OV]];
    h.F=face(fp,0,0,top+rise/2,run/2,"F",false);h.B=face(fp,Math.PI,0,top+rise/2,-run/2,"B",false);
    face(sp,Math.PI/2,W/2-run/2,top+rise/2,0,"SR",false);face(sp,-Math.PI/2,-(W/2-run/2),top+rise/2,0,"SL",false);
    var yr=top+rise+TOP+.04;
    var rgh=new T.Mesh(G.cyl,mats.ridge);rgh.scale.set(.17,Math.max(.01,2*rh),.17);rgh.rotation.z=Math.PI/2;rgh.position.set(0,yr,0);rgh.castShadow=true;g.add(rgh);
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(c){cylBetween(V(c[0]*rh,yr,0),V(c[0]*(W/2+oc),top-OV*Math.sin(a)+TOP+.04,c[1]*(D/2+oc)),.15,mats.ridge,g);});
  }
  if(S.chimney){var cx2=W/2-1.5,cz=-run*.45,yRoof=top+rise*(1-.45);box(.9,rise*.45+1.5,.9,M.brick,cx2,yRoof+(rise*.45+1.5)/2-rise*.45+.2,cz,g);box(1.05,.12,1.05,M.concrete,cx2,yRoof+1.72,cz,g);}
  /* solar arrays */
  var zTop=-L/2+(S.roof==="hip"?1.2:1.35);h.zTop=zTop;
  groups.forEach(function(gp2){
    var par=gp2.face>0?h.F:h.B,ox=gp2.cx-(gp2.cols-1)/2*PW,occ={},py=h.TT+H,k;
    for(k=0;k<gp2.n;k++)occ[(k%gp2.cols)+","+Math.floor(k/gp2.cols)]=1;
    for(var rw=0;rw<gp2.rows;rw++){var inRow=Math.min(gp2.cols,gp2.n-rw*gp2.cols),rz=zTop+rw*PD+PD/2;[-.55,.55].forEach(function(dz){box(inRow*PW,.04,.05,M.rail,ox+(inRow-1)*PW/2,h.TT+H/2,rz+dz,par);});}
    for(k=0;k<gp2.n;k++){var c=k%gp2.cols,rw2=Math.floor(k/gp2.cols),px=ox+c*PW,pz=zTop+rw2*PD+PD/2;
      var fr=new T.Mesh(G.frame,M.pframe);fr.position.set(px,py,pz);fr.castShadow=true;par.add(fr);
      var ce=new T.Mesh(G.cell,M.cell);ce.position.set(px,py+.024,pz);par.add(ce);
      if(main){var dm2=new T.Mesh(G.cell,M.dust.clone());dm2.userData.dyn=true;dm2.position.set(px,py+.03,pz);dm2.renderOrder=3;dm2.visible=false;par.add(dm2);
        h.panels.push({face:gp2.face,par:par,x:px,z:pz,row:rw2,col:c,dust:dm2});}
      if(!occ[c+","+(rw2-1)])h.edges.push([px,pz-PD/2,0,-1,gp2.face]);if(!occ[c+","+(rw2+1)])h.edges.push([px,pz+PD/2,0,1,gp2.face]);
      if(!occ[(c-1)+","+rw2])h.edges.push([px-PW/2,pz,1,-1,gp2.face]);if(!occ[(c+1)+","+rw2])h.edges.push([px+PW/2,pz,1,1,gp2.face]);}
    gp2.rect=[ox-PW/2-.4,ox+(gp2.cols-.5)*PW+.4,zTop-.4,zTop+gp2.rows*PD+.4];h.rects[gp2.face].push(gp2.rect);
    gp2.center=[gp2.cx,zTop+gp2.rows*PD/2];gp2.bottom=zTop+gp2.rows*PD;
  });
  if(main){
    /* pigeon mesh and clips on every open panel edge */
    h.edges.forEach(function(e){var par=e[4]>0?h.F:h.B,len=e[2]?PD:PW,sk=new T.Mesh(G.plane,M.pmesh);sk.position.set(e[0],h.TT+H/2,e[1]);if(e[2])sk.rotation.y=Math.PI/2;sk.scale.set(len,H,1);sk.userData.y0=h.TT;sk.userData.dyn=true;par.add(sk);h.skirt.push(sk);
      for(var q=-1;q<=1;q+=2){var cl=new T.Mesh(G.clip,M.clip);cl.position.set(e[0]+(e[2]?0:q*len*.3),h.TT+H-.01,e[1]+(e[2]?q*len*.3:0));if(e[2])cl.rotation.y=Math.PI/2;par.add(cl);h.clips.push(cl);}});
    /* vents near the ridge, where the spinners mount */
    var vz=-L/2+.6;
    for(i=0;i<8;i++){var o=ORDER[i],f2=o[0]>0?h.F:h.B,sp2=spanAt(f2.userData.poly,vz),vx=Math.max(sp2[0]+.6,Math.min(sp2[1]-.6,o[1]*W));
      var v=new T.Group();v.position.set(vx,h.TT,vz);var fl=new T.Mesh(G.flash,M.flash);fl.position.y=.01;v.add(fl);var vp=new T.Mesh(G.vent,M.vent);vp.position.y=.18;vp.castShadow=true;v.add(vp);f2.add(v);
      h.vents.push({face:o[0],x:vx,z:vz,par:f2,g:v});}
  }
  /* yard */
  var fz=D/2;
  box(W+3.2,.01,D+3.2,M.shadow,0,.012,0,g,true).receiveShadow=false;
  (h.garages||[]).forEach(function(gg){box(gg[1]+.4,.03,8.2,M.concrete,gg[0],.015,fz+4.1,g,true);});
  if(h.doorX!==undefined){box(1.2,.03,S.id==="classic"?6:3.2,M.concrete,h.doorX,.016,fz+(S.id==="classic"?5.2:1.6),g,true);}
  var ystep=main?1:0;
  for(i=0;i<5+ystep*3;i++){var side=i%2?1:-1,sx2=side*(W/2-1.2-r()*2.5),sz=fz+.9+r()*1.1;if(h.garages&&h.garages.some(function(gg){return Math.abs(sx2-gg[0])<gg[1]/2+.8;}))continue;
    var sc=.3+r()*.35,nb=4+Math.floor(r()*3);for(var bi=0;bi<nb;bi++){var bm=[M.shrub,M.shrub2,M.shrub3][Math.floor(r()*3)],sb=new T.Mesh(G.bush[bi%2],bm),bs=sc*(.45+r()*.35),an=r()*6.28,rd=bi?sc*.55:0;
      sb.scale.set(bs*1.15,bs*.85,bs);sb.rotation.y=r()*3;sb.position.set(sx2+Math.cos(an)*rd,bs*.7,sz+Math.sin(an)*rd*.8);sb.castShadow=true;g.add(sb);}}
  for(i=0;i<4+ystep*4;i++){var rk=new T.Mesh(G.rock[i%3],[M.rock,M.rock2,M.rock3][Math.floor(r()*3)]),rs=.14+r()*.22;rk.scale.set(rs*1.5,rs*.75,rs*1.1);rk.rotation.set((r()-.5)*.4,r()*3,(r()-.5)*.4);rk.position.set((r()-.5)*W,rs*.25,fz+2.3+r()*3.2);if(h.garages&&h.garages.some(function(gg){return Math.abs(rk.position.x-gg[0])<gg[1]/2+.6;}))continue;rk.castShadow=true;g.add(rk);}
  if(main){
    for(i=0;i<3;i++){var ag=new T.Group(),axx=(i===1?1:-1)*(W/2-.8-i*.6),azz=fz+3.4+i*.5;for(var l=0;l<11;l++){var lf=new T.Mesh(G.cone,M.agave);lf.scale.set(.05,.55,.05);var an=l/11*Math.PI*2;lf.position.set(Math.cos(an)*.12,.24,Math.sin(an)*.12);lf.rotation.set(Math.sin(an)*.7,0,-Math.cos(an)*.7);lf.castShadow=true;ag.add(lf);}ag.position.set(axx,0,azz);g.add(ag);}
    joshua(g,-W/2-2.4,fz+3.2,r);
    var wx=W/2+3.4,wz0=0,wz1=-D/2-4.6,wh=1.6;
    [1,-1].forEach(function(sx){box(.2,wh,wz0-wz1,M.cmu,sx*wx,wh/2,(wz0+wz1)/2,g);box(.28,.06,wz0-wz1,M.cap,sx*wx,wh+.03,(wz0+wz1)/2,g);});
    box(2*wx,wh,.2,M.cmu,0,wh/2,wz1,g);box(2*wx+.28,.06,.28,M.cap,0,wh+.03,wz1,g);
  }
  batch(h);
  return h;
}
/* merge every static mesh that shares a geometry and material into one instanced draw */
function batch(h){
  var root=h.g,groups={},kill=[];root.updateMatrixWorld(true);
  root.traverse(function(o){if(!o.isMesh||o.isInstancedMesh||o.userData.dyn)return;var p=o.parent;while(p&&p!==root){if(p.userData.dyn)return;p=p.parent;}
    var k=o.geometry.uuid+"|"+o.material.uuid;(groups[k]=groups[k]||[]).push(o);});
  Object.keys(groups).forEach(function(k){var list=groups[k];if(list.length<2)return;
    var im=new T.InstancedMesh(list[0].geometry,list[0].material,list.length),cast=false,recv=false;
    list.forEach(function(o,i){im.setMatrixAt(i,o.matrixWorld);cast=cast||o.castShadow;recv=recv||o.receiveShadow;kill.push(o);});
    im.instanceMatrix.needsUpdate=true;im.castShadow=cast;im.receiveShadow=recv;root.add(im);
    if(list[0].geometry===G.clip)h.clipIM=im;});
  kill.forEach(function(o){o.parent.remove(o);});
}
function joshua(par,x,z,r){
  var j=new T.Group();j.position.set(x,0,z);par.add(j);
  cylBetween(V(0,0,0),V(.05,2.1,0),.13,M.jtrunk,j);
  [[.9,2.9,.3],[-.8,2.7,-.2],[.2,3.2,-.7]].forEach(function(b){var tip=V(b[0],b[1],b[2]);cylBetween(V(.05,1.9,0),tip,.08,M.jtrunk,j);
    for(var k=0;k<14;k++){var sp=new T.Mesh(G.cone,M.jleaf);sp.scale.set(.035,.42,.035);var th=r()*Math.PI*2,ph=r()*Math.PI*.8;var d=V(Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th));
      sp.position.copy(tip).addScaledVector(d,.2);sp.quaternion.setFromUnitVectors(UP,d);sp.castShadow=true;j.add(sp);}});
}

/* ---------- world: my house, street, neighbors ---------- */
var world=new T.Group();scene.add(world);
var me=null,street=null,nbs=[],birds=[],spinners=[],cover={},builtKey="",nbKey="";
function cfgMe(){return {style:h3.style,stories:st.stories,roof:h3.roof,rc:h3.rc,wc:h3.wc,tc:h3.tc,grids:h3.grids,more:st.more,n:st.panels,arrays:st.arrays,sizes:st.arrays>1?st.arr.slice(0,st.arrays):null};}
function keyOf(c){return [c.style,c.stories,c.roof,c.rc,c.wc,c.tc,c.grids,c.more,c.n,c.arrays,c.sizes?c.sizes.join("."):""].join("-");}
function buildMe(){
  if(me){world.remove(me.g);disposeGroup(me.g);}
  birds.forEach(function(b){world.remove(b.m);});birds=[];
  me=makeHouse(cfgMe(),true);world.add(me.g);me.g.updateMatrixWorld(true);me.ms=(mode!=="pig"||h3.stage>=1)?1:0;
  builtKey=keyOf(me.cfg);
  if(street){world.remove(street);disposeGroup(street);}
  street=new T.Group();world.add(street);var fz=me.D/2;
  box(900,.02,7,M.asphalt,0,.01,fz+12.3,street,true);box(900,.12,.25,M.curb,0,.06,fz+8.7,street,true);box(900,.03,1.6,M.concrete,0,.015,fz+7.8,street,true);
  me.front=fz;
  demoWin=me.front1[0]||me.wins[0];scrWin=me.front1[me.front1.length-1]||demoWin;
  prepDemo();
  nbKey="";clearNeighbors();birds=[];
  spinners=[];buildSpinners();
  fitShadow(false);
  anchors();
}
function disposeGroup(g){g.traverse(function(o){if(o.geometry&&o.geometry!==G.box&&o.geometry!==G.cyl&&o.geometry!==G.ball&&o.geometry!==G.plane&&o.geometry.dispose&&!o.geometry.userData.shared)o.geometry.dispose();});}
[G.box,G.cyl,G.ball,G.plane,G.frame,G.cell,G.clip,G.blade,G.vent,G.flash,G.clamp,G.beak,G.tail,G.leg,G.cone,sT].concat(TILE.map(function(t){return t.geo;})).forEach(function(gg){gg.userData.shared=true;});
function clearNeighbors(){nbs.forEach(function(n){world.remove(n.g);disposeGroup(n.g);});nbs=[];}
function buildNeighbors(){
  var key=builtKey;if(nbKey===key&&nbs.length)return;clearNeighbors();
  var cfgs=[{style:0,stories:2,roof:1,rc:1,wc:2,tc:0,grids:false,more:false,n:12,arrays:1},{style:1,stories:1,roof:0,rc:3,wc:0,tc:1,grids:true,more:false,n:10,arrays:1}];
  var gap=7.5,L=makeHouse(cfgs[0],false),Rn=makeHouse(cfgs[1],false);
  L.g.position.set(-(me.W/2+gap+L.W/2),0,me.front-L.D/2);Rn.g.position.set(me.W/2+gap+Rn.W/2,0,me.front-Rn.D/2);
  world.add(L.g);world.add(Rn.g);L.g.updateMatrixWorld(true);Rn.g.updateMatrixWorld(true);nbs=[L,Rn];nbKey=key;
  buildBirds();fitShadow(true);
}
function fitShadow(wide){
  var c=sun.shadow.camera,S2=wide?(me.W/2+30):(Math.max(me.W,me.D)*.75+7);
  c.left=-S2;c.right=S2;c.top=S2;c.bottom=-S2;c.near=1;c.far=wide?140:90;c.updateProjectionMatrix();
  sun.position.set(-14,22,16);sun.target.position.set(0,0,0);
}

/* ---------- spinners on the vents, two hose clamps each ---------- */
function spinCount(){return h3.spinOv!==null?h3.spinOv:C.free()+st.spin;}
function buildSpinners(){
  spinners.forEach(function(s){s.par.remove(s.g);});spinners=[];
  var n=Math.min(spinCount(),me.vents.length);
  for(var i=0;i<n;i++){var v=me.vents[i],g=new T.Group();g.position.set(v.x,me.TT,v.z);
    var pl=new T.Mesh(G.cyl,M.pole);pl.scale.set(.018,.9,.018);pl.position.set(.085,.46,0);pl.castShadow=true;g.add(pl);
    [.1,.27].forEach(function(y){var cl=new T.Mesh(G.clamp,M.clampM);cl.rotation.x=Math.PI/2;cl.scale.set(1.45,1,1);cl.position.set(.035,y,0);g.add(cl);});
    var rot=new T.Group();rot.position.set(.085,.86,0);var hub=new T.Mesh(G.ball,M.pole);hub.scale.setScalar(.05);rot.add(hub);
    for(var b=0;b<3;b++){var m=new T.Mesh(G.blade,b===1?M.bladeR:M.blade);m.position.x=.25;m.rotation.x=.55;m.castShadow=true;var arm=new T.Group();arm.rotation.y=b*Math.PI*2/3;arm.add(m);rot.add(arm);}
    g.add(rot);v.par.add(g);spinners.push({g:g,rot:rot,face:v.face,x:v.x,z:v.z,par:v.par,s:0});}
  paintCover();
}
function paintCover(){
  [1,-1].forEach(function(sign){
    var f=sign>0?me.F:me.B;
    if(!cover[sign]){var c=doc.createElement("canvas");c.width=256;c.height=128;cover[sign]={c:c,t:new T.CanvasTexture(c)};}
    var cv2=cover[sign];if(cv2.m&&cv2.m.parent)cv2.m.parent.remove(cv2.m);
    cv2.m=new T.Mesh(G.plane,new T.MeshBasicMaterial({map:cv2.t,transparent:true,depthWrite:false}));cv2.m.rotation.x=-Math.PI/2;cv2.m.renderOrder=2;f.add(cv2.m);
    cv2.m.scale.set(me.W,me.L,1);cv2.m.position.set(0,me.TT+.02,0);
    var g=cv2.c.getContext("2d");g.clearRect(0,0,256,128);
    spinners.forEach(function(sp){if(sp.face!==sign)return;var cx=(sp.x/me.W+.5)*256,cy=(sp.z/me.L+.5)*128,rx=me.L*1.1/me.W*256,ry=1.1*128;
      g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI);g.closePath();g.fillStyle="rgba(240,176,64,.26)";g.fill();g.lineWidth=2;g.setLineDash([6,5]);g.strokeStyle="rgba(240,176,64,.95)";g.stroke();});
    cv2.t.needsUpdate=true;cv2.m.visible=false;
  });
}
function covered(b){
  for(var i=0;i<spinners.length;i++){var s=spinners[i];
    if(b.kind==="R"){if(Math.abs(b.x-s.x)<me.L*1.15)return true;continue;}
    if(s.face!==b.face)continue;var dx=b.x-s.x,dz=b.z-s.z;
    if(dz>-.7&&Math.hypot(dx,dz)<me.L*1.1&&(dz<=0||Math.atan2(Math.abs(dx),dz)<1.6))return true;}
  return false;
}

/* ---------- pigeons ---------- */
function pigeon(){
  var g=new T.Group(),m;
  function add(geo,mat,sx,sy,sz,x,y,z,par){m=new T.Mesh(geo,mat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.castShadow=true;(par||g).add(m);return m;}
  add(G.ball,M.bird,.12,.105,.2,0,.13,0);add(G.ball,M.neck,.07,.08,.07,0,.2,.12);add(G.ball,M.head,.055,.055,.06,0,.26,.165);
  var bk=add(G.beak,M.beak,1,1,1,0,.255,.225);bk.rotation.x=Math.PI/2;var tl=add(G.tail,M.wing,1,1,1,0,.12,-.24);tl.rotation.x=-.25;
  add(G.leg,M.leg,1,1,1,-.03,.04,.02);add(G.leg,M.leg,1,1,1,.03,.04,.02);
  var wl=new T.Group(),wr=new T.Group();wl.position.set(-.08,.17,-.02);wr.position.set(.08,.17,-.02);
  add(G.ball,M.wing,.12,.025,.15,-.1,0,0,wl);add(G.ball,M.wing,.12,.025,.15,.1,0,0,wr);g.add(wl);g.add(wr);
  g.userData.w=[wl,wr];g.scale.setScalar(1.35);return g;
}
function spots(h,fc,count,r){
  var out=[],tries=0,f=fc>0?h.F:h.B,poly=f.userData.poly;
  while(out.length<count&&tries<600){tries++;var z=-h.L/2+.5+r()*(h.L-1),sp=spanAt(poly,z),x=sp[0]+.6+r()*Math.max(0,sp[1]-sp[0]-1.2),hit=false;
    h.rects[fc].forEach(function(q){if(x>q[0]&&x<q[1]&&z>q[2]&&z<q[3])hit=true;});if(!hit)out.push({f:f,face:fc,x:x,z:z});}
  return out;
}
function buildBirds(){
  birds.forEach(function(b){world.remove(b.m);});birds=[];
  var r=rng(st.panels*31+h3.style*7+st.stories),landing=[];
  nbs.forEach(function(nh){spots(nh,1,9,r).concat(spots(nh,-1,7,r)).forEach(function(s){landing.push(toWorld(s.f,s.x,nh.TT,s.z));});});
  landing.sort(function(){return r()-.5;});
  function bird(pos,kind,info){var pg=pigeon();pg.position.copy(pos);pg.rotation.y=r()*6.28;world.add(pg);
    var b={m:pg,kind:kind,face:info.face,x:info.x,z:info.z,base:pos.clone(),k:0,kt:0,ry:pg.rotation.y,ph:r()*6.28};
    if(kind!=="N")b.dest=landing.length?landing.pop():pos.clone().add(V(r()<.5?-16:16,0,0));birds.push(b);return b;}
  me.edges.slice().sort(function(){return r()-.5;}).slice(0,5).forEach(function(e){var par=e[4]>0?me.F:me.B,x=e[0]+(e[2]?.32*e[3]:(r()-.5)*.4),z=e[1]+(e[2]?(r()-.5)*.6:.32*e[3]);bird(toWorld(par,x,me.TT,z),"U",{face:e[4],x:x,z:z});});
  spots(me,1,6,r).concat(spots(me,-1,8,r)).forEach(function(s){bird(toWorld(s.f,s.x,me.TT,s.z),"O",s);});
  var yr=me.wallH+me.rise+TOP+.2,rl=me.S.roof==="hip"?Math.max(.5,me.W/2-me.run):me.W/2;
  for(var q=0;q<3;q++){var x=(r()-.5)*2*(rl-.6);bird(V(x,yr,0),"R",{face:0,x:x,z:0});}
  nbs.forEach(function(nh){spots(nh,1,4,r).concat(spots(nh,-1,3,r)).forEach(function(s){bird(toWorld(s.f,s.x,nh.TT,s.z),"N",s);});});
  birdTargets(true);
}
function birdTargets(snap){
  var stg=h3.stage;
  birds.forEach(function(b){if(b.kind==="N"){b.kt=0;return;}b.kt=stg>=1&&b.kind==="U"?1:stg===2&&covered(b)?1:0;if(snap)b.k=b.kt;});
}

/* ---------- demo pieces: dirty glass, screens, dusty panels ---------- */
var demoWin=null,scrWin=null,haze=null,screens=[],sillDust=new T.Color(0xcbbfa7);
function prepDemo(){
  var w=demoWin;if(!w)return;
  var hc=hazeCanvas(256,212,5),ht=tx(hc,false),hm=new T.Mesh(G.plane,new T.MeshBasicMaterial({map:ht,transparent:true,depthWrite:false}));
  hm.scale.set(w.gw,w.gh,1);hm.position.z=.103;hm.visible=false;w.g.add(hm);haze={c:hc,t:ht,m:hm,w:w,last:null};
  screens=[];
  var list=[demoWin].concat(me.wins.filter(function(x){return x!==demoWin&&x.ang===0;}));
  list.forEach(function(w2,i){var s=makeScreen(w2);s.idx=i;screens.push(s);});
}
/* sliders get one screen, over the half that opens (the right half from outside) */
function makeScreen(w){
  var g=new T.Group(),gw=w.gw/2+.04,gh=w.gh+.04,x0=w.gw/4;
  var fr=[box(gw,.035,.025,M.sframe,0,gh/2,0,g,true),box(gw,.035,.025,M.sframe,0,-gh/2,0,g,true),box(.035,gh,.025,M.sframe,-gw/2,0,0,g,true),box(.035,gh,.025,M.sframe,gw/2,0,0,g,true)];
  var pg=new T.PlaneGeometry(gw,gh,8,8),uv=pg.attributes.uv.array;for(var i=0;i<uv.length;i+=2){uv[i]*=gw/.1;uv[i+1]*=gh/.1;}
  var mesh=new T.Mesh(pg,M.scrA);g.add(mesh);
  var dg=new T.PlaneGeometry(gw,gh,8,8),dmg=new T.Mesh(dg,M.scrDmg);dmg.renderOrder=1;dmg.visible=false;g.add(dmg);
  g.position.set(x0,0,.14);g.visible=false;w.g.add(g);
  return {g:g,w:w,fr:fr,mesh:mesh,geo:pg,dmg:dmg,old:false,gw:gw,gh:gh,x0:x0};
}
function screenLook(s,old){
  if(s.old===old&&s.pet===st.pet)return;s.old=old;s.pet=st.pet;
  s.mesh.material=old?M.scrOld:(st.pet?M.scrA:M.scrC);s.dmg.visible=old;
  s.fr.forEach(function(f){f.material=old?M.sframeOld:M.sframe;});
  [s.geo,s.dmg.geometry].forEach(function(geo){var a=geo.attributes.position.array;
    for(var i=0;i<a.length;i+=3){var u=a[i]/s.gw+.5,v=a[i+1]/s.gh+.5;a[i+2]=old?-.03*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)+.002:0;}
    geo.attributes.position.needsUpdate=true;});
}
/* where the squeegee is at time t, and wipe everything it passed since the last frame */
function sweepAt(t,t0,dur,passes,v0,dv){var p=clamp01((t-t0)/dur),idx=Math.min(passes-1,Math.floor(p*passes)),fr=p*passes-idx;return [(idx%2?.5-fr:-.5+fr)*.86,v0-idx*dv,idx];}
function sweep(hz,t,t0,dur,passes,v0,dv,wpx){
  var from=Math.max(hz.done===undefined?t0:hz.done,t0),pi=null;
  for(var tt=from;tt<=t+1e-6;tt+=.015){var q=sweepAt(tt,t0,dur,passes,v0,dv);if(pi!==null&&q[2]!==pi)hz.last=null;pi=q[2];wipeHaze(hz,q[0],q[1],wpx);}
  hz.done=t;return sweepAt(t,t0,dur,passes,v0,dv);
}
function resetHaze(){haze.done=undefined;haze.clear=false;var g=haze.c.getContext("2d"),n=hazeCanvas(256,212,5);g.globalCompositeOperation="copy";g.drawImage(n,0,0);g.globalCompositeOperation="source-over";haze.t.needsUpdate=true;haze.last=null;}
function wipeHaze(hz,u,v,wpx){var g=hz.c.getContext("2d"),W=hz.c.width,Hh=hz.c.height,x=(u+.5)*W,y=(.5-v)*Hh;
  g.globalCompositeOperation="destination-out";g.strokeStyle="#000";g.lineCap="round";g.lineWidth=wpx;g.beginPath();
  if(hz.last){g.moveTo(hz.last[0],hz.last[1]);}else g.moveTo(x-.1,y);g.lineTo(x,y);g.stroke();g.globalCompositeOperation="source-over";hz.last=[x,y];hz.t.needsUpdate=true;}

/* ---------- the tech: straw hat, blue shirt, two arms that reach ---------- */
var worker=null,tools={};
function makeWorker(){
  var w=new T.Group(),body=new T.Group(),head=new T.Group(),m;w.add(body);head.position.y=1.6;body.add(head);
  function part(geo,mat,sx,sy,sz,x,y,z,to){m=new T.Mesh(geo,mat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.castShadow=true;(to||body).add(m);return m;}
  /* legs: thigh, knee, shin and boot, posed every frame so the feet stay planted */
  var legs={};[-1,1].forEach(function(sd){var th=part(G.cyl,M.pants,.078,1,.078,0,0,0,w),kn=part(G.ball,M.pants,.07,.07,.07,0,0,0,w),sh=part(G.cyl,M.pants,.066,1,.066,0,0,0,w);
    part(G.box,M.shoe,.12,.09,.27,sd*.1,.045,.05,w);part(G.ball,M.pants,.068,.05,.068,sd*.1,.1,.01,w);legs[sd]={th:th,kn:kn,sh:sh,sd:sd};});
  part(G.box,M.pants,.36,.2,.23,0,.95,0);[-1,1].forEach(function(sd){part(G.ball,M.pants,.09,.09,.09,sd*.1,.9,0);});
  var torso=new T.Mesh(new T.CylinderGeometry(.2,.17,.62,20),M.shirt);torso.position.y=1.26;torso.scale.z=.74;torso.castShadow=true;body.add(torso);
  part(G.ball,M.shirt,.2,.09,.148,0,1.56,0);
  part(G.cyl,M.shoe,.178,.045,.132,0,.975,0);part(G.box,M.chan,.05,.035,.012,0,.975,.13);
  part(G.ball,M.shirt,.075,.075,.07,-.21,1.5,0);part(G.ball,M.shirt,.075,.075,.07,.21,1.5,0);
  /* head: neck, ears, nose, mouth, sunglasses, straw hat, all turning together */
  part(G.cyl,M.skin,.05,.1,.05,0,0,0,head);part(G.ball,M.skin,.108,.125,.115,0,.14,.01,head);part(G.ball,M.skin,.07,.05,.07,0,.06,.035,head);
  part(G.ball,M.hair,.113,.106,.112,0,.162,-.022,head);
  [-1,1].forEach(function(sd){part(G.ball,M.skin,.02,.036,.028,sd*.108,.135,0,head);});
  part(G.ball,M.skin,.017,.026,.022,0,.128,.123,head);part(G.box,M.lip,.045,.009,.01,0,.085,.108,head);
  part(G.box,M.shades,.16,.036,.014,0,.162,.1,head);[-1,1].forEach(function(sd){part(G.box,M.shades,.008,.01,.1,sd*.098,.166,.05,head);});
  part(G.cyl,M.hat,.28,.018,.28,0,.23,0,head);part(G.cyl,M.hat,.12,.11,.12,0,.29,0,head);part(G.cyl,M.band,.125,.03,.125,0,.255,0,head);
  /* arms: short sleeve over a bare arm, a round elbow, and a hand with four fingers and a thumb */
  function arm(sd){var u=new T.Mesh(G.cyl,M.skin),sl=new T.Mesh(G.cyl,M.shirt),f=new T.Mesh(G.cyl,M.skin),el=new T.Mesh(G.ball,M.skin),hd=new T.Group();
    u.scale.x=u.scale.z=.045;sl.scale.x=sl.scale.z=.062;f.scale.x=f.scale.z=.038;el.scale.setScalar(.043);
    function hp(geo,sx,sy,sz,x,y,z,rx,rz){var o=new T.Mesh(geo,M.skin);o.scale.set(sx,sy,sz);o.position.set(x,y,z);o.rotation.set(rx||0,0,rz||0);o.castShadow=true;hd.add(o);}
    hp(G.ball,.036,.05,.017,0,.045,0);
    [-.024,-.008,.008,.024].forEach(function(x,i){var L=i===0||i===3?.036:.044;hp(G.cyl,.0085,L,.0085,x,.09+L/2-.012,.006,.45);});
    hp(G.cyl,.0095,.04,.0095,-sd*.034,.035,.008,.3,sd*.75);
    [u,sl,f,el].forEach(function(o){o.castShadow=true;w.add(o);});w.add(hd);return {u:u,sl:sl,f:f,el:el,h:hd,sd:sd};}
  w.userData={L:arm(-1),R:arm(1),body:body,head:head,torso:torso,legs:legs,dip:0,look:null};
  w.visible=false;scene.add(w);
  /* tools */
  var sq=new T.Group();box(.36,.03,.03,M.chan,0,0,.02,sq,true);box(.35,.012,.012,M.rubber,0,0,.004,sq,true);sq.visible=false;scene.add(sq);tools.sq=sq;
  var hd=new T.Mesh(G.cyl,M.pole);hd.scale.x=hd.scale.z=.014;hd.visible=false;scene.add(hd);tools.handle=hd;
  var tw=new T.Mesh(G.box,M.towel);tw.scale.set(.16,.05,.1);tw.visible=false;scene.add(tw);tools.towel=tw;
  var pole=new T.Mesh(G.cyl,M.pole);pole.scale.x=pole.scale.z=.022;pole.visible=false;scene.add(pole);tools.pole=pole;
  var br=new T.Group();box(.52,.05,.11,M.cart,0,.06,0,br,true);box(.5,.05,.09,M.rubber,0,.025,0,br,true);br.visible=false;scene.add(br);tools.brush=br;
  var wg=new T.BufferGeometry(),wp=new Float32Array(60*3);wg.setAttribute("position",new T.BufferAttribute(wp,3));var water=new T.Points(wg,M.water);water.visible=false;water.frustumCulled=false;scene.add(water);tools.water=water;
  var cart=new T.Group(),tk=new T.Mesh(G.cyl,M.tank);tk.scale.set(.28,.8,.28);tk.position.y=.55;tk.castShadow=true;cart.add(tk);box(.7,.08,.5,M.cart,0,.12,0,cart);
  [-1,1].forEach(function(s){var wh=new T.Mesh(G.cyl,M.rubber);wh.scale.set(.1,.05,.1);wh.rotation.z=Math.PI/2;wh.position.set(s*.37,.1,0);cart.add(wh);});
  cart.visible=false;scene.add(cart);tools.cart=cart;
  worker=w;
  if(C.CFG.tech)loadRig(C.CFG.tech);
}
var SHL={L:V(-.22,1.5,0),R:V(.22,1.5,0)},UA=.3,FA=.29,POLE={L:V(-1,-.9,-.5),R:V(1,-.9,-.5)},TH=.45,SH=.45;
/* two joint reach: from a root toward a target, with the middle joint pushed toward a hint direction */
function ik2(s,t,l1,l2,hint){var d=t.clone().sub(s),len=d.length(),mx=l1+l2-.002;if(len>mx){d.setLength(mx);len=mx;}if(len<.12){d.setLength(.12);len=.12;}
  var u=d.clone().normalize(),ca=(l1*l1+len*len-l2*l2)/(2*l1*len),sa=Math.sqrt(Math.max(0,1-ca*ca)),pv=hint.clone();pv.sub(u.clone().multiplyScalar(pv.dot(u))).normalize();
  return [s.clone().addScaledVector(u,l1*ca).addScaledVector(pv,l1*sa),s.clone().add(d)];}
function shoulder(side){var b=worker.userData.body;b.updateMatrix();return SHL[side].clone().applyMatrix4(b.matrix);}
function reach(side,targetW,noLook){
  if(worker.userData.rig)return rigReach(side,targetW);
  var w=worker,a=w.userData[side],s=shoulder(side),j=ik2(s,w.worldToLocal(targetW.clone()),UA,FA,POLE[side]),E=j[0],Hn=j[1];
  setBone(a.u,s,E);setBone(a.sl,s.clone().lerp(E,-.08),s.clone().lerp(E,.45));setBone(a.f,E,Hn);a.el.position.copy(E);
  /* the hand carries on from the forearm: palm down when reaching, palm in when hanging */
  var fd=Hn.clone().sub(E).normalize(),hx=Math.abs(fd.y)<.7?new T.Vector3().crossVectors(UP,fd).normalize():new T.Vector3(0,0,-a.sd*(fd.y<0?1:-1));
  hx.addScaledVector(fd,-hx.dot(fd)).normalize();var hz=new T.Vector3().crossVectors(hx,fd);a.h.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(hx,fd,hz));a.h.position.copy(Hn).addScaledVector(fd,-.035);
  var out=w.localToWorld(Hn.clone());if(!noLook&&(side==="R"||!w.userData.look)){w.userData.look=out;look();}return out;
}
function rest(side){var w=worker,b=w.userData.body.position;return reach(side,w.localToWorld(V((side==="L"?-.3:.3)+b.x,1.0+b.y,.08)),true);}
function lookAtW(p){worker.userData.look=p.clone();look();}
/* legs follow the body down: feet stay on the ground and the knees bend forward */
function legs(){var u=worker.userData,b=u.body;if(u.rig){rigLegs();return;}b.updateMatrix();
  [-1,1].forEach(function(sd){var L=u.legs[sd],hip=V(sd*.1,.9,0).applyMatrix4(b.matrix),ank=V(sd*.1,.1,.01),j=ik2(hip,ank,TH,SH,V(0,0,1));
    setBone(L.th,hip,j[0]);setBone(L.sh,j[0],ank);L.kn.position.copy(j[0]);});}
/* the head turns toward whatever the hands are working on, and he breathes */
function look(){var u=worker.userData;if(!u.look)return;var hd=u.head,lp=hd.parent.worldToLocal(u.look.clone()).sub(hd.position);
  hd.rotation.y=Math.max(-.8,Math.min(.8,Math.atan2(lp.x,lp.z)));hd.rotation.x=Math.max(-.35,Math.min(.5,-Math.atan2(lp.y,Math.hypot(lp.x,lp.z))*.8));}
function placeWorker(pos,faceDir){worker.position.copy(pos);worker.rotation.set(0,Math.atan2(faceDir.x,faceDir.z),0);
  var u=worker.userData,b=u.body,t=performance.now()/1000;u.look=null;u.dip=0;b.position.set(Math.sin(t*.7)*.008,0,0);b.rotation.set(0,0,Math.sin(t*.7)*.01);
  if(u.rig)rigIdle(t);
  u.torso.scale.x=1+Math.sin(t*1.7)*.012;u.torso.scale.z=.74*(1+Math.sin(t*1.7)*.018);u.head.rotation.set(0,0,0);
  worker.updateMatrixWorld(true);legs();}
/* ---------- a real rigged character (Mixamo skeleton), used when assets/quote/tech.glb is present ----------
   The same reach and crouch logic drives its arm and leg bones, so every scene works with either body. */
function loadRig(ver){
  function go(){new T.GLTFLoader().load("assets/quote/tech.glb?v="+ver,function(g){try{buildRig(g);}catch(e){if(window.console)console.warn("tech rig",e);}},undefined,function(){});}
  if(T.GLTFLoader)go();else{var sc=doc.createElement("script");sc.src="assets/vendor/gltf.min.js?v="+ver;sc.onload=go;doc.head.appendChild(sc);}
}
function buildRig(g){
  var u=worker.userData,root=g.scene,B={},want=["Hips","Spine","Spine1","Spine2","Neck","Head","LeftArm","LeftForeArm","LeftHand","RightArm","RightForeArm","RightHand","LeftUpLeg","LeftLeg","LeftFoot","RightUpLeg","RightLeg","RightFoot"];
  root.traverse(function(n){if(n.isBone){var k=n.name.replace(/^mixamorig\d*:?/,"");if(want.indexOf(k)>=0&&!B[k])B[k]=n;}if(n.isMesh){n.castShadow=true;n.frustumCulled=false;}});
  if(!B.LeftArm||!B.RightArm||!B.LeftUpLeg||!B.Head)return;
  root.updateMatrixWorld(true);
  var wp=function(b){return b.getWorldPosition(new T.Vector3());},hy=wp(B.Head).y-(wp(B.LeftFoot).y+wp(B.RightFoot).y)/2;
  root.scale.multiplyScalar(1.6/Math.max(.001,hy));root.updateMatrixWorld(true);
  var fy=(wp(B.LeftFoot).y+wp(B.RightFoot).y)/2;root.position.y-=fy-.08;
  var holder=new T.Group();holder.add(root);worker.add(holder);holder.updateMatrixWorld(true);
  var len=function(a,b){return wp(a).distanceTo(wp(b));};
  var rig={root:root,holder:holder,B:B,dip:0,L:{a:len(B.LeftArm,B.LeftForeArm),f:len(B.LeftForeArm,B.LeftHand)},R:{a:len(B.RightArm,B.RightForeArm),f:len(B.RightForeArm,B.RightHand)},
    legL:{a:len(B.LeftUpLeg,B.LeftLeg),f:len(B.LeftLeg,B.LeftFoot),foot:worker.worldToLocal(wp(B.LeftFoot))},legR:{a:len(B.RightUpLeg,B.RightLeg),f:len(B.RightLeg,B.RightFoot),foot:worker.worldToLocal(wp(B.RightFoot))},
    mixer:null,last:0,bind:{}};
  for(var bk in B)rig.bind[bk]=B[bk].quaternion.clone();
  var idle=g.animations.filter(function(a){return /idle|breath/i.test(a.name);})[0];
  if(idle){rig.mixer=new T.AnimationMixer(root);rig.mixer.clipAction(idle).play();}
  /* hide the simple body, keep the tools */
  worker.children.forEach(function(c){if(c!==holder)c.visible=false;});
  u.rig=rig;
}
function turnBone(bone,childW,wantW){var bp=bone.getWorldPosition(new T.Vector3()),cur=childW.clone().sub(bp).normalize(),des=wantW.clone().sub(bp).normalize();
  var q=new T.Quaternion().setFromUnitVectors(cur,des).multiply(bone.getWorldQuaternion(new T.Quaternion())),pq=bone.parent.getWorldQuaternion(new T.Quaternion()).invert();
  bone.quaternion.copy(pq.multiply(q));bone.updateMatrixWorld(true);}
function rigIdle(t){var r=worker.userData.rig;for(var bk in r.B)r.B[bk].quaternion.copy(r.bind[bk]);if(r.mixer){var dt=r.last?Math.min(.05,t-r.last):0;r.last=t;r.mixer.update(dt);}
  r.dip=0;r.holder.position.y=0;r.holder.rotation.x=0;worker.updateMatrixWorld(true);}
function rigReach(side,targetW){var r=worker.userData.rig,B=r.B,A=B[side==="L"?"LeftArm":"RightArm"],F=B[side==="L"?"LeftForeArm":"RightForeArm"],H=B[side==="L"?"LeftHand":"RightHand"],d=r[side];
  var S=A.getWorldPosition(new T.Vector3()),hint=POLE[side].clone().transformDirection(worker.matrixWorld),j=ik2(S,targetW,d.a,d.f,hint);
  turnBone(A,F.getWorldPosition(new T.Vector3()),j[0]);turnBone(F,H.getWorldPosition(new T.Vector3()),j[1]);return H.getWorldPosition(new T.Vector3());}
function rigLegs(){var r=worker.userData.rig,B=r.B;r.holder.position.y=-.3*r.dip;r.holder.rotation.x=0;worker.updateMatrixWorld(true);
  if(r.dip>0){var sp=B.Spine;sp.rotation.x+=.25*r.dip;sp.updateMatrixWorld(true);}
  [["Left","legL"],["Right","legR"]].forEach(function(p){var U=B[p[0]+"UpLeg"],K=B[p[0]+"Leg"],Fo=B[p[0]+"Foot"],d=r[p[1]],tgt=worker.localToWorld(d.foot.clone()),hint=V(0,0,1).transformDirection(worker.matrixWorld);
    var j=ik2(U.getWorldPosition(new T.Vector3()),tgt,d.a,d.f,hint);turnBone(U,K.getWorldPosition(new T.Vector3()),j[0]);turnBone(K,Fo.getWorldPosition(new T.Vector3()),j[1]);});}
function QZ(a){return new T.Quaternion().setFromAxisAngle(V(0,0,1),a);}
function crouch(k){var b=worker.userData.body,e=smooth(k);if(worker.userData.rig){worker.userData.rig.dip=e;}b.position.y=-.3*e;b.rotation.x=.16*e;worker.updateMatrixWorld(true);legs();}
var hoseKey="";
function hose(a,b,c){var k=[a.x,a.z,b.x,c.x].map(function(v){return v.toFixed(2);}).join();if(k!==hoseKey){hoseKey=k;if(tools.hose){scene.remove(tools.hose);tools.hose.geometry.dispose();}
  var mid=b.clone().add(V(0,.1,.4)),down=V((b.x+c.x)/2,.05,(b.z+c.z)/2+.3),curve=new T.CatmullRomCurve3([a,b,mid,down,c]);tools.hose=new T.Mesh(new T.TubeGeometry(curve,48,.018,6,false),M.hose);tools.hose.castShadow=true;scene.add(tools.hose);}tools.hose.visible=true;}
function hideTools(){for(var k in tools)tools[k].visible=false;}

/* ---------- inside a room, looking at the window and its track ---------- */
var room=null;
function buildRoom(){
  var g=new T.Group(),Z=-320;g.position.set(0,0,Z);scene.add(g);
  var fl=new T.Mesh(G.plane,M.ifloor);fl.rotation.x=-Math.PI/2;fl.scale.set(9,8,1);fl.position.set(0,.004,3.8);fl.receiveShadow=true;g.add(fl);M.ifloor.map.repeat.set(3,3);
  var ow=.75,y0=.95,y1=2.15,th=.2;
  box(4-ow,2.8,th,M.iwall,-(ow+(4-ow)/2),1.4,0,g,true);box(4-ow,2.8,th,M.iwall,ow+(4-ow)/2,1.4,0,g,true);
  box(2*ow,2.8-y1,th,M.iwall,0,(y1+2.8)/2,0,g,true);box(2*ow,y0,th,M.iwall,0,y0/2,0,g,true);
  box(.2,2.8,8,M.iwall,-4,1.4,4,g,true);box(.2,2.8,8,M.iwall,4,1.4,4,g,true);box(8,.1,8,M.iwall,0,2.85,4,g,true);
  box(8,.12,.03,M.vinyl,0,.06,.115,g,true);
  /* window: white vinyl frame, sliding pane in front, fixed pane behind */
  var fw=2*ow,fh=y1-y0;
  box(fw,.06,.2,M.vinyl,0,y1-.03,0,g,true);box(.06,fh,.2,M.vinyl,-ow+.03,(y0+y1)/2,0,g,true);box(.06,fh,.2,M.vinyl,ow-.03,(y0+y1)/2,0,g,true);
  box(.05,fh-.1,.05,M.vinyl,0,(y0+y1)/2+.02,.03,g,true);
  var gl=new T.Mesh(G.plane,M.iglass);gl.scale.set(fw-.12,fh-.12,1);gl.position.set(0,(y0+y1)/2+.02,.02);g.add(gl);
  var hc=hazeCanvas(256,212,9),ht=tx(hc,false),hm=new T.Mesh(G.plane,new T.MeshBasicMaterial({map:ht,transparent:true,depthWrite:false,opacity:.85}));
  hm.scale.set(fw-.12,fh-.12,1);hm.position.set(0,(y0+y1)/2+.02,.035);g.add(hm);
  /* the track, where the muddy puddle sits */
  box(fw,.02,.2,M.alum,0,y0+.005,0,g,true);box(fw,.035,.012,M.alum,0,y0+.03,-.05,g,true);box(fw,.035,.012,M.alum,0,y0+.03,.05,g,true);
  var pc=puddleCanvas(),pt=tx(pc,false),pm=new T.Mesh(G.plane,new T.MeshBasicMaterial({map:pt,transparent:true,depthWrite:false}));
  pm.rotation.x=-Math.PI/2;pm.scale.set(fw-.1,.1,1);pm.position.set(0,y0+.018,0);g.add(pm);
  box(fw+.3,.04,.2,M.vinyl,0,y0-.03,.16,g,true);
  /* a plant and a little light, so it reads as a room */
  var pot=new T.Mesh(G.cyl,M.cart);pot.scale.set(.18,.32,.18);pot.position.set(2.2,.16,.7);g.add(pot);
  for(var i=0;i<7;i++){var lf=new T.Mesh(G.ball,M.shrub);lf.scale.set(.14,.3,.08);lf.position.set(2.2+Math.cos(i)*.1,.55+i*.03,.7+Math.sin(i)*.1);lf.rotation.z=(i-3)*.25;g.add(lf);}
  var pl=new T.PointLight(0xfff1dc,.6,12);pl.position.set(.5,2.5,3);g.add(pl);
  box(8,1.7,.2,M.cmu,0,.85,-5,g);
  g.visible=false;g.updateMatrixWorld(true);
  room={g:g,Z:Z,center:toWorld(g,0,(y0+y1)/2,0),haze:{c:hc,t:ht,m:hm,last:null},puddle:{c:pc,t:pt,m:pm},y0:y0,ow:ow,fw:fw,fh:fh};
}

/* ---------- modes and timelines ---------- */
var mode="show",pageMode=C.mode||"home",tl=0,auto=true,heroOn=false,heroVis=true,overlay=false;
var story={win:[],sol:[],scr:[]};
function setMode(m,keepT){
  if(!me)buildMe();
  mode=m;if(!keepT)tl=0;auto=true;say("");
  if(m==="pig"){buildNeighbors();h3.stage=0;birdTargets(true);}else{if(nbs.length){clearNeighbors();nbKey="";}birds.forEach(function(b){world.remove(b.m);});birds=[];fitShadow(false);}
  if((m==="win"||m==="sol"||m==="scr")&&!worker)makeWorker();
  if(m==="win"&&h3.view===1&&!room)buildRoom();
  if(m==="win"){resetHaze();if(room)resetRoom();}
  if(m==="sol")me.panels.forEach(function(p){p.dust.material.opacity=1;});
  ov.setAttribute("data-mode",m);
  $$(".ov-tabs [data-hmode]").forEach(function(b){b.setAttribute("aria-selected",String(b.getAttribute("data-hmode")===m));});
  $$(".ov-panel .ops").forEach(function(p){p.hidden=p.getAttribute("data-for")!==m;});
  $("ovT").textContent={show:"Your home in 3D",home:"Your home in 3D",win:"Window cleaning in 3D",sol:"Solar cleaning in 3D",scr:"Screen repair in 3D",pig:"Pigeon proofing in 3D"}[m];
  if(!keepT)user=false;goal=preset();if(!keepT){cur=null;}
  syncControls();summary();
}
function resetRoom(){room.haze.done=undefined;room.haze.clear=false;var pg=room.puddle.c.getContext("2d"),np=puddleCanvas();pg.clearRect(0,0,256,32);pg.drawImage(np,0,0);room.puddle.t.needsUpdate=true;var g=room.haze.c.getContext("2d"),n=hazeCanvas(256,212,9);g.globalCompositeOperation="copy";g.drawImage(n,0,0);g.globalCompositeOperation="source-over";room.haze.t.needsUpdate=true;room.haze.last=null;room.puddle.m.material.opacity=1;}
function replay(){tl=0;user=false;if(mode==="win"){resetHaze();if(room)resetRoom();}if(mode==="sol")me.panels.forEach(function(p){p.dust.material.opacity=1;});if(mode==="pig"){h3.stage=0;auto=true;birdTargets(false);}track("replay_3d",{mode:mode});}

/* each frame, put everything where the timeline says it should be */
function frame(dt){
  var pristine=mode==="show"||mode==="home";
  /* pigeon mesh, clips, spinners, coverage */
  var meshOn=mode==="pig"?h3.stage>=1:true,spinOn=mode==="pig"?h3.stage>=2:true;
  me.ms=me.ms===undefined?1:me.ms;var msT=meshOn?1:0;me.ms+=(msT-me.ms)*Math.min(1,dt*2.4);if(Math.abs(me.ms-msT)<.003)me.ms=msT;
  me.skirt.forEach(function(s){s.visible=me.ms>.02;s.scale.y=H*Math.min(1,me.ms*1.4);s.position.y=s.userData.y0+s.scale.y/2;});
  if(me.clipIM)me.clipIM.visible=me.ms>.75;
  spinners.forEach(function(s,i){s.s+=((spinOn?1:0)-s.s)*Math.min(1,dt*3);s.g.visible=s.s>.02;s.g.scale.setScalar(Math.max(.001,s.s));s.rot.rotation.y+=dt*(3.2+i*.3);});
  [1,-1].forEach(function(k){if(cover[k]&&cover[k].m)cover[k].m.visible=mode==="pig"&&h3.stage===2&&h3.cov;});
  /* birds fly between your roof and the roofs next door */
  birds.forEach(function(b){b.m.visible=mode==="pig";if(mode!=="pig")return;
    if(b.k!==b.kt){b.k+=(b.kt>b.k?1:-1)*dt*.55;b.k=clamp01(b.k);if(Math.abs(b.k-b.kt)<.01)b.k=b.kt;}
    var flying=b.dest&&b.k>0&&b.k<1;
    if(b.dest){b.m.position.copy(b.base).lerp(b.dest,smooth(b.k));b.m.position.y+=Math.sin(b.k*Math.PI)*4.5;
      if(flying)b.m.rotation.y=Math.atan2((b.dest.x-b.base.x)*(b.kt?1:-1),(b.dest.z-b.base.z)*(b.kt?1:-1));else b.m.rotation.y=b.ry;}
    var fl=flying?Math.sin(tl*22+b.ph)*.9:0;b.m.userData.w[0].rotation.z=fl;b.m.userData.w[1].rotation.z=-fl;
    if(!flying){b.m.children[2].position.y=.26+Math.max(0,Math.sin(tl*1.3+b.ph))*.0+(.01*Math.sin(tl*3+b.ph));}
  });
  /* haze, screens, dust off unless their demo is running */
  haze.m.visible=mode==="win"&&h3.view===0&&tl<9.3;
  screens.forEach(function(s){s.g.visible=false;});
  if(mode!=="sol")me.panels.forEach(function(p){p.dust.visible=false;});
  if(demoWin)demoWin.sillM.color.copy(me.mats.trim.color);
  if(room)room.g.visible=mode==="win"&&h3.view===1;
  if(worker){worker.visible=false;hideTools();}
  if(mode==="win"){if(h3.view===0)winOutside();else winInside();}
  else if(mode==="sol")solar();
  else if(mode==="scr")screensDemo();
  else if(mode==="pig")pigAuto();
  if(pristine&&mode==="show"){}
}
function msgAt(list){var s="";for(var i=0;i<list.length;i++)if(tl>=list[i][0])s=list[i][1];return s;}
var lastMsg="";
function say(html,cls){var m=$("ovMsg"),mt=$("ovMsgT")||m;if(!overlay){m.hidden=true;return;}if(!html){m.hidden=true;lastMsg="";return;}if(html!==lastMsg){mt.innerHTML=html;lastMsg=html;}m.className="ov-msg"+(cls?" "+cls:"");m.hidden=false;}
/* notes wait for the reader: each one holds until Next, and Back steps back */
function steps(){
  if(mode==="win")return h3.view===1?[0,1.2,5.0,8.4]:[0,1.4,6.4,7.8,9.3];
  if(mode==="sol"){var n=me.panels.filter(function(p){return p.face>0;}).length,per=Math.min(.55,11/Math.max(1,n));return [0,1.4,1.4+n*per+.6];}
  if(mode==="scr")return [0,1,3.6];
  if(mode==="pig")return [0,2.2,5.6];
  return null;
}
function stepAt(S){var i=0;for(var k=0;k<S.length;k++)if(tl>=S[k]-1e-4)i=k;return i;}
function advance(dt){var S=overlay&&steps();if(!S){tl+=dt;return;}var i=stepAt(S),hold=i+1<S.length?S[i+1]-.001:Infinity;if(tl<hold)tl=Math.min(hold,tl+dt);}
function rewind(t){tl=t;if(mode==="win"){resetHaze();if(room)resetRoom();}if(mode==="pig")auto=true;}
function stepNav(){var nav=$("ovNav");if(!nav)return;var S=overlay&&steps();nav.hidden=!S;if(!S)return;var i=stepAt(S),last=i===S.length-1,holding=!last&&tl>=S[i+1]-.0015;
  var c=(i+1)+" of "+S.length;if($("ovStep").textContent!==c)$("ovStep").textContent=c;
  var nx=nav.querySelector(".nx"),lbl=last?"Watch again":"Next ›";if(nx.textContent!==lbl)nx.textContent=lbl;nx.classList.toggle("ready",holding);
  nav.querySelector("[data-hact='prev']").disabled=i===0;}

function winOutside(){
  var w=demoWin,sc=screens[0],t=tl;worker.visible=true;
  var n=V(Math.sin(w.ang),0,Math.cos(w.ang)),side=V(Math.cos(w.ang),0,-Math.sin(w.ang)),wc=toWorld(w.g,0,0,0);
  placeWorker(V(wc.x,0,wc.z).addScaledVector(n,.55).addScaledVector(side,-.12),n.clone().negate());
  /* screen comes off, then goes back in */
  var off=smooth((t-.4)/.9)*(1-smooth((t-7.9)/.9));
  sc.g.visible=true;screenLook(sc,false);
  sc.g.position.set(sc.x0+(-(w.gw/2+.6)-sc.x0)*off,-.2*off,.14+.3*off);sc.g.rotation.set(-.12*off,.5*off,0);
  if(t<1.4||t>7.8){var sp=toWorld(sc.g,-sc.gw/2+.05,0,0),sp2=toWorld(sc.g,sc.gw/2-.05,0,0);
    if(off>.01&&off<.99){reach("L",sp);reach("R",sp2);}else{rest("L");rest("R");}}
  /* four squeegee passes, top to bottom, then the sill */
  var u,v,idx;
  if(t>=1.5&&t<6.4){var pt=sweep(haze,t,1.5,4.8,4,.34,.23,256*.36/w.gw);u=pt[0];v=pt[1];idx=pt[2];
    var P2=toWorld(w.g,u*w.gw,v*w.gh,.1);tools.sq.visible=true;tools.sq.position.copy(P2);tools.sq.quaternion.copy(w.g.getWorldQuaternion(new T.Quaternion())).multiply(QZ(idx%2?1.3:1.84));
    var hand=reach("R",P2.clone().addScaledVector(n,.2));tools.handle.visible=true;setBone(tools.handle,P2.clone().addScaledVector(n,.03),hand);tools.handle.scale.x=tools.handle.scale.z=.014;rest("L");
  }else if(t>=6.4&&t<7.8){var q=clamp01((t-6.5)/1.1),sx=(-.5+q)*w.gw,SP=toWorld(w.g,sx,-w.gh/2-.1,.14);crouch(Math.min(clamp01((t-6.4)/.3),clamp01((7.8-t)/.3)));
    tools.towel.visible=true;var hh=reach("L",SP);tools.towel.position.copy(hh);rest("R");
    w.sillM.color.copy(sillDust).lerp(me.mats.trim.color,q);
  }
  if(t<6.4)w.sillM.color.copy(sillDust);
  if(t>=6.4&&!haze.clear){haze.c.getContext("2d").clearRect(0,0,256,212);haze.t.needsUpdate=true;haze.clear=true;}
  var one=st.stories===1;
  say(msgAt([[0,"<b>1.</b> Screens come off first and get scrubbed."],[1.4,"<b>2.</b> Purified water, then a squeegee, top to bottom. Nothing left on the glass to spot."],
    [6.4,"<b>3.</b> Sills and tracks wiped out. Included, not an add on."],[7.8,"<b>4.</b> Screen back in. Glass that dries clear."],
    [9.3,"<b>Done.</b> "+(one?"$149 single story":"$249 two story")+", screens, tracks and sills included. Tap <b>Inside</b> to see the part most crews skip."]]),t>9.3?"ok":"");
}
function winInside(){
  var t=tl,rm=room;worker.visible=true;
  placeWorker(V(-.45,0,rm.Z+.62),V(0,0,-1));
  if(t>=1.2&&t<4.8){var pt=sweep(rm.haze,t,1.2,3.6,3,.3,.3,256*.36/(rm.fw-.12)),u=pt[0],v=pt[1],idx=pt[2];
    var P2=toWorld(rm.g,u*(rm.fw-.12),(rm.y0+rm.fh/2+.02)+v*(rm.fh-.12),.045);tools.sq.visible=true;tools.sq.position.copy(P2);tools.sq.quaternion.copy(QZ(idx%2?1.3:1.84));
    var hand=reach("R",P2.clone().add(V(0,0,.2)));tools.handle.visible=true;setBone(tools.handle,P2.clone().add(V(0,0,.03)),hand);tools.handle.scale.x=tools.handle.scale.z=.014;rest("L");}
  else if(t<5.4){rest("L");rest("R");}
  else if(t>=5.4&&t<8.4){var q=clamp01((t-5.5)/2.7),x=(-.5+q)*(rm.fw-.2),TP=toWorld(rm.g,x,rm.y0+.03,.02);crouch(Math.min(clamp01((t-5.4)/.3),clamp01((8.4-t)/.3)));
    var hh=reach("R",TP.clone().add(V(0,.22,.18)));tools.handle.visible=true;setBone(tools.handle,TP.clone().add(V(0,.02,0)),hh);tools.handle.scale.x=tools.handle.scale.z=.018;tools.towel.visible=true;tools.towel.position.copy(TP).add(V(0,.02,0));rest("L");
    var pg=rm.puddle.c.getContext("2d");pg.clearRect(0,0,(q*256)|0,32);rm.puddle.t.needsUpdate=true;}
  else{rest("L");rest("R");}
  if(t>=4.8&&!rm.haze.clear){rm.haze.c.getContext("2d").clearRect(0,0,256,212);rm.haze.t.needsUpdate=true;rm.haze.clear=true;}
  if(t>=8.4){var pg2=rm.puddle.c.getContext("2d");pg2.clearRect(0,0,256,32);rm.puddle.t.needsUpdate=true;}
  say(msgAt([[0,"<b>Inside.</b> Every window in the house for $49."],[1.2,"Same purified water and squeegee on the inside glass."],
    [5.0,"<b>The track.</b> After most crews clean the outside, the water runs down into the track and sits there as a muddy puddle. You open the window and the gunk is still there."],
    [8.4,"<b>We vacuum and wipe every track dry.</b> Open your windows and they slide clean. "+(st.inside?"Inside windows are on your quote.":"Add inside windows for $49 below.")]]),t>=8.4?"ok":"");
}
function solar(){
  var t=tl,list=me.panels.filter(function(p){return p.face>0;}),back=me.panels.filter(function(p){return p.face<0;});
  list.sort(function(a,b){return a.row-b.row||(a.row%2?b.x-a.x:a.x-b.x);});
  var n=list.length,per=Math.min(.55,11/Math.max(1,n)),start=1.4,end=start+n*per;
  me.panels.forEach(function(p){p.dust.visible=true;});
  list.forEach(function(p,i){var th=start+i*per+per*.5;p.dust.material.opacity=1-smooth((t-th)/.45);});
  back.forEach(function(p){p.dust.material.opacity=1-smooth((t-end)/.8);});
  var gp=me.groups.filter(function(g){return g.face>0;})[0];
  if(gp){worker.visible=true;
    var feet=toWorld(me.F,gp.cx,me.TT-.02,Math.min(me.L/2-.35,gp.bottom+.7));placeWorker(feet,V(0,0,-1));
    tools.cart.visible=true;tools.cart.position.set(gp.cx+2.2,0,me.front+2.2);hose(worker.localToWorld(V(.1,.95,-.05)),toWorld(me.F,gp.cx+.6,me.TT,me.L/2+OV*.6),tools.cart.position.clone().add(V(0,.9,0)));
    var i2=Math.min(n-1,Math.max(0,Math.floor((t-start)/per))),pp=list[i2],fr=clamp01((t-start)/per-i2),dir=pp.row%2?-1:1;
    var bx=t<start?list[0].x:(t>end?pp.x:pp.x+dir*(-.38+.76*fr)),bz=t<start?list[0].z:pp.z;
    var B=toWorld(me.F,bx,me.TT+H+.08,bz),chest=worker.localToWorld(V(0,1.25,.32)),d=B.clone().sub(chest).normalize();
    tools.pole.visible=true;setBone(tools.pole,chest.clone().addScaledVector(d,-.55),B);tools.pole.scale.x=tools.pole.scale.z=.022;
    reach("L",chest.clone().addScaledVector(d,-.1));reach("R",chest.clone().addScaledVector(d,.45));
    lookAtW(B);tools.brush.visible=true;tools.brush.position.copy(B);tools.brush.quaternion.copy(me.F.getWorldQuaternion(new T.Quaternion()));
    var wa=tools.water.geometry.attributes.position.array,on=t>=start&&t<end;tools.water.visible=on;
    if(on){for(var k=0;k<60;k++){var ph=(tl*3+k*.37)%1;wa[k*3]=B.x+Math.sin(k*12.9)*.28;wa[k*3+1]=B.y+.05+ph*.25-ph*ph*.35;wa[k*3+2]=B.z+Math.cos(k*7.1)*.14+ph*.1;}tools.water.geometry.attributes.position.needsUpdate=true;}
  }
  var price=st.pig?"free with your pigeon proofing":money(st.panels*P.panel);
  var secTxt=st.arrays>1?" In "+st.arrays+" sections: "+st.arr.slice(0,st.arrays).join(", ")+" panels.":"";
  say(msgAt([[0,"<b>Your "+st.panels+" panels</b> under a layer of desert dust."+secTxt+" Up here there's almost no rain to rinse it off."],
    [start,"<b>Purified water through a soft brush</b> on a water fed pole, row by row. Nobody walks on your panels."],
    [end+.6,"<b>Dries spot free, no streaks.</b> Your "+st.panels+" panels: "+price+". Full array inspection included."]]),t>end+.6?"ok":"");
}
function screensDemo(){
  var t=tl,w=scrWin,n=V(Math.sin(w.ang),0,Math.cos(w.ang)),side=V(Math.cos(w.ang),0,-Math.sin(w.ang)),wc=toWorld(w.g,0,0,0);
  var sc=screens.filter(function(s){return s.w===w;})[0]||screens[0],others=screens.filter(function(s){return s!==sc;}).slice(0,Math.max(0,st.screens-1));
  screens.forEach(function(s){s.g.visible=false;});
  /* the tech stands just past the window's edge, so the glass stays in view the whole time */
  var wx=w.gw/2+.35;
  worker.visible=true;placeWorker(V(wc.x,0,wc.z).addScaledVector(n,.5).addScaledVector(side,wx),n.clone().negate());
  var swapped=t>=3.6;
  others.forEach(function(s){s.g.visible=true;screenLook(s,!swapped);s.g.position.set(s.x0,0,.14);s.g.rotation.set(0,0,0);});
  sc.g.visible=true;
  /* old screen comes out toward the window's edge in front of him, turned to face you; the new one goes back the same way */
  var out=smooth((t-1.0)/1.1),inn=smooth((t-2.5)/1.1),k=t<2.3?out:1-inn,dx=w.gw/2-sc.x0;
  screenLook(sc,t<2.3);sc.g.position.set(sc.x0+dx*k,-.2*k,.14+.3*k);sc.g.rotation.set(0,-.35*k,0);
  if(t>=.9&&t<3.8){reach("L",toWorld(sc.g,-sc.gw/2+.28,-.12,.02));reach("R",toWorld(sc.g,sc.gw/2-.04,.08,.02));}else{rest("L");rest("R");}
  var fact=st.pet?"<b>All weather, $64.99.</b> Heavy vinyl coated polyester, 5x stronger and far more UV stable. Takes sun, wind and pets.":"<b>Charcoal fiberglass, $53.99.</b> Clearest view and good airflow. Fine for shaded windows.";
  if(st.frames)fact+=" New frames and clips on all "+st.screens+", $10 more a screen.";
  say(msgAt([[0,"<b>Old builder mesh</b> after a few High Desert summers: faded, brittle, torn."],[1,"<b>Stripped and re-meshed on site.</b> About 15 to 20 minutes a screen, same visit."],[3.6,fact]]),t>=3.6?"ok":"");
}
function pigAuto(){
  if(auto){var s=tl<2.2?0:tl<5.6?1:2;if(s!==h3.stage){h3.stage=s;birdTargets(false);syncControls();}}
  var mine={1:0,"-1":0,0:0},nbN=0,U=0;
  birds.forEach(function(b){if(b.kind==="N"){nbN++;return;}if(!b.kt){if(b.kind==="U")U++;else mine[b.face]++;}else nbN++;});
  var left=mine[1]+mine[-1]+mine[0]+U,sb=0,sf=0,sc=spinners.length;spinners.forEach(function(s){if(s.face>0)sf++;else sb++;});
  var all=birds.filter(function(b){return b.kind!=="N";}).length;
  if(h3.stage===0)say("<b>Today:</b> every roof on the block has pigeons. "+all+" on yours, nesting under the panels and resting on the ridge.");
  else if(h3.stage===1)say("<b>Cleanout and mesh.</b> Nests out, panels cleaned, mesh clipped to the frame. Nothing gets under your panels again, but "+left+" pigeons still land on your open roof. That's the job of the free spinners.","warn");
  else if(!left)say("<b>Your roof is clear.</b> The free spinners keep them from coming back after the cleanout, so they settle on the roofs next door. "+nbN+" pigeons next door now. The first house on the block to protect wins.","ok");
  else if(!sc)say("<b>Mesh only.</b> "+left+" pigeons still sit on your open roof. Add spinners.","warn");
  else if(!sb&&mine[-1])say("<b>"+sc+(sc>1?" spinners only watch":" spinner only watches")+" the front.</b> The ridge blocks the flash, so "+mine[-1]+" pigeons stay on your back side. Add one facing the back.","warn");
  else say("<b>"+left+" pigeon"+(left>1?"s":"")+" still outside the flash</b> at the corners. Add another spinner.","warn");
}

/* ---------- summary under the controls ---------- */
function summary(){
  var el=$("osum"),s=st.stories,t=C.totals();if(!el)return;
  var txt={home:"<b>"+["New build","Ranch","Classic","Lake estate"][h3.style]+" · "+s+" story · "+st.panels+" panels</b><br>Tap Windows, Solar, Screens or Pigeons above to watch the job on this home.",
    win:"<b>"+(s===1?"Single":"Two")+" story windows · "+money(P.win[s]+(st.more?P.more[s]:0)+(st.inside?P.inside:0))+"</b><br>Screens, tracks and sills included."+(st.inside?" Inside windows included.":" Inside every window +$49."),
    sol:"<b>"+st.panels+" panels · "+(st.pig?"free with pigeon proofing":money(st.panels*P.panel))+"</b><br>$7 a panel, purified water, dries spot free.",
    scr:"<b>"+st.screens+" "+P.meshName[st.pet]+" screen"+(st.screens>1?"s":"")+(st.frames?" · new frames":"")+" · "+money(Math.max(st.screens*(P.mesh[st.pet]+(st.frames?P.frame:0)),P.scrMin))+"</b><br>Screens cover the half of the window that opens. New frames and clips are $10 more a screen. $149 job minimum when screens are the only service.",
    pig:"<b>"+st.panels+" panels · "+spinCount()+" spinner"+(spinCount()===1?"":"s")+" · "+money(P.pig+Math.max(0,st.panels-P.pigUpTo)*P.pigPer+st.spin*P.spinner)+"</b><br>"+C.free()+" spinners come free. Extras are $50 each. Solar wash and roof wash free."};
  el.innerHTML=(txt[mode]||txt.home)+"<br><span class=\"small\">Your quote right now: "+(t.from?"from ":"")+money(t.total)+"</span>";
}

/* ---------- camera ---------- */
var cur=null,goal=null,user=false;
/* how far back the camera sits so a box of half width hw and half height hh fits the screen, any shape */
function fitWH(hw,hh){var vf=cam.fov*Math.PI/360,hf=Math.atan(Math.tan(vf)*cam.aspect);return Math.max(hw/Math.tan(hf),hh/Math.tan(vf));}
function preset(){
  if(!me)return {tx:0,ty:2,tz:0,yaw:.55,tilt:.32,dist:24};
  var tall=me.wallH+me.rise,rad=.5*Math.sqrt(me.W*me.W+me.D*me.D),cy=tall*.45,p;
  if(mode==="pig")p={tx:0,ty:cy,tz:0,yaw:.5,tilt:.44,dist:fitWH(rad*2.1,tall*1.3)};
  else if(mode==="win"&&h3.view===1&&room)p=tl>=5.0&&tl<9.4&&!user?{tx:room.center.x+.1,ty:room.y0,tz:room.Z+.02,yaw:.25,tilt:.9,dist:fitWH(.75,.45)} /* look down into the track */
    :{tx:room.center.x,ty:room.center.y-.1,tz:room.center.z,yaw:.42,tilt:.1,dist:fitWH(1.25,.95)};
  else if(mode==="win"){var c=toWorld(demoWin.g,0,0,0);p={tx:c.x,ty:c.y-.15,tz:c.z,yaw:demoWin.ang+.5,tilt:.1,dist:fitWH(1.55,1.15)};}
  else if(mode==="scr"){var c2=toWorld(scrWin.g,.3,0,0);p={tx:c2.x,ty:c2.y-.2,tz:c2.z,yaw:scrWin.ang-.45,tilt:.08,dist:fitWH(1.45,1.2)};}
  else if(mode==="sol"){var gp=me.groups.filter(function(g){return g.face>0;})[0]||me.groups[0],c3=toWorld(me.F,gp.center[0],me.TT,gp.center[1]);
    p={tx:c3.x,ty:c3.y,tz:c3.z,yaw:.3,tilt:.7,dist:fitWH(gp.cols*PW/2+1.4,gp.rows*PD/2+1.6)};}
  else p={tx:0,ty:cy*.8,tz:me.D*.08,yaw:.55,tilt:.3,dist:fitWH(rad*1.02,tall*.95)*(mode==="show"?1.04:1)};
  return p;
}
function camStep(dt,t){
  if(!goal)goal=preset();
  if(mode==="show"&&!reduce)goal.yaw=.5+Math.sin(t*.11)*.55;
  if(mode==="win"&&h3.view===1&&!user)goal=preset();
  if(!cur){cur={};for(var k in goal)cur[k]=goal[k];}
  var a=1-Math.exp(-dt*3.2);for(var k2 in goal)cur[k2]+=(goal[k2]-cur[k2])*a;
  placeCam(cur);
}
function placeCam(c){cam.position.set(c.tx+Math.sin(c.yaw)*Math.cos(c.tilt)*c.dist,c.ty+Math.sin(c.tilt)*c.dist,c.tz+Math.cos(c.yaw)*Math.cos(c.tilt)*c.dist);cam.lookAt(c.tx,c.ty,c.tz);}
function limits(){var p=preset();goal.dist=Math.max(p.dist*.35,Math.min(p.dist*2.4,goal.dist));goal.tilt=Math.max(.02,Math.min(1.35,goal.tilt));
  if(mode==="win"&&h3.view===1){goal.yaw=Math.max(p.yaw-.9,Math.min(p.yaw+.9,goal.yaw));goal.dist=Math.min(goal.dist,3.4);goal.tilt=Math.min(goal.tilt,.6);}}
var ptrs={},pinch=0,el=R.domElement;
el.addEventListener("pointerdown",function(e){if(!overlay)return;ptrs[e.pointerId]=[e.clientX,e.clientY];user=true;try{el.setPointerCapture(e.pointerId);}catch(x){}});
el.addEventListener("pointermove",function(e){var p=ptrs[e.pointerId];if(!p||!goal)return;var ids=Object.keys(ptrs);
  if(ids.length===1){goal.yaw-=(e.clientX-p[0])*.008;goal.tilt+=(e.clientY-p[1])*.005;}
  ptrs[e.pointerId]=[e.clientX,e.clientY];
  if(ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)goal.dist*=pinch/d;pinch=d;}limits();});
function up(e){delete ptrs[e.pointerId];pinch=0;}
el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
el.addEventListener("wheel",function(e){if(!overlay||!goal)return;e.preventDefault();user=true;goal.dist*=1+Math.max(-.3,Math.min(.3,e.deltaY*.001));limits();},{passive:false});
el.addEventListener("webglcontextlost",function(e){e.preventDefault();var l=$("ovLoad");l.hidden=false;l.textContent="The 3D preview paused. Close it and open it again.";heroLay.classList.remove("live");});

/* ---------- callouts that point at the details ---------- */
var CALL={glass:"Purified water, dries spot free",panel:"Panels washed streak free, $7 each",mesh:"Mesh clipped to the frame, never bolted",spin:"Spinners on the vents, held with hose clamps",tile:"Roof soft wash, free with pigeon proofing"};
var ORDERS={pig:["mesh","spin","panel","glass"],win:["glass","panel","mesh","spin"],sol:["panel","mesh","glass","spin"],scr:["glass","mesh","panel","spin"],home:["glass","panel","mesh","spin"]};
var anc={};
function anchors(){
  anc={};if(!me)return;
  if(demoWin){anc.glass={p:toWorld(demoWin.g,0,.1,.12),n:V(Math.sin(demoWin.ang),0,Math.cos(demoWin.ang))};}
  var gp=me.groups.filter(function(g){return g.face>0;})[0];
  if(gp){var nF=me.F.localToWorld(V(0,1,0)).sub(me.F.localToWorld(V(0,0,0))).normalize();
    anc.panel={p:toWorld(me.F,gp.center[0]+.4,me.TT+H+.05,gp.center[1]-.2),n:nF};
    anc.mesh={p:toWorld(me.F,gp.center[0],me.TT+H/2,gp.bottom+.02),n:V(0,.5,1).normalize()};}
  if(spinners[0])anc.spin={p:toWorld(spinners[0].par,spinners[0].x+.085,me.TT+.86,spinners[0].z),n:V(0,1,.2).normalize()};
}
var callI=0,callT=0,callEl=null,callKey="";
function callouts(dt,host){
  var elC=overlay?$("ocall"):$("hcall");var other=overlay?$("hcall"):$("ocall");if(other)other.hidden=true;
  if(!elC)return;if(!(mode==="show"||mode==="home")){elC.hidden=true;return;}
  var ord=ORDERS[pageMode]||ORDERS.home,keys=ord.filter(function(k){return anc[k];});if(!keys.length){elC.hidden=true;return;}
  callT+=dt;if(callT>3.4){callT=0;callI=(callI+1)%keys.length;}
  var k=keys[callI%keys.length],a=anc[k],v=a.p.clone().project(cam),w=host.clientWidth,h=host.clientHeight;
  var facing=cam.position.clone().sub(a.p).dot(a.n)>0,vis=facing&&v.z<1&&v.x>-.85&&v.x<.85&&v.y>-.75&&v.y<.8;
  var fadeIn=callT>.25&&callT<3.1;
  if(k!==callKey){elC.querySelector("span").textContent=CALL[k];callKey=k;}
  elC.hidden=false;elC.classList.toggle("fade",!(vis&&fadeIn));
  var x=(v.x+1)/2*w,y=(1-v.y)/2*h,flip=x>w*.55;elC.classList.toggle("flip",flip);
  elC.style.transform="translate("+(flip?x-elC.offsetWidth+7:x-7)+"px,"+(y-elC.offsetHeight/2)+"px)";
}

/* ---------- section labels over each group of panels ---------- */
var secEl=[0,1,2].map(function(i){var d=doc.createElement("div");d.className="seclbl";d.hidden=true;stageEl.appendChild(d);return d;});
function secLabels(){
  var on=overlay&&st.arrays>1&&(mode==="home"||mode==="sol"||mode==="pig")&&me;
  secEl.forEach(function(d,i){var gp=on&&me.groups.filter(function(g){return g.idx===i;})[0];if(!gp){d.hidden=true;return;}
    var par=gp.face>0?me.F:me.B,p=toWorld(par,gp.center[0],me.TT+H+.35,gp.center[1]),nrm=par.localToWorld(V(0,1,0)).sub(par.localToWorld(V(0,0,0))).normalize();
    var v=p.clone().project(cam),seen=cam.position.clone().sub(p).dot(nrm)>0&&v.z<1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.95;
    d.hidden=!seen;if(!seen)return;var txt="Section "+(i+1)+" · "+gp.n+" panels";if(d.textContent!==txt)d.textContent=txt;
    d.style.transform="translate("+((v.x+1)/2*stageEl.clientWidth)+"px,"+((1-v.y)/2*stageEl.clientHeight)+"px) translate(-50%,-100%)";});
}

/* ---------- render loop ---------- */
var raf=0,last=0,acc=0,host=heroHost,first=true;
function size(){var w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;var c=R.domElement;if(c.width!==Math.round(w*R.getPixelRatio())||c.height!==Math.round(h*R.getPixelRatio()))R.setSize(w,h,false);if(Math.abs(cam.aspect-w/h)>.001){cam.aspect=w/h;cam.updateProjectionMatrix();goal=preset();limits&&goal&&limits();}}
function loop(now){
  raf=0;var dt=Math.min(.05,(now-last)/1000||0);last=now;
  var running=overlay||(heroOn&&heroVis&&!doc.hidden);if(!running)return;
  raf=requestAnimationFrame(loop);
  if(!overlay){acc+=dt;if(acc<1/30)return;dt=acc;acc=0;}
  size();advance(dt);stepNav();
  frame(dt);camStep(dt,now/1000);R.render(scene,cam);callouts(dt,host);secLabels();
  if(first&&!overlay){first=false;heroLay.classList.add("live");}
}
function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(loop);}}
function attach(to){host=to;if(R.domElement.parentNode!==to)to.insertBefore(R.domElement,to.firstChild);cur=null;goal=null;size();}
if("IntersectionObserver" in window)new IntersectionObserver(function(en){heroVis=en[0].isIntersecting;if(heroVis)start();}).observe(heroLay);
doc.addEventListener("visibilitychange",function(){if(!doc.hidden)start();});
if("ResizeObserver" in window){var ro=new ResizeObserver(function(){size();});ro.observe(stageEl);ro.observe(heroHost);}

/* ---------- controls in the builder ---------- */
function syncControls(){
  $$("#ov [data-hseg]").forEach(function(g){var k=g.getAttribute("data-hseg");$$("button[data-v]",g).forEach(function(b){b.setAttribute("aria-pressed",String(+b.getAttribute("data-v")===h3[k]));});});
  $$("#ov [data-hsw]").forEach(function(x){x.setAttribute("aria-checked",String(!!h3[x.getAttribute("data-hsw")]));});
  $$("#ov [data-hstep='spin'] output").forEach(function(o){o.textContent=spinCount();});
}
ov.addEventListener("click",function(e){
  var t=e.target;
  var mb=t.closest("[data-hmode]");if(mb){var nm=mb.getAttribute("data-hmode");if(nm===mode){replay();return;}fade(function(){setMode(nm);});track("view_3d_service",{mode:nm});return;}
  var z=t.closest("[data-zoom]");if(z&&goal){var d=+z.getAttribute("data-zoom");if(d===0){user=false;goal=preset();}else{user=true;goal.dist*=d>0?.78:1.28;limits();}return;}
  var hb=t.closest("[data-hseg] button[data-v]");
  if(hb){var k=hb.parentNode.getAttribute("data-hseg"),v=+hb.getAttribute("data-v");
    if(k==="stage"){auto=false;h3.stage=v;birdTargets(false);track("pigeon_stage",{stage:v});}
    else if(k==="view"){if(h3.view!==v){h3.view=v;if(v===1&&!room)buildRoom();fade(function(){tl=0;user=false;resetHaze();if(room)resetRoom();goal=preset();cur=null;});track("window_view",{inside:v});}}
    else if(k==="style"){h3.style=v;if(v===3){if(st.stories!==2)st.stories=2;if(!st.large){st.large=true;h3.estateLarge=true;}}else{if(h3.estateLarge){st.large=false;h3.estateLarge=false;}if(v===1&&st.stories!==1)st.stories=1;h3.grids=v===2?true:h3.grids;}
      track("home_style",{style:STY[v].id});C.render();return;}
    else{h3[k]=v;C.render();return;}
    syncControls();summary();return;}
  var hs=t.closest("[data-hsw]");if(hs){var k2=hs.getAttribute("data-hsw");h3[k2]=!h3[k2];if(k2==="grids"){C.render();return;}syncControls();return;}
  var hp=t.closest("[data-hstep='spin'] button[data-d]");
  if(hp){var d2=+hp.getAttribute("data-d"),cnt=spinCount(),f=C.free();auto=false;h3.stage=2;
    if(d2>0){if(h3.spinOv!==null){h3.spinOv++;if(h3.spinOv>=f){st.spin=h3.spinOv-f;h3.spinOv=null;}}else st.spin=Math.min(8-f,st.spin+1);}
    else{if(cnt>f)st.spin--;else h3.spinOv=Math.max(0,cnt-1);}
    buildSpinners();birdTargets(false);C.render();return;}
  var ha=t.closest("[data-hact]");if(ha){var a=ha.getAttribute("data-hact");
    if(a==="replay")replay();
    else if(a==="next"||a==="prev"){var S=steps();if(!S)return;var i=stepAt(S);if(mode==="pig"){auto=true;h3.spinOv=null;}
      if(a==="next"){if(i+1<S.length){tl=S[i+1];track("note_next",{mode:mode,step:i+2});}else replay();}else rewind(S[Math.max(0,i-1)]);}
    else if(a==="try1"){auto=false;h3.stage=2;h3.cov=true;h3.spinOv=1;buildSpinners();birdTargets(false);C.render();goal.yaw=Math.round((cur.yaw-2.6)/(Math.PI*2))*Math.PI*2+2.6;track("try_one_spinner");}
    return;}
});
var fading=false;
function fade(mid){var f=$("ovFade");if(fading||reduce){mid();return;}fading=true;f.classList.add("on");setTimeout(function(){mid();setTimeout(function(){f.classList.remove("on");fading=false;},60);},260);}

/* ---------- api ---------- */
function sync(){
  if(!me)return;
  var k=keyOf(cfgMe());
  if(k!==builtKey){var keepStage=h3.stage;buildMe();if(mode==="pig"){buildNeighbors();h3.stage=keepStage;birdTargets(true);}
    if(mode!=="show"&&mode!=="home"&&mode!=="pig"){tl=0;if(mode==="win"){resetHaze();}}goal=preset();}
  else if(spinners.length!==Math.min(spinCount(),me.vents.length)){buildSpinners();birdTargets(false);anchors();}
  syncControls();summary();
}
buildMe();
return {
  open:function(m){overlay=true;$("ovLoad").hidden=true;attach(stageEl);if(["home","win","sol","scr","pig"].indexOf(m)<0)m="home";setMode(m);start();},
  close:function(){overlay=false;say("");h3.spinOv=null;if(h3.view===1)h3.view=0;setMode("show");attach(heroHost);$("ocall").hidden=true;},
  hero:function(on){heroOn=on;if(on&&!overlay){if(mode!=="show")setMode("show");attach(heroHost);start();}},
  sync:sync,
  pref:function(m){pageMode=m;},
  /* a still frame of the model home, used to make the poster images */
  snap:function(w,h,o){o=o||{};if(mode!=="show")setMode("show");R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
    var p=preset();if(o.yaw!=null)p.yaw=o.yaw;if(o.tilt!=null)p.tilt=o.tilt;if(o.dist)p.dist*=o.dist;if(o.ty)p.ty+=o.ty;
    frame(0);placeCam(p);R.render(scene,cam);var url=R.domElement.toDataURL(o.type||"image/png",o.q||.9);cur=null;goal=null;size();return url;},
  seek:function(t){tl=t;},
  state:function(){return {styleName:["New build","Ranch","Classic","Lake estate"][h3.style],mode:mode,tl:tl,h3:JSON.parse(JSON.stringify(h3)),spinners:spinners.length,birds:birds.length,nbs:nbs.length,W:me&&me.W,style:me&&me.S.id};}
};
};
})();
