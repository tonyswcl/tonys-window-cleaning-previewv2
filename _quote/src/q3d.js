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
var PR0=Math.min(window.devicePixelRatio||1,small?1.75:2,navigator.deviceMemory&&navigator.deviceMemory<=4?1.5:3);
R.setPixelRatio(PR0);
R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.02;
R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
var ANI=Math.min(8,R.capabilities.getMaxAnisotropy()||1);
var scene=new T.Scene(),cam=new T.PerspectiveCamera(34,1,.05,1500);
var UP=new T.Vector3(0,1,0);
function V(x,y,z){return new T.Vector3(x,y,z);}
function clamp01(x){return x<0?0:x>1?1:x;}
function smooth(x){x=clamp01(x);return x*x*(3-2*x);}
function lerp(a,b,t){return a+(b-a)*t;}
function rng(s){s=(Math.abs(Math.floor(s))%2147483646)+1;return function(){s=s*16807%2147483647;return (s-1)/2147483646;};}

/* sky: a clear High Desert midday, painted right here so nothing has to download. Deep blue overhead, pale at the
   horizon, the sun where the sun light is, and a few fair weather clouds that drift slowly. */
var lowMem=!!(navigator.deviceMemory&&navigator.deviceMemory<=4),HOR=0xdbe9f3;
var skyU={top:{value:new T.Color(0x2a6cbd)},mid:{value:new T.Color(0x6aa7de)},hor:{value:new T.Color(HOR)},bot:{value:new T.Color(0xcfd6d3)},map:{value:null},has:{value:0},off:{value:0},
  sunD:{value:new T.Vector3(-14,22,16).normalize()}};
scene.add(new T.Mesh(new T.SphereGeometry(900,48,24),new T.ShaderMaterial({uniforms:skyU,side:T.BackSide,depthWrite:false,fog:false,
  vertexShader:"varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
  fragmentShader:"uniform vec3 top;uniform vec3 mid;uniform vec3 hor;uniform vec3 bot;uniform sampler2D map;uniform float has;uniform float off;uniform vec3 sunD;varying vec3 vP;"+
    "void main(){vec3 d=normalize(vP);float h=d.y;vec3 c=h>0.0?mix(mix(hor,mid,smoothstep(0.0,0.22,h)),top,smoothstep(0.18,0.85,h)):mix(hor,bot,pow(-h,0.35));"+
    "if(has>0.5&&h>-0.01){float u=fract(atan(d.z,d.x)/6.2831853+off);float v=clamp(asin(clamp(h,0.0,1.0))/1.5707963,0.002,0.998);"+
    "vec4 s=texture2D(map,vec2(u,v));c=mix(c,s.rgb,s.a*smoothstep(0.0,0.05,h));}"+
    "float sd=max(dot(d,sunD),0.0);c+=vec3(1.0,0.97,0.9)*(pow(sd,700.0)*1.6+pow(sd,30.0)*0.14);gl_FragColor=vec4(c,1.0);}"})));
/* the clouds: flat bottomed puffs, bigger overhead and smaller toward the horizon, shaded a little underneath.
   cover 0 is a clear day, 1 is overcast; repainted when the weather changes */
var cloudCv=null,cloudCover=-1;
function paintClouds(cover){if(Math.abs(cover-cloudCover)<.04)return;cloudCover=cover;
  var W=small||lowMem?1024:2048,Hh=W/4,k=W/2048,r=rng(29);if(!cloudCv)cloudCv=cv(W,Hh,function(){});var g=cloudCv.getContext("2d");g.clearRect(0,0,W,Hh);
  var shade=Math.round(168-cover*40),sb=Math.round(206-cover*40);
  function cloud(cx,base,w,h){var pc=cv(Math.ceil(w*1.3),Math.ceil(h*1.5),function(q,pw,ph){var n=9+((r()*6)|0);
      for(var i=0;i<n;i++){var t=i/(n-1),x=pw*.15+t*pw*.7+(r()-.5)*w*.08,rr=h*(.35+.55*Math.sin(Math.PI*t)*(.7+r()*.5)),y=ph*.78-rr*.55;
        var gr=q.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,"rgba(255,255,255,.95)");gr.addColorStop(.55,"rgba(255,255,255,.75)");gr.addColorStop(1,"rgba(255,255,255,0)");q.fillStyle=gr;q.fillRect(x-rr,y-rr,2*rr,2*rr);}
      q.globalCompositeOperation="destination-out";var cut=q.createLinearGradient(0,ph*.74,0,ph*.86);cut.addColorStop(0,"rgba(0,0,0,0)");cut.addColorStop(1,"rgba(0,0,0,1)");q.fillStyle=cut;q.fillRect(0,ph*.74,pw,ph*.26);
      q.globalCompositeOperation="source-atop";var sh=q.createLinearGradient(0,ph*.3,0,ph*.82);sh.addColorStop(0,"rgba("+sb+","+(sb+10)+","+(sb+20)+",0)");sh.addColorStop(1,"rgba("+shade+","+(shade+14)+","+(shade+34)+","+(.7+cover*.2)+")");q.fillStyle=sh;q.fillRect(0,0,pw,ph);});
    var x0=cx-pc.width/2,y0=base-pc.height*.8;g.drawImage(pc,x0,y0);if(x0<0)g.drawImage(pc,x0+W,y0);if(x0+pc.width>W)g.drawImage(pc,x0-W,y0);}
  var n=Math.round(10+cover*(small||lowMem?55:80));
  for(var i=0;i<n;i++){var el=2+Math.pow(r(),1.4+(1-cover))*48,sz=(.35+el/22)*(.6+r()*.7)*(1+cover*.8);cloud(r()*W,Hh*(1-el/90),150*k*sz,34*k*sz);}
  if(cover<.6)for(var j=0;j<5;j++){var x=r()*W,y=Hh*(.18+r()*.3),len=W*(.05+r()*.07),gl=g.createLinearGradient(x,0,x+len,0);gl.addColorStop(0,"rgba(255,255,255,0)");gl.addColorStop(.5,"rgba(255,255,255,.28)");gl.addColorStop(1,"rgba(255,255,255,0)");
    g.fillStyle=gl;g.fillRect(x,y,len,3*k+1);}
  if(!skyU.map.value){var t=new T.CanvasTexture(cloudCv);t.wrapS=T.RepeatWrapping;t.minFilter=T.LinearFilter;t.generateMipmaps=false;skyU.map.value=t;skyU.has.value=1;}else skyU.map.value.needsUpdate=true;}
paintClouds(.2);
/* mountains all the way around, taller behind the house the way the San Gabriels and San Bernardinos sit to the south,
   and nearer desert hills in front of them, both faded by the distance so the horizon is somewhere, not nowhere */
function ridge(rad,base,amp,seed,top,foot,peak){var n=220,pos=[],col=[],idx=[],r=rng(seed),ph=[r()*6.28,r()*6.28,r()*6.28,r()*6.28],ct=new T.Color(top).convertSRGBToLinear(),cf=new T.Color(foot).convertSRGBToLinear();
  for(var i=0;i<=n;i++){var a=i/n*Math.PI*2,x=Math.cos(a)*rad,z=Math.sin(a)*rad,bias=peak?.45+.75*Math.pow(Math.max(0,Math.cos(a-4.15)),1.4):1;
    var hh=(base+amp*(.55+.45*Math.sin(a*3+ph[0]))*(.65+.35*Math.sin(a*7+ph[1]))+amp*.22*Math.sin(a*17+ph[2])+amp*.1*Math.abs(Math.sin(a*43+ph[3])))*bias;
    pos.push(x,-3,z,x,hh,z);col.push(cf.r,cf.g,cf.b,ct.r,ct.g,ct.b);if(i<n){var k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}
  var g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(pos,3));g.setAttribute("color",new T.Float32BufferAttribute(col,3));g.setIndex(idx);
  var m=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false,side:T.DoubleSide}));m.renderOrder=-1;scene.add(m);return m;}
ridge(660,22,86,7,0x8e9fbb,0xd3e1ec,true);ridge(430,4,20,13,0xa9aa9c,0xd6e2e9,false);
function envFace(kind,sun){var c=doc.createElement("canvas");c.width=c.height=64;var g=c.getContext("2d");
  if(kind==="top"){g.fillStyle="#3f82cf";g.fillRect(0,0,64,64);}
  else if(kind==="bot"){g.fillStyle="#9c9a86";g.fillRect(0,0,64,64);}
  else{var gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,"#5b9ad8");gr.addColorStop(.46,"#dbe9f3");gr.addColorStop(.52,"#b9bfb8");gr.addColorStop(1,"#9c9a86");g.fillStyle=gr;g.fillRect(0,0,64,64);
    if(sun){var sg=g.createRadialGradient(20,14,0,20,14,12);sg.addColorStop(0,"#fff");sg.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=sg;g.fillRect(0,0,64,64);}}
  return c;}
var cube=new T.CubeTexture([envFace("side"),envFace("side",true),envFace("top"),envFace("bot"),envFace("side",true),envFace("side")]);
cube.encoding=T.sRGBEncoding;cube.needsUpdate=true;scene.environment=cube;
scene.fog=new T.Fog(HOR,110,520);
var HEMI=new T.HemisphereLight(0xdcebff,0x8d8466,.62);scene.add(HEMI);
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
  /* leaves: light and dark flecks, tinted per tree by the material color */
  TX.leaf=tx(cv(128,128,function(g,w,h){g.fillStyle="#8a8a8a";g.fillRect(0,0,w,h);for(var i=0;i<1500;i++){var x=r()*w,y=r()*h,sz=1.5+r()*3.5,v=r();g.fillStyle=v<.55?"rgba(30,40,24,"+(.3+r()*.45).toFixed(2)+")":"rgba(236,244,206,"+(.15+r()*.35).toFixed(2)+")";g.beginPath();g.ellipse(x,y,sz,sz*.6,r()*3,0,6.3);g.fill();}}),true);TX.leaf.repeat.set(2,2);
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
  shrub:Std({map:TX.leaf,color:0x7c9150,roughness:1}),shrub2:Std({map:TX.leaf,color:0x9aa56a,roughness:1}),shrub3:Std({map:TX.leaf,color:0x66793f,roughness:1}),rock:Std({color:0x8a6d54,roughness:1,flatShading:true}),rock2:Std({color:0xa08a6c,roughness:1,flatShading:true}),rock3:Std({color:0x76604b,roughness:1,flatShading:true}),
  agave:Std({color:0x7d9a8a,roughness:.8}),jtrunk:Std({color:0x6e6250,roughness:1}),jleaf:Std({color:0x5a6d42,roughness:.9}),
  tile:Std({roughness:.72,side:T.DoubleSide}),shingle:Std({map:TX.gran,roughness:.95}),
  pframe:Std({color:0x1c1e21,metalness:.7,roughness:.35}),cell:Std({map:TX.cells,metalness:.3,roughness:.1,envMapIntensity:1.4}),rail:Std({color:0xa3a9b0,metalness:.8,roughness:.4}),
  pmesh:Std({map:TX.pmesh,transparent:true,alphaTest:.35,side:T.DoubleSide,metalness:.4,roughness:.6}),clip:Std({color:0x2a2c30,metalness:.5,roughness:.5}),
  bird:Std({color:0x7d8693,roughness:.8}),wing:Std({color:0x626b77,roughness:.85}),neck:Std({color:0x5b7f70,metalness:.45,roughness:.35}),head:Std({color:0x4c5461,roughness:.7}),beak:Std({color:0x2a2a2a}),leg:Std({color:0xc4767a}),
  blade:Std({color:0xffffff,metalness:1,roughness:.04}),chrome:Std({color:0xf4f6f8,metalness:1,roughness:.06,envMapIntensity:1.8,side:T.DoubleSide}),reach:new T.MeshBasicMaterial({color:0xf0b040,transparent:true,opacity:.26,depthWrite:false,side:T.DoubleSide}),reachLine:new T.MeshBasicMaterial({color:0xf0b040,transparent:true,opacity:.9,depthWrite:false,side:T.DoubleSide}),bladeR:Std({color:0xd23a2c,metalness:.6,roughness:.2}),pole:Std({color:0x9aa0a8,metalness:.7,roughness:.35}),
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
  /* the crew uniform: gray polo, black work pants, black cap */
  shirt:Std({color:0x3c4045,roughness:.92}),pants:Std({color:0x0c0d0f,roughness:.85}),skin:Std({color:0xb98262,roughness:.7}),
  hat:Std({color:0x0b0c0e,roughness:.8}),band:Std({color:0xf0b040,roughness:.6}),shoe:Std({color:0x1a1a1a,roughness:.8}),collar:Std({color:0x2c2f33,roughness:.9}),
  rubber:Std({color:0x111111,roughness:.9}),chan:Std({color:0xc7ccd2,metalness:.8,roughness:.3}),towel:Std({color:0x3d7fd1,roughness:1}),
  iwall:Std({color:0xefe9df,roughness:.95}),ifloor:Std({map:TX.wood,roughness:.6}),vinyl:Std({color:0xf7f7f4,roughness:.5}),
  iglass:Std({color:0xdfeef7,metalness:.1,roughness:.05,transparent:true,opacity:.14,envMapIntensity:1.2,depthWrite:false}),
  alum:Std({color:0xb8bcc0,metalness:.8,roughness:.35})
};
TX.grass=tx(cv(256,256,function(g,w,h){var r=rng(41);g.fillStyle="#6a8a3c";g.fillRect(0,0,w,h);dots(g,w,h,r,9000,"52,86,34",.25,.6,1,2.2);dots(g,w,h,r,6000,"150,178,88",.2,.45,1,1.8);
  for(var i=0;i<2400;i++){var x=r()*w,y=r()*h;g.strokeStyle="rgba("+(r()<.5?"74,110,44":"126,158,72")+","+(.35+r()*.4)+")";g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*2,y-2-r()*3);g.stroke();}}),true);TX.grass.repeat.set(4,3);
M.grass=Std({map:TX.grass,roughness:1});M.tree=Std({map:TX.leaf,color:0x6f9a48,roughness:.95});M.tree2=Std({map:TX.leaf,color:0x8fb05c,roughness:.95});M.pine=Std({map:TX.leaf,color:0x4e7440,roughness:.95});M.fence=Std({color:0x8a6f52,roughness:.95});
M.dust=Std({map:TX.dust,transparent:true,depthWrite:false,roughness:1});
M.ground=Std({map:TX.gravel,bumpMap:TX.gravelB,bumpScale:.02,roughness:1});
M.ground.polygonOffset=true;M.ground.polygonOffsetFactor=2;M.ground.polygonOffsetUnits=8;
var ground=new T.Mesh(new T.PlaneGeometry(2400,2400),M.ground);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
/* the street around you: stucco in a few real tract colors, tile roofs, cars, palms. Shared materials, so the whole
   block draws in a few dozen batches and stays light on a phone */
TX.roofRow=tx(cv(128,128,function(g,w,h){var r=rng(63);g.fillStyle="#fff";g.fillRect(0,0,w,h);
  for(var y=0;y<h;y+=32){for(var x=0;x<w;x+=16){var gr=g.createLinearGradient(x,0,x+16,0);gr.addColorStop(0,"rgba(0,0,0,.22)");gr.addColorStop(.45,"rgba(255,255,255,.18)");gr.addColorStop(1,"rgba(0,0,0,.26)");g.fillStyle=gr;g.fillRect(x,y,16,32);}
    var sh=g.createLinearGradient(0,y,0,y+32);sh.addColorStop(0,"rgba(0,0,0,0)");sh.addColorStop(.8,"rgba(0,0,0,.08)");sh.addColorStop(1,"rgba(0,0,0,.34)");g.fillStyle=sh;g.fillRect(0,y,w,32);}
  dots(g,w,h,r,900,"0,0,0",.04,.12,1,2);}),true);TX.roofRow.repeat.set(7,9);
var WALLS=[0xeadfca,0xd6be98,0xf2eee6,0xc9c3b0,0xe5d2b8,0xbfb29c,0xe9e1d3,0xcfae8a,0xb8b8a4].map(function(c){return Std({map:TX.stucco,color:c,roughness:.95});});
var ROOFS=[0xa9573c,0x7a5646,0x4f5357,0xb08a64,0x94472f,0x8f7a62].map(function(c){return Std({map:TX.roofRow,color:c,roughness:.82,flatShading:true});});
var CARS=[0xf2f2f0,0xb9bdc2,0x1d1f22,0x27364f,0x9a2a22,0x56606b,0xd9d3c4].map(function(c){return Std({color:c,metalness:.55,roughness:.32,envMapIntensity:1.2});});
M.carG=Std({color:0x1a222b,metalness:.8,roughness:.1});M.tire=Std({color:0x151515,roughness:.9});M.garL=Std({map:TX.garage,roughness:.55});M.trimL=Std({color:0xf4f1ea,roughness:.6});
M.frond=Std({color:0x58773a,roughness:.9,side:T.DoubleSide});M.palmT=Std({color:0x8a7a64,roughness:1});M.palmSk=Std({color:0xa48e6a,roughness:1,flatShading:true});
M.bin=Std({color:0x2f3a33,roughness:.7});M.binB=Std({color:0x2b4f8c,roughness:.7});M.lamp=Std({color:0x7d8288,metalness:.6,roughness:.4});M.dirt=Std({color:0xb8a27f,roughness:1});M.pool=Std({color:0x3aa6d4,roughness:.08,metalness:.1,envMapIntensity:1.3});
TX.ripple=tx(cv(128,128,function(g,w,h){var r=rng(71);g.fillStyle="#808080";g.fillRect(0,0,w,h);for(var i=0;i<260;i++){var x=r()*w,y=r()*h,l=6+r()*16;g.strokeStyle="rgba("+(r()<.5?"255,255,255":"0,0,0")+","+(.12+r()*.2)+")";g.lineWidth=1+r()*1.5;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+l/2,y-1.5,x+l,y);g.stroke();}}),true,true);TX.ripple.repeat.set(.3,.3);
M.water=Std({color:0x184f76,roughness:.34,metalness:0,envMapIntensity:.28,bumpMap:TX.ripple,bumpScale:.02});M.water.fog=false;M.boat=Std({color:0xf4f4f1,roughness:.35});
/* trees and palm fronds move a little in the breeze */
var windU={value:0},windA={value:1},windV={value:new T.Vector2(-1,0)};
function sway(m,amp){m.onBeforeCompile=function(s){s.uniforms.uWind=windU;s.uniforms.uWA=windA;s.uniforms.uWV=windV;s.vertexShader="uniform float uWind;uniform float uWA;uniform vec2 uWV;\n"+s.vertexShader.replace("#include <begin_vertex>",
  "#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat swPh=instanceMatrix[3].x*.21+instanceMatrix[3].z*.17;float swG=(0.55+0.45*sin(uWind*1.6+swPh))*uWA*"+amp.toFixed(3)+"*(position.y+1.0);transformed.x+=uWV.x*swG+sin(uWind*2.3+swPh*2.0)*"+(amp*.35).toFixed(3)+"*uWA;transformed.z+=uWV.y*swG+cos(uWind*1.9+swPh)*"+(amp*.35).toFixed(3)+"*uWA;\n#endif");};
  m.customProgramCacheKey=function(){return "sway"+amp;};}
sway(M.tree,.035);sway(M.tree2,.035);sway(M.pine,.025);sway(M.frond,.06);
/* roof shapes on a 1 x 1 footprint, eaves at 0 and ridge at 1, scaled to each house */
function roofGeo(a,ends){var P=[],U=[];
  function tri(p,ax){p.forEach(function(q){P.push(q[0],q[1],q[2]);U.push(ax?q[2]:q[0],ends?q[1]*.3:ax?.5-Math.abs(q[0]):.5-Math.abs(q[2]));});}
  if(ends){tri([[.5,0,.5],[.5,0,-.5],[.5,1,0]],1);tri([[-.5,0,-.5],[-.5,0,.5],[-.5,1,0]],1);}
  else{tri([[-.5,0,.5],[.5,0,.5],[a,1,0]]);tri([[-.5,0,.5],[a,1,0],[-a,1,0]]);tri([[.5,0,-.5],[-.5,0,-.5],[-a,1,0]]);tri([[.5,0,-.5],[-a,1,0],[a,1,0]]);
    if(a<.5){tri([[.5,0,.5],[.5,0,-.5],[a,1,0]],1);tri([[-.5,0,-.5],[-.5,0,.5],[-a,1,0]],1);}}
  var g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(P,3));g.setAttribute("uv",new T.Float32BufferAttribute(U,2));g.computeVertexNormals();g.userData.shared=true;return g;}
var RG={hip:[roofGeo(.16),roofGeo(.27)],gable:roofGeo(.5),end:roofGeo(0,true)};
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
  blade:new T.BoxGeometry(.5,.012,.14),cup:new T.SphereGeometry(.075,18,10,0,Math.PI*2,0,Math.PI/2),vent:new T.CylinderGeometry(.06,.06,.36,14),flash:new T.CylinderGeometry(.2,.24,.02,16),clamp:new T.TorusGeometry(.075,.011,6,18),
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
var h3={hood:1,style:0,roof:0,rc:0,wc:0,tc:0,grids:false,view:0,stage:2,cov:true,spinOv:null,estateLarge:false,custom:null,cv:0,shop:null,sv:0,cst:0,cwc:0,cac:0,cname:""},ED=null;
var ORDER=[[1,0],[-1,0],[1,-.32],[-1,.32],[1,.32],[-1,-.32],[1,-.44],[-1,.44],[1,.16],[-1,-.16]];

/* window sizes you can pick: small, standard slider, large picture */
var SZ=[[.9,.9],[1.3,1.08],[1.9,1.4]];
/* a wall of the house: 0 front, 1 back, 2 right, 3 left; u runs left to right as you face it from outside */
function faceFrame(h,f){var W=h.W,D=h.D;return [{p:V(0,0,D/2),n:V(0,0,1),d:V(1,0,0),ang:0,len:W},{p:V(0,0,-D/2),n:V(0,0,-1),d:V(-1,0,0),ang:Math.PI,len:W},
  {p:V(W/2,0,0),n:V(1,0,0),d:V(0,0,-1),ang:Math.PI/2,len:D},{p:V(-W/2,0,0),n:V(-1,0,0),d:V(0,0,1),ang:-Math.PI/2,len:D}][f];}
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
    o=o||{};var w=new T.Group();w.position.set(x,y,z);w.rotation.y=ang;g.add(w);if(cfg.editing)w.userData.dyn=true;
    box(gw+.2,gh+.2,.1,trim,0,0,.03,w);
    var gl=box(gw,gh,.06,M.glass,0,0,.07,w,true);
    box(.05,gh,.08,trim,0,0,.09,w,true);
    if(cfg.grids){[-1,1].forEach(function(sd){var cx=sd*gw/4;box(.022,gh,.02,trim,cx,0,.105,w,true);box(gw/2-.05,.022,.02,trim,cx,0,.105,w,true);});}
    var sillM=main&&o.demo?trim.clone():trim,sill=box(gw+.32,.08,.2,sillM,0,-gh/2-.14,.08,w);if(sillM!==trim)sill.userData.dyn=true;
    if(o.arch){var ag=new T.CircleGeometry(gw/2,24,0,Math.PI),am=new T.Mesh(ag,M.glass);am.position.set(0,gh/2+.1,.072);w.add(am);
      var ring=new T.Mesh(new T.RingGeometry(gw/2,gw/2+.1,24,1,0,Math.PI),trim);ring.position.set(0,gh/2+.1,.08);w.add(ring);box(gw+.2,.1,.1,trim,0,gh/2+.08,.03,w);}
    var rec={g:w,gw:gw,gh:gh,gl:gl,sill:sill,sillM:sillM,ang:ang,f:o.f,u:o.u,v:y,sz:o.sz,s:o.s===undefined?1:o.s};h.wins.push(rec);return rec;
  }
  var gy0=S.big?1.55:1.5,gw1=S.big?1.5:1.3,gh1=S.big?1.7:1.08;
  var sum=items.reduce(function(q,k){return q+iw[k];},0),gap=(W-sum)/(items.length+1),x=-W/2+gap;
  var nWin=items.filter(function(k){return k==="win";}).length,wi=0;
  h.obst=[];var cust=cfg.custom;
  items.forEach(function(k){var cx=x+iw[k]/2,z=D/2;x+=iw[k]+gap;
    h.obst.push(k==="win"?null:k==="door"?[cx-.72,cx+.72,0,2.4]:k==="porch"?[cx-1.85,cx+1.85,0,2.9]:k==="entry"?[cx-1.5,cx+1.5,0,3.3]:[cx-iw[k]/2+.05,cx+iw[k]/2-.05,0,2.6]);
    if(k==="win"){wi++;if(!cust)h.front1.push(win(cx,gy0,z,0,gw1,gh1,{arch:S.big,demo:wi===1||wi===nWin,f:0,u:cx,sz:S.big?2:1}));}
    else if(k==="door"){box(1.0,2.15,.08,M.door,cx,1.075,z+.04,g);box(1.2,.1,.1,trim,cx,2.2,z+.05,g);box(.08,2.2,.1,trim,cx-.56,1.1,z+.05,g);box(.08,2.2,.1,trim,cx+.56,1.1,z+.05,g);box(.1,.2,.08,M.pframe,cx+.72,1.9,z+.06,g);h.doorX=cx;}
    else if(k==="porch"){box(1.0,2.15,.08,M.door,cx,1.075,z+.04,g);box(1.2,.1,.1,trim,cx,2.2,z+.05,g);
      box(3.2,.16,2.2,M.concrete,cx,.08,z+1.1,g);[-1.45,1.45].forEach(function(px){box(.14,2.45,.14,trim,cx+px,1.3,z+2.0,g);});
      var pr=box(3.7,.1,2.6,mats.porch,cx,2.62,z+1.2,g);pr.rotation.x=.12;h.doorX=cx;}
    else if(k==="entry"){box(1.3,2.6,.08,M.door,cx,1.3,z+.04,g);[-1.05,1.05].forEach(function(px){var c=new T.Mesh(G.cyl,trim);c.scale.set(.16,2.9,.16);c.position.set(cx+px,1.45,z+.4);c.castShadow=true;g.add(c);});
      box(2.7,.32,.7,trim,cx,3.04,z+.3,g);box(2.9,.12,1.1,M.concrete,cx,.06,z+.55,g);h.doorX=cx;}
    else if(k==="gar2"||k==="gar1"){var gw=k==="gar2"?4.6:2.6;box(gw,2.3,.1,mats.garage,cx,1.15,z+.05,g);box(gw+.2,.12,.12,trim,cx,2.36,z+.06,g);
      box(.1,2.36,.12,trim,cx-gw/2-.05,1.18,z+.06,g);box(.1,2.36,.12,trim,cx+gw/2+.05,1.18,z+.06,g);(h.garages=h.garages||[]).push([cx,gw]);}
  });
  h.obst=h.obst.filter(Boolean);
  if(cust){[0,1,2,3].forEach(function(f){var fr=faceFrame(h,f);(cust[f]||[]).forEach(function(it){var sz=SZ[it.sz]||SZ[1],lim=fr.len/2-.45-sz[0]/2,u=Math.max(-lim,Math.min(lim,it.u)),v=Math.max(sz[1]/2+.45,Math.min(wallH-.3-sz[1]/2,it.v)),pos=fr.p.clone().addScaledVector(fr.d,u);
      var rec=win(pos.x,v,pos.z,fr.ang,sz[0],sz[1],{f:f,u:u,sz:it.sz,s:it.s,demo:f===0});if(f===0&&v<story)h.front1.push(rec);});});
    h.front1.sort(function(a,b){return a.u-b.u;});}
  for(s=0;s<cfg.stories&&!cust;s++){
    var y=s*story+gy0;
    if(s>0){var nf=(S.big?4:3)+(cfg.more?1:0);for(i=0;i<nf;i++){var ux=-W/2+W*(i+1)/(nf+1);win(ux,y,D/2,0,S.big?1.4:1.3,S.big?1.3:1.08,{arch:false,f:0,u:ux,sz:1});}}
    var nb=3+(cfg.more?1:0)+(S.big?1:0);for(i=0;i<nb;i++){var bx2=-W/2+W*(i+1)/(nb+1);win(bx2,y,-D/2,Math.PI,1.3,1.08,{f:1,u:-bx2,sz:1});}
    [1,-1].forEach(function(sx){(D>7?[-.22,.22]:[0]).forEach(function(fz){win(sx*W/2,y,fz*D,sx>0?Math.PI/2:-Math.PI/2,1.3,1.08,{f:sx>0?2:3,u:sx>0?-fz*D:fz*D,sz:1});});});
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
    if(cfg.pv===false){gp2.center=[gp2.cx,zTop+gp2.rows*PD/2];gp2.bottom=zTop+gp2.rows*PD;return;}
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
    if(cfg.hood===0||cfg.hood===2)joshua(g,-W/2-2.4,fz+3.2,r);
    var wx=W/2+3.4,wz0=0,wz1=-D/2-4.6,wh=1.6;if((cfg.hood===0||cfg.hood===1)&&!cfg.editing){
    [1,-1].forEach(function(sx){box(.2,wh,wz0-wz1,M.cmu,sx*wx,wh/2,(wz0+wz1)/2,g);box(.28,.06,wz0-wz1,M.cap,sx*wx,wh+.03,(wz0+wz1)/2,g);});
    box(2*wx,wh,.2,M.cmu,0,wh/2,wz1,g);box(2*wx+.28,.06,.28,M.cap,0,wh+.03,wz1,g);}
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
    im.instanceMatrix.needsUpdate=true;im.castShadow=cast;im.receiveShadow=recv;im.frustumCulled=false;root.add(im);
    if(list[0].geometry===G.clip)h.clipIM=im;});
  kill.forEach(function(o){o.parent.remove(o);});
}
function joshua(par,x,z,r){
  var j=new T.Group();j.position.set(x,0,z);j.rotation.y=r()*6.28;par.add(j);var sc=.8+r()*.5;j.scale.setScalar(sc);
  cylBetween(V(0,0,0),V(.05,2.1,0),.14,M.jtrunk,j);
  var arms=[[.9,2.9,.3],[-.8,2.7,-.2],[.2,3.2,-.7],[-.3,3.0,.8]].slice(0,2+((r()*3)|0));
  arms.forEach(function(b){var tip=V(b[0]*(.8+r()*.4),b[1]*(.9+r()*.2),b[2]*(.8+r()*.4));cylBetween(V(.05,1.9,0),tip,.09,M.jtrunk,j);
    /* the dense spiky head at the end of every arm */
    var hd=new T.Mesh(G.bush[1],M.jleaf);hd.scale.set(.36,.32,.36);hd.position.copy(tip).add(V(0,.08,0));hd.castShadow=true;j.add(hd);
    for(var k=0;k<10;k++){var sp=new T.Mesh(G.cone,M.jleaf);sp.scale.set(.045,.5,.045);var th=r()*Math.PI*2,ph=r()*Math.PI*.75;var d=V(Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th));
      sp.position.copy(tip).addScaledVector(d,.3);sp.quaternion.setFromUnitVectors(UP,d);sp.castShadow=true;j.add(sp);}});
}

/* ---------- world: my house, street, neighbors ---------- */
var world=new T.Group();scene.add(world);
var me=null,nbs=[],birds=[],spinners=[],cover={},builtKey="",nbKey="";
function showPanels(){return st.sol||st.pig||mode==="sol"||mode==="pig";}
function cfgMe(){return {pv:showPanels(),hood:h3.hood,style:h3.style,stories:st.stories,roof:h3.roof,rc:h3.rc,wc:h3.wc,tc:h3.tc,grids:h3.grids,more:st.more,n:st.panels,arrays:st.arrays,sizes:st.arrays>1?st.arr.slice(0,st.arrays):null,
  custom:h3.custom,editing:!!(ED&&ED.t==="home"),cv:h3.cv};}
function keyOf(c){return [c.pv,c.hood,c.style,c.stories,c.roof,c.rc,c.wc,c.tc,c.grids,c.custom?"":c.more,c.n,c.arrays,c.sizes?c.sizes.join("."):"",c.custom?"c"+c.cv:"",c.editing?"e":""].join("-");}
function buildMe(){
  checkCustom();
  if(me){world.remove(me.g);disposeGroup(me.g);}
  birds.forEach(function(b){world.remove(b.m);});birds=[];
  me=makeHouse(cfgMe(),true);world.add(me.g);me.g.updateMatrixWorld(true);me.ms=(mode!=="pig"||h3.stage>=1)?1:0;
  builtKey=keyOf(me.cfg);
  me.front=me.D/2;
  demoWin=me.front1[0]||me.wins[0];scrWin=me.front1[me.front1.length-1]||demoWin;
  prepDemo();prepBefore();
  nbKey="";clearNeighbors();birds=[];
  spinners=[];buildSpinners();
  buildNeighbors();
  buildHood();
  anchors();
}
/* free what a rebuilt group held on the graphics card: its own shapes, its per piece materials, and the instance lists */
function disposeGroup(g){g.traverse(function(o){if(o.geometry&&o.geometry!==G.box&&o.geometry!==G.cyl&&o.geometry!==G.ball&&o.geometry!==G.plane&&o.geometry.dispose&&!o.geometry.userData.shared)o.geometry.dispose();
  if(o.isInstancedMesh)o.dispatchEvent({type:"dispose"});if(o.material&&o.material.userData&&o.material.userData.own)o.material.dispose();});}
[G.box,G.cyl,G.ball,G.plane,G.frame,G.cell,G.clip,G.blade,G.cup,G.vent,G.flash,G.clamp,G.beak,G.tail,G.leg,G.cone,sT].concat(TILE.map(function(t){return t.geo;})).forEach(function(gg){gg.userData.shared=true;});
function clearNeighbors(){nbs.forEach(function(n){world.remove(n.g);disposeGroup(n.g);});nbs=[];}
function buildNeighbors(){
  var key=builtKey+"|"+h3.hood;if(nbKey===key&&nbs.length)return;clearNeighbors();
  var cfgs=[{pv:true,style:0,stories:2,roof:1,rc:1,wc:2,tc:0,grids:false,more:false,n:12,arrays:1,hood:h3.hood},{pv:true,style:1,stories:1,roof:0,rc:3,wc:0,tc:1,grids:true,more:false,n:10,arrays:1,hood:h3.hood}];
  var gap=h3.hood===2?26:h3.hood===1?6:h3.hood===3?6.5:7.5,L=makeHouse(cfgs[0],false),Rn=makeHouse(cfgs[1],false);
  L.g.position.set(-(me.W/2+gap+L.W/2),0,me.front-L.D/2);Rn.g.position.set(me.W/2+gap+Rn.W/2,0,me.front-Rn.D/2);
  if(h3.hood===1||h3.hood===3)[L,Rn].forEach(function(nh,i){lawn(nh.g,0,nh.W+4,nh.D/2+.4,nh.D/2+7);tree(nh.g,(i?1:-1)*(nh.W/2-1),nh.D/2+5.4,.95);});
  world.add(L.g);world.add(Rn.g);L.g.updateMatrixWorld(true);Rn.g.updateMatrixWorld(true);nbs=[L,Rn];nbKey=key;
  fitShadow(true);
}
/* ---------- the neighborhood: streets, homes on every side, cars, palms, the town beyond and the mountains past it.
   Desert yards, lawns and trees, or acreage. Everything is built from shared shapes and batched, so a whole town is a few dozen draws. ---------- */
var hoodG=null,townKey="",mover=null,TOWN={};
function lawn(par,cx,w,z0,z1){var gm=new T.Mesh(G.plane,M.grass);gm.rotation.x=-Math.PI/2;gm.scale.set(w,z1-z0,1);gm.position.set(cx,.012,(z0+z1)/2);gm.receiveShadow=true;par.add(gm);return gm;}
/* a shade tree: trunk, a few limbs, and a rounded crown of leafy clumps, each one a little different */
function tree(par,x,z,sc){var t=new T.Group();t.position.set(x,0,z);t.rotation.y=x*.7+z;par.add(t);var r=rng(Math.round(Math.abs(x*7.3+z*13.1))+3);
  cylBetween(V(0,0,0),V(.05,1.9*sc,0),.14*sc,M.jtrunk,t);
  for(var b=0;b<3;b++){var a=b*2.1+r();cylBetween(V(.03,1.5*sc,0),V(Math.cos(a)*.75*sc,2.45*sc,Math.sin(a)*.75*sc),.06*sc,M.jtrunk,t);}
  for(var i=0;i<14;i++){var a2=r()*6.283,el=Math.acos(1-r()*1.35),rr=1.05*sc,bl=new T.Mesh(G.bush[i%2],i%3?M.tree:M.tree2),bs=(.48+r()*.32)*sc;
    bl.scale.set(bs,bs*.85,bs);bl.position.set(Math.sin(el)*Math.cos(a2)*rr,2.75*sc+Math.cos(el)*rr*.72,Math.sin(el)*Math.sin(a2)*rr);bl.castShadow=castOn;t.add(bl);}return t;}
/* a pine, the kind that lines High Desert yards and windbreaks */
function pine(par,x,z,ht){var t=new T.Group();t.position.set(x,0,z);par.add(t);var r=rng(Math.round(Math.abs(x*5.1+z*9.7))+11);
  cylBetween(V(0,0,0),V((r()-.5)*.3,ht,(r()-.5)*.3),.16,M.jtrunk,t);
  for(var i=0;i<6;i++){var f=i/5,rad=(1.5-f*1.1)*(ht/7),bl=new T.Mesh(G.bush[i%2],M.pine);bl.scale.set(rad*(.9+r()*.3),rad*.55,rad*(.9+r()*.3));
    bl.position.set((r()-.5)*.4,ht*(.32+f*.62),(r()-.5)*.4);bl.castShadow=castOn;t.add(bl);}return t;}
var castOn=true;
function bx(w,h,d,m,x,y,z,par){return box(w,h,d,m,x,y,z,par,!castOn);}
/* a fan palm: tall trunk, a skirt of old fronds, a round crown */
function palm(par,x,z,ht,r){var t=new T.Group();t.position.set(x,0,z);par.add(t);var top=V((r()-.5)*.7,ht,(r()-.5)*.7);cylBetween(V(0,0,0),top,.2,M.palmT,t);
  var sk=new T.Mesh(G.cyl,M.palmSk);sk.scale.set(.5,1.2,.5);sk.position.copy(top).add(V(0,-.8,0));sk.castShadow=castOn;t.add(sk);
  var cr=new T.Mesh(G.bush[0],M.tree);cr.scale.set(.7,.45,.7);cr.position.copy(top).add(V(0,.15,0));cr.castShadow=castOn;t.add(cr);
  for(var i=0;i<12;i++){var a=i/12*6.283+r()*.35,L=1.5+r()*.6,dr=.12+r()*.55,f=new T.Mesh(G.box,M.frond);f.scale.set(.6,.02,L);f.rotation.set(dr,a,0,"YXZ");
    f.position.copy(top).add(V(Math.sin(a)*Math.cos(dr)*L*.5,.15-Math.sin(dr)*L*.5,Math.cos(a)*Math.cos(dr)*L*.5));f.castShadow=castOn;t.add(f);}
  return t;}
/* a parked car or SUV; its nose points along +z */
function car(par,x,z,ang,ci,r){var c=new T.Group();c.position.set(x,0,z);c.rotation.y=ang;par.add(c);var bm=CARS[ci%CARS.length],suv=r()<.45,cl=suv?2.7:2.15,cz=suv?-.4:-.2;
  bx(1.84,.64,4.6,bm,0,.6,0,c);bx(1.64,.5,cl,M.carG,0,1.16,cz,c);bx(1.58,.07,cl-.3,bm,0,1.44,cz,c);
  [[-.84,1.5],[.84,1.5],[-.84,-1.45],[.84,-1.45]].forEach(function(w){var t=new T.Mesh(G.cyl,M.tire);t.scale.set(.34,.24,.34);t.rotation.z=Math.PI/2;t.position.set(w[0],.34,w[1]);t.castShadow=castOn;c.add(t);});
  return c;}
function shrubs(par,x0,x1,z,n,r,desert){for(var i=0;i<n;i++){var sb=new T.Mesh(G.bush[i%2],desert?[M.shrub2,M.agave,M.shrub][i%3]:[M.shrub,M.shrub2,M.shrub3][i%3]),s=desert?.28+r()*.25:.4+r()*.3;
  sb.scale.set(s*1.2,s*.8,s);sb.position.set(x0+r()*(x1-x0),s*.6,z+(r()-.5)*.8);sb.castShadow=castOn;par.add(sb);}}
/* a wooden dock off the back of a lakefront lot, and sometimes a boat tied up at it */
function dock(par,x,z,r,full){bx(1.8,.16,6,M.fence,x,.2,z-3,par);if(!full)return;for(var i=0;i<3;i++){bx(.16,.7,.16,M.fence,x-.8,.1,z-1-i*2.2,par);bx(.16,.7,.16,M.fence,x+.8,.1,z-1-i*2.2,par);}
  if(r()<.45){var bxp=x+(r()<.5?-2.1:2.1),bzp=z-3.4;bx(1.9,.5,4.8,M.boat,bxp,.22,bzp,par);bx(1.95,.12,4.85,CARS[3],bxp,.3,bzp,par);bx(1.5,.32,.12,M.carG,bxp,.63,bzp+.4,par);}}
/* one neighbor's home and lot. o: x, zf (front line), dir (+1 faces +z), W, D, st, wall, roof, gar (garage side), walk (front to curb),
   back (yard depth), gap (to the next lot), lod (2 full, 1 simple, 0 far), yard (0 gravel, 1 lawn), hood */
function liteHouse(par,o,r){
  var g=new T.Group();if(o.ang!==undefined){g.position.set(o.cx,0,o.cz);g.rotation.y=o.ang;}else{g.position.set(o.x,0,o.zf-o.dir*o.D/2);g.rotation.y=o.dir>0?0:Math.PI;}par.add(g);
  var W=o.W,D=o.D,f=D/2,hgt=o.st*2.75,wm=WALLS[o.wall],pitch=.34+r()*.12,rs=(D+.8)*.5*pitch,hip=r()<.55,gs=o.gar,a=(W-D)/(2*(W+.8));
  bx(W,hgt,D,wm,0,hgt/2,0,g);
  var rm=new T.Mesh(hip?RG.hip[a<.21?0:1]:RG.gable,ROOFS[o.roof]);rm.scale.set(W+.8,rs,D+.8);rm.position.y=hgt-.12;rm.castShadow=castOn;rm.receiveShadow=true;g.add(rm);
  if(!hip){var ge=new T.Mesh(RG.end,wm);ge.scale.set(W,rs-.1,D);ge.position.y=hgt;ge.castShadow=castOn;g.add(ge);}
  var gx=gs*(W/2-3.1),dx=gx-gs*4.3,drv=o.hood===2?M.dirt:M.concrete;
  bx(4.9,2.3,.1,M.garL,gx,1.15,f+.05,g);bx(5.3,.03,o.walk+.4,drv,gx,.016,f+(o.walk+.4)/2,g);
  if(o.lake){dock(g,-gs*(W/2-2.5),-f-o.back,r,o.lod===2);lawn(g,0,W+o.gap-.8,-f-o.back+.1,-f-.3);}
  if(o.lod===0){if(o.hood===1||o.hood===3){if(o.yard)lawn(g,0,W+o.gap-.6,f+.3,f+o.walk-.05);if(r()<.6){var tb=new T.Mesh(G.bush[0],r()<.5?M.tree:M.tree2),ts=1.4+r()*.8;tb.scale.set(ts,ts*.85,ts);tb.position.set((r()-.5)*W,2.4,-f-2-r()*3);g.add(tb);}}
    else if(o.hood===2&&r()<.35){bx(6,3,5,WALLS[(o.wall+2)%WALLS.length],gs*(W/2+6),1.5,-f-4,g);}
    return g;}
  bx(1.0,2.15,.08,M.door,dx,1.075,f+.04,g);bx(5.2,.14,.14,M.trimL,gx,2.36,f+.08,g);
  function win(x,y,z,side){if(side){bx(.05,1.15,1.5,M.trimL,x,y,z,g);bx(.07,.95,1.3,M.glass,x+(x>0?.02:-.02),y,z,g);}else{bx(1.5,1.15,.05,M.trimL,x,y,z,g);bx(1.3,.95,.07,M.glass,x,y,z+(z>0?.02:-.02),g);}}
  for(var x=-W/2+1.4;x<=W/2-1.4;x+=2.5){if(Math.abs(x-gx)<3.3||Math.abs(x-dx)<1.3)continue;win(x,1.6,f+.02);}
  for(var s=1;s<o.st;s++)for(var x2=-W/2+1.6;x2<=W/2-1.6;x2+=3)win(x2,1.6+2.75*s,f+.02);
  for(var s2=0;s2<o.st;s2++){win(-W/2-.02,1.6+2.75*s2,0,1);win(W/2+.02,1.6+2.75*s2,0,1);for(var x3=-W/2+2;x3<=W/2-2;x3+=3.4)win(x3,1.6+2.75*s2,-f-.02);}
  var sh=box(W+3,.01,D+3,M.shadow,0,.012,0,g,true);sh.receiveShadow=false;
  if(o.lod<2)return g;
  var desert=o.hood===0||o.hood===2;
  if(o.yard)lawn(g,0,W+o.gap-.6,f+.3,f+o.walk-.05);
  if(o.hood!==2)bx(1.1,.03,o.walk,M.concrete,dx,.016,f+o.walk/2,g);
  shrubs(g,-W/2+.6,W/2-.6,f+.7,3+((r()*3)|0),r,desert);
  /* the back yard: grass or a patio, sometimes a pool, and the block wall around it */
  if(o.lake){bx(W*.5,.03,2.6,M.concrete,(r()-.5)*2,.02,-f-1.3,g);bx(.18,1.2,f+o.back-D*.2,M.cmu,W/2+o.gap/2,.6,(-D*.2-f-o.back)/2,g);}
  else if(o.hood!==2){if(!desert&&r()<.6)lawn(g,0,W+o.gap-.8,-f-o.back+.3,-f-.3);else bx(W*.5,.03,2.6,M.concrete,(r()-.5)*2,.016,-f-1.3,g);
    if(r()<(desert?.14:.3)){var px=(r()-.5)*(W-6),pz=-f-2.2-Math.min(3,o.back*.3);bx(3.9,.04,6.8,M.concrete,px,.02,pz-2.8,g);bx(3.3,.05,6.2,M.pool,px,.03,pz-2.8,g);}
    bx(.18,1.8,f+o.back-D*.2,M.cmu,W/2+o.gap/2,.9,(-D*.2-f-o.back)/2,g);if(!o.noBack)bx(W+o.gap,1.8,.18,M.cmu,0,.9,-f-o.back,g);}
  else{/* a rail fence along the road, and out back a metal barn or a shed */
    if(r()<.55){var bw=6+r()*4,bd=7+r()*4,bxx=gs*(W/2+4+bw/2),bzz=-f-5-bd/2;bx(bw,3.2,bd,r()<.5?M.flash:WALLS[(o.wall+3)%WALLS.length],bxx,1.6,bzz,g);
      var br=new T.Mesh(RG.gable,M.flash);br.scale.set(bw+.4,1.2,bd+.4);br.rotation.y=Math.PI/2;br.position.set(bxx,3.1,bzz);br.castShadow=castOn;g.add(br);}
    for(var fx=-W/2-o.gap/2+1;fx<W/2+o.gap/2;fx+=4)if(Math.abs(fx-gx)>3.4)bx(.14,1.2,.14,M.fence,fx,.6,f+o.walk-2,g);
    [.45,.95].forEach(function(y){bx(W+o.gap-2,.08,.06,M.fence,0,y,f+o.walk-2.05,g);});}
  var ty=r();
  if(o.hood===1||o.hood===3){if(ty<.35)palm(g,gs*-(W/2-1)+(r()-.5),f+o.walk-1.6,6.5+r()*3.5,r);else if(ty<.8)tree(g,-gs*(W/2-2)+(r()-.5)*2,f+o.walk*.55,.8+r()*.35);
    if(r()<.3)(r()<.5?pine(g,(r()-.5)*W,-f-o.back*.55,6+r()*3):tree(g,(r()-.5)*W,-f-o.back*.55,.9+r()*.3));}
  else if(o.hood===0){if(ty<.2)palm(g,-gs*(W/2-1),f+o.walk-1.6,6+r()*3,r);else if(ty<.4)joshua(g,-gs*(W/2-2),f+o.walk*.5,r);else if(ty<.6)pine(g,-gs*(W/2-1.5),f+o.walk*.5,5.5+r()*2.5);}
  else{if(ty<.7)joshua(g,-gs*(W/2+4)*(.5+r()*.6),f+o.walk*(.3+r()*.4),r);if(r()<.45)for(var pk=0;pk<5;pk++)pine(g,-W/2-4+pk*(W+8)/4,-f-13,6.5+r()*2.5);}
  var cc=r(),s1=r()<.5?-1:1;if(cc<.62){car(g,gx+s1*1.2,f+3.2+r()*1.2,r()<.8?0:Math.PI,(r()*7)|0,r);if(cc<.2)car(g,gx-s1*1.2,f+3.4,0,(r()*7)|0,r);}
  if(o.hood!==2&&r()<.3){bx(.62,1.05,.7,M.bin,gx+gs*3,.53,f+o.walk-.5,g);bx(.62,1.05,.7,M.binB,gx+gs*3.8,.53,f+o.walk-.5,g);}
  return g;
}
function streetStrip(par,z,len,cx,near,hood){/* asphalt, then on each side a curb and sidewalk (not out on acreage) */
  bx(len,.045,hood===2?6.4:7,M.asphalt,cx,.0225,z,par);if(hood===2||!near)return;
  [-1,1].forEach(function(sd){bx(len,.13,.25,M.curb,cx,.065,z+sd*3.6,par);bx(len,.05,1.6,M.concrete,cx,.025,z+sd*4.5,par);});}
/* pieces of a line from a to b that stay out of the lake: [[from,to],...] */
function dry(a,b,cut){if(!cut)return [[a,b]];var out=[];if(cut[0]>a)out.push([a,Math.min(b,cut[0])]);if(cut[1]<b)out.push([Math.max(a,cut[1]),b]);return out;}
function buildTown(){
  var fz=me.front,hood=h3.hood,lite=small||lowMem,r=rng(131+hood*17);
  var xL=nbs[0]?nbs[0].g.position.x-nbs[0].W/2:-me.W/2,xR=nbs[1]?nbs[1].g.position.x+nbs[1].W/2:me.W/2;
  var key=[hood,me.W.toFixed(1),me.D.toFixed(1),xL.toFixed(1),xR.toFixed(1),lite].join("|");if(key===townKey&&hoodG)return;townKey=key;
  if(hoodG){world.remove(hoodG);disposeGroup(hoodG);}hoodG=new T.Group();world.add(hoodG);
  var zs=fz+12.3,XF=lite?170:250,XC=hood===2?1e9:hood===1?78:hood===3?92:86,W0=me.W;
  TOWN={zs:zs};
  /* the lake out back, shaped loosely like Spring Valley Lake: a flat shore behind your street, coves on the far side */
  var LK=null,LKH=[];
  if(hood===3){var zsh=-me.D/2-4.6,LA=lite?125:165,LB=40,lzc=zsh-1.5-LB*.8;LK={zsh:zsh,A:LA,B:LB,zc:lzc,pts:[],sh:[]};
    for(var li=0;li<96;li++){var th=li/96*6.2832,lx=LA*Math.cos(th)*(1+.05*Math.sin(3*th+1)+.03*Math.sin(7*th)),lz=lzc+LB*Math.sin(th)*(1+.08*Math.sin(5*th+2));LK.sh.push([lx,lz]);LK.pts.push([lx,Math.min(lz,zsh-1.5)]);}
    var wgeo=new T.ShapeGeometry(new T.Shape(LK.pts.map(function(q){return new T.Vector2(q[0],-q[1]);})));wgeo.rotateX(-Math.PI/2);
    var wm=new T.Mesh(wgeo,M.water);wm.position.y=.035;wm.receiveShadow=true;hoodG.add(wm);
    var rim=new T.Mesh(wgeo,M.dirt);rim.scale.set((LA+2.5)/LA,1,(LB+2.5)/LB);rim.position.set(0,.006,lzc*(1-(LB+2.5)/LB));hoodG.add(rim);}
  function wet(x,z,m){if(!LK)return false;var ex=x/(LK.A+m),ez=(z-LK.zc)/(LK.B+m);return ex*ex+ez*ez<1&&z<LK.zsh-1.5+m;}
  function cutX(z,m){if(!LK)return null;var ez=(z-LK.zc)/(LK.B+m);if(Math.abs(ez)>=1||z>LK.zsh-1.5+m)return null;var hw=(LK.A+m)*Math.sqrt(1-ez*ez);return [-hw,hw];}
  function cutZ(x,m){if(!LK)return null;var ex=x/(LK.A+m);if(Math.abs(ex)>=1)return null;var dz=(LK.B+m)*Math.sqrt(1-ex*ex);return [LK.zc-dz,Math.min(LK.zc+dz,LK.zsh-1.5+m)];}
  function nearLK(x,z,d){for(var i=0;i<LKH.length;i++)if(Math.hypot(LKH[i][0]-x,LKH[i][1]-z)<d)return true;return false;}
  /* your own front yard */
  if(hood===1||hood===3){lawn(hoodG,0,W0+5,fz+.4,fz+7);tree(hoodG,-(W0/2+1.3),fz+5.3,1);tree(hoodG,W0/2+1.6,fz+5.8,.9);}
  if(hood===3){/* your backyard runs down to the water: lawn, a low view fence, your own dock */
    lawn(hoodG,0,W0+6,LK.zsh+.1,-me.D/2-.2);dock(hoodG,W0/2-3,LK.zsh,r,true);
    bx(W0+6,.05,.05,M.pframe,0,1.05,LK.zsh+.3,hoodG);bx(W0+6,.05,.05,M.pframe,0,.35,LK.zsh+.3,hoodG);for(var fx0=-W0/2-3;fx0<=W0/2+3;fx0+=1.6)if(Math.abs(fx0-(W0/2-3))>1.2)bx(.05,1.1,.05,M.pframe,fx0,.55,LK.zsh+.3,hoodG);
    nbs.forEach(function(nb){var nbk=nb.g.position.z-nb.D/2;lawn(hoodG,nb.g.position.x,nb.W+5,LK.zsh+.1,nbk-.2);dock(hoodG,nb.g.position.x+(nb.g.position.x>0?2:-2),LK.zsh,r,true);});
    /* homes all around the far shore, backs to the water, and the drive that circles behind them */
    var arc=99,lastP=null,ring=[];
    for(var ai=0;ai<720;ai++){var ath=ai/720*6.2832,sx=LA*Math.cos(ath)*(1+.05*Math.sin(3*ath+1)+.03*Math.sin(7*ath)),sz=lzc+LB*Math.sin(ath)*(1+.08*Math.sin(5*ath+2));
      if(lastP)arc+=Math.hypot(sx-lastP[0],sz-lastP[1]);lastP=[sx,sz];if(sz>zsh-10)continue;
      var nx=sx/(LA*LA),nz=(sz-lzc)/(LB*LB),nl=Math.hypot(nx,nz);nx/=nl;nz/=nl;
      if(ai%6===0)ring.push([sx+nx*33,sz+nz*33]);
      var Wl=12.5+r()*5;if(arc<Wl+6.5)continue;arc=0;
      var Dl=9+r()*3,off=1.5+7.5+Dl/2,hx=sx+nx*off,hz=sz+nz*off;if(hz>zsh-16)continue;
      var dd2=Math.hypot(hx,hz);castOn=false;LKH.push([hx,hz]);
      liteHouse(hoodG,{ang:Math.atan2(nx,nz),cx:hx,cz:hz,W:Wl,D:Dl,st:r()<.45?2:1,wall:(r()*WALLS.length)|0,roof:(r()*ROOFS.length)|0,gar:r()<.5?-1:1,walk:7,back:7.5,gap:6.5,lod:dd2<120?1:0,yard:r()<.85?1:0,hood:3,lake:true},r);
      if(r()<.3)palm(hoodG,sx+nx*3,sz+nz*3,7+r()*3,r);}
    for(var ri=1;ri<ring.length;ri++){var p0=ring[ri-1],p1=ring[ri],sl=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);if(sl>30)continue;var rs2=bx(7,.045,sl+1,M.asphalt,(p0[0]+p1[0])/2,.0225,(p0[1]+p1[1])/2,hoodG);rs2.rotation.y=Math.atan2(p1[0]-p0[0],p1[1]-p0[1]);}}
  if(hood===2){
    var x0=-19,x1=19,z0=-me.D/2-15,z1=fz+6.6,post=function(x,z){bx(.14,1.25,.14,M.fence,x,.62,z,hoodG);};
    for(var x=x0;x<=x1;x+=3){post(x,z0);if(Math.abs(x)>3.5)post(x,z1);}for(var z=z0+3;z<z1;z+=3){post(x0,z);post(x1,z);}
    [.5,1.02].forEach(function(y){bx(x1-x0,.09,.06,M.fence,0,y,z0,hoodG);bx(x1-3.5,.09,.06,M.fence,(x0-3.5)/2,y,z1,hoodG);bx(x1-3.5,.09,.06,M.fence,(x1+3.5)/2,y,z1,hoodG);
      bx(.06,.09,z1-z0,M.fence,x0,y,(z0+z1)/2,hoodG);bx(.06,.09,z1-z0,M.fence,x1,y,(z0+z1)/2,hoodG);});
    joshua(hoodG,-13,fz+1.5,r);joshua(hoodG,14,-3,r);joshua(hoodG,-15,-me.D/2-6,r);joshua(hoodG,11,fz+4.5,r);}
  if(hood!==2){
    /* the grid: a street every S meters, homes back to back between them. Street 0 is yours. */
    var S=2*me.D+33.8,kmin=lite?-2:-3,kmax=lite?1:2,lotD=S/2-12.3;
    for(var k=kmin;k<=kmax;k++){var zk=zs+k*S,near=k===0||k===-1;castOn=k===0;
      castOn=false;dry(-XF-30,XF+30,cutX(zk,14)).forEach(function(sg){streetStrip(hoodG,zk,sg[1]-sg[0],(sg[0]+sg[1])/2,near||k===1,hood);});
      [1,-1].forEach(function(side){/* side -1: homes on the -z side of this street, facing it (+z) */
        var zf=zk+side*12.3,dir=-side,rowNear=k===0||(k===-1&&side===1),rowMid=k===-1&&side===-1,xx=-XF;
        while(xx<XF){var Wn=hood===1?12+r()*5:11.5+r()*4.5,gap=hood===1?5.5+r()*1.8:7+r()*4,cx=xx+Wn/2;xx+=Wn+gap;
          if(Math.abs(Math.abs(cx)-XC)<Wn/2+6)continue;
          if(k===0&&side===-1&&cx>xL-gap-Wn/2-1&&cx<xR+gap+Wn/2+1)continue;
          var inner=Math.abs(cx)<XC,lod=inner&&rowNear?2:inner&&rowMid?1:0;
          if(lite&&!inner&&Math.abs(cx)>XF*.8&&r()<.4)continue;
          if(hood===0&&r()<.16){if(lod===2)shrubs(hoodG,cx-Wn/2,cx+Wn/2,zf+dir*-6,5,r,true);continue;}
          castOn=lod===2&&Math.abs(cx)<55;var Dn=Math.min(8.5+r()*3.5,lotD-3.5),hzc=zf-dir*Dn/2,shore=LK&&k===0&&side===-1&&wet(cx,LK.zsh-3,0);
          if(LK&&!shore&&(wet(cx,hzc,14)||wet(cx,zf-dir*lotD,4)||nearLK(cx,hzc,19)))continue;
          liteHouse(hoodG,{x:cx,zf:zf,dir:dir,W:Wn,D:Dn,st:r()<.35?2:1,wall:(r()*WALLS.length)|0,roof:(r()*ROOFS.length)|0,gar:r()<.5?-1:1,
            walk:7,back:lotD-Dn,gap:gap,lod:lod,yard:hood===1||hood===3?(r()<.8?1:0):(r()<.1?1:0),hood:hood,lake:shore,noBack:shore||k===-1&&side===1&&Math.abs(cx)<W0/2+4.4+Wn/2+gap},r);}
        /* street lights and a few cars at the curb on the near streets */
        if(k===0&&side===1)for(var lx=-XC+18;lx<XC;lx+=38+r()*8){var lz=zk+side*4.9;castOn=Math.abs(lx)<55;bx(.14,6.8,.14,M.lamp,lx,3.4,lz,hoodG);bx(.1,.1,1.5,M.lamp,lx,6.75,lz-side*.7,hoodG);bx(.34,.12,.6,M.lamp,lx,6.66,lz-side*1.4,hoodG);}
        if(k===0)for(var cx2=-XC+10;cx2<XC-10;cx2+=16+r()*14){if(r()<.3&&Math.abs(cx2)>W0/2+5){castOn=true;car(hoodG,cx2,zk+side*2.45,side>0?-Math.PI/2:Math.PI/2,(r()*7)|0,r);}}
      });}
    /* cross streets at each end of the block, and the next ones out */
    castOn=false;var za=zs+kmin*S-14,zb=zs+kmax*S+14;
    [-1,1].forEach(function(sd){[XC,XC+170].forEach(function(xc){if(xc>XF)return;dry(za,zb,cutZ(xc,14)).forEach(function(sg){bx(7,.035,sg[1]-sg[0],M.asphalt,sd*xc,.0175,(sg[0]+sg[1])/2,hoodG);});});});
  }else{
    /* acreage: a road out front, big lots along it, and homes scattered across the desert behind */
    streetStrip(hoodG,zs,2*XF+60,0,false,2);bx(2*XF+60,.02,1.4,M.dirt,0,.011,zs-4,hoodG);bx(2*XF+60,.02,1.4,M.dirt,0,.011,zs+4,hoodG);
    [-1,1].forEach(function(side){var xx=side>0?xR+22:xL-22;
      for(var n=0;n<6;n++){var Wn=13+r()*5,cx=xx+side*Wn/2,sb=side,zfa=fz+(r()-.5)*8;castOn=Math.abs(cx)<60;
        liteHouse(hoodG,{x:cx,zf:zfa,dir:1,W:Wn,D:9+r()*3,st:r()<.25?2:1,wall:(r()*WALLS.length)|0,roof:(r()*ROOFS.length)|0,gar:r()<.5?-1:1,walk:zs-3.3-zfa,back:20,gap:28,lod:Math.abs(cx)<90?2:0,yard:0,hood:2},r);
        xx+=sb*(Wn+32+r()*30);if(Math.abs(xx)>XF)break;}});
    for(var n2=0;n2<9;n2++){var Wa=13+r()*5,cxa=-XF*.6+n2*XF*.15+(r()-.5)*20,zfb=zs+26+r()*16;castOn=Math.abs(cxa)<45;
      liteHouse(hoodG,{x:cxa,zf:zfb,dir:-1,W:Wa,D:9+r()*3,st:r()<.25?2:1,wall:(r()*WALLS.length)|0,roof:(r()*ROOFS.length)|0,gar:r()<.5?-1:1,walk:zfb-zs-3.3,back:20,gap:30,lod:Math.abs(cxa)<80?2:0,yard:0,hood:2},r);}
    castOn=false;var bz=-me.D/2-120;bx(2*XF,.04,6,M.asphalt,0,.02,bz,hoodG);
    for(var gx2=-XF;gx2<XF;gx2+=55){for(var gz=-me.D/2-40;gz>-XF;gz-=60){if(r()<.45||Math.abs(gz-bz)<14)continue;var ax=gx2+r()*30,az=gz-r()*25;if(Math.abs(ax)<30&&az>-me.D/2-45)continue;
      liteHouse(hoodG,{x:ax,zf:az,dir:r()<.5?1:-1,W:12+r()*6,D:9+r()*3,st:1,wall:(r()*WALLS.length)|0,roof:(r()*ROOFS.length)|0,gar:1,walk:14,back:14,gap:30,lod:0,yard:0,hood:2},r);
      if(r()<.5)joshua(hoodG,ax+14,az+(r()-.5)*20,r);}}
  }
  /* creosote and brush dotting the open desert between lots and out past the last homes */
  if(hood===0||hood===2){castOn=false;var nB=lite?260:520,rr=hood===2?260:170;for(var q=0;q<nB;q++){var an=r()*6.283,dd=14+Math.pow(r(),.7)*rr,qx=Math.cos(an)*dd,qz=Math.sin(an)*dd;
      var SS=2*me.D+33.8,mz=((qz-zs)%SS+SS)%SS;if(hood===0&&(mz<6||mz>SS-6||Math.abs(Math.abs(qx)-XC)<5))continue;
      if(hood===2&&(Math.abs(qz-zs)<5||Math.abs(qz+me.D/2+120)<5))continue;
      var cb=new T.Mesh(G.bush[q%2],q%3?M.shrub2:M.shrub3),cs=.35+r()*.55;cb.scale.set(cs*1.3,cs*.75,cs*1.2);cb.position.set(qx,cs*.4,qz);hoodG.add(cb);}}
  castOn=true;
  batch({g:hoodG});
  /* one car that drives by now and then, so the street feels lived in */
  mover={g:car(hoodG,0,zs,0,1,rng(5)),t:9,span:Math.min(XF*.7,150),zs:zs};
}
function buildHood(){buildTown();}
function fitShadow(wide){
  var c=sun.shadow.camera,S2=wide?(me.W/2+30):(Math.max(me.W,me.D)*.75+7);
  c.left=-S2;c.right=S2;c.top=S2;c.bottom=-S2;c.near=1;c.far=wide?140:90;c.updateProjectionMatrix();
  sun.position.set(-14,22,16);sun.target.position.set(0,0,0);
}

/* ---------- spinners on the vents, two hose clamps each ---------- */
function spinCount(){return h3.spinOv!==null?h3.spinOv:C.free()+st.spin;}
function buildSpinners(){
  spinners.forEach(function(s){s.par.remove(s.g);if(s.disc){s.par.remove(s.disc);s.par.remove(s.edge);s.disc.geometry.dispose();s.edge.geometry.dispose();}});spinners=[];
  var n=Math.min(spinCount(),me.vents.length);
  for(var i=0;i<n;i++){var v=me.vents[i],g=new T.Group();g.position.set(v.x,me.TT,v.z);
    var pl=new T.Mesh(G.cyl,M.pole);pl.scale.set(.018,.9,.018);pl.position.set(.085,.46,0);pl.castShadow=true;g.add(pl);
    [.1,.27].forEach(function(y){var cl=new T.Mesh(G.clamp,M.clampM);cl.rotation.x=Math.PI/2;cl.scale.set(1.45,1,1);cl.position.set(.035,y,0);g.add(cl);});
    var rot=new T.Group();rot.position.set(.085,.86,0);var hub=new T.Mesh(G.ball,M.pole);hub.scale.setScalar(.05);rot.add(hub);
    /* four mirrored cups on chrome arms, the way real reflective spinners are built */
    for(var b=0;b<4;b++){var arm=new T.Group();arm.rotation.y=b*Math.PI/2;var rod=new T.Mesh(G.cyl,M.chrome);rod.scale.set(.008,.2,.008);rod.rotation.z=Math.PI/2;rod.position.x=.1;arm.add(rod);
      var cup=new T.Mesh(G.cup,b%2?M.chrome:M.bladeR);cup.rotation.x=Math.PI/2;cup.position.set(.2,0,.0);cup.scale.set(1,1.15,1);cup.castShadow=true;arm.add(cup);rot.add(arm);}
    var cap=new T.Mesh(G.ball,M.chrome);cap.scale.set(.035,.05,.035);cap.position.y=.02;rot.add(cap);
    /* how far one spinner's flash reaches on the side of the roof it faces */
    var R2=me.L*1.1,disc=new T.Mesh(new T.CircleGeometry(R2,40,Math.PI,Math.PI),M.reach.clone()),edge=new T.Mesh(new T.RingGeometry(R2-.07,R2,48,1,Math.PI,Math.PI),M.reachLine.clone());
    [disc,edge].forEach(function(o){o.rotation.x=-Math.PI/2;o.position.set(v.x,me.TT+H+.12,v.z);o.visible=false;o.renderOrder=4;v.par.add(o);});
    g.add(rot);v.par.add(g);spinners.push({g:g,rot:rot,face:v.face,x:v.x,z:v.z,par:v.par,s:0,disc:disc,edge:edge});}
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
/* a pigeon: the body is one merged shape with its colors painted on, plus two wings that flap, so a flock stays cheap to draw */
var PIGG=null;M.pigB=Std({vertexColors:true,roughness:.75});
function pigGeo(){if(PIGG)return PIGG;var pos=[],nor=[],col=[],d=new T.Object3D(),c=new T.Color();
  [[G.ball,0x7d8693,[.12,.105,.2],[0,.13,0],0],[G.ball,0x5b7f70,[.07,.08,.07],[0,.2,.12],0],[G.ball,0x4c5461,[.055,.055,.06],[0,.26,.165],0],[G.beak,0x2a2a2a,[1,1,1],[0,.255,.225],Math.PI/2],
   [G.tail,0x626b77,[1,1,1],[0,.12,-.24],-.25],[G.leg,0xc4767a,[1,1,1],[-.03,.04,.02],0],[G.leg,0xc4767a,[1,1,1],[.03,.04,.02],0]].forEach(function(q){
    var g=q[0].index?q[0].toNonIndexed():q[0].clone();d.position.set(q[3][0],q[3][1],q[3][2]);d.scale.set(q[2][0],q[2][1],q[2][2]);d.rotation.set(q[4],0,0);d.updateMatrix();g.applyMatrix4(d.matrix);
    var pa=g.attributes.position.array,na=g.attributes.normal.array;c.setHex(q[1]);for(var i=0;i<pa.length;i++){pos.push(pa[i]);nor.push(na[i]);}for(var j=0;j<pa.length/3;j++)col.push(c.r,c.g,c.b);g.dispose();});
  PIGG=new T.BufferGeometry();PIGG.setAttribute("position",new T.Float32BufferAttribute(pos,3));PIGG.setAttribute("normal",new T.Float32BufferAttribute(nor,3));PIGG.setAttribute("color",new T.Float32BufferAttribute(col,3));PIGG.userData.shared=true;return PIGG;}
function pigeon(){
  var g=new T.Group(),b=new T.Mesh(pigGeo(),M.pigB);b.castShadow=true;g.add(b);
  var wl=new T.Group(),wr=new T.Group();wl.position.set(-.08,.17,-.02);wr.position.set(.08,.17,-.02);
  [[wl,-.1],[wr,.1]].forEach(function(q){var m=new T.Mesh(G.ball,M.wing);m.scale.set(.12,.025,.15);m.position.set(q[1],0,0);m.castShadow=true;q[0].add(m);g.add(q[0]);});
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
  birds.forEach(function(b){if(b.kind==="N"){b.kt=0;return;}b.kt=stg>=1&&b.kind==="U"?1:stg>=2&&covered(b)?1:0;if(snap)b.k=b.kt;});
}

/* ---------- demo pieces: dirty glass, screens, dusty panels ---------- */
var demoWin=null,scrWin=null,haze=null,screens=[],sillDust=new T.Color(0xcbbfa7);
function prepDemo(){
  var w=demoWin;if(!w)return;
  var hc=hazeCanvas(256,212,5),ht=tx(hc,false),hm=new T.Mesh(G.plane,new T.MeshBasicMaterial({map:ht,transparent:true,depthWrite:false}));
  hm.scale.set(w.gw,w.gh,1);hm.position.z=.103;hm.visible=false;w.g.add(hm);haze={c:hc,t:ht,m:hm,w:w,last:null};
  screens=[];
  var list=[demoWin].concat(me.wins.filter(function(x){return x!==demoWin&&x.ang===0&&(!h3.custom||x.s);}));
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
/* look: false new, "dirty" dusty but whole, true torn and sagging */
function screenLook(s,old){
  if(s.old===old&&s.pet===st.pet)return;s.old=old;s.pet=st.pet;var torn=old===true;
  s.mesh.material=old?M.scrOld:(st.pet?M.scrA:M.scrC);s.dmg.visible=torn;
  s.fr.forEach(function(f){f.material=old?M.sframeOld:M.sframe;});old=torn;
  [s.geo,s.dmg.geometry].forEach(function(geo){var a=geo.attributes.position.array;
    for(var i=0;i<a.length;i+=3){var u=a[i]/s.gw+.5,v=a[i+1]/s.gh+.5;a[i+2]=old?-.03*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)+.002:0;}
    geo.attributes.position.needsUpdate=true;});
}
/* ---------- your home the way it looks today: every problem you checked, right on the house ---------- */
var bef={win:0,scr:0,sol:0,pig:0},befOn=false,forceProb=null,grime=[],poop=[],nests=[],dmgSel=0,dmgStop=-1,befPts={};
/* months of dust, sprinkler spots and drip lines on the glass */
M.grime=new T.MeshBasicMaterial({map:tx(cv(256,212,function(g,w,h){var r=rng(17);g.fillStyle="rgba(186,170,140,.58)";g.fillRect(0,0,w,h);blot(g,w,h,r,22,"150,130,98",.3,38);
  var gr=g.createLinearGradient(0,h*.55,0,h);gr.addColorStop(0,"rgba(160,140,108,0)");gr.addColorStop(1,"rgba(150,128,96,.5)");g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(var i=0;i<90;i++){var x=r()*w,y=r()*h,rr=1.5+r()*5;g.strokeStyle="rgba(250,248,240,"+(.35+r()*.4).toFixed(2)+")";g.lineWidth=1+r();g.beginPath();g.arc(x,y,rr,0,7);g.stroke();}
  for(var k=0;k<16;k++){var sx=r()*w,sy=h*(.15+r()*.4);g.strokeStyle="rgba(120,100,72,"+(.25+r()*.25).toFixed(2)+")";g.lineWidth=1.5+r()*2;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+(r()-.5)*5,h);g.stroke();}
  dots(g,w,h,r,900,"110,92,64",.15,.4,1,2);})),transparent:true,depthWrite:false});
M.poop=Std({color:0xf3f1ea,roughness:1});M.nest=Std({color:0x7b6446,roughness:1,flatShading:true});
function prepBefore(){
  grime=[];poop=[];nests=[];befPts={};var r=rng(st.panels*13+h3.style+5);
  me.wins.forEach(function(w){if(w.ang!==0)return;var m=new T.Mesh(G.plane,M.grime);m.scale.set(w.gw,w.gh,1);m.position.z=.104;m.visible=false;m.renderOrder=2;w.g.add(m);grime.push(m);});
  var d=new T.Object3D();
  [1,-1].forEach(function(fc){var f=fc>0?me.F:me.B,list=[],nl=[],tw=[];
    /* white droppings on the tile, heaviest along the ridge where they perch, and on the panels */
    spots(me,fc,fc>0?30:22,r).forEach(function(q){var near=q.z<-me.L/2+1.4;list.push([q.x,me.TT-.012,q.z,(near?.08:.05)+r()*.08]);if(near&&r()<.6)list.push([q.x+(r()-.5)*.3,me.TT-.012,q.z+.25+r()*.4,.04+r()*.05]);});
    me.panels.forEach(function(p){if(p.face!==fc)return;var n=r()<.65?1+((r()*3)|0):0;for(var i=0;i<n;i++)list.push([p.x+(r()-.5)*.8,me.TT+H+.03,p.z+(r()-.5)*1.4,.025+r()*.045,1]);});
    if(fc>0&&list.length)befPts.poop={par:f,p:V(list[0][0],list[0][1]+.05,list[0][2])};
    var im=new T.InstancedMesh(G.ball,M.poop,Math.max(1,list.length));im.count=list.length;
    list.forEach(function(q,i){d.position.set(q[0],q[1],q[2]);d.rotation.set(0,r()*3,0);d.scale.set(q[3],q[4]?.006:.028,q[3]*(.7+r()*.5));d.updateMatrix();im.setMatrixAt(i,d.matrix);});
    im.visible=false;im.frustumCulled=false;f.add(im);poop.push(im);
    /* nests stuffed under the edges of the panels: a clump and some sticks poking out */
    me.edges.filter(function(e){return e[4]===fc;}).sort(function(){return r()-.5;}).slice(0,fc>0?4:3).forEach(function(e){var ox=e[2]?e[3]*.16:0,oz=e[2]?0:e[3]*.16;nl.push([e[0]+ox,me.TT+.06,e[1]+oz]);
      for(var k=0;k<5;k++)tw.push([e[0]+ox*1.4+(r()-.5)*.3,me.TT+.05+r()*.06,e[1]+oz*1.4+(r()-.5)*.3,r()*3]);});
    if(fc>0&&nl.length){befPts.nest={par:f,p:V(nl[0][0],nl[0][1]+.08,nl[0][2])};befPts.smell={par:f,p:V((nl[1]||nl[0])[0],(nl[1]||nl[0])[1]+.3,(nl[1]||nl[0])[2])};}
    var nm=new T.InstancedMesh(G.bush[1],M.nest,Math.max(1,nl.length)),tm=new T.InstancedMesh(G.box,M.nest,Math.max(1,tw.length));nm.count=nl.length;tm.count=tw.length;
    nl.forEach(function(q,i){d.position.set(q[0],q[1],q[2]);d.rotation.set(0,r()*3,0);d.scale.set(.24,.1,.2);d.updateMatrix();nm.setMatrixAt(i,d.matrix);});
    tw.forEach(function(q,i){d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],(r()-.5)*.5);d.scale.set(.32,.012,.012);d.updateMatrix();tm.setMatrixAt(i,d.matrix);});
    [nm,tm].forEach(function(m){m.visible=false;m.frustumCulled=false;m.castShadow=true;f.add(m);nests.push(m);});});
}
/* which problems are on this home, in the order the tour walks them */
function probs(){var p=[];if(st.win||st.hw)p.push("win");if(st.scr)p.push("scr");if(me&&me.panels.length){if(st.sol&&!st.pig)p.push("sol");if(st.pig)p.push("pig");}return p;}
function tourOn(){return !!me&&((overlay&&mode==="home"&&!obdOpen)||!!forceProb);}
function stopIdx(k,ph){var TS=tourStops();for(var i=0;i<TS.length;i++)if(TS[i].k===k&&(TS[i].ph||0)===ph)return i;return -1;}
function tourAt(){var TS=tourStops();return Math.min(stepAt(steps()),TS.length-1);}
/* is this problem still showing? before its Fix it step, yes */
function broken(k,ph){if(forceProb)return forceProb===k;if(!tourOn())return false;var j=stopIdx(k,ph||1);return j>=0&&tourAt()<j;}
function applyBefore(dt){
  var on=tourOn(),P2=on?probs():[],snap=!!forceProb||dt===0;
  var tgt={win:broken("win")?0:1,scr:broken("scr")?0:1,sol:(broken("sol")||broken("pig"))?0:1,pig:broken("pig")?0:1};
  for(var k in bef){bef[k]=snap?tgt[k]:bef[k]+(tgt[k]-bef[k])*Math.min(1,dt*2.2);if(Math.abs(bef[k]-tgt[k])<.01)bef[k]=tgt[k];}
  befOn=on&&(P2.length>0||!!forceProb);
  var hasWin=P2.indexOf("win")>=0||forceProb==="win",hasScr=P2.indexOf("scr")>=0||forceProb==="scr";
  M.grime.opacity=1-bef.win;grime.forEach(function(m){m.visible=befOn&&hasWin&&bef.win<.99;});
  if(befOn&&(hasWin||hasScr)){screens.forEach(function(sc){sc.g.visible=true;var torn=hasScr&&bef.scr<.5,dirty=!torn&&hasWin&&bef.win<.5;screenLook(sc,torn?true:dirty?"dirty":false);
    var hang=torn&&sc.w===scrWin;sc.g.position.set(sc.x0,hang?-.1:0,.14);sc.g.rotation.set(0,0,hang?-.26:0);});}
  var dusty=befOn&&(P2.indexOf("sol")>=0||P2.indexOf("pig")>=0||forceProb==="sol"||forceProb==="pig");
  if(dusty)me.panels.forEach(function(p){p.dust.visible=bef.sol<.99;p.dust.material.opacity=1-bef.sol;});
  var pigNow=befOn&&(P2.indexOf("pig")>=0||forceProb==="pig");
  poop.concat(nests).forEach(function(m){m.visible=pigNow&&bef.pig<.5;});
}
/* where to tap for what each problem does */
var DM={win:["Dust and sprinkler spots bake on in the sun and dull the light coming in.","Gray, dusty screens block more light than most people think, and the dirt washes back onto clean glass."],
  hw:"White spots are minerals left by sprinkler water. Left alone, they etch into the glass.",
  scr:["Tears let bugs and dust in, and they only get bigger in the wind.","Sun makes builder mesh brittle, so it sags and pulls loose from the frame."],
  sol:["A film of dust blocks sunlight from the cells, and we get little rain to wash it off.","Your solar app shows it: output drifts down between washes."],
  pig:["Droppings stain the tile and the panels, and they pile up fast where the birds perch.","Nests under the panels hold dry twigs and debris right against the wiring.","The smell. Droppings and old nests give off a sharp ammonia smell that gets worse in the summer heat. We clean it all out and sanitize, so the smell leaves with them.","Pigeons come back to the same roof, and one pair turns into a flock."]};
function dmgList(k){if(k==="win"){var a=DM.win.slice();if(st.hw)a.push(DM.hw);return a;}return DM[k]||[];}
function dmgPos(k,i){var w=demoWin,sw=scrWin,q;
  if(k==="win")return [toWorld(w.g,-w.gw/4,.15,.16),toWorld(w.g,w.gw/4,-.1,.2),toWorld(w.g,-w.gw/4,-w.gh/2+.2,.16)][i];
  if(k==="scr")return [toWorld(sw.g,sw.gw/4,.1,.22),toWorld(sw.g,sw.gw/2-.06,-sw.gh/2+.12,.22)][i];
  if(k==="sol"){var ps=me.panels.filter(function(p){return p.face>0;});q=ps[i*Math.max(1,ps.length-1)]||me.panels[i]||me.panels[0];return q&&toWorld(q.par,q.x,me.TT+H+.1,q.z);}
  if(k==="pig"){var b=[befPts.poop,befPts.nest,befPts.smell][i];if(b)return toWorld(b.par,b.p.x,b.p.y,b.p.z);if(i===3)return V(0,me.wallH+me.rise+.6,0);}
  return null;}
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
  /* polo collar and a small gold crest on the chest */
  part(G.cyl,M.collar,.105,.035,.09,0,1.585,.01);part(G.box,M.band,.05,.04,.01,-.09,1.4,.132);
  /* head: neck, ears, nose, mouth, sunglasses, cap, all turning together */
  part(G.cyl,M.skin,.05,.1,.05,0,0,0,head);part(G.ball,M.skin,.108,.125,.115,0,.14,.01,head);part(G.ball,M.skin,.07,.05,.07,0,.06,.035,head);
  part(G.ball,M.hair,.113,.106,.112,0,.162,-.022,head);
  [-1,1].forEach(function(sd){part(G.ball,M.skin,.02,.036,.028,sd*.108,.135,0,head);});
  part(G.ball,M.skin,.017,.026,.022,0,.128,.123,head);part(G.box,M.lip,.045,.009,.01,0,.085,.108,head);
  part(G.box,M.shades,.16,.036,.014,0,.162,.1,head);[-1,1].forEach(function(sd){part(G.box,M.shades,.008,.01,.1,sd*.098,.166,.05,head);});
  var cr=part(G.cup,M.hat,1.55,1.25,1.6,0,.2,-.005,head);cr.rotation.x=0;part(G.box,M.hat,.17,.012,.12,0,.2,.14,head);part(G.box,M.band,.04,.028,.004,0,.245,.112,head);
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
  if(ED&&!((m==="home"&&ED.t==="home")||(m==="com"&&ED.t==="shop")))edStop();
  if(!me)buildMe();
  mode=m;if(!keepT)tl=0;auto=true;say("");
  flight=null;focusShot=null;
  ensureScene();
  if(keyOf(cfgMe())!==builtKey)buildMe();
  if(m==="pig"){buildNeighbors();buildBirds();h3.stage=0;birdTargets(true);}
  else{birds.forEach(function(b){world.remove(b.m);});birds=[];buildNeighbors();}
  if((m==="win"||m==="sol"||m==="scr")&&!worker)makeWorker();
  if(m==="win"&&h3.view===1&&!room)buildRoom();
  if(m==="win"){resetHaze();if(room)resetRoom();}
  if(m==="sol")me.panels.forEach(function(p){p.dust.material.opacity=1;});
  ov.setAttribute("data-mode",m);
  $$(".ov-tabs [data-hmode]").forEach(function(b){b.setAttribute("aria-selected",String(b.getAttribute("data-hmode")===m));});
  $$(".ov-panel .ops").forEach(function(p){p.hidden=p.getAttribute("data-for")!==m;});
  $("ovT").textContent={show:"Your home in 3D",home:"Your home in 3D",win:"Window cleaning in 3D",sol:"Solar cleaning in 3D",scr:"Screen repair in 3D",pig:"Pigeon proofing in 3D",com:st.ctype?"Your building in 3D":"Your storefront in 3D"}[m];
  if(!keepT)user=false;goal=preset();if(!keepT){cur=null;}
  syncControls();summary();
}
function resetRoom(){room.haze.done=undefined;room.haze.clear=false;var pg=room.puddle.c.getContext("2d"),np=puddleCanvas();pg.clearRect(0,0,256,32);pg.drawImage(np,0,0);room.puddle.t.needsUpdate=true;var g=room.haze.c.getContext("2d"),n=hazeCanvas(256,212,9);g.globalCompositeOperation="copy";g.drawImage(n,0,0);g.globalCompositeOperation="source-over";room.haze.t.needsUpdate=true;room.haze.last=null;room.puddle.m.material.opacity=1;}
function replay(){tl=0;user=false;if(mode==="win"){resetHaze();if(room)resetRoom();}if(mode==="sol")me.panels.forEach(function(p){p.dust.material.opacity=1;});if(mode==="pig"){h3.stage=0;auto=true;birdTargets(false);}track("replay_3d",{mode:mode});}

/* each frame, put everything where the timeline says it should be */
/* ---------- conditions: today's sky and wind from the nearest weather station, or pick sunny, windy or cloudy ---------- */
var WX={mode:"today",live:null,cover:.2,wind:6,v:new T.Vector2(-.8,.6),rain:false,asked:false};
var WXP={sun:{cover:.12,wind:5,from:250},wind:{cover:.3,wind:30,from:260},cloud:{cover:.88,wind:9,from:230}};
function wxStation(){return C.ie&&C.ie()?["KONT","Ontario"]:["KVCV","Victorville"];}
function wxFetch(){if(WX.asked)return;WX.asked=true;var sn=wxStation(),key="tqwx_"+sn[0];
  try{var c=JSON.parse(sessionStorage.getItem(key)||"null");if(c&&Date.now()-c.t<18e5){WX.live=c.d;applyWx();return;}}catch(e){}
  if(!window.fetch){applyWx();return;}var ctl=window.AbortController?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort();},4500);
  fetch("https://api.weather.gov/stations/"+sn[0]+"/observations/latest",ctl?{signal:ctl.signal}:{}).then(function(r){return r.ok?r.json():null;}).then(function(j){clearTimeout(to);
    var p=j&&j.properties;if(!p){applyWx();return;}var amt={CLR:.04,SKC:.04,FEW:.25,SCT:.45,BKN:.75,OVC:.95},cov=.08;(p.cloudLayers||[]).forEach(function(l){if(amt[l.amount]!==undefined)cov=Math.max(cov,amt[l.amount]);});
    var ws=p.windSpeed&&p.windSpeed.value!=null?p.windSpeed.value*.621:null,txt=String(p.textDescription||"");
    var d={cover:cov,wind:ws===null?6:Math.round(ws),from:p.windDirection&&p.windDirection.value!=null?p.windDirection.value:250,rain:/rain|drizzle|shower|thunder/i.test(txt),text:txt,name:sn[1]};
    WX.live=d;try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),d:d}));}catch(e){}applyWx();}).catch(function(){clearTimeout(to);applyWx();});}
function wxNow(){if(WX.mode==="today"&&WX.live)return WX.live;return WXP[WX.mode]||WXP.sun;}
function applyWx(){var w=wxNow(),cov=w.cover,dust=clamp01((w.wind-14)/18);WX.cover=cov;WX.wind=w.wind;WX.rain=!!w.rain;
  var b=((w.from||250)+180)*Math.PI/180;WX.v.set(-Math.sin(b),Math.cos(b));windV.value.copy(WX.v);windA.value=.35+Math.min(4,w.wind/8);
  paintClouds(WX.rain?Math.max(.85,cov):cov);var oc=clamp01((cov-.35)/.6);
  skyU.top.value.setHex(0x2a6cbd).lerp(new T.Color(0x7d93ab),oc);skyU.mid.value.setHex(0x6aa7de).lerp(new T.Color(0xa9b8c7),oc);skyU.hor.value.setHex(HOR).lerp(new T.Color(0xd9ddde),oc).lerp(new T.Color(0xdcd2bf),dust*.7);
  sun.intensity=2.2-1.25*oc-.3*dust;HEMI.intensity=.62+.4*oc;R.toneMappingExposure=1.02+.1*oc;
  scene.fog.color.copy(skyU.hor.value);scene.fog.near=110-55*dust-20*oc;scene.fog.far=520-230*dust-80*oc;
  dustFx.m.visible=w.wind>=12;dustFx.u.uOp.value=.25+dust*.55;rainFx.m.visible=WX.rain;wxChip();}
function wxChip(){var b=$("wxChip");if(!b)return;var w=wxNow(),live=WX.mode==="today"&&WX.live;
  var sky=WX.rain?"rain":w.cover>.7?"cloudy":w.cover>.4?"partly cloudy":"clear";
  b.textContent=(WX.mode==="today"?(live?"Today in "+WX.live.name+": ":"A typical day: "):{sun:"Sunny: ",wind:"Windy: ",cloud:"Cloudy: "}[WX.mode])+sky+", "+Math.round(w.wind)+" mph wind";}
/* blowing dust, carried by the wind and wrapped around the house */
var dustFx=(function(){var n=small||lowMem?260:520,pos=new Float32Array(n*3),ar=new Float32Array(n),r=rng(101);for(var i=0;i<n;i++){pos[i*3]=(r()-.5)*90;pos[i*3+1]=.1+Math.pow(r(),2)*6;pos[i*3+2]=(r()-.5)*90;ar[i]=r();}
  var g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(pos,3));g.setAttribute("aR",new T.BufferAttribute(ar,1));
  var u={uT:{value:0},uV:{value:new T.Vector2()},uOp:{value:.4},uS:{value:900},uC:{value:new T.Color(0xcdbb98)}};
  var m=new T.Points(g,new T.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,
    vertexShader:"uniform float uT;uniform vec2 uV;uniform float uS;attribute float aR;varying float vA;void main(){vec3 p=position;p.xz=mod(p.xz+uV*uT*(0.7+aR*0.6)+45.0,90.0)-45.0;p.y+=sin(uT*1.7+aR*6.28)*0.25;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=clamp(uS*(0.04+aR*0.07)/-mv.z,1.0,9.0);vA=smoothstep(0.0,6.0,-mv.z)*(1.0-smoothstep(60.0,90.0,-mv.z));gl_Position=projectionMatrix*mv;}",
    fragmentShader:"uniform vec3 uC;uniform float uOp;varying float vA;void main(){float d=length(gl_PointCoord-0.5);gl_FragColor=vec4(uC,smoothstep(0.5,0.05,d)*uOp*vA);}"}));
  m.frustumCulled=false;m.visible=false;m.renderOrder=5;scene.add(m);return {m:m,u:u};})();
/* rain, only when the station says it's actually raining */
var rainFx=(function(){var n=small||lowMem?300:600,pos=new Float32Array(n*6),r=rng(202);for(var i=0;i<n;i++){var x=(r()-.5)*50,y=r()*22,z=(r()-.5)*50;pos.set([x,y,z,x,y+.45,z],i*6);}
  var g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(pos,3));var u={uT:{value:0},uV:{value:new T.Vector2()}};
  var m=new T.LineSegments(g,new T.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,
    vertexShader:"uniform float uT;uniform vec2 uV;void main(){vec3 p=position;float f=mod(p.y-uT*11.0,22.0);p.xz+=uV*(22.0-f)*0.08;p.y=f;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}",
    fragmentShader:"void main(){gl_FragColor=vec4(0.78,0.84,0.9,0.35);}"}));m.frustumCulled=false;m.visible=false;scene.add(m);return {m:m,u:u};})();
/* a couple of tumbleweeds rolling down the street when it blows, out in the desert and on acreage */
var tumbles=[0,1].map(function(i){var t=new T.Mesh(G.bush[i],new T.MeshBasicMaterial({color:0x9a8158,wireframe:true}));t.scale.setScalar(.42+i*.08);t.visible=false;scene.add(t);return {m:t,t:i*7,z:0};});
function weather(dt){var w=WX.wind;windU.value+=dt*(.8+w/12);skyU.off.value=(skyU.off.value+dt*(.00025+w*.00003)*(WX.v.x>0?1:-1)+1)%1;
  dustFx.u.uT.value+=dt;dustFx.u.uV.value.copy(WX.v).multiplyScalar(w*.22);dustFx.u.uS.value=R.domElement.height*.5/Math.tan(cam.fov*Math.PI/360);
  rainFx.u.uT.value+=dt;rainFx.u.uV.value.copy(WX.v).multiplyScalar(Math.min(1,w/20));
  if(me&&rainFx.m.visible)rainFx.m.position.set(cur?cur.tx:0,0,cur?cur.tz:0);
  var roll=w>=15&&(h3.hood===0||h3.hood===2)&&TOWN.zs!==undefined&&!comOn(),sx=WX.v.x>=0?1:-1;
  tumbles.forEach(function(tb,i){tb.m.visible=roll;if(!roll)return;tb.t+=dt;var sp=2.2+w*.12,x=-sx*60+sx*((tb.t*sp)%120);
    tb.m.position.set(x,.42+Math.abs(Math.sin(tb.t*2.6+i))*.35,TOWN.zs+(i?1.8:-1.5));tb.m.rotation.z=-sx*tb.t*sp/.45;tb.m.rotation.y=i;});}
/* the street keeps living: a breeze in the trees, clouds drifting, a car going by every so often */
function drive(dt){weather(dt);TX.ripple.offset.x=(TX.ripple.offset.x+dt*.012)%1;if(!mover||!mover.g.parent||ED)return;
  var sp=10,cyc=2*mover.span/sp+12;mover.t+=dt;var ph=mover.t%cyc,dir=Math.floor(mover.t/cyc)%2?-1:1,x=dir*(-mover.span+ph*sp),on=ph*sp<2*mover.span;
  mover.g.visible=on;if(!on)return;mover.g.position.set(x,0,mover.zs+dir*1.75);mover.g.rotation.y=dir>0?Math.PI/2:-Math.PI/2;}
function frame(dt){
  var pristine=mode==="show"||mode==="home";drive(dt);
  if(ED){if(com&&ED.t==="shop"){com.grime.visible=false;if(com.patio)com.patio.visible=false;if(com.patio2)com.patio2.visible=false;}else edHide(true);return;}
  if(comOn()){comFrame(dt);return;}
  screens.forEach(function(s){s.g.visible=false;});
  if(mode!=="sol")me.panels.forEach(function(p){p.dust.visible=false;});
  applyBefore(dt);
  /* in the tour, pigeons sit on your roof until you tap Fix it, then the mesh and spinners go on */
  var homePig=befOn&&(probs().indexOf("pig")>=0||forceProb==="pig"),pst=homePig?(broken("pig",1)?0:broken("pig",2)?1:2):-1;
  if(homePig){if(!birds.length)buildBirds();if(h3.stage!==pst){h3.stage=pst;birdTargets(!!forceProb||dt===0);}}
  /* pigeon mesh, clips, spinners, coverage */
  var meshOn=mode==="pig"?h3.stage>=1:homePig?pst>=1:!!st.pig,spinOn=mode==="pig"?h3.stage>=2:homePig?pst>=2:!!st.pig;
  me.ms=me.ms===undefined?1:me.ms;var msT=meshOn?1:0;me.ms+=(msT-me.ms)*Math.min(1,dt*2.4);if(Math.abs(me.ms-msT)<.003)me.ms=msT;
  me.skirt.forEach(function(s){s.visible=me.ms>.02;s.scale.y=H*Math.min(1,me.ms*1.4);s.position.y=s.userData.y0+s.scale.y/2;});
  if(me.clipIM)me.clipIM.visible=me.ms>.75;
  spinners.forEach(function(s,i){s.s+=((spinOn?1:0)-s.s)*Math.min(1,dt*3);s.g.visible=s.s>.02;s.g.scale.setScalar(Math.max(.001,s.s));s.rot.rotation.y+=dt*(3.2+i*.3);});
  [1,-1].forEach(function(k){if(cover[k]&&cover[k].m)cover[k].m.visible=false;});
  /* one spinner's reach: the first spinner pulses in step 4, every spinner shows when coverage is switched on */
  var pulse=.18+.12*Math.sin(tl*4);
  spinners.forEach(function(sp,i){var on=mode==="pig"&&h3.stage>=2&&((h3.stage===3&&i===0)||(h3.cov&&h3.stage===2));if(!sp.disc)return;sp.disc.visible=sp.edge.visible=on&&sp.s>.5;if(on){sp.disc.material.opacity=h3.stage===3?pulse+.08:.2;}});
  /* birds fly between your roof and the roofs next door */
  birds.forEach(function(b){var bv=mode==="pig"||homePig;b.m.visible=bv;if(!bv)return;
    if(b.k!==b.kt){b.k+=(b.kt>b.k?1:-1)*dt*.55;b.k=clamp01(b.k);if(Math.abs(b.k-b.kt)<.01)b.k=b.kt;}
    var flying=b.dest&&b.k>0&&b.k<1;
    if(b.dest){b.m.position.copy(b.base).lerp(b.dest,smooth(b.k));b.m.position.y+=Math.sin(b.k*Math.PI)*4.5;
      if(flying)b.m.rotation.y=Math.atan2((b.dest.x-b.base.x)*(b.kt?1:-1),(b.dest.z-b.base.z)*(b.kt?1:-1));else b.m.rotation.y=b.ry;}
    var fl=flying?Math.sin(tl*22+b.ph)*.9:0;b.m.userData.w[0].rotation.z=fl;b.m.userData.w[1].rotation.z=-fl;
  });
  /* haze off unless the window demo is running */
  haze.m.visible=mode==="win"&&h3.view===0&&tl<9.3;
  if(demoWin)demoWin.sillM.color.copy(me.mats.trim.color);
  if(room)room.g.visible=mode==="win"&&h3.view===1;
  if(worker){worker.visible=false;hideTools();}
  if(mode==="win"){if(h3.view===0)winOutside();else winInside();}
  else if(mode==="sol")solar();
  else if(mode==="scr")screensDemo();
  else if(mode==="pig")pigAuto();
  else if(mode==="home"&&overlay){if(obdOpen)say("");else tourSay();}
  if(pristine&&mode==="show"){}
}
function msgAt(list){var s="";for(var i=0;i<list.length;i++)if(tl>=list[i][0])s=list[i][1];return s;}
var lastMsg="";
function say(html,cls){var m=$("ovMsg"),mt=$("ovMsgT")||m;if(!overlay){m.hidden=true;return;}if(!html){m.hidden=true;lastMsg="";return;}if(html!==lastMsg){mt.innerHTML=html;lastMsg=html;msgH=-1;}m.className="ov-msg"+(cls?" "+cls:"");m.hidden=false;}
/* keep the home centered in the part of the view the note doesn't cover */
var msgH=0,lift=0,edH=-1;
function liftView(dt){var m=$("ovMsg"),want=0;if(overlay&&ED&&!edbar.hidden){if(edH<0)edH=edbar.offsetHeight;want=Math.min(host.clientHeight*.4,(edH+12)*.5);}
  else if(overlay&&!m.hidden){if(msgH<0)msgH=m.offsetHeight;want=Math.min(host.clientHeight*.3,(msgH+10)*.5);}
  lift+=(want-lift)*Math.min(1,dt*5);if(Math.abs(lift-want)<.5)lift=want;var w=host.clientWidth,h=host.clientHeight;
  if(lift>.5&&w&&h)cam.setViewOffset(w,h,0,Math.round(lift),w,h);else if(cam.view&&cam.view.enabled)cam.clearViewOffset();}
/* notes wait for the reader: each one holds until Next, and Back steps back */
function steps(){
  if(ED)return null;
  if(mode==="win")return h3.view===1?[0,1.2,5.0,8.4]:[0,1.4,6.4,7.8,9.3];
  if(mode==="sol"){var n=me.panels.filter(function(p){return p.face>0;}).length,per=Math.min(.55,11/Math.max(1,n));return [0,1.4,1.4+n*per+.6];}
  if(mode==="scr")return [0,1,3.6];
  if(mode==="pig")return [0,2.2,5.6,9,12.4];
  if(mode==="home"&&overlay&&!obdOpen)return tourStops().map(function(x,i){return i;});
  if(mode==="com"&&overlay)return comStops().map(function(x,i){return i;});
  return null;
}
function stepAt(S){var i=0;for(var k=0;k<S.length;k++)if(tl>=S[k]-1e-4)i=k;return i;}
function advance(dt){var S=overlay&&steps();if(!S){tl+=dt;return;}var i=stepAt(S),hold=i+1<S.length?S[i+1]-.001:Infinity;if(tl<hold)tl=Math.min(hold,tl+dt);}
function rewind(t){tl=t;if(mode==="win"){resetHaze();if(room)resetRoom();}if(mode==="pig")auto=true;}
function stepNav(){var nav=$("ovNav");if(!nav)return;var S=overlay&&steps();nav.hidden=!S;if(!S)return;var i=stepAt(S),last=i===S.length-1,holding=!last&&tl>=S[i+1]-.0015;
  var c=(i+1)+" of "+S.length;if($("ovStep").textContent!==c)$("ovStep").textContent=c;
  var nx=nav.querySelector(".nx"),lbl=last?"Watch again":"Next ›";if(mode==="home"&&!obdOpen||mode==="com"){var cs=(mode==="com"?comStops():tourStops())[i];if(cs&&cs.ph===0)lbl="Fix it ›";else if(last)lbl="Start over";}if(nx.textContent!==lbl)nx.textContent=lbl;nx.classList.toggle("ready",holding);
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
  /* the brush glides along one continuous path, and each panel clears as the brush passes over it */
  var u=clamp01((t-start)/(end-start))*Math.max(0,n-1);
  list.forEach(function(p,i){p.dust.material.opacity=t<start?1:1-smooth((u-i+.35)/.7);});
  back.forEach(function(p){p.dust.material.opacity=1-smooth((t-end)/.8);});
  var gp=me.groups.filter(function(g){return g.face>0;})[0];
  if(gp){worker.visible=true;
    var feet=toWorld(me.F,gp.cx,me.TT-.02,Math.min(me.L/2-.35,gp.bottom+.7));placeWorker(feet,V(0,0,-1));
    tools.cart.visible=true;tools.cart.position.set(gp.cx+2.2,0,me.front+2.2);hose(worker.localToWorld(V(.1,.95,-.05)),toWorld(me.F,gp.cx+.6,me.TT,me.L/2+OV*.6),tools.cart.position.clone().add(V(0,.9,0)));
    var ia=Math.min(n-1,Math.floor(u)),ib=Math.min(n-1,ia+1),fr=u-ia,pa=list[ia],pb=list[ib],same=pa.row===pb.row,ef=same?fr:smooth(fr);
    var bx=lerp(pa.x,pb.x,ef),bz=lerp(pa.z,pb.z,ef)+(t>start&&t<end?Math.sin(tl*9)*.12:0);
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
  if(auto){var s=tl<2.2?0:tl<5.6?1:tl<9?2:tl<12.4?3:4;if(s!==h3.stage){h3.stage=s;birdTargets(false);syncControls();}}
  var mine={1:0,"-1":0,0:0},nbN=0,U=0;
  birds.forEach(function(b){if(b.kind==="N"){nbN++;return;}if(!b.kt){if(b.kind==="U")U++;else mine[b.face]++;}else nbN++;});
  var left=mine[1]+mine[-1]+mine[0]+U,sb=0,sf=0,sc=spinners.length;spinners.forEach(function(s){if(s.face>0)sf++;else sb++;});
  var all=birds.filter(function(b){return b.kind!=="N";}).length;
  if(h3.stage===3){say("<b>What one spinner covers.</b> Its mirrored cups throw flashes of light across the side of the roof it faces, about this far. The ridge blocks it from the other side, so a roof with birds on both sides needs at least 2. That's why 2 to 3 come free.","ok");return;}
  if(h3.stage===4){say("<b>What happens next door.</b> With your roof closed off, the flock moves to the roofs around you: "+nbN+" pigeons next door now. The first home on the block to get protected stays clear, and that's usually when the neighbors start asking who did yours.","ok");return;}
  if(h3.stage===0)say("<b>Today:</b> every roof on the block has pigeons. "+all+" on yours, nesting under the panels and resting on the ridge.");
  else if(h3.stage===1)say("<b>Cleanout and mesh.</b> Nests out, panels cleaned, mesh clipped to the frame. Nothing gets under your panels again, but "+left+" pigeons still land on your open roof. That's the job of the free spinners.","warn");
  else if(!left)say("<b>Your roof is clear.</b> The free spinners keep them from coming back after the cleanout, so they settle on the roofs next door. "+nbN+" pigeons next door now. The first house on the block to protect wins.","ok");
  else if(!sc)say("<b>Mesh only.</b> "+left+" pigeons still sit on your open roof. Add spinners.","warn");
  else if(!sb&&mine[-1])say("<b>"+sc+(sc>1?" spinners only watch":" spinner only watches")+" the front.</b> The ridge blocks the flash, so "+mine[-1]+" pigeons stay on your back side. Add one facing the back.","warn");
  else say("<b>"+left+" pigeon"+(left>1?"s":"")+" still outside the flash</b> at the corners. Add another spinner.","warn");
}

/* ---------- storefronts and office buildings: the commercial side, and the crew's walk up sales tool ---------- */
var comG=null,comKey="",com=null;
function comOn(){return mode==="com"||(mode==="show"&&pageMode==="com");}
/* the storefront or the house, whichever this view is about */
function ensureScene(){if(comOn()){buildCom();world.visible=false;comG.visible=true;comShadow();}else{world.visible=true;if(comG&&comG.visible){comG.visible=false;fitShadow(true);}}}
function comKeyOf(){return [st.ctype,st.cpanes,st.cdoors,st.cstk,st.cin,st.bsq,st.bst,st.bwin,h3.cst,h3.cwc,h3.cac,h3.cname,h3.sv,ED&&ED.t==="shop"?"e":""].join("|");}
/* shop signs and window stickers, painted here; generic names, nobody's real brand */
function signTex(txt,bg,fg){return tx(cv(512,96,function(g,w,h){g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;var fs=54;g.font="bold "+fs+"px sans-serif";while(g.measureText(txt).width>w-30&&fs>22){fs-=4;g.font="bold "+fs+"px sans-serif";}
  g.textAlign="center";g.textBaseline="middle";g.fillText(txt,w/2,h/2+3);}));}
var STK=[["OPEN","#c8462b","#fff",1],["SALE","#f0b040","#103050",0],["NOW HIRING","#ffffff","#103050",0],["HOURS 9 TO 6","#ffffff","#333",0],["WE DELIVER","#1b7a4c","#fff",1],["50% OFF","#c8462b","#fff",0]];
var stkMat=STK.map(function(s){return new T.MeshBasicMaterial({map:tx(cv(128,128,function(g,w,h){g.fillStyle=s[1];if(s[3]){g.beginPath();g.arc(64,64,60,0,7);g.fill();}else g.fillRect(4,24,120,80);
  g.fillStyle=s[2];g.font="bold "+(s[0].length>6?18:30)+"px sans-serif";g.textAlign="center";g.textBaseline="middle";var ws=s[0].split(" ");if(ws.length>2)ws=[ws.slice(0,2).join(" "),ws.slice(2).join(" ")];ws.forEach(function(x,i){g.fillText(x,64,64+(i-(ws.length-1)/2)*24);});})),transparent:true,side:T.DoubleSide});});
M.stripe=new T.MeshBasicMaterial({color:0xf2f2ee});M.metal=Std({color:0xcfd3d8,metalness:.6,roughness:.4});M.dark=Std({color:0x2c2f33,roughness:.7});M.stone=Std({map:TX.cmu,color:0x9a8f80,roughness:.95});
/* pane sizes you can pick for a storefront: small, standard, tall */
var PSZ=[[1.0,1.4],[1.55,2.3],[2.3,2.7]];
var CSTY=[{n:"YOUR SHOP",H:5.4,top:3.55},{n:"YOUR CAFE",H:5.4,top:3.55},{n:"YOUR STORE",H:7.4,top:5.3},{n:"YOUR OFFICE",H:5.2,top:3.35}];
var CWALL=[2,0,5,7],CACC=["#103050","#1b7a4c","#9a2a22","#2b4f8c"],CACC3=[0x103050,0x1b7a4c,0x9a2a22,0x2b4f8c];
function autoShop(){var n=st.cpanes,nd=st.cdoors,two=n>8,n1=two?Math.ceil(n/2):n,n2=n-n1,pw=1.55,dw=1.05,gap=.12,y0=.35,gh=two?2.3:2.7,items=[];
  var W=Math.max(9,n1*(pw+gap)+nd*(dw+gap)+1.4),x=-(n1*(pw+gap)+nd*(dw+gap))/2,doorAt=Math.floor(n1/2);
  function add(cx,cy,w2,h2,door,sz){items.push({u:cx,v:cy,w:w2,h:h2,door:door,sz:sz,stk:0});}
  for(var i=0;i<n1;i++){if(i===doorAt)for(var d=0;d<nd;d++){add(x+dw/2,y0+1.1,dw,2.2,true,1);x+=dw+gap;}add(x+pw/2,y0+gh/2,pw,gh,false,two?1:2);x+=pw+gap;}
  if(n1===0)for(var d2=0;d2<nd;d2++){add(x+dw/2,y0+1.1,dw,2.2,true,1);x+=dw+gap;}
  if(two){var span=n1*(pw+gap)+nd*(dw+gap),tw=span/n2-gap;for(var j=0;j<n2;j++)add(-span/2+j*(tw+gap)+tw/2,y0+gh+.62,tw,.9,false,0);}
  var low=items.filter(function(p){return !p.door&&p.h>1.5;});if(!low.length)low=items.filter(function(p){return !p.door;});
  for(var k=0;k<st.cstk&&low.length;k++)low[k%low.length].stk++;
  return {w:W,items:items};}
function buildCom(force){
  var key=comKeyOf();if(comG&&key===comKey&&!force)return;comKey=key;
  if(h3.shop&&h3.shopSig!==shopSig())h3.shop=null;
  if(comG){scene.remove(comG);disposeGroup(comG);}comG=new T.Group();comG.visible=comOn();scene.add(comG);castOn=true;
  var r=rng(7+st.cpanes*3+st.cdoors),g=comG,panes=[],stickers=[],c={panes:panes,stickers:stickers},editing=!!(ED&&ED.t==="shop");
  if(st.ctype===0){
    /* a storefront: strip center, cafe with a patio, a tall modern glass front, or a standalone office. Your name on the sign. */
    var sty=CSTY[h3.cst]||CSTY[0],lay=h3.shop||autoShop(),W=lay.w,H=sty.H,D=14,y0=.35,wall=WALLS[CWALL[h3.cwc]||2],acc=CACC[h3.cac]||CACC[0];
    var accM=Std({color:CACC3[h3.cac]||CACC3[0],roughness:.7});accM.userData.own=true;
    bx(W,H,D,wall,0,H/2,-D/2,g);bx(W+.1,.5,.4,WALLS[5],0,H+.1,-.1,g);
    if(h3.cst===3){bx(W+.2,1.1,.3,M.stone,0,.55,.02,g);}
    var sm=new T.MeshBasicMaterial({map:signTex((h3.cname||sty.n).toUpperCase(),acc,h3.cac===0?"#f0b040":"#fff")});sm.userData.own=true;
    var sb=new T.Mesh(G.plane,sm);sb.scale.set(Math.min(W-1,7.5),1.1,1);sb.position.set(0,sty.top+.8,.07);g.add(sb);
    bx(W,y0,.3,WALLS[5],0,y0/2,.05,g);
    /* the glass, one group per pane so the editor can move it */
    lay.items.forEach(function(it){var pg=new T.Group();pg.position.set(it.u,it.v,0);if(editing)pg.userData.dyn=true;g.add(pg);var w2=it.door?1.05:it.w,h2=it.door?2.2:it.h;
      bx(w2,h2,.05,M.glass,0,0,.02,pg);bx(w2+.08,.07,.1,M.alum,0,h2/2,.03,pg);bx(w2+.08,.07,.1,M.alum,0,-h2/2,.03,pg);bx(.07,h2,.1,M.alum,-w2/2,0,.03,pg);bx(.07,h2,.1,M.alum,w2/2,0,.03,pg);
      if(it.door){bx(.5,.05,.06,M.metal,.1,0,.1,pg);bx(.07,.4,.06,M.metal,.36,0,.1,pg);}
      var rec={x:it.u,y:it.v,w:w2,h:h2,door:!!it.door,sz:it.sz,stk:it.stk||0,g:pg};panes.push(rec);
      for(var k=0;k<rec.stk;k++){var sk=new T.Mesh(G.plane,stkMat[(stickers.length)%stkMat.length].clone());sk.material.userData.own=true;sk.scale.set(.46,.46,1);sk.position.set((k%2?.3:-.25)*Math.min(1,w2/1.5),-h2/2+.55+Math.floor(k/2)*.55,.06);pg.add(sk);stickers.push({m:sk,rz:(r()-.5)*.35});}});
    c.gtop=sty.top;
    if(h3.cst===0){bx(W+2,.18,2.4,WALLS[0],0,3.9,1.2,g);[-W/2,W/2].forEach(function(px){bx(.25,3.8,.25,WALLS[5],px-Math.sign(px)*.2,1.9,2.2,g);});}
    else if(h3.cst===1){/* a striped awning and a patio out front */
      var pat=new T.Group();pat.userData.dyn=true;g.add(pat);c.patio=pat;
      var aw=new T.Mesh(G.box,new T.MeshStandardMaterial({map:tx(cv(64,8,function(q,w,h){for(var i=0;i<8;i++){q.fillStyle=i%2?"#f4f1ea":acc;q.fillRect(i*8,0,8,h);}}),false),roughness:.8}));aw.material.userData.own=true;
      aw.scale.set(W-.4,.06,1.9);aw.position.set(0,3.9,.85);aw.rotation.x=.35;aw.castShadow=true;g.add(aw);
      for(var tb=0;tb<3;tb++){var tx0=-W/2+2+tb*(W-4)/2;bx(.9,.05,.9,M.dark,tx0,.78,4.2,pat);bx(.08,.75,.08,M.dark,tx0,.4,4.2,pat);[[-.6,0],[.6,0]].forEach(function(o2){bx(.42,.42,.42,M.dark,tx0+o2[0],.22,4.2+o2[1],pat);});
        cylBetween(V(tx0,.8,4.2),V(tx0,2.5,4.2),.03,M.metal,pat);var um=new T.Mesh(G.cone,accM);um.scale.set(1.3,.45,1.3);um.position.set(tx0,2.55,4.2);um.castShadow=true;pat.add(um);}
      [-W/2+.6,W/2-.6].forEach(function(px){bx(.8,.6,.8,WALLS[5],px,.3,3,g);shrubs(g,px-.3,px+.3,3,3,r,false);});}
    else if(h3.cst===2){bx(3.4,.1,1.6,M.dark,0,2.75,.8,g);[-1.6,1.6].forEach(function(px){cylBetween(V(px,2.75,.1),V(px,3.6,-.02),.03,M.metal,g);});bx(W+.1,.08,.12,M.dark,0,sty.top+.05,.08,g);}
    else{/* standalone: a monument sign by the drive, planting beds */
      bx(3.4,1.2,.5,M.stone,-W/2-3,.6,6,g);var ms=new T.Mesh(G.plane,sm);ms.scale.set(3,.6,1);ms.position.set(-W/2-3,.75,6.26);g.add(ms);
      for(var tt=0;tt<4;tt++)tree(g,-W/2-4+tt*(W+8)/3,-D-3,1.2);shrubs(g,-W/2+.5,W/2-.5,.9,8,r,false);}
    bx(W+60,.15,3.2,M.concrete,0,.075,1.6,g);bx(W+60,.16,.25,M.curb,0,.08,3.25,g);
    /* the neighbors: both sides in a strip center, one side for the cafe, none for a standalone building */
    if(h3.cst!==3)[["COFFEE","#6b4f2a"],["NAILS","#9a2a5a"],["TAX OFFICE","#27364f"],["DONUTS","#c8462b"]].forEach(function(nb,k){var side=k%2?1:-1;if(h3.cst===1&&side>0)return;var off=side*(W/2+4.6+Math.floor(k/2)*9.2),nh=h3.cst===2?5.4:H;
      bx(9.2,nh,D,WALLS[(k+3)%WALLS.length],off,nh/2,-D/2,g);var ns=new T.Mesh(G.plane,new T.MeshBasicMaterial({map:signTex(nb[0],nb[1],"#fff")}));ns.material.userData.own=true;ns.scale.set(6,1,1);ns.position.set(off,4.35,.07);g.add(ns);
      for(var q=0;q<4;q++){bx(1.8,2.6,.05,M.glass,off-3.3+q*2.2,1.65,.02,g);bx(.07,2.6,.1,M.alum,off-3.3+q*2.2-.93,1.65,.03,g);}bx(9.2+.1,.5,.4,WALLS[5],off,nh+.1,-.1,g);bx(9.2,.18,2.4,WALLS[0],off,3.9,1.2,g);});
    /* the lot: asphalt, stripes, a few cars, light poles */
    bx(W+60,.03,26,M.asphalt,0,.015,16.2,g);for(var sx=-W/2-26;sx<W/2+26;sx+=2.8){bx(.12,.012,5,M.stripe,sx,.035,6.4,g);bx(.12,.012,5,M.stripe,sx,.035,22,g);}
    var lotG=new T.Group();lotG.userData.dyn=true;g.add(lotG);c.patio2=lotG;
    for(var cp=0;cp<9;cp++){var ccx=-W/2-24+r()*(W+48);if(Math.abs(ccx)<2.2)continue;car(lotG,Math.round(ccx/2.8)*2.8+1.4,r()<.5?6.4:22,r()<.5?0:Math.PI,(r()*7)|0,r);}
    [-12,12].forEach(function(lx){bx(.2,8,.2,M.lamp,lx,4,14.2,g);bx(1.6,.18,.5,M.lamp,lx,8,14.2,g);});
    if(h3.cst!==3){palm(g,-W/2-2,3.8,8,r);palm(g,W/2+2.3,3.8,7.5,r);}
    /* the town behind the center: a service road, a block wall, rooftops and trees, and the boulevard out front */
    castOn=false;bx(W+90,.04,7,M.asphalt,0,.02,-D-5,g);bx(W+90,1.8,.2,M.cmu,0,.9,-D-9.5,g);
    [[-D-12,-1,.35],[-D-38,1,.5],[-D-50,-1,.5],[-D-76,1,.6]].forEach(function(rw){for(var bxr=-W/2-70;bxr<W/2+70;bxr+=15+r()*5){var bw=11+r()*4;
      liteHouse(g,{x:bxr,zf:rw[0]-r()*2,dir:rw[1],W:bw,D:9+r()*3,st:r()<rw[2]?2:1,wall:(r()*WALLS.length)|0,roof:(r()*ROOFS.length)|0,gar:r()<.5?-1:1,walk:7,back:5,gap:5,lod:0,yard:1,hood:1},r);
      if(r()<.55)tree(g,bxr+(r()-.5)*8,rw[0]+rw[1]*-3+(r()-.5)*2,1.1+r()*.4);}});
    bx(W+160,.04,7,M.asphalt,0,.02,-D-25,g);bx(W+160,.04,7,M.asphalt,0,.02,-D-63,g);
    bx(W+90,.045,9,M.asphalt,0,.022,33,g);bx(W+90,.13,.25,M.curb,0,.065,29.2,g);
    castOn=true;
    c.W=W;c.H=H;c.D=D;c.cy=Math.min(H*.45,3);c.name="shop";
  }else{
    /* an office building sized from square feet and stories, windows spread around every side */
    var fl=st.bst,per=st.bsq*1000/10.764/fl,Wb=Math.max(14,Math.min(90,Math.sqrt(per*1.7))),Db=Math.max(10,Math.min(60,per/Wb)),fh=3.9,Hb=fl*fh+.8;
    bx(Wb,Hb,Db,WALLS[3],0,Hb/2,0,g);bx(Wb+.3,.6,Db+.3,WALLS[5],0,Hb+.3,0,g);
    var perF=Math.max(4,Math.round(st.bwin/fl)),fr=perF*Wb/(2*(Wb+Db)),sr=perF*Db/(2*(Wb+Db)),fcount=Math.max(1,Math.round(fr)),scount=Math.max(0,Math.round(sr));
    for(var f=0;f<fl;f++){var yy=f*fh+2.1;
      [[1,fcount,Wb,0],[-1,fcount,Wb,Math.PI],[2,scount,Db,Math.PI/2],[-2,scount,Db,-Math.PI/2]].forEach(function(sd){var cnt=sd[1];if(!cnt)return;var len=sd[2],step=len/cnt,ww=Math.min(2.4,step*.72);
        for(var k2=0;k2<cnt;k2++){var u=-len/2+step*(k2+.5),wx=Math.abs(sd[0])===1?u:sd[0]>0?Wb/2:-Wb/2,wz=Math.abs(sd[0])===1?(sd[0]>0?Db/2:-Db/2):u;
          var wg=bx(Math.abs(sd[0])===1?ww:.06,2,Math.abs(sd[0])===1?.06:ww,M.glass,wx+(Math.abs(sd[0])===2?Math.sign(sd[0])*.02:0),yy,wz+(Math.abs(sd[0])===1?Math.sign(sd[0])*.02:0),g);
          if(f<2&&sd[0]===1)panes.push({x:wx,y:yy,w:ww,h:2,door:false});}});}
    /* entry, walk, lot, trees */
    bx(4.2,2.6,.06,M.glass,0,1.3,Db/2+.04,g);bx(5.6,.2,2.6,WALLS[5],0,3,Db/2+1.3,g);panes.push({x:0,y:1.3,w:4.2,h:2.6,door:true});
    bx(Wb+30,.15,4,M.concrete,0,.075,Db/2+2.2,g);bx(Wb+40,.03,28,M.asphalt,0,.015,Db/2+18,g);
    for(var sx2=-Wb/2-16;sx2<Wb/2+16;sx2+=2.8){bx(.12,.012,5,M.stripe,sx2,.035,Db/2+9,g);bx(.12,.012,5,M.stripe,sx2,.035,Db/2+25,g);}
    for(var cp2=0;cp2<12;cp2++)car(g,Math.round((-Wb/2-14+r()*(Wb+28))/2.8)*2.8+1.4,r()<.5?Db/2+9:Db/2+25,r()<.5?0:Math.PI,(r()*7)|0,r);
    for(var t2=0;t2<6;t2++)tree(g,-Wb/2-4+t2*(Wb+8)/5,Db/2+5.2,1.1);
    c.W=Wb;c.H=Hb;c.D=Db;c.cy=Math.min(Hb*.45,8);c.name="building";
  }
  /* grime on the glass, one overlay per pane, fades when you tap Fix it */
  var gm=M.grime.clone();gm.userData.own=true;c.grime=gm;if(editing)gm.visible=false;
  panes.forEach(function(p){var o=new T.Mesh(G.plane,gm);o.scale.set(p.w,p.h,1);o.renderOrder=2;if(p.g){o.position.set(0,0,.055);p.g.add(o);}else{o.position.set(p.x,p.y,p.door?Db/2+.08:Db/2+.06);g.add(o);}});
  batch({g:comG});
  com=c;
  comShadow();
}
function comShadow(){if(!com)return;var sc=sun.shadow.camera,S2=Math.max(com.W,com.D)/2+26;sc.left=-S2;sc.right=S2;sc.top=S2;sc.bottom=-S2;sc.near=1;sc.far=160;sc.updateProjectionMatrix();sun.target.position.set(0,0,0);}
function comStops(){var s=[{k:"cover"},{k:"cglass",ph:0},{k:"cglass",ph:1}];if(st.ctype===0&&st.cstk)s.push({k:"cstk",ph:0},{k:"cstk",ph:1});s.push({k:"cend"});return s;}
function comFixed(k){if(!overlay||mode!=="com")return true;var S=comStops(),i=Math.min(stepAt(steps()),S.length-1);for(var j=0;j<S.length;j++)if(S[j].k===k&&S[j].ph===1)return i>=j;return true;}
var comK={g:1,s:1};
function comFrame(dt){if(!com)return;var fg=comFixed("cglass")?1:0,fs=comFixed("cstk")?1:0,a=dt===0?1:Math.min(1,dt*2.2);
  comK.g+=(fg-comK.g)*a;comK.s+=(fs-comK.s)*a;com.grime.opacity=1-comK.g;com.grime.visible=comK.g<.99;
  com.stickers.forEach(function(s){s.m.rotation.z=s.rz*(1-comK.s);s.m.material.opacity=.55+.45*comK.s;s.m.material.color.setScalar(.8+.2*comK.s);});
  if(overlay&&mode==="com")comSay();}
function comShot(k){var c=com,W=c.W,H=c.H,front=st.ctype===0?0:c.D/2;
  if(k==="cstk"&&com.stickers[0]){var p=com.stickers[0].m.position;return {tx:p.x,ty:1.6,tz:front,yaw:.25,tilt:.08,dist:fitWH(2.6,1.7)};}
  if(k==="cglass")return {tx:0,ty:st.ctype===0?1.9:3,tz:front,yaw:.3,tilt:.08,dist:fitWH(Math.min(W*.4,7),2.6)};
  return {tx:0,ty:c.cy,tz:front-(st.ctype===0?2:c.D*.2),yaw:.42,tilt:st.ctype===0?.2:.28,dist:fitWH(W*.62+3,H*.8+1)};}
function comSay(){if(edNote&&performance.now()-edNote.t<4500){say(edNote.txt,"ok");return;}var S=comStops(),i=Math.min(stepAt(steps()),S.length-1),cs=S[i],t=C.totals(),shop=st.ctype===0,gl=st.cpanes+st.cdoors,txt,cls="";
  if(cs.k==="cover")txt=shop?"<b>Your storefront today.</b> "+st.cpanes+" pane"+(st.cpanes>1?"s":"")+" and "+st.cdoors+" glass door"+(st.cdoors===1?"":"s")+" collecting dust, fingerprints and sprinkler spots. Tap Next to see it done.":"<b>Your building today.</b> "+st.bst+" stor"+(st.bst>1?"ies":"y")+" and "+st.bwin+" windows under a film of desert dust. Tap Next to see it done.";
  else if(cs.k==="cglass"&&!cs.ph){cls="warn";txt=shop?"<b>First impressions.</b> Customers see the glass before they see the shelves. Out here it only takes a couple of windy weeks to look neglected.":"<b>Dusty glass.</b> Tenants and visitors notice it from the parking lot, and the wind keeps bringing more.";}
  else if(cs.k==="cglass"){cls="ok";txt=shop?"<b>Clean, inside and out.</b> Purified water, frames and doors wiped, handprints gone. "+(st.cfreq?money(C.comVisit())+" a visit "+P.comFName[st.cfreq]:"$"+P.com+" flat for 8 to "+P.comUpTo+" panes")+(gl>P.comUpTo?", with the extra "+(gl-P.comUpTo)+" panes confirmed by Tony":"")+".":"<b>Clean, top to bottom.</b> Worked after hours so nobody is in the way. Free walkthrough and a firm price before we start.";}
  else if(cs.k==="cstk"&&!cs.ph){cls="warn";txt="<b>Old stickers.</b> Faded promos and peeling corners make a shop look closed. "+st.cstk+" on your glass.";}
  else if(cs.k==="cstk"){cls="ok";txt="<b>Swapped and straight.</b> Old ones off clean, new ones up level, $10 a sticker while we're there.";}
  else{cls="ok";txt="<b>That's your "+(shop?"storefront":"building")+" done right.</b> "+(t.total>0?"Your quote: "+(t.from?"from ":"")+money(t.total)+(shop?" a visit.":"."):"Tony walks it with you for free and gives you a firm written price.")+" One invoice a month, worked around your hours.";}
  say(txt,cls);}

/* ---------- make it yours: tap to add a window, drag to move it, pick pane or with screen. Storefronts too. ---------- */
var edbar=doc.createElement("div");edbar.className="edbar";edbar.hidden=true;stageEl.appendChild(edbar);
var edBtn=doc.createElement("button");edBtn.type="button";edBtn.className="edgo";edBtn.hidden=true;stageEl.appendChild(edBtn);
var edNote=null,edRay=new T.Raycaster(),edV=new T.Vector2(),edSel=null,edScr=[];
var FACE=["Front of the house","Back of the house","Right side","Left side"];
function checkCustom(){if(h3.custom&&h3.customSig!==h3.style+"-"+st.stories){h3.custom=null;h3.cv++;}}
/* the layout as it stands, so editing starts from what's on screen */
function autoLayout(){var L={0:[],1:[],2:[],3:[]};me.wins.forEach(function(w){if(w.f===undefined)return;var sz=w.gw>1.6?2:w.gw<1.05?0:1;L[w.f].push({u:w.u,v:w.v,sz:sz,s:w.s===undefined?1:w.s});});return L;}
function edItems(){return ED.t==="home"?me.wins.filter(function(w){return w.f===ED.f;}):com.panes;}
function edFrame(){if(ED.t==="home"){var fr=faceFrame(me,ED.f);return {p:fr.p,n:fr.n,d:fr.d,len:fr.len,H:me.wallH,ang:fr.ang};}
  return {p:V(0,0,0),n:V(0,0,1),d:V(1,0,0),len:com.W,H:(com.gtop||3.55)+.5,ang:0};}
function edShot(){var fr=edFrame(),c=fr.p.clone().add(V(0,fr.H*.5,0)),hh=host.clientHeight||600,vf=Math.max(.35,(hh-(edH>0?edH:edbar.offsetHeight||200)-24)/hh);
  return {tx:c.x,ty:c.y,tz:c.z,yaw:fr.ang,tilt:.06,dist:fitWH(fr.len/2+1.1,(fr.H/2+.9)/vf)};}
function edHit(e){var rc=R.domElement.getBoundingClientRect();edV.set((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);edRay.setFromCamera(edV,cam);
  var fr=edFrame(),pl=new T.Plane(fr.n.clone(),-fr.n.dot(fr.p)),hit=new T.Vector3();if(!edRay.ray.intersectPlane(pl,hit))return null;var rel=hit.clone().sub(fr.p);return {u:rel.dot(fr.d),v:hit.y};}
function edSize(it){if(ED.t==="home"){var s2=SZ[it.sz]||SZ[1];return [s2[0]+.2,s2[1]+.3];}return it.door?[1.05,2.2]:[it.w,it.h];}
function edClamp(it,u,v){var fr=edFrame(),sz=edSize(it),lim=fr.len/2-(ED.t==="home"?.45:.3)-sz[0]/2;u=Math.max(-lim,Math.min(lim,u));
  if(ED.t==="home")v=Math.max(sz[1]/2+.45,Math.min(fr.H-.3-sz[1]/2,v));else v=it.door?.35+1.1:Math.max(.35+sz[1]/2,Math.min((com.gtop||3.55)-sz[1]/2,v));
  return [Math.round(u*20)/20,Math.round(v*20)/20];}
function edFree(it,u,v){var sz=edSize(it);
  if(ED.t==="home"&&ED.f===0)for(var i=0;i<me.obst.length;i++){var o=me.obst[i];if(u+sz[0]/2>o[0]&&u-sz[0]/2<o[1]&&v-sz[1]/2<o[3])return false;}
  var L=edItems();for(var j=0;j<L.length;j++){var w=L[j];if(w===it)continue;var s2=edSize(w),wu=ED.t==="home"?w.u:w.x,wv=ED.t==="home"?w.v:w.y;
    if(Math.abs(u-wu)<(sz[0]+s2[0])/2+.05&&Math.abs(v-wv)<(sz[1]+s2[1])/2+.05)return false;}return true;}
function edPick(u,v){var L=edItems();for(var i=L.length-1;i>=0;i--){var w=L[i],sz=edSize(w),wu=ED.t==="home"?w.u:w.x,wv=ED.t==="home"?w.v:w.y;if(Math.abs(u-wu)<sz[0]/2+.1&&Math.abs(v-wv)<sz[1]/2+.1)return w;}return null;}
/* write what's on the wall back into the saved layout */
function edSave(){if(ED.t==="home"){var L={0:[],1:[],2:[],3:[]};me.wins.forEach(function(w){if(w.f!==undefined)L[w.f].push({u:w.u,v:w.v,sz:w.sz,s:w.s});});h3.custom=L;h3.customSig=h3.style+"-"+st.stories;}
  else{h3.shop={w:com.W,items:com.panes.map(function(p){return {u:p.x,v:p.y,w:p.w,h:p.h,sz:p.sz,door:p.door,stk:p.door?0:(p.stk||0)};})};
    st.cpanes=Math.max(1,Math.min(60,com.panes.filter(function(p){return !p.door;}).length));st.cdoors=Math.min(12,com.panes.filter(function(p){return p.door;}).length);st.cstk=Math.min(40,com.panes.reduce(function(a,p){return a+(p.door?0:(p.stk||0));},0));h3.shopSig=shopSig();}}
function shopSig(){return [st.cpanes,st.cdoors,st.cstk].join(".");}
function edRebuild(keepSel){var sel=edSel?{u:ED.t==="home"?edSel.u:edSel.x,v:ED.t==="home"?edSel.v:edSel.y}:null;edSave();h3.cv++;h3.sv++;
  if(ED.t==="home")buildMe();else{buildCom(true);C.render();}edSel=null;
  if(keepSel&&sel){var L=edItems();for(var i=0;i<L.length;i++){var w=L[i];if(Math.abs((ED.t==="home"?w.u:w.x)-sel.u)<.01&&Math.abs((ED.t==="home"?w.v:w.y)-sel.v)<.01){edSelect(w);break;}}}
  edScreens();edRender();}
/* screens show on the windows that have them while you edit */
function edScreens(){edScr=[];if(!ED||ED.t!=="home")return;me.wins.forEach(function(w){if(w.s&&w.f!==undefined){var sc=makeScreen(w);screenLook(sc,false);sc.g.visible=true;edScr.push(sc);}});}
function edSelect(w){if(edSel&&edSel.hl){edSel.hl.parent.remove(edSel.hl);edSel.hl=null;}edSel=w;if(!w){edRender();return;}
  var sz=edSize(w),hl=new T.Group(),mt=M.reachLine;[[0,sz[1]/2+.06,sz[0]+.2,.06],[0,-sz[1]/2-.06,sz[0]+.2,.06],[-sz[0]/2-.06,0,.06,sz[1]+.2],[sz[0]/2+.06,0,.06,sz[1]+.2]].forEach(function(q){var b=new T.Mesh(G.box,mt);b.scale.set(q[2],q[3],.04);b.position.set(q[0],q[1],.16);b.renderOrder=6;hl.add(b);});
  w.g.add(hl);w.hl=hl;if(ED.t==="home"){ED.type=w.s?1:0;ED.sz=w.sz;}else{ED.type=w.door?1:0;ED.sz=w.sz;}edRender();}
function edStart(t){if(t==="home"){checkCustom();if(!h3.custom){h3.custom=autoLayout();h3.customSig=h3.style+"-"+st.stories;}}
  else{if(st.ctype!==0){st.ctype=0;C.render();}}
  ED={t:t,f:0,type:1,sz:1,drag:null};if(t==="shop")ED.type=0;edHide(true);obdShow(false);say("");flight=null;focusShot=null;user=false;
  if(t==="home")buildMe();else buildCom(true);edScreens();ov.classList.add("ed-on");edRender();track("edit_start",{what:t});}
function edHide(on){if(hoodG)hoodG.visible=!on;nbs.forEach(function(n){n.g.visible=!on;});if(mover)mover.g.visible=!on;}
function edStop(){if(!ED)return;var t=ED.t;edSelect(null);edSave();ED=null;edHide(false);h3.cv++;h3.sv++;ov.classList.remove("ed-on");edbar.hidden=true;edScr=[];
  if(t==="home"){buildMe();var n=0,sc=0;me.wins.forEach(function(w){n++;if(w.s)sc++;});
    if(st.win)st.more=n>P.coverMax[st.stories];if(sc)st.screens=Math.max(1,Math.min(40,sc));
    edNote={t:performance.now(),txt:"<b>Saved.</b> Your home has "+n+" windows, "+sc+" with screens. Your quote uses these counts now."};}
  else{buildCom(true);edNote={t:performance.now(),txt:"<b>Saved.</b> "+st.cpanes+" panes, "+st.cdoors+" doors"+(st.cstk?", "+st.cstk+" stickers":"")+". Your quote is updated."};}
  C.render();tl=0;goal=preset();track("edit_done",{what:t});}
function edCounts(){if(ED.t==="home"){var n=0,sc=0,here=0;me.wins.forEach(function(w){n++;if(w.s)sc++;if(w.f===ED.f)here++;});return here+" on this side · "+n+" windows in all, "+sc+" with screens";}
  var p=com.panes.filter(function(x){return !x.door;}).length,d=com.panes.length-p,k=com.panes.filter(function(x){return x.stk;}).length;return p+" panes, "+d+" doors"+(k?", "+k+" stickers":"");}
function edRender(){if(!ED){edbar.hidden=true;return;}edbar.hidden=false;edH=-1;var home=ED.t==="home";
  var seg=function(k,list){return '<div class="seg2" data-edseg="'+k+'">'+list.map(function(x,i){return '<button type="button" data-v="'+i+'" aria-pressed="'+(ED[k]===i)+'">'+x+'</button>';}).join("")+"</div>";};
  edbar.innerHTML='<div class="ed-top">'+(home?'<button type="button" data-ed="prev" aria-label="Previous side">‹</button><b>'+FACE[ED.f]+'</b><button type="button" data-ed="next" aria-label="Next side">›</button>':'<b>Your storefront</b>')+'<span>'+edCounts()+'</span></div>'+
    '<div class="ed-row">'+seg("type",home?["Pane","With screen"]:["Pane","Door"])+seg("sz",["S","M","L"])+
    (home?"":'<button type="button" data-ed="stk" aria-pressed="'+!!(edSel&&edSel.stk)+'">Sticker</button><button type="button" data-ed="wider">Wider</button><button type="button" data-ed="narrower">Narrower</button>')+
    '<button type="button" data-ed="del"'+(edSel?"":" disabled")+'>Remove</button><button type="button" class="go" data-ed="done">Done</button></div>'+
    '<p class="ed-hint">'+(edSel?"Drag it to move it, change it above, or tap it again to let go.":"Tap the wall to add a "+(home?"window":ED.type?"door":"pane")+". Tap one to change it.")+'</p>';}
edbar.addEventListener("click",function(e){var t=e.target;if(!t.closest||!ED)return;var sg=t.closest("[data-edseg] button");
  if(sg){var k=sg.parentNode.getAttribute("data-edseg"),v=+sg.getAttribute("data-v");ED[k]=v;
    if(edSel){if(ED.t==="home"){if(k==="type")edSel.s=v;else edSel.sz=v;}else{if(k==="type")edSel.door=!!v;else{edSel.sz=v;var ps=PSZ[v];edSel.w=ps[0];edSel.h=ps[1];}}
      var cl=edClamp(edSel,ED.t==="home"?edSel.u:edSel.x,ED.t==="home"?edSel.v:edSel.y);if(ED.t==="home"){edSel.u=cl[0];edSel.v=cl[1];}else{edSel.x=cl[0];edSel.y=cl[1];}edRebuild(true);}else edRender();return;}
  var b=t.closest("[data-ed]");if(!b)return;var a=b.getAttribute("data-ed");
  if(a==="done")edStop();
  else if(a==="prev"||a==="next"){edSelect(null);ED.f=(ED.f+(a==="next"?1:3))%4;flyTo(edShot());edRender();}
  else if(a==="del"&&edSel){if(ED.t==="home"&&me.wins.length<2){edNoteNow("Keep at least one window.");return;}if(ED.t!=="home"&&com.panes.length<2)return;
    var L=ED.t==="home"?me.wins:com.panes,i=L.indexOf(edSel);if(i>=0)L.splice(i,1);edSel=null;edRebuild(false);}
  else if(a==="stk"&&edSel&&!edSel.door){edSel.stk=edSel.stk?0:1;edRebuild(true);}
  else if(a==="wider"||a==="narrower"){var nw=Math.max(6,Math.min(24,com.W+(a==="wider"?1.6:-1.6)));if(nw===com.W)return;com.W=nw;
    com.panes.forEach(function(p){var c2=edClamp(p,p.x,p.y);p.x=c2[0];p.y=c2[1];});edRebuild(true);flyTo(edShot());}});
function edNoteNow(t){var h=edbar.querySelector(".ed-hint");if(h)h.textContent=t;}
function edDown(e){var h=edHit(e);if(!h)return;var w=edPick(h.u,h.v);
  if(w){var was=w===edSel;edSelect(w);ED.drag={was:was,id:e.pointerId,du:(ED.t==="home"?w.u:w.x)-h.u,dv:(ED.t==="home"?w.v:w.y)-h.v,moved:false};try{el.setPointerCapture(e.pointerId);}catch(x){}return;}
  /* add: a new window or pane where you tapped, if it fits */
  var it=ED.t==="home"?{sz:ED.sz,s:ED.type}:{sz:ED.sz,door:!!ED.type,w:PSZ[ED.sz][0],h:PSZ[ED.sz][1]},cl=edClamp(it,h.u,h.v);
  var fits=Math.abs(cl[0]-h.u)<=1.2&&Math.abs(cl[1]-h.v)<=1.6&&edFree(it,cl[0],cl[1]);
  if(!fits&&ED.t==="shop"&&Math.abs(h.u)>com.W/2-2.2&&com.W<24){var extra=(it.door?1.05:it.w)+.2,side=h.u>=0?1:-1;extra=Math.min(extra,24-com.W);
    com.panes.forEach(function(p){p.x-=side*extra/2;});com.W+=extra;var ew=it.door?1.05:it.w;cl=edClamp(it,side*(com.W/2-.3-ew/2),h.v);fits=edFree(it,cl[0],cl[1]);}
  if(!fits){edNoteNow("No room there. Try an open spot on the wall"+(ED.t==="shop"?", or tap near an end to make the storefront wider.":"."));return;}
  if(ED.t==="home"){it.f=ED.f;it.u=cl[0];it.v=cl[1];me.wins.push({f:ED.f,u:cl[0],v:cl[1],sz:it.sz,s:it.s});}
  else com.panes.push({x:cl[0],y:cl[1],sz:it.sz,door:it.door,w:it.w,h:it.h,stk:false});
  track("edit_add",{what:ED.t});edSel={u:cl[0],v:cl[1],x:cl[0],y:cl[1]};edRebuild(true);}
function edMove(e){var d=ED.drag;if(!d||d.id!==e.pointerId||!edSel)return;var h=edHit(e);if(!h)return;var home=ED.t==="home",cl=edClamp(edSel,h.u+d.du,h.v+d.dv);
  if(!edFree(edSel,cl[0],cl[1]))return;d.moved=true;
  if(home){edSel.u=cl[0];edSel.v=cl[1];var fr=edFrame(),pos=fr.p.clone().addScaledVector(fr.d,cl[0]);edSel.g.position.set(pos.x,cl[1],pos.z);}
  else{edSel.x=cl[0];edSel.y=cl[1];edSel.g.position.set(cl[0],cl[1],0);}}
function edUp(e){var d=ED.drag;if(!d||d.id!==e.pointerId)return;ED.drag=null;if(d.moved){edSave();h3.cv++;h3.sv++;edRender();}else if(d.was)edSelect(null);}
/* the button that opens the editor: on your home, or on your storefront */
function edButton(){var show=overlay&&!ED&&!obdOpen&&(mode==="home"||(mode==="com"&&st.ctype===0));edBtn.hidden=!show;if(!show)return;var txt=mode==="home"?"Edit my windows":"Build my storefront";if(edBtn.textContent!==txt)edBtn.textContent=txt;}
edBtn.addEventListener("click",function(){edStart(mode==="home"?"home":"shop");});

/* ---------- the guided tour of your home: overview, then each thing on your list ---------- */
function tourStops(){var s=[{k:"over"}];probs().forEach(function(p){s.push({k:p,ph:0},{k:p,ph:1});if(p==="pig"&&spinners.length)s.push({k:p,ph:2});});s.push({k:"end"});return s;}
function tourShot(k,ph){var tall=me.wallH+me.rise,rad=.5*Math.sqrt(me.W*me.W+me.D*me.D),c;
  if(k==="win"){c=toWorld(demoWin.g,0,0,0);return {tx:c.x,ty:c.y,tz:c.z,yaw:demoWin.ang+.32,tilt:.12,dist:fitWH(2.1,1.5)};}
  if(k==="scr"){c=toWorld(scrWin.g,.2,-.05,0);return {tx:c.x,ty:c.y,tz:c.z,yaw:scrWin.ang-.35,tilt:.12,dist:fitWH(1.8,1.4)};}
  if(k==="sol"){var gp=me.groups.filter(function(g){return g.face>0;})[0]||me.groups[0];c=toWorld(gp.face>0?me.F:me.B,gp.center[0],me.TT,gp.center[1]);return {tx:c.x,ty:c.y,tz:c.z,yaw:gp.face>0?.3:Math.PI+.3,tilt:.72,dist:fitWH(gp.cols*PW/2+1.6,gp.rows*PD/2+1.8)};}
  if(k==="pig"&&!ph){c=toWorld(me.F,0,me.TT,0);return {tx:c.x,ty:c.y,tz:c.z,yaw:.42,tilt:.62,dist:fitWH(me.W*.58,me.L*.72)};}
  if(k==="pig"&&ph===1&&anc.mesh){c=anc.mesh.p;return {tx:c.x,ty:c.y,tz:c.z,yaw:.25,tilt:.4,dist:fitWH(2.2,1.5)};}
  if(k==="pig"&&ph===2&&spinners[0]){var sp=spinners[0];c=toWorld(sp.par,sp.x+.08,me.TT+.75,sp.z);return {tx:c.x,ty:c.y,tz:c.z,yaw:sp.face>0?.45:Math.PI+.45,tilt:.3,dist:fitWH(1.3,1)};}
  return {tx:0,ty:tall*.36,tz:me.D*.08,yaw:.55,tilt:.38,dist:fitWH(rad*1.5,tall*1.4)};}
function probName(k,fixed){if(fixed)return {win:"Clean windows",scr:"New screens",sol:"Clean panels",pig:"Pigeon proofed"}[k];return {win:st.hw?"Hard water spots":"Dirty windows",scr:"Torn screens",sol:"Dusty panels",pig:"Pigeons"}[k];}
function listText(a){return a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];}
function tourSay(){if(edNote&&performance.now()-edNote.t<4500){say(edNote.txt,"ok");return;}var TS=tourStops(),i=tourAt(),cs=TS[i],k=cs.k,ph=cs.ph||0,t=C.totals(),n=st.panels,P2=probs();
  if(i!==dmgStop){dmgStop=i;dmgSel=0;}
  var nb=birds.filter(function(b){return b.kind!=="N";}).length,dl=dmgList(k),tapHint=dl.length?" Tap "+(dl.length>1?"1 to "+dl.length:"1")+" on the house to see what it does.":"";
  var txt,cls="";
  if(k==="over")txt=P2.length?"<b>Here's your home today.</b> "+listText(P2.map(function(q){return probName(q).toLowerCase();})).replace(/^./,function(c){return c.toUpperCase();})+". Tap Next and we'll take them one at a time.":"<b>Here's your home.</b> Tap Next for a quick tour, or drag to look around.";
  else if(k==="end"){txt="<b>All fixed.</b> That's your home the way we leave it. Your quote right now: "+(t.from?"from ":"")+money(t.total)+". Tap Windows, Solar, Screens or Pigeons above to watch a job, or See my price below.";cls="ok";}
  else if(ph===0&&dmgSel){txt="<b>"+probName(k)+", "+dmgSel+" of "+dl.length+".</b> "+dl[dmgSel-1];cls="warn";}
  else if(ph===0){cls="warn";txt={win:"<b>"+probName("win")+".</b> Dust, sprinkler spots and gray screens. Out here it builds up fast."+(WX.wind>=15?" Wind like today's keeps blowing more on.":"")+tapHint,
      scr:"<b>Torn screens.</b> A few summers of sun and wind, and builder mesh rips, sags and hangs loose."+tapHint,
      sol:"<b>Dusty panels.</b> "+n+" panels under a film of desert dust."+(WX.wind>=15?" Wind like today's keeps blowing more on.":"")+tapHint,
      pig:"<b>Pigeons.</b> "+nb+" on your roof, nests under the panels, and droppings on the tile."+tapHint}[k];}
  else{cls="ok";txt={win:"<b>Clean.</b> Purified water and a squeegee, screens washed, tracks and sills wiped, dried spot free. "+(st.stories===1?"$149 single story.":"$249 two story.")+(st.hw?" Hard water spots treated pane by pane.":""),
      scr:"<b>New screens.</b> "+st.screens+" re-meshed on site with "+P.meshName[st.pet]+" mesh, on the half of each window that opens.",
      sol:"<b>Washed.</b> Purified water and a soft brush, dried spot free. "+money(n*P.panel)+" at $7 a panel.",
      pig:ph===1?"<b>Cleaned out and closed off.</b> Nests, droppings and debris hauled away, the area sanitized so the smell goes with them, panels washed free, and mesh clipped to the frame. Nothing drilled, so your panel warranty stays safe."
        :"<b>Reflective spinners.</b> Mirrored cups flash across the roof so the birds don't settle again. "+C.free()+" come free. The flock moves on."}[k];}
  say(txt,cls);}
function homeDesc(){return ["new build","ranch","classic","lake estate"][h3.style]+" home, "+["street with desert yards","neighborhood with lawns","acreage","on the lake"][h3.hood];}

/* ---------- summary under the controls ---------- */
function summary(){
  var el=$("osum"),s=st.stories,t=C.totals();if(!el)return;
  var txt={home:"<b>"+["New build","Ranch","Classic","Lake estate"][h3.style]+" · "+s+" story · "+st.panels+" panels</b><br>Tap Windows, Solar, Screens or Pigeons above to watch the job on this home.",
    win:"<b>"+(s===1?"Single":"Two")+" story windows · "+money(P.win[s]+(st.more?P.more[s]:0)+(st.inside?P.inside:0))+"</b><br>Screens, tracks and sills included."+(st.inside?" Inside windows included.":" Inside every window +$49."),
    sol:"<b>"+st.panels+" panels · "+(st.pig?"free with pigeon proofing":money(st.panels*P.panel))+"</b><br>$7 a panel, purified water, dries spot free.",
    scr:"<b>"+st.screens+" "+P.meshName[st.pet]+" screen"+(st.screens>1?"s":"")+(st.frames?" · new frames":"")+" · "+money(Math.max(st.screens*(P.mesh[st.pet]+(st.frames?P.frame:0)),P.scrMin))+"</b><br>Screens cover the half of the window that opens. New frames and clips are $10 more a screen. $149 job minimum when screens are the only service.",
    pig:"<b>"+st.panels+" panels · "+spinCount()+" spinner"+(spinCount()===1?"":"s")+" · "+money(P.pig+Math.max(0,st.panels-P.pigUpTo)*P.pigPer+st.spin*P.spinner)+"</b><br>"+C.free()+" spinners come free. Extras are $50 each. Solar wash and roof wash free."};
  txt.com=st.ctype?"<b>Office building · "+st.bst+" stor"+(st.bst>1?"ies":"y")+" · "+st.bwin+" windows</b><br>Free walkthrough and a firm price before we start.":"<b>Storefront · "+(st.cpanes+st.cdoors)+" panes and doors"+(st.cstk?" · "+st.cstk+" stickers":"")+"</b><br>"+(st.cfreq?money(C.comVisit())+" a visit "+P.comFName[st.cfreq]:"$"+P.com+" one time")+", inside and out.";
  el.innerHTML=(txt[mode]||txt.home)+"<br><span class=\"small\">Your quote right now: "+(t.from?"from ":"")+money(t.total)+"</span>";
}

/* ---------- camera ---------- */
var cur=null,goal=null,user=false;
/* how far back the camera sits so a box of half width hw and half height hh fits the screen, any shape */
function fitWH(hw,hh){var vf=cam.fov*Math.PI/360,hf=Math.atan(Math.tan(vf)*cam.aspect);return Math.max(hw/Math.tan(hf),hh/Math.tan(vf));}
function preset(){
  if(!me)return {tx:0,ty:2,tz:0,yaw:.55,tilt:.32,dist:24};
  var tall=me.wallH+me.rise,rad=.5*Math.sqrt(me.W*me.W+me.D*me.D),cy=tall*.45,p;
  if(ED&&overlay)return edShot();
  if(overlay&&focusShot)return focusShot;
  if(comOn()&&com){if(mode==="com"&&overlay){var CS=comStops();return comShot(CS[Math.min(stepAt(steps()),CS.length-1)].k);}return comShot("cover");}
  if(mode==="home"&&overlay&&!obdOpen){var TS=tourStops(),ti=Math.min(stepAt(steps()),TS.length-1);return tourShot(TS[ti].k,TS[ti].ph);}
  if(mode==="pig"&&h3.stage===3&&spinners[0]){var sp=spinners[0],sc3=toWorld(sp.par,sp.x,me.TT,sp.z+me.L*.5);p={tx:sc3.x,ty:sc3.y,tz:sc3.z,yaw:sp.face>0?.35:Math.PI+.35,tilt:.7,dist:fitWH(me.L*1.25,me.L*.9)};}
  else if(mode==="pig"&&h3.stage===4)p={tx:0,ty:cy,tz:-2,yaw:.45,tilt:.52,dist:fitWH(rad*2.6+(h3.hood===2?18:0),tall*1.4)};
  else if(mode==="pig")p={tx:0,ty:cy,tz:0,yaw:.5,tilt:.44,dist:fitWH(rad*2.1,tall*1.3)};
  else if(mode==="win"&&h3.view===1&&room)p=tl>=5.0&&tl<9.4&&!user?{tx:room.center.x+.1,ty:room.y0,tz:room.Z+.02,yaw:.25,tilt:.9,dist:fitWH(.75,.45)} /* look down into the track */
    :{tx:room.center.x,ty:room.center.y-.1,tz:room.center.z,yaw:.42,tilt:.1,dist:fitWH(1.25,.95)};
  else if(mode==="win"){var c=toWorld(demoWin.g,0,0,0);p={tx:c.x,ty:c.y-.15,tz:c.z,yaw:demoWin.ang+.5,tilt:.1,dist:fitWH(1.55,1.15)};}
  else if(mode==="scr"){var c2=toWorld(scrWin.g,.3,0,0);p={tx:c2.x,ty:c2.y-.2,tz:c2.z,yaw:scrWin.ang-.45,tilt:.08,dist:fitWH(1.45,1.2)};}
  else if(mode==="sol"){var gp=me.groups.filter(function(g){return g.face>0;})[0]||me.groups[0],c3=toWorld(me.F,gp.center[0],me.TT,gp.center[1]);
    p={tx:c3.x,ty:c3.y,tz:c3.z,yaw:.3,tilt:.7,dist:fitWH(gp.cols*PW/2+1.4,gp.rows*PD/2+1.6)};}
  else p={tx:0,ty:cy*.8,tz:me.D*.08,yaw:.55,tilt:.32,dist:fitWH(rad*1.16,tall*1.1)*(mode==="show"?1.03:1)};
  return p;
}
var flight=null,focusShot=null;
function easeIO(x){x=clamp01(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function shotDiff(a,b){return Math.hypot(a.tx-b.tx,a.ty-b.ty,a.tz-b.tz)>.35||Math.abs(a.dist-b.dist)>.6||Math.abs(a.yaw-b.yaw)>.18||Math.abs(a.tilt-b.tilt)>.12;}
function flyTo(p){if(!cur){cur={};for(var k in p)cur[k]=p[k];goal=p;return;}
  var from={};for(var k2 in cur)from[k2]=cur[k2];var far=Math.hypot(p.tx-from.tx,p.ty-from.ty,p.tz-from.tz);
  flight={from:from,to:p,t:0,dur:far>3?1.6:1.05,bump:far>3?Math.min(14,far*.55):0};goal=p;}
function camStep(dt,t){
  if(!goal)goal=preset();
  if((mode==="show"||(mode==="home"&&obdOpen))&&!reduce){goal=preset();goal.yaw=.5+Math.sin(t*.11)*.55;}
  else if(overlay&&(!user||ED)){var p=preset();if(shotDiff(p,flight?flight.to:goal))flyTo(p);}
  if(!cur){cur={};for(var k in goal)cur[k]=goal[k];}
  if(flight){flight.t+=dt;var q=easeIO(flight.t/flight.dur);for(var k3 in flight.to)cur[k3]=lerp(flight.from[k3],flight.to[k3],q);cur.dist+=flight.bump*Math.sin(Math.PI*q);
    if(flight.t>=flight.dur)flight=null;placeCam(cur);return;}
  var a=1-Math.exp(-dt*3.2);for(var k2 in goal)cur[k2]+=(goal[k2]-cur[k2])*a;
  placeCam(cur);
}
function placeCam(c){var nr=Math.max(.05,Math.min(1.2,c.dist*.02));if(Math.abs(cam.near-nr)>.02){cam.near=nr;cam.updateProjectionMatrix();}
  cam.position.set(c.tx+Math.sin(c.yaw)*Math.cos(c.tilt)*c.dist,c.ty+Math.sin(c.tilt)*c.dist,c.tz+Math.cos(c.yaw)*Math.cos(c.tilt)*c.dist);cam.lookAt(c.tx,c.ty,c.tz);}
/* you can look around your own home, not wander off down the street */
function limits(){var p=preset();goal.dist=Math.max(p.dist*.55,Math.min(p.dist*1.45,goal.dist));goal.tilt=Math.max(Math.max(.05,p.tilt-.3),Math.min(Math.min(1.25,p.tilt+.4),goal.tilt));
  goal.yaw=Math.max(p.yaw-1.3,Math.min(p.yaw+1.3,goal.yaw));
  if(mode==="win"&&h3.view===1){goal.yaw=Math.max(p.yaw-.9,Math.min(p.yaw+.9,goal.yaw));goal.dist=Math.min(goal.dist,3.4);goal.tilt=Math.min(goal.tilt,.9);}}
var ptrs={},pinch=0,el=R.domElement;
el.addEventListener("pointerdown",function(e){if(!overlay)return;if(ED){edDown(e);return;}ptrs[e.pointerId]=[e.clientX,e.clientY];user=true;flight=null;focusShot=null;try{el.setPointerCapture(e.pointerId);}catch(x){}});
el.addEventListener("pointermove",function(e){if(ED){edMove(e);return;}var p=ptrs[e.pointerId];if(!p||!goal)return;var ids=Object.keys(ptrs);
  if(ids.length===1){goal.yaw-=(e.clientX-p[0])*.0065;goal.tilt+=(e.clientY-p[1])*.004;}
  ptrs[e.pointerId]=[e.clientX,e.clientY];
  if(ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)goal.dist*=pinch/d;pinch=d;}limits();});
function up(e){if(ED)edUp(e);delete ptrs[e.pointerId];pinch=0;}
el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
el.addEventListener("wheel",function(e){if(!overlay||!goal||ED)return;e.preventDefault();user=true;goal.dist*=1+Math.max(-.3,Math.min(.3,e.deltaY*.001));limits();},{passive:false});
/* if the phone takes the graphics back, pause quietly and pick up again when it returns it */
el.addEventListener("webglcontextlost",function(e){e.preventDefault();lost=true;var l=$("ovLoad");l.hidden=false;l.textContent="One moment, the 3D view is catching up.";heroLay.classList.remove("live");});
el.addEventListener("webglcontextrestored",function(){lost=false;$("ovLoad").hidden=true;first=true;if(quality>1)setQuality(quality-1);start();});

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
  if(!elC)return;if(!(mode==="show"||mode==="home")||overlay||comOn()){elC.hidden=true;return;}
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

/* ---------- labels you can tap: panel sections, and the things on the tour ---------- */
var secEl=[0,1,2].map(function(i){var d=doc.createElement("button");d.type="button";d.className="seclbl";d.hidden=true;d.setAttribute("data-sec3",i);stageEl.appendChild(d);return d;});
var HS={win:"Windows",scr:"Screens",sol:"Solar",pig:"Pigeons"},hsEl={};
/* numbered dots on the problem: tap one to read what it does */
var dmgEl=[0,1,2,3].map(function(i){var d=doc.createElement("button");d.type="button";d.className="dmg";d.hidden=true;d.setAttribute("data-dmg",i+1);d.setAttribute("aria-label","What this does, point "+(i+1));d.textContent=i+1;stageEl.appendChild(d);return d;});
Object.keys(HS).forEach(function(k){var d=doc.createElement("button");d.type="button";d.className="hs";d.hidden=true;d.setAttribute("data-hs",k);d.textContent=HS[k];stageEl.appendChild(d);hsEl[k]=d;});
function place(d,p,nrm){var v=p.clone().project(cam),on=v.z<1&&Math.abs(v.x)<.96&&Math.abs(v.y)<.94;d.hidden=!on;if(!on)return;
  var back=nrm&&cam.position.clone().sub(p).dot(nrm)<0;d.classList.toggle("dim",!!back);
  d.style.transform="translate("+((v.x+1)/2*stageEl.clientWidth)+"px,"+((1-v.y)/2*stageEl.clientHeight)+"px) translate(-50%,-100%)";}
function secLabels(){
  var on=overlay&&st.arrays>1&&(mode==="home"||mode==="sol"||mode==="pig")&&me&&!obdOpen&&!ED;
  secEl.forEach(function(d,i){var gp=on&&me.groups.filter(function(g){return g.idx===i;})[0];if(!gp||!me.panels.length){d.hidden=true;return;}
    var par=gp.face>0?me.F:me.B,p=toWorld(par,gp.center[0],me.TT+H+.35,gp.center[1]),nrm=par.localToWorld(V(0,1,0)).sub(par.localToWorld(V(0,0,0))).normalize();
    var txt="Section "+(i+1)+" · "+gp.n+" panels";if(d.textContent!==txt)d.textContent=txt;place(d,p,nrm);});
  var hon=overlay&&mode==="home"&&!obdOpen&&me&&!ED,TS=hon?tourStops():[],ti=hon?tourAt():0,cs=TS[ti]||{},P2=hon?probs():[],atEnds=cs.k==="over"||cs.k==="end";
  Object.keys(hsEl).forEach(function(k){var d=hsEl[k];if(!hon||!atEnds||P2.indexOf(k)<0||(k==="sol"&&st.arrays>1)){d.hidden=true;return;}
    var fx=!broken(k),txt=probName(k,fx);if(d.textContent!==txt)d.textContent=txt;d.classList.toggle("bad",!fx);
    var p=k==="win"?toWorld(demoWin.g,0,demoWin.gh/2+.25,.15):k==="scr"?toWorld(scrWin.g,.3,-scrWin.gh/2+.1,.15):k==="sol"?anc.panel&&anc.panel.p:anc.mesh&&anc.mesh.p.clone().add(V(0,.3,0));
    if(!p){d.hidden=true;return;}place(d,p,null);});
  var dl=hon&&cs.ph===0?dmgList(cs.k):[];
  dmgEl.forEach(function(d,i){if(i>=dl.length){d.hidden=true;return;}var p=dmgPos(cs.k,i);if(!p){d.hidden=true;return;}d.setAttribute("aria-pressed",String(dmgSel===i+1));place(d,p,null);});
}
/* tap a label: fly there, and in the tour, jump to that stop */
stageEl.addEventListener("click",function(e){var t=e.target;if(!t.closest)return;
  var hs=t.closest("[data-hs]");if(hs){var k=hs.getAttribute("data-hs"),j=stopIdx(k,0);if(j>=0)tl=j;user=false;focusShot=null;track("tap_label",{what:k});return;}
  var dm=t.closest("[data-dmg]");if(dm){var nsel=+dm.getAttribute("data-dmg");dmgSel=dmgSel===nsel?0:nsel;track("tap_damage",{what:(tourStops()[tourAt()]||{}).k,point:nsel});return;}
  var sl=t.closest("[data-sec3]");if(sl&&me){var gi=+sl.getAttribute("data-sec3"),gp=me.groups.filter(function(g){return g.idx===gi;})[0];if(!gp)return;
    var par=gp.face>0?me.F:me.B,c=toWorld(par,gp.center[0],me.TT,gp.center[1]);focusShot={tx:c.x,ty:c.y,tz:c.z,yaw:gp.face>0?.3:Math.PI+.3,tilt:.75,dist:fitWH(gp.cols*PW/2+1.4,gp.rows*PD/2+1.6)};user=false;
    say("<b>Section "+(gi+1)+":</b> "+gp.n+" panels"+(st.pig?", meshed and washed with the rest.":", "+money(gp.n*P.panel)+" at $7 a panel."),"");track("tap_section",{section:gi+1});}});

/* ---------- welcome: get the home right, then the problems, then the build ---------- */
var obdOpen=false,obdDone=false,obd=doc.createElement("div");obd.className="obd";obd.hidden=true;
/* picture cards, so nobody has to know what a "ranch" is */
function pics(o,list,cur){return '<div class="obd-row pics" data-o="'+o+'">'+list.map(function(x,i){var v=x[2]!==undefined?x[2]:i;return '<button type="button" data-v="'+v+'" aria-pressed="'+(v===cur)+'"><img src="assets/quote/'+o+'-'+v+'.webp" alt="" width="300" height="200" loading="lazy" decoding="async"><b>'+x[0]+'</b><span>'+x[1]+'</span></button>';}).join("")+"</div>";}
function chips(o,list,cur){return '<div class="obd-row" data-o="'+o+'">'+list.map(function(x,i){return '<button type="button" data-v="'+(o==="stories"?i+1:i)+'" aria-pressed="'+((o==="stories"?i+1:i)===cur)+'">'+x+'</button>';}).join("")+"</div>";}
function obdRender(){
  var P1='<div class="obd-in" data-p="1"><b class="obd-h">Let\'s get your home right</b><p>Three taps and the model looks like your place.</p>'+
    '<div class="obd-l">Which looks most like your home?</div>'+pics("style",[["New build","Stucco, tile roof, garage up front"],["Ranch","Single story, long and low"],["Classic","Siding, porch, window grids"],["Lake estate","Big two story, arched windows"]],h3.style)+
    '<div class="obd-l">Stories</div>'+chips("stories",["1 story","2 story"],st.stories)+
    '<div class="obd-l">And your street?</div>'+pics("hood",[["Desert yards","Rock yards, block walls. Like newer Victorville tracts",0],["Lawns and trees","Green yards, shade trees. Like Jess Ranch",1],["On the lake","Backyard on the water. Like Spring Valley Lake",3],["Acreage","Big lots, room to spread out. Like Oak Hills",2]],h3.hood)+
    '<div class="obd-act"><button type="button" data-obd="skip">Skip</button><button type="button" class="go" data-obd="next">Next</button></div></div>';
  /* the problems, as pictures you check off */
  var PB=[["win","Dirty windows","Dust, spots, gray screens"],["pig","Pigeons","On the roof or under panels"],["sol","Dusty solar panels","A film of desert dust"],["scr","Torn screens","Ripped, sagging or loose"],["hw","Hard water spots","White spots from sprinklers"]];
  var P2='<div class="obd-in" data-p="2" hidden><b class="obd-h">What seems to be the problem?</b><p>Check everything that applies. Next you\'ll see it on your home.</p><div class="obd-row pics pc">'+
    PB.map(function(x){return '<label class="obd-pc"><input type="checkbox" value="'+x[0]+'"'+(st[x[0]]?" checked":"")+'><img src="assets/quote/prob-'+x[0]+'.webp" alt="" width="300" height="200" loading="lazy" decoding="async"><b>'+x[1]+'</b><span>'+x[2]+'</span><i aria-hidden="true"></i></label>';}).join("")+'</div>'+
    '<div class="obd-act"><button type="button" data-obd="back">Back</button><button type="button" class="go" data-obd="build">Build my home</button></div></div>';
  obd.innerHTML=P1+P2;}
stageEl.appendChild(obd);
function obdShow(on){obdOpen=on;obd.hidden=!on;ov.classList.toggle("obd-on",on);if(on){obdRender();say("");track("onboard_open");}secLabels();}
obd.addEventListener("click",function(e){var t=e.target;if(!t.closest)return;
  var b=t.closest(".obd-row button");if(b){var o=b.parentNode.getAttribute("data-o"),v=+b.getAttribute("data-v");if(o==="stories")v=+b.getAttribute("data-v");
    if(o==="stories")st.stories=v;else if(o==="style"){h3.style=v;if(v===3){st.stories=2;st.large=true;h3.estateLarge=true;}else if(h3.estateLarge){st.large=false;h3.estateLarge=false;}if(v===1)st.stories=1;h3.grids=v===2;}else h3[o]=v;
    $$("button",b.parentNode).forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});    $$('[data-o="stories"] button',obd).forEach(function(x){x.setAttribute("aria-pressed",String(+x.getAttribute("data-v")===st.stories));});C.render();return;}
  var a=t.closest("[data-obd]");if(!a)return;var act=a.getAttribute("data-obd"),pages=$$(".obd-in",obd);
  if(act==="next"){pages[0].hidden=true;pages[1].hidden=false;}
  else if(act==="back"){pages[0].hidden=false;pages[1].hidden=true;}
  else if(act==="skip"||act==="build"){
    if(act==="build"){var any=false;$$(".obd-pc input",obd).forEach(function(c){st[c.value]=c.checked;any=any||c.checked;});if(st.hw)st.win=true;if(!any)st.win=true;
      track("onboard_build",{win:st.win,hw:st.hw,sol:st.sol,pig:st.pig,scr:st.scr,hood:h3.hood,style:h3.style});}
    obdDone=true;obdShow(false);tl=0;user=false;focusShot=null;C.render();}});

/* ---------- render loop ---------- */
var raf=0,last=0,acc=0,host=heroHost,first=true,lost=false;
/* if a phone struggles, step the detail down so it stays smooth: sharpness first, then the far streets and soft shadows */
var quality=3,perf={n:0,t0:0,hold:0};
function setQuality(q){quality=q;var pr=q>=3?PR0:q===2?Math.max(1,PR0-.5):1;if(Math.abs(R.getPixelRatio()-pr)>.01){R.setPixelRatio(pr);size();}
  if(q<=0&&sun.castShadow){sun.castShadow=false;}track("3d_quality",{level:q});}
/* measured in real time: after the first moment, any 2 second stretch under 24 frames a second steps down one level */
function watchPerf(now){if(window.__tqFixedQ||!overlay)return;if(now<perf.hold){perf.t0=now;perf.n=0;return;}perf.n++;var el=now-perf.t0;
  if(el>=2000){var fps=perf.n*1000/el;perf.t0=now;perf.n=0;if(fps<24&&quality>0){setQuality(quality-1);perf.hold=now+1200;}}}
function size(){var w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;var c=R.domElement;if(c.width!==Math.round(w*R.getPixelRatio())||c.height!==Math.round(h*R.getPixelRatio()))R.setSize(w,h,false);if(Math.abs(cam.aspect-w/h)>.001){cam.aspect=w/h;cam.updateProjectionMatrix();goal=preset();limits&&goal&&limits();}}
function loop(now){
  raf=0;var dt=Math.min(.05,(now-last)/1000||0);last=now;
  var running=(overlay||(heroOn&&heroVis&&!doc.hidden))&&!lost;if(!running)return;
  raf=requestAnimationFrame(loop);
  if(!overlay){acc+=dt;if(acc<1/30)return;dt=acc;acc=0;}
  size();watchPerf(now);advance(dt);stepNav();
  frame(dt);camStep(dt,now/1000);liftView(dt);R.render(scene,cam);edButton();callouts(dt,host);secLabels();
  if(first&&!overlay){first=false;heroLay.classList.add("live");}
}
function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(loop);}}
function attach(to){host=to;if(R.domElement.parentNode!==to)to.insertBefore(R.domElement,to.firstChild);cur=null;goal=null;size();}
if("IntersectionObserver" in window)new IntersectionObserver(function(en){heroVis=en[0].isIntersecting;if(heroVis)start();}).observe(heroLay);
doc.addEventListener("visibilitychange",function(){if(!doc.hidden)start();});
if("ResizeObserver" in window){var ro=new ResizeObserver(function(){msgH=-1;size();});ro.observe(stageEl);ro.observe(heroHost);}

/* ---------- controls in the builder ---------- */
function syncControls(){
  $$("#ov [data-hseg]").forEach(function(g){var k=g.getAttribute("data-hseg");$$("button[data-v]",g).forEach(function(b){b.setAttribute("aria-pressed",String(+b.getAttribute("data-v")===h3[k]));});});
  $$("#ov [data-hsw]").forEach(function(x){x.setAttribute("aria-checked",String(!!h3[x.getAttribute("data-hsw")]));});
  $$("#ov [data-hstep='spin'] output").forEach(function(o){o.textContent=spinCount();});
}
ov.addEventListener("click",function(e){
  var t=e.target;
  if(t.closest("#wxChip")){var order=["today","sun","wind","cloud"];WX.mode=order[(order.indexOf(WX.mode)+1)%order.length];applyWx();track("weather_3d",{mode:WX.mode});return;}
  var mb=t.closest("[data-hmode]");if(mb){var nm=mb.getAttribute("data-hmode");if(nm===mode){replay();return;}fade(function(){setMode(nm);});track("view_3d_service",{mode:nm});return;}
  var z=t.closest("[data-zoom]");if(z&&goal){var d=+z.getAttribute("data-zoom");if(d===0){user=false;focusShot=null;flyTo(preset());}else{user=true;flight=null;goal.dist*=d>0?.8:1.25;limits();}return;}
  var hb=t.closest("[data-hseg] button[data-v]");
  if(hb){var k=hb.parentNode.getAttribute("data-hseg"),v=+hb.getAttribute("data-v");
    if(k==="stage"){tl=[0,2.2,5.6,9,12.4][v];auto=true;user=false;focusShot=null;h3.stage=v;birdTargets(false);track("pigeon_stage",{stage:v});}
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
    else if(a==="next"||a==="prev"){var S=steps();if(!S)return;var i=stepAt(S);user=false;focusShot=null;if(mode==="pig"){auto=true;h3.spinOv=null;}
      if(a==="next"){if(i+1<S.length){tl=S[i+1];track("note_next",{mode:mode,step:i+2});}else replay();}else rewind(S[Math.max(0,i-1)]);}
    else if(a==="obd"){fade(function(){setMode("home");obdShow(true);});}
    else if(a==="reach"){tl=9;auto=true;user=false;focusShot=null;h3.spinOv=null;h3.stage=3;birdTargets(false);track("spinner_reach");}
    else if(a==="try1"){auto=false;h3.stage=2;h3.cov=true;h3.spinOv=1;buildSpinners();birdTargets(false);C.render();goal.yaw=Math.round((cur.yaw-2.6)/(Math.PI*2))*Math.PI*2+2.6;track("try_one_spinner");}
    return;}
});
ov.addEventListener("input",function(e){if(e.target&&e.target.id==="cname"){h3.cname=String(e.target.value).replace(/[^A-Za-z0-9 &'.\-]/g,"").slice(0,18);C.render();}});
var fading=false;
function fade(mid){var f=$("ovFade");if(fading||reduce){mid();return;}fading=true;f.classList.add("on");setTimeout(function(){mid();setTimeout(function(){f.classList.remove("on");fading=false;},60);},260);}

/* ---------- api ---------- */
function sync(){
  if(!me)return;checkCustom();
  var k=keyOf(cfgMe());
  if(comG&&comKeyOf()!==comKey){buildCom();if(comOn())comShadow();else comG.visible=false;if(mode==="com")$("ovT").textContent=st.ctype?"Your building in 3D":"Your storefront in 3D";}
  if(k!==builtKey){var keepStage=h3.stage;buildMe();if(mode==="pig"){buildNeighbors();buildBirds();h3.stage=keepStage;birdTargets(true);}
    if(mode!=="show"&&mode!=="home"&&mode!=="pig"){tl=0;if(mode==="win"){resetHaze();}}goal=preset();}
  else if(spinners.length!==Math.min(spinCount(),me.vents.length)){buildSpinners();birdTargets(false);anchors();}
  syncControls();summary();
}
buildMe();
return {
  open:function(m){overlay=true;perf.hold=performance.now()+1500;perf.n=0;wxFetch();wxChip();$("ovLoad").hidden=true;attach(stageEl);var tour=m==="tour";if(tour)m=pageMode==="com"?"com":"home";if(["home","win","sol","scr","pig","com"].indexOf(m)<0)m="home";setMode(m);if(tour&&!obdDone&&m==="home")obdShow(true);start();},
  close:function(){if(ED)edStop();overlay=false;obdShow(false);say("");secEl.forEach(function(d){d.hidden=true;});Object.keys(hsEl).forEach(function(k){hsEl[k].hidden=true;});h3.spinOv=null;if(h3.view===1)h3.view=0;setMode("show");attach(heroHost);$("ocall").hidden=true;},
  hero:function(on){heroOn=on;if(on&&!overlay){if(mode!=="show")setMode("show");else ensureScene();attach(heroHost);start();}},
  sync:sync,
  pref:function(m){pageMode=m;},
  homeDesc:homeDesc,
  bizName:function(){return h3.cname;},
  /* for tests: where a spot on the wall being edited lands on screen, and what's on it */
  edPt:function(u,v){if(!ED)return null;var fr=edFrame(),p=fr.p.clone().addScaledVector(fr.d,u);p.y=v;p.project(cam);var rc=R.domElement.getBoundingClientRect();return {x:rc.left+(p.x+1)/2*rc.width,y:rc.top+(1-p.y)/2*rc.height};},
  edState:function(){if(!ED)return null;return {t:ED.t,f:ED.f,sel:!!edSel,items:edItems().map(function(w){return ED.t==="home"?[w.u,w.v,w.sz,w.s]:[w.x,w.y,w.sz,w.door?1:0,w.stk||0];}),len:edFrame().len};},
  /* a still frame of the model home, used to make the poster images */
  snap:function(w,h,o){o=o||{};var back=null;if(o.com&&!overlay){back=mode;setMode("com");}else if(mode!=="show"&&!overlay)setMode("show");else ensureScene();cam.clearViewOffset();lift=0;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
    var p=preset();if(o.yaw!=null)p.yaw=o.yaw;if(o.tilt!=null)p.tilt=o.tilt;if(o.dist)p.dist*=o.dist;if(o.ty)p.ty+=o.ty;
    frame(0);placeCam(p);R.render(scene,cam);var url=R.domElement.toDataURL(o.type||"image/png",o.q||.9);cur=null;goal=null;size();if(back!==null)setMode(back);return url;},
  seek:function(t){tl=t;},
  /* a picture of one problem on the model home, for the welcome cards */
  probSnap:function(k,w,h){var hw0=st.hw;if(k==="hw")st.hw=true;forceProb=k==="hw"?"win":k;if(mode!=="show")setMode("show");cam.clearViewOffset();lift=0;
    R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();frame(0);frame(0);var p=tourShot(forceProb,0);if(k==="hw"){p.dist*=.62;p.yaw-=.12;}
    placeCam(p);R.render(scene,cam);var url=R.domElement.toDataURL("image/png");forceProb=null;st.hw=hw0;frame(0);cur=null;goal=null;size();return url;},
  /* picture cards for the welcome: set the look, then snap it */
  look:function(o){if(o.style!=null)h3.style=o.style;if(o.hood!=null)h3.hood=o.hood;if(o.stories)st.stories=o.stories;if(o.grids!=null)h3.grids=o.grids;sync();},
  settle:function(){var p=preset();flight=null;goal=p;cur={};for(var k in p)cur[k]=p[k];placeCam(cur);},
  quality:function(){return {level:quality,shadows:sun.castShadow,pr:R.getPixelRatio(),calls:R.info.render.calls,tris:R.info.render.triangles,geos:R.info.memory.geometries,tex:R.info.memory.textures};},
  state:function(){return {styleName:["New build","Ranch","Classic","Lake estate"][h3.style],mode:mode,tl:tl,h3:JSON.parse(JSON.stringify(h3)),spinners:spinners.length,birds:birds.length,nbs:nbs.length,W:me&&me.W,style:me&&me.S.id};}
};
};
})();
