/* Tony's quick quote. Loads with defer on every page. Page settings come from window.TQ:
   svc (preselected services), tab (first hero tab), city, street (placeholder), live (false in previews). */
(function(){
"use strict";
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var $=function(id){return document.getElementById(id);};
var CFG=window.TQ||{};
function track(name,params){try{if(typeof window.gtag==="function")window.gtag("event",name,params||{});
  if(typeof window.fbq==="function"){if(name==="generate_lead")window.fbq("track","Lead",params||{});else window.fbq("trackCustom",name,params||{});}
  if(typeof window.clarity==="function")window.clarity("event",name);}catch(e){}}

/* ---------- hero: live 3D, then real before and after sliders ---------- */
var MODES={
  r3d:{lbl:"Live 3D",note:"Pigeon proofing on a real size roof. Tap to pick your roof, color, panels and spinners."},
  win:{lbl:"Windows",note:"Real job. Same door, before and after. Drag the bar."},
  sol:{lbl:"Solar",note:"Real photos. Same array, same day. Drag the bar."},
  pig:{lbl:"Pigeon proofing",note:"Real job. Droppings before, cleaned and meshed after. Drag the bar."}
};
var setMode=(function(){
  var box=$("wipe"), pct=$("wpct"), cur=null;
  [].forEach.call(box.querySelectorAll(".cmp"),function(c){
    var down=false; c._x=100;
    c._set=function(p){p=Math.max(0,Math.min(100,p));c._x=p;c.style.setProperty("--x",p+"%");
      if(c===cur)pct.textContent=Math.round(100-p)+"% clean";
      if(100-p>=90&&!c._done){c._done=1;track("compare_clean",{service:c.dataset.lay});}};
    function cx(e){var b=c.getBoundingClientRect();c._set((e.clientX-b.left)/b.width*100);}
    c.addEventListener("pointerdown",function(e){if(e.target.closest("button"))return;down=true;c._played=1;cx(e);});
    c.addEventListener("pointermove",function(e){if(down)cx(e);});
    ["pointerup","pointercancel","pointerleave"].forEach(function(t){c.addEventListener(t,function(){down=false;});});
    c._set(100);
  });
  function nudge(c){if(c._played)return;c._played=1;if(reduce){c._set(50);return;}
    var t0=performance.now();(function f(now){var t=Math.min(1,(now-t0)/1100),e=1-Math.pow(1-t,3);c._set(100-50*e);if(t<1)requestAnimationFrame(f);})(t0);}
  function set(m){
    if(!MODES[m])return;
    [].forEach.call($("modes").children,function(x){x.setAttribute("aria-pressed",String(x.dataset.m===m));});
    cur=null;[].forEach.call(box.querySelectorAll(".lay"),function(l){l.hidden=l.dataset.lay!==m;if(!l.hidden&&l.classList.contains("cmp"))cur=l;});
    $("wlbl").textContent=MODES[m].lbl; $("wnote").textContent=MODES[m].note; pct.hidden=!cur; window.__heroMode=m;
    if(cur){pct.textContent=Math.round(100-cur._x)+"% clean";nudge(cur);}
    if(m==="r3d"&&window.__tq3d)window.__tq3d();
  }
  $("modes").addEventListener("click",function(e){var b=e.target.closest("button");if(b)set(b.dataset.m);});
  set(CFG.tab||"r3d");
  return set;
})();

/* ---------- steps 1 to 3 ---------- */
var LIVE=CFG.live!==false; /* false only in previews, so a test never posts a real lead */
var FORM="https://formspree.io/f/mdkzdael";
var SHARE_BASE=CFG.shareBase||location.origin+location.pathname;
var st={win:true,sol:false,pig:false,scr:false,stories:1,more:false,inside:false,panels:16,spin:0,screens:4,pet:1,day:-1,time:2,plan:0};
if(CFG.svc){st.win=false;CFG.svc.forEach(function(k){st[k]=true;});}
var SV=["win","sol","pig","scr"], tiles=$("tiles");
function cents(n){return Math.round(n*100)/100;}
function money(n){n=cents(n);return "$"+n.toLocaleString("en-US",n%1?{minimumFractionDigits:2,maximumFractionDigits:2}:{maximumFractionDigits:0});}
function seg(id,key,after){$(id).addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;st[key]=+b.dataset.v;if(after)after(b);render();});}
function segSync(id,v){[].forEach.call($(id).children,function(x){x.setAttribute("aria-pressed",String(+x.dataset.v===v));});}
tiles.addEventListener("click",function(e){
  var b=e.target.closest(".tile"); if(!b)return; var k=b.dataset.svc; st[k]=!st[k];
  if(st[k]&&MODES[k])setMode(k); track("select_service",{service:k,on:st[k]}); render();
});
seg("stories","stories"); seg("tq-mesh","pet"); seg("time","time",function(){track("pick_time");}); seg("plan","plan",function(){track("pick_plan",{plan:st.plan});});
function sw(id,key){$(id).addEventListener("click",function(){st[key]=!st[key];render();});}
sw("inside","inside"); sw("more","more");
function stepper(m,p,key,lo,hi){$(m).addEventListener("click",function(){st[key]=Math.max(lo,st[key]-1);render();});$(p).addEventListener("click",function(){st[key]=Math.min(hi,st[key]+1);render();});}
stepper("pm","pp","panels",1,99); stepper("sm","sp","spin",0,20); stepper("cm","cp","screens",1,40);

/* days: the next 8 working days, Sundays off */
var DAYS=[],dd=new Date(); dd.setHours(12,0,0,0);
while(DAYS.length<8){dd.setDate(dd.getDate()+1); if(dd.getDay()!==0)DAYS.push(new Date(dd));}
var WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
DAYS.forEach(function(d,i){var b=document.createElement("button");b.type="button";b.className="day";b.dataset.i=i;b.setAttribute("aria-pressed","false");
  b.innerHTML=WD[d.getDay()]+"<b>"+d.getDate()+"</b>"+MO[d.getMonth()];$("days").appendChild(b);});
$("days").addEventListener("click",function(e){var b=e.target.closest(".day");if(!b)return;var i=+b.dataset.i;st.day=st.day===i?-1:i;track("pick_day");render();});
function dayText(){if(st.day<0)return "";var d=DAYS[st.day];return WD[d.getDay()]+" "+MO[d.getMonth()]+" "+d.getDate()+", "+["morning","afternoon","any time"][st.time];}

function items(){
  var a=[],n=st.panels,one=st.stories===1;
  if(st.win){a.push([(one?"Single":"Two")+" story windows",one?149:249]);
    if(st.more)a.push(["More than "+(one?12:20)+" windows",one?39:59]);
    if(st.inside)a.push(["Inside windows",49]);}
  if(st.sol)a.push(st.pig?[n+" solar panels washed",0,"Included"]:[n+" solar panels × $7",n*7]);
  if(st.pig){a.push(["Pigeon proofing, up to 12 panels",450]);
    if(n>12)a.push([(n-12)+" more panel"+(n-12>1?"s":"")+" × $50",(n-12)*50]);
    a.push([(n>=16?"3":"2")+" spinners",0,"Free"]);
    if(st.spin)a.push([st.spin+" extra spinner"+(st.spin>1?"s":"")+" × $50",st.spin*50]);}
  if(st.scr){var each=st.pet?64.99:53.99,sub=cents(st.screens*each);
    a.push([st.screens+" "+(st.pet?"pet and all weather":"standard")+" screen"+(st.screens>1?"s":"")+" × "+money(each),sub]);
    if(!st.win&&!st.sol&&!st.pig&&sub<149)a.push(["$149 job minimum",cents(149-sub)]);}
  return a;
}
function totalOf(it){var t=0;it.forEach(function(x){t+=x[1];});return cents(t);}
var shown=149,anim=null;
function render(){
  SV.forEach(function(k){document.querySelector('.tile[data-svc="'+k+'"]').setAttribute("aria-pressed",String(st[k]));document.querySelector('[data-body="'+k+'"]').hidden=!st[k];});
  $("empty").hidden=st.win||st.sol||st.pig||st.scr;
  $("panelRow").hidden=!(st.sol||st.pig);
  var one=st.stories===1;
  segSync("stories",st.stories); segSync("tq-mesh",st.pet); segSync("time",st.time); segSync("plan",st.plan);
  [].forEach.call($("days").children,function(x){x.setAttribute("aria-pressed",String(+x.dataset.i===st.day));});
  $("winNote").textContent=one?"1 story price covers 10 to 12 windows.":"2 story price covers 18 to 20 windows.";
  $("moreLbl").innerHTML="More than "+(one?12:20)+" windows <b class=\"num\" style=\"color:var(--gold-text)\">+$"+(one?39:59)+"</b>";
  $("solNote").textContent=st.pig?"Included free with pigeon proofing.":"Purified water and a soft brush. Set your panel count below.";
  $("inside").setAttribute("aria-checked",String(st.inside)); $("more").setAttribute("aria-checked",String(st.more));
  $("pn").textContent=st.panels; $("sn").textContent=st.spin; $("cn").textContent=st.screens;
  var it=items(), total=totalOf(it), tl=$("tlines"); tl.textContent="";
  if(!it.length){var e=document.createElement("div");e.className="tline";e.textContent="Tap a service above to see a price.";tl.appendChild(e);}
  it.forEach(function(x){var d=document.createElement("div");d.className="tline";var s=document.createElement("span");s.textContent=x[0];var b=document.createElement("b");b.textContent=x[2]||money(x[1]);d.appendChild(s);d.appendChild(b);tl.appendChild(d);});
  var sv=$("save"); sv.hidden=!st.pig; if(st.pig)sv.textContent="You save "+money(st.panels*7)+" on the panel wash";
  var a0=shown,t0=performance.now(); if(anim)cancelAnimationFrame(anim);
  (function step(now){var p=reduce?1:Math.min(1,(now-t0)/380),v=p>=1?total:a0+(total-a0)*(1-Math.pow(1-p,3));
    var txt=p>=1?money(total):money(Math.round(v)); $("ttotal").textContent=txt; $("dockTotal").textContent=txt; shown=v; if(p<1)anim=requestAnimationFrame(step);})(t0);
  msg(); if(window.__t3)window.__t3.update();
}
var iOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function msg(){
  var it=items(),total=totalOf(it), name=$("fname").value.trim(), street=$("fstreet").value.trim(), day=dayText();
  var t="Hi Tony"+(name?", it's "+name:"")+". I'd like "+(it.length?it.map(function(x){return x[0].charAt(0).toLowerCase()+x[0].slice(1)+" ("+(x[2]?x[2].toLowerCase():money(x[1]))+")";}).join(", ")+". Total "+money(total):"a quote")+"."
    +(st.plan?" I'd like this every "+(st.plan===1?"6":"3")+" months.":"")
    +(street?" I'm on "+street+".":"")
    +(day?" Best for me is "+day+". Does that work?":" When's your next opening?");
  $("msg").textContent=t; $("smsA").href="sms:+17145590300"+(iOS?"&":"?")+"body="+encodeURIComponent(t); msg.text=t; msg.total=total; msg.lines=it;
}
["fname","fstreet"].forEach(function(id){$(id).addEventListener("input",msg);});
function copyText(t,okMsg,node){
  var toast=$("toast");
  function sel(){var r=document.createRange();r.selectNodeContents(node);var s=getSelection();s.removeAllRanges();s.addRange(r);toast.textContent="Selected. Copy it with your phone's menu.";}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast.textContent=okMsg;},sel);else sel();
}
$("smsA").addEventListener("click",function(){track("text_tap");copyText(msg.text,"Copied too. If Messages didn't open, paste it into a text to 714-559-0300.",$("msg"));});
$("copyBtn").addEventListener("click",function(){copyText(msg.text,"Copied. Paste it into a text to 714-559-0300.",$("msg"));});

/* send: the lead reaches Tony even if they never press send in Messages */
$("sendForm").addEventListener("submit",function(e){
  e.preventDefault();
  var ph=$("fphone").value.replace(/\D/g,""); if(ph.length===11&&ph.charAt(0)==="1")ph=ph.slice(1);
  if(ph.length!==10){$("fphone").setAttribute("aria-invalid","true");$("ferr").textContent="Add a 10 digit mobile number so Tony can text you back.";$("fphone").focus();return;}
  $("fphone").removeAttribute("aria-invalid"); $("ferr").textContent="";
  var btn=$("sendBtn"); btn.disabled=true; btn.textContent="Sending…";
  var data={name:$("fname").value.trim(),phone:ph.slice(0,3)+"-"+ph.slice(3,6)+"-"+ph.slice(6),street:$("fstreet").value.trim(),
    quote:msg.lines.map(function(x){return x[0]+": "+(x[2]||money(x[1]));}).join("\n"),total:money(msg.total),
    day:dayText()||"Tony to suggest",schedule:["One time","Every 6 months","Every 3 months"][st.plan],message:msg.text,page:location.pathname,city:CFG.city||"",
    _subject:"New quote "+money(msg.total)+(msg.lines.length?" · "+msg.lines[0][0]:"")};
  function done(ok){
    btn.disabled=false; btn.textContent=ok?"Sent ✓":"Send my quote";
    if(ok){$("sent").hidden=false;$("prevNote").hidden=LIVE;track("generate_lead",{value:msg.total,currency:"USD"});try{document.dispatchEvent(new CustomEvent("tq:lead",{detail:{value:msg.total}}));}catch(e){}}
    else $("ferr").textContent="That didn't go through. Tap Text Tony instead, or call 714-559-0300.";
  }
  if(!LIVE){setTimeout(function(){done(true);},450);return;}
  fetch(FORM,{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json"},body:JSON.stringify(data)})
    .then(function(r){done(r.ok);},function(){done(false);});
});
$("fphone").addEventListener("input",function(){if(this.getAttribute("aria-invalid")){this.removeAttribute("aria-invalid");$("ferr").textContent="";}});

/* share: a link that reopens this exact quote */
var KEYS={w:"win",y:"stories",m:"more",i:"inside",o:"sol",p:"pig",n:"panels",x:"spin",c:"scr",k:"screens",t:"pet",f:"plan",h:"time"};
var BOOL={win:1,more:1,inside:1,sol:1,pig:1,scr:1}, LIM={stories:[1,2],panels:[1,99],spin:[0,20],screens:[1,40],pet:[0,1],plan:[0,2],time:[0,2]};
function token(){var t="q";for(var k in KEYS){var v=st[KEYS[k]];t+=k+(typeof v==="boolean"?+v:v);}return t;}
function loadToken(){
  var h=location.hash.slice(1); if(!/^q([a-z]\d+)+$/.test(h))return false;
  var re=/([a-z])(\d+)/g,m; h=h.slice(1);
  while((m=re.exec(h))){var key=KEYS[m[1]],v=+m[2];if(!key)continue;
    if(BOOL[key])st[key]=!!v;else{var L=LIM[key];st[key]=Math.max(L[0],Math.min(L[1],v));}}
  return true;
}
$("shareBtn").addEventListener("click",function(){
  var url=SHARE_BASE+"#"+token(), out=$("linkout"); out.textContent=url; track("share_quote");
  var data={title:"Our quote from Tony's Window Cleaning",text:"Here's the quote: "+money(msg.total),url:url};
  function copy(){copyText(url,"Link copied. Send it to anyone and it opens this exact quote.",out);}
  if(navigator.share)navigator.share(data).catch(copy);else copy();
});

/* first look at the price counts as a view */
if("IntersectionObserver" in window){var seen=false;new IntersectionObserver(function(en,o){if(en[0].isIntersecting&&!seen){seen=true;track("view_price");o.disconnect();}}).observe($("price"));}

/* ---------- ZIP check ---------- */
var Z={"92345":"Hesperia and Silverwood","92344":"Hesperia and Oak Hills","92340":"Hesperia","92392":"Victorville","92394":"Victorville","92395":"Victorville and Spring Valley Lake",
       "92307":"Apple Valley","92308":"Apple Valley","92301":"Adelanto","92371":"Phelan","92397":"Wrightwood","92372":"Pinon Hills"};
var IE={"91739":"Etiwanda","91737":"Alta Loma","91701":"Rancho Cucamonga","92336":"North Fontana","92880":"Eastvale","91709":"Chino Hills","91784":"Upland","92374":"Redlands","91761":"Ontario"};
if($("zipIn"))$("zipIn").addEventListener("input",function(){
  var v=this.value.replace(/\D/g,"").slice(0,5); this.value=v; var r=$("zres"); r.className="zres";
  if(v.length<5){r.textContent="Hesperia, Victorville, Apple Valley, Oak Hills, Phelan, Adelanto, Spring Valley Lake and Silverwood.";return;}
  if(Z[v]){r.className="zres yes";r.innerHTML="<b>Yes, we come to "+Z[v]+".</b> No trip fee.";}
  else if(IE[v]){r.className="zres maybe";r.innerHTML="<b>Yes for pigeon proofing in "+IE[v]+".</b> Text Tony for windows and solar down the hill.";}
  else{r.innerHTML="<b>Not on our usual route yet.</b> Text Tony anyway, he'll tell you straight.";}
});

/* ---------- 3D roof preview: live in the hero, full screen on tap ---------- */
(function(){
  var ov=$("ov"), loading=false, api=null, lastFocus=null, autoAfter=0, pend=[];
  var h3={stories:1,roof:0,color:0,after:0,spin:3,cov:true,arrays:1};
  function free(){return st.panels>=16?3:2;}
  function syncUI(){segSync("h3s",h3.stories);segSync("h3a",h3.arrays);segSync("h3r",h3.roof);segSync("h3c",h3.color);segSync("tq-ba",h3.after);
    $("s3n").textContent=h3.spin;$("p3n").textContent=st.panels;$("cov").setAttribute("aria-checked",String(h3.cov));}
  function load(then){
    if(api){if(then)then();return;} if(then)pend.push(then); if(loading)return; loading=true;
    var s=document.createElement("script"); s.src=(CFG.root||"")+"assets/vendor/three.min.js";
    s.onload=function(){try{api=init();api.attach(ov.hidden?$("h3host"):$("stage"));api.rebuild();api.start();pend.forEach(function(f){f();});pend=[];}catch(err){$("ovLoad").hidden=false;$("ovLoad").textContent="3D isn't available on this device.";}};
    s.onerror=function(){loading=false;$("ovLoad").textContent="Couldn't load the 3D. Close and try again.";};
    document.head.appendChild(s);
  }
  window.__tq3d=function(){h3.spin=free()+st.spin;load();};
  var saver=navigator.connection&&navigator.connection.saveData;
  if((CFG.tab||"r3d")==="r3d"&&!saver)addEventListener("load",function(){setTimeout(window.__tq3d,200);});
  function open(){
    lastFocus=document.activeElement; h3.stories=st.stories; h3.spin=free()+st.spin; h3.after=0; syncUI();
    ov.hidden=false; document.documentElement.style.overflow="hidden"; $("ovX").focus(); track("view_3d");
    clearTimeout(autoAfter); autoAfter=setTimeout(function(){h3.after=1;syncUI();if(api)api.state();},1600);
    load(function(){api.attach($("stage"));api.rebuild();});
  }
  function close(){ov.hidden=true;document.documentElement.style.overflow="";clearTimeout(autoAfter);
    if(api){h3.spin=free()+st.spin;api.attach($("h3host"));api.rebuild();}if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  $("h3host").parentNode.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  document.addEventListener("click",function(e){var o=e.target.closest(".open3d");if(o){e.preventDefault();open();}});
  $("ovX").addEventListener("click",close);
  addEventListener("keydown",function(e){if(e.key==="Escape"&&!ov.hidden)close();});
  function pick(id,fn){$(id).addEventListener("click",function(e){var b=e.target.closest("button");if(!b||b.dataset.v===undefined)return;fn(+b.dataset.v);syncUI();});}
  pick("h3s",function(v){h3.stories=v;st.stories=v;render();if(api)api.rebuild();});
  pick("h3a",function(v){h3.arrays=v;if(api)api.rebuild();track("solar_arrays",{arrays:v});});
  pick("h3r",function(v){h3.roof=v;if(api)api.rebuild();track("roof_type",{type:v});});
  pick("h3c",function(v){h3.color=v;if(api)api.rebuild();});
  pick("tq-ba",function(v){clearTimeout(autoAfter);h3.after=v;if(api)api.state();});
  function setPanels(n){st.panels=Math.max(1,Math.min(99,n));if(!st.sol&&!st.pig)st.sol=true;render();syncUI();}
  $("p3m").addEventListener("click",function(){setPanels(st.panels-1);});
  $("p3p").addEventListener("click",function(){setPanels(st.panels+1);});
  function setSpin(n,look){clearTimeout(autoAfter);h3.spin=Math.max(0,Math.min(10,n));h3.after=1;st.spin=Math.max(0,h3.spin-free());render();syncUI();if(api){api.state();if(look)api.lookBack();}}
  $("s3m").addEventListener("click",function(){setSpin(h3.spin-1);});
  $("s3p").addEventListener("click",function(){setSpin(h3.spin+1);});
  $("try1").addEventListener("click",function(){h3.cov=true;setSpin(1,true);track("try_one_spinner");});
  $("cov").addEventListener("click",function(){h3.cov=!h3.cov;syncUI();if(api)api.state();});
  window.__t3={update:function(){if(api)api.panels();}};

  function rng(seed){seed=seed%2147483647||7;return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
  function tex(w,h,draw,rep){var c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;}return t;}
  function noise(base,dark,light,amt,seed){return function(g,w,h){var r=rng(seed);g.fillStyle=base;g.fillRect(0,0,w,h);for(var i=0;i<amt;i++){g.fillStyle="rgba("+(r()<.5?dark:light)+","+(r()*.35)+")";g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}};}

  function init(){
    var T=THREE, stage=$("stage"), host=stage, heroVis=true, demoT=0;
    if("IntersectionObserver" in window)new IntersectionObserver(function(en){heroVis=en[0].isIntersecting;}).observe($("wipe"));
    var small=Math.min(screen.width,screen.height)<700;
    var R=new T.WebGLRenderer({antialias:true}); R.setPixelRatio(Math.min(devicePixelRatio||1,small?1.75:2));
    R.outputEncoding=T.sRGBEncoding; R.toneMapping=T.ACESFilmicToneMapping; R.toneMappingExposure=.92;
    R.shadowMap.enabled=true; R.shadowMap.type=T.PCFSoftShadowMap;
    $("ovLoad").hidden=true;
    var scene=new T.Scene(), cam=new T.PerspectiveCamera(34,1,.1,900);

    /* sky dome, and the same sky baked into reflections for glass, panels and spinners */
    var skyU={top:{value:new T.Color(0x3f86c6)},hor:{value:new T.Color(0xdfeaf1)},bot:{value:new T.Color(0xc9b793)}};
    var skyV="varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
    var skyF="uniform vec3 top;uniform vec3 hor;uniform vec3 bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.0?mix(hor,top,pow(h,0.55)):mix(hor,bot,pow(-h,0.35));gl_FragColor=vec4(c,1.0);}";
    function skyMesh(r){return new T.Mesh(new T.SphereGeometry(r,32,16),new T.ShaderMaterial({uniforms:skyU,vertexShader:skyV,fragmentShader:skyF,side:T.BackSide,depthWrite:false}));}
    scene.add(skyMesh(500));
    /* reflections: a small sky cube painted on canvases, no render targets needed */
    function face(kind,sun){var c=document.createElement("canvas");c.width=c.height=64;var g=c.getContext("2d");
      if(kind==="top"){g.fillStyle="#5d9ed6";g.fillRect(0,0,64,64);}
      else if(kind==="bot"){g.fillStyle="#a8966f";g.fillRect(0,0,64,64);}
      else{var gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,"#6aa6da");gr.addColorStop(.48,"#e9f1f5");gr.addColorStop(.52,"#cdbb96");gr.addColorStop(1,"#a8966f");g.fillStyle=gr;g.fillRect(0,0,64,64);
        if(sun){var sg=g.createRadialGradient(20,14,0,20,14,12);sg.addColorStop(0,"#ffffff");sg.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=sg;g.fillRect(0,0,64,64);}}
      return c;}
    var cube=new T.CubeTexture([face("side"),face("side",true),face("top"),face("bot"),face("side",true),face("side")]); cube.encoding=T.sRGBEncoding; cube.needsUpdate=true;
    scene.environment=cube;
    scene.fog=new T.Fog(0xe6eff4,70,320);
    scene.add(new T.HemisphereLight(0xe4f0ff,0x8a7455,.5));
    var sun=new T.DirectionalLight(0xfff0d6,2.3); sun.position.set(-13,21,15); sun.castShadow=true;
    var sm=small?1024:2048; sun.shadow.mapSize.set(sm,sm); sun.shadow.bias=-.0005; sun.shadow.normalBias=.04; scene.add(sun); scene.add(sun.target);
    var gravel=tex(256,256,noise("#b29d77","96,78,52","222,208,180",9000,5),true); gravel.repeat.set(80,80);
    var ground=new T.Mesh(new T.PlaneGeometry(600,600),new T.MeshStandardMaterial({map:gravel,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
    scene.fog=new T.Fog(0xd9ebf5,34,110);
    var house=new T.Group(); scene.add(house);

    var stuccoTex=tex(128,128,noise("#ece1cb","150,130,100","255,255,255",2600,11),true); stuccoTex.repeat.set(6,3);
    var concreteTex=tex(128,128,noise("#d3cfc6","120,118,110","250,250,245",2200,17),true); concreteTex.repeat.set(3,6);
    var garageTex=tex(128,128,function(g,w,h){g.fillStyle="#f1eee7";g.fillRect(0,0,w,h);g.fillStyle="rgba(0,0,0,.14)";for(var y=0;y<h;y+=32)g.fillRect(0,y+30,w,2);g.fillStyle="rgba(0,0,0,.06)";for(var x=0;x<w;x+=32)g.fillRect(x,0,1,h);});
    var cellTex=tex(128,212,function(g,w,h){g.fillStyle="#0e1726";g.fillRect(0,0,w,h);for(var i=0;i<6;i++)for(var j=0;j<10;j++){var gr=g.createLinearGradient(i*w/6,j*h/10,(i+1)*w/6,(j+1)*h/10);gr.addColorStop(0,"#1a2a44");gr.addColorStop(1,"#101b2e");g.fillStyle=gr;g.fillRect(i*w/6+1,j*h/10+1,w/6-2,h/10-2);}
      g.strokeStyle="rgba(200,210,225,.35)";g.lineWidth=.8;for(var k=1;k<4;k++){g.beginPath();g.moveTo(k*w/4,0);g.lineTo(k*w/4,h);g.stroke();}});
    var meshTex=tex(64,64,function(g,w,h){g.strokeStyle="#16181b";g.lineWidth=3;for(var i=0;i<=w;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}},true); meshTex.repeat.set(6,2);
    var granTex=tex(128,128,noise("#ffffff","0,0,0","255,255,255",5000,23),true); granTex.repeat.set(2,2);
    function Std(o){return new T.MeshStandardMaterial(o);}
    var M={
      wall:Std({map:stuccoTex,roughness:.95}), trim:Std({color:0xf4f1ea,roughness:.7}), under:Std({color:0x4a3c32,roughness:1}),
      glass:Std({color:0x1b2733,metalness:.9,roughness:.05}), garage:Std({map:garageTex,roughness:.6}), concrete:Std({map:concreteTex,roughness:.95}),
      shrub:Std({color:0x5f7a3e,roughness:1}), rock:Std({color:0x9c8a6c,roughness:1}),
      tile:Std({roughness:.72,side:T.DoubleSide}), shingle:Std({map:granTex,roughness:.95}),
      pframe:Std({color:0x1c1e21,metalness:.7,roughness:.35}), cell:Std({map:cellTex,metalness:.3,roughness:.1,envMapIntensity:1.4}), rail:Std({color:0xa3a9b0,metalness:.8,roughness:.4}),
      mesh:Std({map:meshTex,transparent:true,alphaTest:.35,side:T.DoubleSide,metalness:.4,roughness:.6}), clip:Std({color:0x2a2c30,metalness:.5,roughness:.5}),
      drop:new T.MeshBasicMaterial({color:0xf1eee4,transparent:true}),
      bird:Std({color:0x5a6370,roughness:.8}), wing:Std({color:0x444b55,roughness:.85}), neck:Std({color:0x557a66,metalness:.45,roughness:.35}), head:Std({color:0x444c57,roughness:.7}), beak:Std({color:0x2a2a2a}), leg:Std({color:0xc4767a}),
      blade:Std({color:0xffffff,metalness:1,roughness:.04}), bladeR:Std({color:0xd23a2c,metalness:.6,roughness:.2}), pole:Std({color:0x9aa0a8,metalness:.7,roughness:.35}), vent:Std({color:0x2e3135,roughness:.6}), flash:Std({color:0x8c9096,metalness:.5,roughness:.5}), clampM:Std({color:0xd9dde2,metalness:1,roughness:.2})
    };
    var G={frame:new T.BoxGeometry(1,.045,1.7),cell:new T.PlaneGeometry(.95,1.64),plane:new T.PlaneGeometry(1,1),clip:new T.BoxGeometry(.06,.07,.04),
      drop:new T.CircleGeometry(.035,10),ball:new T.SphereGeometry(1,16,12),blade:new T.BoxGeometry(.5,.012,.14),pole:new T.CylinderGeometry(.022,.022,.8,8),
      beak:new T.ConeGeometry(.018,.05,6),tail:new T.BoxGeometry(.1,.02,.15),leg:new T.CylinderGeometry(.008,.008,.08,5),vent:new T.CylinderGeometry(.06,.06,.36,14),flash:new T.CylinderGeometry(.2,.24,.02,16),clamp:new T.TorusGeometry(.075,.011,6,18)};
    G.pole=new T.CylinderGeometry(.018,.018,.9,8);
    G.cell.rotateX(-Math.PI/2);
    /* tile shapes: barrel for S tile, slab for flat tile, strip for shingle */
    var sT=new T.CylinderGeometry(.14,.14,.44,12,1,true,0,Math.PI); sT.rotateZ(Math.PI/2); sT.rotateY(Math.PI/2);
    var TILE=[{geo:sT,dx:.3,dz:.38,h:.14,tilt:-.07,stag:0},{geo:new T.BoxGeometry(.3,.035,.42),dx:.31,dz:.34,h:.05,tilt:-.06,stag:.155},{geo:new T.BoxGeometry(.98,.014,.34),dx:1,dz:.15,h:.035,tilt:-.035,stag:.333}];
    var PAL=[[[.72,.37,.24],[.62,.30,.20],[.80,.46,.30]],[[.44,.32,.25],[.35,.25,.20],[.53,.39,.29]],[[.27,.28,.29],[.21,.22,.23],[.33,.34,.35]],[[.77,.67,.51],[.70,.60,.44],[.83,.74,.58]]];

    function pigeon(){var g=new T.Group(),m;
      function add(geo,mat,sx,sy,sz,x,y,z){m=new T.Mesh(geo,mat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;}
      add(G.ball,M.bird,.12,.105,.2,0,.13,0); add(G.ball,M.wing,.125,.07,.16,0,.165,-.03);
      add(G.ball,M.neck,.07,.08,.07,0,.2,.12); add(G.ball,M.head,.055,.055,.06,0,.26,.165);
      var bk=add(G.beak,M.beak,1,1,1,0,.255,.225); bk.rotation.x=Math.PI/2;
      var tl=add(G.tail,M.wing,1,1,1,0,.12,-.24); tl.rotation.x=-.25;
      add(G.leg,M.leg,1,1,1,-.03,.04,.02); add(G.leg,M.leg,1,1,1,.03,.04,.02);
      g.scale.setScalar(1.35); return g;}

    var H=.2, TOP=.07, TT=.2, HALF=1.45, dims={W:12,L:6}, F=null, B=null, P={skirt:[],clips:[],drops:[],birds:[]}, built=-1, spinGroup=[], covC={}, covT={}, covM={};
    var target=new T.Vector3(), camDist=20, mt=0;
    function box(w,h,d,m,x,y,z,par,noCast){var o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=!noCast;o.receiveShadow=true;(par||house).add(o);return o;}
    function build(){
      while(house.children.length)house.remove(house.children[0]);
      P={skirt:[],clips:[],drops:[],birds:[]}; covM={}; spinGroup=[];
      var n=st.panels, A=Math.min(h3.arrays,n), r=rng(n*97+13+h3.stories*7+A*3), PW=1.02, PD=1.72, tile=TILE[h3.roof];
      TT=TOP+tile.h;
      var sizes=[];for(var i=0;i<A;i++)sizes.push(Math.floor(n/A)+(i<n%A?1:0));
      var faces=A===1?[1]:A===2?[1,-1]:[1,1,-1];
      var groups=sizes.map(function(ng,i){var c=ng<3?ng:Math.max(2,Math.min(10,Math.round(Math.sqrt(2.2*ng))));return {n:ng,face:faces[i],cols:c,rows:Math.ceil(ng/c)};});
      var need=0;[1,-1].forEach(function(sg){var gs=groups.filter(function(g){return g.face===sg;});var tw=gs.reduce(function(s,g){return s+g.cols*PW;},0)+Math.max(0,gs.length-1)*1.4;need=Math.max(need,tw);
        var x=-tw/2;gs.forEach(function(g){g.cx=x+g.cols*PW/2;x+=g.cols*PW+1.4;});});
      var maxRows=Math.max.apply(null,groups.map(function(g){return g.rows;}));
      var Wd=Math.max(11,need+4.5), L=Math.max(5.4,maxRows*PD+2.6), a=.4, run=L*Math.cos(a), rise=L*Math.sin(a), Dp=2*run, wallH=h3.stories*2.8, o=.45;
      dims={W:Wd,L:L,wallH:wallH,rise:rise,Dp:Dp};
      /* walls, trim, windows, garage */
      box(Wd,wallH,Dp,M.wall,0,wallH/2,0);
      if(h3.stories>1)box(Wd+.06,.12,Dp+.06,M.trim,0,2.8,0);
      for(var s=0;s<h3.stories;s++)[1,-1].forEach(function(side){[-.32,0,.32].forEach(function(fx,k){
        var y=s*2.8+1.5,x=fx*Wd,z=side*(Dp/2);
        if(s===0&&side===1&&k===1){box(2.8,2.2,.08,M.garage,x,1.1,z+side*.03);box(3.05,.12,.12,M.trim,x,2.27,z+side*.04);return;}
        box(1.5,1.28,.1,M.trim,x,y,z+side*.03); box(1.3,1.08,.06,M.glass,x,y,z+side*.07,null,true); box(.05,1.08,.08,M.trim,x,y,z+side*.09,null,true);
        box(1.62,.08,.2,M.trim,x,y-.68,z+side*.08);});});
      var gShape=new T.Shape(); gShape.moveTo(-run,0); gShape.lineTo(run,0); gShape.lineTo(0,rise); gShape.lineTo(-run,0);
      [1,-1].forEach(function(sx){var gm=new T.Mesh(new T.ShapeGeometry(gShape),M.wall);gm.material.side=T.DoubleSide;gm.rotation.y=Math.PI/2;gm.position.set(sx*Wd/2,wallH,0);gm.castShadow=true;gm.receiveShadow=true;house.add(gm);});
      /* yard: driveway, walk, a few shrubs and rocks */
      box(3.4,.03,9,M.concrete,0,.015,Dp/2+4.5,null,true); box(1.1,.03,3,M.concrete,Wd*.32,.015,Dp/2+1.5,null,true);
      for(var q=0;q<5;q++){var sb=new T.Mesh(G.ball,M.shrub);var sc=.35+r()*.35;sb.scale.set(sc,sc*.8,sc);sb.position.set((q%2?1:-1)*(2.6+r()*(Wd/2-2.4)),sc*.6,Dp/2+.8+r()*.8);sb.castShadow=true;house.add(sb);}
      for(q=0;q<6;q++){var rk=new T.Mesh(G.ball,M.rock);var rs=.12+r()*.15;rk.scale.set(rs*1.4,rs*.7,rs);rk.position.set((r()-.5)*Wd*1.2,rs*.3,Dp/2+1.6+r()*3);rk.castShadow=true;house.add(rk);}
      /* roof faces with real tiles */
      var pal=PAL[h3.color], col=new T.Color();
      function face(sign){var g=new T.Group();g.rotation.order="YXZ";g.rotation.set(a,sign>0?0:Math.PI,0);g.position.set(0,wallH+rise/2,sign*run/2);house.add(g);
        var slab=box(Wd+2*o,.06,L+o,M.under,0,TOP-.03,o/2,g); slab.castShadow=true;
        var x0=-(Wd/2+o)+tile.dx/2, x1=Wd/2+o-tile.dx/2, z0=-L/2+tile.dz/2, z1=L/2+o-tile.dz/2;
        var nx=Math.floor((x1-x0)/tile.dx)+2, nz=Math.floor((z1-z0)/tile.dz)+1, im=new T.InstancedMesh(tile.geo,h3.roof===2?M.shingle:M.tile,nx*nz), dm=new T.Object3D(), cnt=0;
        for(var zi=0;zi<nz;zi++)for(var xi=0;xi<nx;xi++){var off=tile.stag?((zi*tile.stag)%1)*tile.dx:0,x=x0+xi*tile.dx-off+ (tile.stag?tile.dx/2:0);
          if(x<x0-.01||x>x1+.01)continue; dm.position.set(x,TOP+(h3.roof===0?0:tile.h/2),z0+zi*tile.dz); dm.rotation.set(tile.tilt,0,0); dm.updateMatrix(); im.setMatrixAt(cnt,dm.matrix);
          var p=h3.roof===0?pal[Math.floor(r()*3)]:pal[r()<.8?0:Math.floor(r()*3)],v=h3.roof===0?.9+r()*.18:.95+r()*.09; col.setRGB(p[0]*v,p[1]*v,p[2]*v).convertSRGBToLinear(); im.setColorAt(cnt,col); cnt++;}
        im.count=cnt; im.instanceMatrix.needsUpdate=true; if(im.instanceColor)im.instanceColor.needsUpdate=true; im.receiveShadow=true; g.add(im);
        box(Wd+2*o,.24,.05,M.trim,0,TOP-.12,L/2+o,g); [1,-1].forEach(function(sx){box(.05,.24,L+o,M.trim,sx*(Wd/2+o),TOP-.12,o/2,g);});
        g.userData.sign=sign; return g;}
      F=face(1); B=face(-1);
      col.setRGB(pal[0][0]*.85,pal[0][1]*.85,pal[0][2]*.85).convertSRGBToLinear();
      var rg=new T.Mesh(new T.CylinderGeometry(.18,.18,Wd+2*o,16),Std({color:col.clone(),roughness:.75})); rg.rotation.z=Math.PI/2; rg.position.set(0,wallH+rise+TOP+.05,0); rg.castShadow=true; house.add(rg);
      /* solar arrays */
      var zTop=-L/2+1.35, rects={1:[],"-1":[]};
      function bird(par,fc,x,z,y,kind){var pg=pigeon();pg.position.set(x,y,z);pg.rotation.y=r()*6.28;par.add(pg);
        P.birds.push({m:pg,face:fc,x:x,z:z,kind:kind,k:0,kt:0,base:pg.position.clone(),dir:new T.Vector3(r()-.5,0,.6+r()*.6).normalize()});}
      groups.forEach(function(gp){
        var par=gp.face>0?F:B, ox=gp.cx-(gp.cols-1)/2*PW, occ={}, edges=[], py=TT+H;
        for(var i=0;i<gp.n;i++)occ[(i%gp.cols)+","+Math.floor(i/gp.cols)]=1;
        for(var rw=0;rw<gp.rows;rw++){var inRow=Math.min(gp.cols,gp.n-rw*gp.cols),rz=zTop+rw*PD+PD/2;[-.55,.55].forEach(function(dz){box(inRow*PW,.04,.05,M.rail,ox+(inRow-1)*PW/2,TT+H/2,rz+dz,par);});}
        for(i=0;i<gp.n;i++){var c=i%gp.cols,rw2=Math.floor(i/gp.cols),x=ox+c*PW,z=zTop+rw2*PD+PD/2;
          var fr=new T.Mesh(G.frame,M.pframe);fr.position.set(x,py,z);fr.castShadow=true;par.add(fr);
          var ce=new T.Mesh(G.cell,M.cell);ce.position.set(x,py+.024,z);par.add(ce);
          if(!occ[c+","+(rw2-1)])edges.push([x,z-PD/2,0,-1]); if(!occ[c+","+(rw2+1)])edges.push([x,z+PD/2,0,1]);
          if(!occ[(c-1)+","+rw2])edges.push([x-PW/2,z,1,-1]); if(!occ[(c+1)+","+rw2])edges.push([x+PW/2,z,1,1]);
          for(var d=0;d<3;d++)if(r()<.8){var dp=new T.Mesh(G.drop,M.drop);dp.rotation.x=-Math.PI/2;dp.scale.setScalar(.6+r()*1.2);dp.position.set(x+(r()-.5)*.8,py+.027,z+(r()-.5)*1.5);par.add(dp);P.drops.push(dp);}}
        edges.forEach(function(e){var len=e[2]?PD:PW,sk=new T.Mesh(G.plane,M.mesh);sk.position.set(e[0],TT+H/2,e[1]);if(e[2])sk.rotation.y=Math.PI/2;sk.scale.set(len,H,1);sk.userData.y0=TT;par.add(sk);P.skirt.push(sk);
          for(var qq=-1;qq<=1;qq+=2){var cl=new T.Mesh(G.clip,M.clip);cl.position.set(e[0]+(e[2]?0:qq*len*.3),py-.01,e[1]+(e[2]?qq*len*.3:0));if(e[2])cl.rotation.y=Math.PI/2;par.add(cl);P.clips.push(cl);}});
        edges.slice().sort(function(){return r()-.5;}).slice(0,Math.max(2,Math.round(4/A)+1)).forEach(function(e){bird(par,gp.face,e[0]+(e[2]?.32*e[3]:(r()-.5)*.4),e[1]+(e[2]?(r()-.5)*.6:.32*e[3]),TT,"U");});
        rects[gp.face].push([ox-PW/2-.4,ox+(gp.cols-.5)*PW+.4,zTop-.4,zTop+gp.rows*PD+.4]);
      });
      function spots(fc,par,count){var made=0,tries=0;while(made<count&&tries<500){tries++;var x=(r()-.5)*(Wd-1.2),z=-L/2+.5+r()*(L-1),hit=false;
        rects[fc].forEach(function(q){if(x>q[0]&&x<q[1]&&z>q[2]&&z<q[3])hit=true;}); if(hit)continue; bird(par,fc,x,z,TT,"O");made++;}}
      spots(1,F,6); spots(-1,B,8);
      for(var rr=0;rr<3;rr++)bird(house,0,(r()-.5)*(Wd-1.5),0,wallH+rise+TOP+.2,"R");
      spinners();
      var S2=Math.max(Wd,Dp)*.75+4; var sc2=sun.shadow.camera; sc2.left=-S2;sc2.right=S2;sc2.top=S2;sc2.bottom=-S2;sc2.near=1;sc2.far=90;sc2.updateProjectionMatrix();
      target.set(0,(wallH+rise)*.5,0); camDist=Math.max(Wd,Dp+2,(wallH+rise)*1.4)*1.75;
      built=n+"-"+A+"-"+h3.roof+"-"+h3.color+"-"+h3.stories;
      mt=h3.after?1:0; P.birds.forEach(function(b){b.k=0;});
    }
    var ORDER=[[1,0],[-1,0],[1,-.32],[-1,.32],[1,.32],[-1,-.32],[1,-.44],[-1,.44],[1,.16],[-1,-.16]];
    /* spinners mount on the roof vents with two hose clamps, the way Tony installs them */
    var ventGroup=[];
    function spinners(){
      spinGroup.forEach(function(g){g.parent.remove(g);}); spinGroup=[];
      ventGroup.forEach(function(g){g.parent.remove(g);}); ventGroup=[];
      var nv=Math.max(6,h3.spin);
      for(var i=0;i<nv;i++){var o=ORDER[i],face=o[0]>0?F:B,x=o[1]*dims.W,z=-dims.L/2+.6;
        var v=new T.Group();v.position.set(x,TT,z);
        var fl=new T.Mesh(G.flash,M.flash);fl.position.y=.01;fl.receiveShadow=true;v.add(fl);
        var vp=new T.Mesh(G.vent,M.vent);vp.position.y=.18;vp.castShadow=true;v.add(vp);
        face.add(v);ventGroup.push(v);
        if(i>=h3.spin)continue;
        var g=new T.Group();g.position.set(x,TT,z);
        var pl=new T.Mesh(G.pole,M.pole);pl.position.set(.085,.46,0);pl.castShadow=true;g.add(pl);
        [.1,.27].forEach(function(y){var cl=new T.Mesh(G.clamp,M.clampM);cl.rotation.x=Math.PI/2;cl.scale.set(1.45,1,1);cl.position.set(.035,y,0);g.add(cl);});
        var rot=new T.Group();rot.position.set(.085,.86,0);var hub=new T.Mesh(G.ball,M.pole);hub.scale.setScalar(.05);rot.add(hub);
        for(var bl=0;bl<3;bl++){var m=new T.Mesh(G.blade,bl===1?M.bladeR:M.blade);m.position.x=.25;m.rotation.x=.55;m.castShadow=true;var arm=new T.Group();arm.rotation.y=bl*Math.PI*2/3;arm.add(m);rot.add(arm);}
        g.add(rot);g.userData={rot:rot,face:o[0],x:x,z:z};face.add(g);spinGroup.push(g);}
      paintCover();
    }
    function paintCover(){
      [1,-1].forEach(function(sign){
        var face=sign>0?F:B;
        if(!covC[sign]){covC[sign]=document.createElement("canvas");covC[sign].width=256;covC[sign].height=128;covT[sign]=new T.CanvasTexture(covC[sign]);}
        if(!covM[sign]){covM[sign]=new T.Mesh(G.plane,new T.MeshBasicMaterial({map:covT[sign],transparent:true,depthWrite:false}));covM[sign].rotation.x=-Math.PI/2;covM[sign].renderOrder=2;face.add(covM[sign]);}
        var m=covM[sign]; m.scale.set(dims.W,dims.L,1); m.position.set(0,TT+.02,0);
        var g=covC[sign].getContext("2d"),cw=256,ch=128; g.clearRect(0,0,cw,ch);
        spinGroup.forEach(function(sp){var u=sp.userData;if(u.face!==sign)return;
          var cx=(u.x/dims.W+.5)*cw, cy=(u.z/dims.L+.5)*ch, rx=dims.L*1.1/dims.W*cw, ry=1.1*ch;
          g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI);g.closePath();g.fillStyle="rgba(240,176,64,.28)";g.fill();g.lineWidth=2;g.setLineDash([6,5]);g.strokeStyle="rgba(240,176,64,.95)";g.stroke();});
        covT[sign].needsUpdate=true;
      });
    }
    function covered(b){
      if(b.kind==="U")return false;
      for(var i=0;i<spinGroup.length;i++){var s=spinGroup[i].userData;
        if(b.kind==="R"){if(Math.abs(b.x-s.x)<dims.L*.8)return true;continue;}
        if(s.face!==b.face)continue; var dx=b.x-s.x,dz=b.z-s.z;
        if(dz>0&&Math.hypot(dx,dz)<dims.L*1.1&&Math.atan2(Math.abs(dx),dz)<HALF)return true;}
      return false;
    }
    function state(){
      if(spinGroup.length!==h3.spin)spinners();
      var aft=!!h3.after, left={1:0,"-1":0,0:0,U:0};
      P.birds.forEach(function(b){b.kt=aft&&(b.kind==="U"||covered(b))?1:0;if(!b.kt)left[b.kind==="U"?"U":b.face]++;});
      spinGroup.forEach(function(g){g.visible=aft;}); [1,-1].forEach(function(k){if(covM[k])covM[k].visible=aft&&h3.cov;});
      var sf=0,sb=0; spinGroup.forEach(function(g){if(g.userData.face>0)sf++;else sb++;});
      var total=left[1]+left[-1]+left[0]+left.U, m=$("ovMsg"); m.hidden=false; m.className="ov-msg";
      if(!aft)m.innerHTML="<b>Before:</b> "+total+" pigeons on your roof and nesting under the panels. Tap <b>After</b>.";
      else if(!total)m.innerHTML="<b>Roof clear.</b> Mesh keeps them out from under the panels. "+h3.spin+" spinners cover the front, the back and the ridge.";
      else{m.className="ov-msg warn";
        if(!h3.spin)m.innerHTML="<b>Mesh only.</b> Nothing can nest under the panels, but "+total+" pigeons still sit on the open roof. Add spinners.";
        else if(!sb&&left[-1])m.innerHTML="<b>"+h3.spin+(h3.spin>1?" spinners only watch":" spinner only watches")+" the front.</b> The ridge blocks the flash, so "+left[-1]+" pigeons are still on the back side. Add one facing the back.";
        else if(!sf&&left[1])m.innerHTML="<b>Nothing faces the front.</b> "+left[1]+" pigeons still sit next to your panels.";
        else m.innerHTML="<b>"+total+" pigeon"+(total>1?"s":"")+" still outside the flash</b> at the corners. Add another spinner.";}
      var n=st.panels, price=450+Math.max(0,n-12)*50+st.spin*50;
      $("osum").innerHTML="<b>"+n+" panels in "+Math.min(h3.arrays,n)+" array"+(Math.min(h3.arrays,n)>1?"s":"")+" · "+h3.spin+" spinner"+(h3.spin===1?"":"s")+" · "+money(price)+"</b><br>"+free()+" spinners come free with pigeon proofing. Extras are $50 each. This updates your price on the page.";
    }
    /* camera: drag to turn, pinch or wheel to zoom */
    var yaw=.55, tilt=.36, zoom=1, spinOn=true, yawTo=null, pts={}, pinch=0, el=R.domElement;
    el.addEventListener("pointerdown",function(e){pts[e.pointerId]=[e.clientX,e.clientY];spinOn=false;yawTo=null;try{el.setPointerCapture(e.pointerId);}catch(x){}});
    el.addEventListener("pointermove",function(e){var p=pts[e.pointerId];if(!p)return;var ids=Object.keys(pts);
      if(ids.length===1){yaw-=(e.clientX-p[0])*.008;tilt=Math.max(.12,Math.min(1.2,tilt+(e.clientY-p[1])*.005));}
      pts[e.pointerId]=[e.clientX,e.clientY];
      if(ids.length===2){var a=pts[ids[0]],b=pts[ids[1]],dd=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)zoom=Math.max(.45,Math.min(1.7,zoom*pinch/dd));pinch=dd;}});
    function up(e){delete pts[e.pointerId];pinch=0;}
    el.addEventListener("pointerup",up); el.addEventListener("pointercancel",up);
    el.addEventListener("wheel",function(e){e.preventDefault();zoom=Math.max(.45,Math.min(1.7,zoom*(1+e.deltaY*.001)));},{passive:false});
    function size(){var w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
    if("ResizeObserver" in window){var ro=new ResizeObserver(size);ro.observe(stage);ro.observe($("h3host"));}
    var raf=0,last=0;
    function loop(now){
      var dt=Math.min(.05,(now-last)/1000); last=now; raf=requestAnimationFrame(loop);
      var inHero=ov.hidden;
      if(inHero&&!(heroVis&&window.__heroMode==="r3d"))return;
      if(inHero){demoT+=dt;if(demoT>3.4){demoT=0;h3.after=h3.after?0:1;state();}}
      if(yawTo!==null){yaw+=(yawTo-yaw)*Math.min(1,dt*2.5);if(Math.abs(yawTo-yaw)<.01)yawTo=null;}
      else if(spinOn&&!reduce)yaw+=dt*.14;
      var mT=h3.after?1:0; if(mt!==mT){mt+=(mT-mt)*Math.min(1,dt*2.4);if(Math.abs(mt-mT)<.003)mt=mT;}
      P.skirt.forEach(function(s){s.visible=mt>.02;s.scale.y=H*Math.min(1,mt*1.4);s.position.y=s.userData.y0+s.scale.y/2;});
      P.clips.forEach(function(c){c.visible=mt>.75;}); M.drop.opacity=1-mt; P.drops.forEach(function(d){d.visible=mt<.98;});
      P.birds.forEach(function(b){if(b.k!==b.kt){b.k+=(b.kt-b.k)*Math.min(1,dt*1.8);if(Math.abs(b.k-b.kt)<.004)b.k=b.kt;}
        var k=b.k;b.m.visible=k<.97;b.m.position.copy(b.base).addScaledVector(b.dir,k*3);b.m.position.y=b.base.y+k*k*5;});
      spinGroup.forEach(function(g,i){g.userData.rot.rotation.y+=dt*(3.2+i*.3);});
      var d=camDist*(inHero?1.3:zoom)*(cam.aspect<1.1?1.3:1);
      cam.position.set(target.x+Math.sin(yaw)*Math.cos(tilt)*d,target.y+Math.sin(tilt)*d,target.z+Math.cos(yaw)*Math.cos(tilt)*d); cam.lookAt(target);
      R.render(scene,cam);
      if(inHero&&!R.userData){R.userData=1;$("r3dPoster").setAttribute("hidden","");}
    }
    function key(){return st.panels+"-"+Math.min(h3.arrays,st.panels)+"-"+h3.roof+"-"+h3.color+"-"+h3.stories;}
    return {
      attach:function(el2){host=el2;el2.insertBefore(R.domElement,el2.firstChild);size();},
      rebuild:function(){build();state();size();},
      panels:function(){if(key()!==built)build();state();},
      state:state,
      lookBack:function(){spinOn=false;yawTo=Math.round((yaw-2.5)/(Math.PI*2))*Math.PI*2+2.5;},
      start:function(){if(!raf){size();last=performance.now();raf=requestAnimationFrame(loop);}},
      stop:function(){cancelAnimationFrame(raf);raf=0;}
    };
  }
})();

if(CFG.street)$("fstreet").placeholder=CFG.street;
if(loadToken()){$("shared").hidden=false;setTimeout(function(){$("need").scrollIntoView({block:"start"});},60);}
render();
})();
