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

/* ---------- hero: swipe for windows, real before and after for solar and pigeons ---------- */
var MODES={
  r3d:{lbl:"Live 3D",note:"Pigeon proofing on a real size roof. Tap to pick your roof, color and spinners."},
  win:{lbl:"Windows",note:"Real window we cleaned. Dirt layer simulated.",area:[[96,203,358,203,358,516,96,516],[430,196,480,196,480,516,430,516]]},
  sol:{lbl:"Solar",note:"Real photos. Same array, same day. Drag the bar."},
  pig:{lbl:"Pigeon proofing",note:"Real Oak Hills job."}
};
var setMode=(function(){
  var box=$("wipe"), cv=$("wcv"), ctx=cv.getContext("2d"), img=$("wimg"), pct=$("wpct");
  var W=480,H=640; cv.width=W; cv.height=H;
  var PW=48,PH=64,probe=document.createElement("canvas"); probe.width=PW; probe.height=PH; var pc=probe.getContext("2d",{willReadFrequently:true});
  var base=1, ready=false;
  function r(a,b){return a+Math.random()*(b-a);}
  function path(){ctx.beginPath();MODES.win.area.forEach(function(p){ctx.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)ctx.lineTo(p[i],p[i+1]);ctx.closePath();});}
  function count(){pc.clearRect(0,0,PW,PH);pc.drawImage(cv,0,0,PW,PH);var d=pc.getImageData(0,0,PW,PH).data,n=0;for(var i=3;i<d.length;i+=4)if(d[i]>60)n++;return n;}
  function dirty(){
    ctx.globalCompositeOperation="source-over"; ctx.clearRect(0,0,W,H);
    ctx.save(); path(); ctx.clip();
    ctx.fillStyle="rgba(116,97,68,.9)"; ctx.fillRect(0,0,W,H);
    for(var i=0;i<40;i++){var x=r(0,W),y=r(0,H),rr=r(30,90),g=ctx.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,"rgba(72,58,38,.45)");g.addColorStop(1,"rgba(72,58,38,0)");ctx.fillStyle=g;ctx.fillRect(x-rr,y-rr,2*rr,2*rr);}
    for(var k=0;k<2600;k++){ctx.fillStyle="rgba("+(Math.random()<.5?"60,48,30,":"170,150,112,")+r(.15,.45)+")";ctx.fillRect(r(0,W),r(0,H),r(1,3),r(1,3));}
    ctx.strokeStyle="rgba(200,190,168,.35)";ctx.lineWidth=3;for(var s=0;s<14;s++){var sx=r(90,470);ctx.beginPath();ctx.moveTo(sx,r(200,300));ctx.lineTo(sx+r(-6,6),r(420,516));ctx.stroke();}
    ctx.restore(); base=Math.max(1,count()); pct.textContent="0%"; box.classList.remove("clean","touched"); ready=true;
  }
  function measure(){var p=Math.max(0,Math.min(100,Math.round((1-count()/base)*100)));if(p>=97)p=100;pct.textContent=p+"%";if(p>=65&&!box.classList.contains("clean")){box.classList.add("clean");track("swipe_clean",{service:"win"});}}
  var last=null,queued=false,rad=W*.1;
  function dab(x,y){var g=ctx.createRadialGradient(x,y,rad*.35,x,y,rad);g.addColorStop(0,"#000");g.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,2*rad,2*rad);}
  function wipe(x,y){ctx.globalCompositeOperation="destination-out";
    if(last){var dx=x-last[0],dy=y-last[1],n=Math.ceil(Math.hypot(dx,dy)/(rad*.3));for(var i=1;i<=n;i++)dab(last[0]+dx*i/n,last[1]+dy*i/n);}else dab(x,y);
    last=[x,y]; if(!queued){queued=true;requestAnimationFrame(function(){queued=false;measure();});}}
  function pos(e){var b=cv.getBoundingClientRect(),s=Math.max(b.width/W,b.height/H),ox=(b.width-W*s)/2,oy=(b.height-H*s)/2;return[(e.clientX-b.left-ox)/s,(e.clientY-b.top-oy)/s];}
  var down=false;
  cv.addEventListener("pointerdown",function(e){down=true;last=null;box.classList.add("touched");var p=pos(e);wipe(p[0],p[1]);});
  cv.addEventListener("pointermove",function(e){if(down){var p=pos(e);wipe(p[0],p[1]);}});
  ["pointerup","pointercancel","pointerleave"].forEach(function(t){cv.addEventListener(t,function(){down=false;last=null;});});
  if(img.complete)dirty();else img.addEventListener("load",dirty);

  /* solar: drag the bar between the real before and after */
  var cmp=$("cmp"), cdown=false, played=false;
  function setX(p){cmp.style.setProperty("--x",Math.max(0,Math.min(100,p))+"%");}
  function cx(e){var b=cmp.getBoundingClientRect();setX((e.clientX-b.left)/b.width*100);}
  cmp.addEventListener("pointerdown",function(e){cdown=true;cx(e);});
  cmp.addEventListener("pointermove",function(e){if(cdown)cx(e);});
  ["pointerup","pointercancel","pointerleave"].forEach(function(t){cmp.addEventListener(t,function(){if(cdown)track("compare_drag",{service:"sol"});cdown=false;});});
  function nudge(){if(played||reduce)return;played=true;var t0=performance.now();(function f(now){var t=(now-t0)/1400;if(t>=1){setX(50);return;}setX(50+Math.sin(t*Math.PI*2)*22);requestAnimationFrame(f);})(t0);}

  function set(m){
    if(!MODES[m])return;
    [].forEach.call($("modes").children,function(x){x.setAttribute("aria-pressed",String(x.dataset.m===m));});
    [].forEach.call(box.querySelectorAll(".lay"),function(l){l.hidden=l.dataset.lay!==m;});
    $("wlbl").textContent=MODES[m].lbl; $("wnote").textContent=MODES[m].note; pct.hidden=m!=="win"; window.__heroMode=m; if(m==="r3d"&&window.__tq3d)window.__tq3d();
    if(m==="sol")nudge();
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

/* ---------- 3D roof preview: opens full screen, loads only on tap ---------- */
(function(){
  var ov=$("ov"), loading=false, api=null, lastFocus=null, autoAfter=0;
  var h3={stories:1,roof:0,color:0,after:0,spin:3,cov:true};
  function free(){return st.panels>=16?3:2;}
  function syncUI(){segSync("h3s",h3.stories);segSync("h3r",h3.roof);segSync("h3c",h3.color);segSync("tq-ba",h3.after);$("s3n").textContent=h3.spin;$("cov").setAttribute("aria-checked",String(h3.cov));}
  var pend=[];
  function load(then){
    if(api){if(then)then();return;} if(then)pend.push(then); if(loading)return; loading=true;
    var s=document.createElement("script"); s.src=(CFG.root||"")+"assets/vendor/three.min.js";
    s.onload=function(){try{api=init();api.attach(ov.hidden?$("h3host"):$("stage"));api.rebuild();api.start();pend.forEach(function(f){f();});pend=[];}catch(err){$("ovLoad").textContent="3D isn't available on this device.";}};
    s.onerror=function(){loading=false;$("ovLoad").textContent="Couldn't load the 3D. Close and try again.";};
    document.head.appendChild(s);
  }
  /* the hero demo starts right after the page paints */
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
  pick("h3r",function(v){h3.roof=v;if(api)api.retex();track("roof_type",{type:v});});
  pick("h3c",function(v){h3.color=v;if(api)api.retex();});
  pick("tq-ba",function(v){clearTimeout(autoAfter);h3.after=v;if(api)api.state();});
  function setSpin(n,look){clearTimeout(autoAfter);h3.spin=Math.max(0,Math.min(10,n));h3.after=1;st.spin=Math.max(0,h3.spin-free());render();syncUI();if(api){api.state();if(look)api.lookBack();}}
  $("s3m").addEventListener("click",function(){setSpin(h3.spin-1);});
  $("s3p").addEventListener("click",function(){setSpin(h3.spin+1);});
  $("try1").addEventListener("click",function(){setSpin(1,true);track("try_one_spinner");});
  $("cov").addEventListener("click",function(){h3.cov=!h3.cov;syncUI();if(api)api.state();});
  window.__t3={update:function(){if(api&&!ov.hidden)api.panels();}};

  function rng(seed){seed=seed%2147483647||7;return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
  function tex(w,h,draw,rep){var c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;}return t;}

  function init(){
    var T=THREE, stage=$("stage"), host=stage, heroVis=true, demoT=0;
    if("IntersectionObserver" in window)new IntersectionObserver(function(en){heroVis=en[0].isIntersecting;}).observe($("wipe"));
    var R=new T.WebGLRenderer({antialias:true,alpha:true}); R.setPixelRatio(Math.min(devicePixelRatio||1,2)); R.outputEncoding=T.sRGBEncoding;
    $("ovLoad").hidden=true;
    var scene=new T.Scene(), cam=new T.PerspectiveCamera(34,1,.1,400);
    scene.add(new T.HemisphereLight(0xffffff,0xb89a78,.8));
    var sun=new T.DirectionalLight(0xfff2dc,1.0); sun.position.set(-8,16,10); scene.add(sun);
    var ground=new T.Mesh(new T.CircleGeometry(220,64),new T.MeshStandardMaterial({color:0xb09c74,roughness:1})); ground.rotation.x=-Math.PI/2; scene.add(ground);
    scene.fog=new T.Fog(0xd9ebf5,34,110);
    var house=new T.Group(); scene.add(house);

    /* roof textures: S tile, flat tile, shingle, in four colors */
    var COL=[[169,87,58],[110,81,64],[70,72,76],[194,166,124]], cache={};
    function sh(c,f){return "rgb("+c.map(function(v){return Math.max(0,Math.min(255,Math.round(v*f)));}).join(",")+")";}
    function roofTex(type,ci){var key=type+"-"+ci; if(cache[key])return cache[key]; var c=COL[ci], r=rng(ci*31+type*7+3);
      var t=tex(256,256,function(g,w,h){
        if(type===0){g.fillStyle=sh(c,.5);g.fillRect(0,0,w,h);var rh=h/6;
          for(var y=0;y<6;y++)for(var x=0;x<w;x+=32){var f=.9+r()*.2,gr=g.createLinearGradient(x,0,x+32,0);gr.addColorStop(0,sh(c,.5*f));gr.addColorStop(.35,sh(c,1.18*f));gr.addColorStop(.62,sh(c,.95*f));gr.addColorStop(1,sh(c,.48*f));g.fillStyle=gr;g.fillRect(x,y*rh,32,rh-4);g.fillStyle="rgba(0,0,0,.35)";g.fillRect(x,y*rh+rh-4,32,4);}}
        else if(type===1){g.fillStyle=sh(c,.5);g.fillRect(0,0,w,h);
          for(var y2=0,row=0;y2<h;y2+=32,row++)for(var x2=(row%2)*16-16;x2<w;x2+=32){g.fillStyle=sh(c,.82+r()*.25);g.fillRect(x2+1,y2,30,28);g.fillStyle="rgba(0,0,0,.3)";g.fillRect(x2+1,y2+28,30,4);}}
        else{g.fillStyle=sh(c,.42);g.fillRect(0,0,w,h);
          for(var y3=0,r3=0;y3<h;y3+=16,r3++)for(var x3=(r3%2)*16-16;x3<w;x3+=32){g.fillStyle=sh(c,.62+r()*.3);g.fillRect(x3+1,y3,30,14);g.fillStyle="rgba(0,0,0,.32)";g.fillRect(x3+1,y3+13,30,3);}
          for(var k=0;k<4000;k++){g.fillStyle="rgba("+(r()<.5?"0,0,0":"255,255,255")+","+(r()*.14)+")";g.fillRect(r()*w,r()*h,1.5,1.5);}}
      },true); cache[key]=t; return t;}
    var cellTex=tex(128,212,function(g,w,h){g.fillStyle="#172a47";g.fillRect(0,0,w,h);var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,"rgba(120,160,220,.22)");gr.addColorStop(.5,"rgba(0,0,0,0)");gr.addColorStop(1,"rgba(120,160,220,.12)");g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle="rgba(170,190,220,.55)";g.lineWidth=1;for(var i=1;i<6;i++){g.beginPath();g.moveTo(i*w/6,0);g.lineTo(i*w/6,h);g.stroke();}for(var j=1;j<10;j++){g.beginPath();g.moveTo(0,j*h/10);g.lineTo(w,j*h/10);g.stroke();}});
    var meshTex=tex(64,64,function(g,w,h){g.strokeStyle="#1f2226";g.lineWidth=3;for(var i=0;i<=w;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}},true); meshTex.repeat.set(5,2);
    var M={
      roof:new T.MeshStandardMaterial({roughness:.85}), ridge:new T.MeshStandardMaterial({roughness:.8}),
      wall:new T.MeshStandardMaterial({color:0xe9dcc6,roughness:.95}), trim:new T.MeshStandardMaterial({color:0xf6f3ee,roughness:.8}),
      glass:new T.MeshStandardMaterial({color:0x2c3e50,metalness:.4,roughness:.15}), door:new T.MeshStandardMaterial({color:0xd9d1c3,roughness:.7}),
      frame:new T.MeshStandardMaterial({color:0xc9ced4,metalness:.7,roughness:.35}), cell:new T.MeshStandardMaterial({map:cellTex,metalness:.35,roughness:.22}),
      mesh:new T.MeshStandardMaterial({map:meshTex,transparent:true,alphaTest:.35,side:T.DoubleSide,metalness:.5,roughness:.5}),
      clip:new T.MeshStandardMaterial({color:0x1d1f22,roughness:.6}), drop:new T.MeshBasicMaterial({color:0xf2efe6,transparent:true}),
      bird:new T.MeshStandardMaterial({color:0x4f5663,roughness:.7}), head:new T.MeshStandardMaterial({color:0x2f3a48,roughness:.6}), beak:new T.MeshStandardMaterial({color:0x2a2a2a}),
      blade:new T.MeshStandardMaterial({color:0xe6edf3,metalness:.6,roughness:.15,emissive:0x1c242c}), bladeR:new T.MeshStandardMaterial({color:0xd84a3a,metalness:.4,roughness:.25,emissive:0x2a0a05}),
      pole:new T.MeshStandardMaterial({color:0x8a9098,metalness:.6,roughness:.4}),
      cover:new T.MeshBasicMaterial({color:0xf0b040,transparent:true,opacity:.24,depthWrite:false,side:T.DoubleSide})
    };
    var G={frame:new T.BoxGeometry(1,.05,1.7),cell:new T.PlaneGeometry(.95,1.63),plane:new T.PlaneGeometry(1,1),clip:new T.BoxGeometry(.06,.07,.04),
      drop:new T.CircleGeometry(.035,10),ball:new T.SphereGeometry(1,14,10),blade:new T.BoxGeometry(.5,.018,.13),pole:new T.CylinderGeometry(.025,.025,.8,8),beak:new T.ConeGeometry(.022,.06,6)};
    G.cell.rotateX(-Math.PI/2);
    function retex(){var t=roofTex(h3.roof,h3.color);t.repeat.set(dims.fw/2.4,dims.fl/2.4);M.roof.map=t;M.roof.needsUpdate=true;M.ridge.color.set(sh(COL[h3.color],.75));}
    function pigeon(){var g=new T.Group();var b=new T.Mesh(G.ball,M.bird);b.scale.set(.15,.12,.24);b.position.y=.12;g.add(b);
      var hd=new T.Mesh(G.ball,M.head);hd.scale.setScalar(.075);hd.position.set(0,.25,.19);g.add(hd);
      var bk=new T.Mesh(G.beak,M.beak);bk.rotation.x=Math.PI/2;bk.position.set(0,.24,.28);g.add(bk);
      var tl=new T.Mesh(G.plane,M.head);tl.scale.set(.12,.16,1);tl.rotation.x=-Math.PI/2.4;tl.position.set(0,.1,-.28);g.add(tl);
      g.scale.setScalar(1.35);return g;}

    var H=.28, TOP=.07, HALF=1.45, dims={fw:12,fl:6}, F=null, B=null, P={skirt:[],clips:[],drops:[],birds:[],spin:[],cover:[]}, built=-1, spinGroup=[];
    var target=new T.Vector3(), camDist=20, mt=0;
    function box(w,h,d,m,x,y,z,par){var o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(par||house).add(o);return o;}
    function build(){
      while(house.children.length)house.remove(house.children[0]);
      for(var k in P)P[k]=[]; covM={};
      var n=st.panels, r=rng(n*97+13+h3.stories), cols=Math.max(2,Math.min(12,Math.round(Math.sqrt(2.2*n)))), rows=Math.ceil(n/cols);
      var PW=1.02,PD=1.72,AW=cols*PW,AD=rows*PD;
      var Wd=Math.max(11,AW+5), L=Math.max(5.4,AD+2.6), a=.4, run=L*Math.cos(a), rise=L*Math.sin(a), Dp=2*run, wallH=h3.stories*2.8, o=.45;
      dims={fw:Wd+2*o,fl:L+o,W:Wd,L:L,wallH:wallH,rise:rise,Dp:Dp};
      box(Wd,wallH,Dp,M.wall,0,wallH/2,0);
      if(h3.stories>1)box(Wd+.06,.14,Dp+.06,M.trim,0,2.8,0);
      for(var s=0;s<h3.stories;s++)[1,-1].forEach(function(side){
        [-.32,0,.32].forEach(function(fx,i){
          var y=s*2.8+1.5, x=fx*Wd, z=side*(Dp/2+.02);
          if(s===0&&side===1&&i===1){box(2.6,2.1,.06,M.door,x,1.05,side*(Dp/2+.03));return;}
          box(1.5,1.25,.05,M.trim,x,y,z); box(1.3,1.05,.06,M.glass,x,y,side*(Dp/2+.03));
        });});
      var gShape=new T.Shape(); gShape.moveTo(-run,0); gShape.lineTo(run,0); gShape.lineTo(0,rise); gShape.lineTo(-run,0);
      [1,-1].forEach(function(sx){var gm=new T.Mesh(new T.ShapeGeometry(gShape),M.wall);gm.material.side=T.DoubleSide;gm.rotation.y=Math.PI/2;gm.position.set(sx*Wd/2,wallH,0);house.add(gm);});
      function face(sign){var g=new T.Group();g.rotation.order="YXZ";g.rotation.set(a,sign>0?0:Math.PI,0);g.position.set(0,wallH+rise/2,sign*run/2);
        var slab=new T.Mesh(new T.BoxGeometry(Wd+2*o,.14,L+o),M.roof);slab.position.set(0,0,o/2);g.add(slab);house.add(g);g.userData.sign=sign;return g;}
      F=face(1); B=face(-1);
      var rg=new T.Mesh(new T.CylinderGeometry(.17,.17,Wd+2*o,14),M.ridge); rg.rotation.z=Math.PI/2; rg.position.set(0,wallH+rise+.06,0); house.add(rg);
      /* panels on the front face */
      var ox=-(cols-1)/2*PW, zTop=-L/2+1.35, occ={}, edges=[];
      for(var i=0;i<n;i++)occ[(i%cols)+","+Math.floor(i/cols)]=1;
      for(i=0;i<n;i++){var c=i%cols,rw=Math.floor(i/cols),x=ox+c*PW,z=zTop+rw*PD+PD/2;
        var fr=new T.Mesh(G.frame,M.frame);fr.position.set(x,TOP+H,z);F.add(fr);
        var ce=new T.Mesh(G.cell,M.cell);ce.position.set(x,TOP+H+.027,z);F.add(ce);
        if(!occ[c+","+(rw-1)])edges.push([x,z-PD/2,0,-1]); if(!occ[c+","+(rw+1)])edges.push([x,z+PD/2,0,1]);
        if(!occ[(c-1)+","+rw])edges.push([x-PW/2,z,1,-1]); if(!occ[(c+1)+","+rw])edges.push([x+PW/2,z,1,1]);
        for(var d=0;d<3;d++)if(r()<.8){var dp=new T.Mesh(G.drop,M.drop);dp.rotation.x=-Math.PI/2;dp.scale.setScalar(.6+r()*1.2);dp.position.set(x+(r()-.5)*.8,TOP+H+.03,z+(r()-.5)*1.5);F.add(dp);P.drops.push(dp);}
      }
      edges.forEach(function(e){var len=e[2]?PD:PW,sk=new T.Mesh(G.plane,M.mesh);sk.position.set(e[0],TOP+H/2,e[1]);if(e[2])sk.rotation.y=Math.PI/2;sk.scale.set(len,H,1);F.add(sk);P.skirt.push(sk);
        for(var q=-1;q<=1;q+=2){var cl=new T.Mesh(G.clip,M.clip);cl.position.set(e[0]+(e[2]?0:q*len*.3),TOP+H-.01,e[1]+(e[2]?q*len*.3:0));if(e[2])cl.rotation.y=Math.PI/2;F.add(cl);P.clips.push(cl);}});
      /* pigeons: under the panels, on each face, on the ridge */
      function bird(par,face,x,z,y,kind){var p=pigeon();p.position.set(x,y,z);p.rotation.y=r()*6.28;par.add(p);
        P.birds.push({m:p,face:face,x:x,z:z,kind:kind,k:0,kt:0,base:p.position.clone(),dir:new T.Vector3(r()-.5,0,.6+r()*.6).normalize()});}
      edges.slice().sort(function(){return r()-.5;}).slice(0,4).forEach(function(e){bird(F,1,e[0]+(e[2]?.32*e[3]:(r()-.5)*.4),e[1]+(e[2]?(r()-.5)*.6:.32*e[3]),TOP,"U");});
      var ax0=ox-PW/2-.4, ax1=-ox+PW/2+.4, az0=zTop-.4, az1=zTop+AD+.4;
      function spots(face,par,count){var made=0,tries=0;while(made<count&&tries<400){tries++;var x=(r()-.5)*(Wd-1.2),z=-L/2+.5+r()*(L-1);
        if(face===1&&x>ax0&&x<ax1&&z>az0&&z<az1)continue; bird(par,face,x,z,TOP,"O");made++;}}
      spots(1,F,6); spots(-1,B,8);
      for(var rr=0;rr<3;rr++)bird(house,0,(r()-.5)*(Wd-1.5),0,wallH+rise+.2,"R");
      P.birds.forEach(function(b){if(b.kind==="R"){b.base.z=0;}});
      dims.ax=[ax0,ax1,az0,az1];
      retex(); spinners();
      target.set(0,(wallH+rise)*.55,0); camDist=Math.max(Wd,Dp+2,(wallH+rise)*1.4)*1.75;
      built=n;
    }
    var ORDER=[[1,0],[-1,0],[1,-.32],[-1,.32],[1,.32],[-1,-.32],[1,-.44],[-1,.44],[1,.16],[-1,-.16]];
    function spinners(){
      spinGroup.forEach(function(g){g.parent.remove(g);}); spinGroup=[];
      for(var i=0;i<h3.spin;i++){var o=ORDER[i],face=o[0]>0?F:B,x=o[1]*dims.W,z=-dims.L/2+.45;
        var g=new T.Group();g.position.set(x,TOP,z);var pl=new T.Mesh(G.pole,M.pole);pl.position.y=.4;g.add(pl);
        var rot=new T.Group();rot.position.y=.8;var hub=new T.Mesh(G.ball,M.pole);hub.scale.setScalar(.06);rot.add(hub);
        for(var bl=0;bl<3;bl++){var m=new T.Mesh(G.blade,bl===1?M.bladeR:M.blade);m.position.x=.25;m.rotation.x=.55;var arm=new T.Group();arm.rotation.y=bl*Math.PI*2/3;arm.add(m);rot.add(arm);}
        g.add(rot);g.userData={rot:rot,face:o[0],x:x,z:z};face.add(g);spinGroup.push(g);
}
      paintCover();
    }
    var covC={}, covT={}, covM={};
    function paintCover(){
      [1,-1].forEach(function(sign){
        var face=sign>0?F:B;
        if(!covC[sign]){covC[sign]=document.createElement("canvas");covC[sign].width=256;covC[sign].height=128;covT[sign]=new T.CanvasTexture(covC[sign]);}
        if(!covM[sign]||covM[sign].parent!==face){covM[sign]=new T.Mesh(G.plane,new T.MeshBasicMaterial({map:covT[sign],transparent:true,opacity:.5,depthWrite:false}));covM[sign].rotation.x=-Math.PI/2;covM[sign].renderOrder=2;face.add(covM[sign]);}
        var m=covM[sign]; m.scale.set(dims.W,dims.L,1); m.position.set(0,TOP+.015,0);
        var g=covC[sign].getContext("2d"),cw=256,ch=128; g.clearRect(0,0,cw,ch); g.fillStyle="#f0b040";
        spinGroup.forEach(function(sp){var u=sp.userData;if(u.face!==sign)return;
          var cx=(u.x/dims.W+.5)*cw, cy=(u.z/dims.L+.5)*ch, rx=dims.L*1.1/dims.W*cw, ry=dims.L*1.1/dims.L*ch;
          g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI);g.closePath();g.fill();});
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
      $("osum").innerHTML="<b>"+n+" panels · "+h3.spin+" spinner"+(h3.spin===1?"":"s")+" · "+money(price)+"</b><br>"+free()+" spinners come free with pigeon proofing. Extras are $50 each. This updates your price on the page.";
    }
    /* camera: drag to turn, pinch or wheel to zoom */
    var yaw=.55, tilt=.42, zoom=1, spinOn=true, yawTo=null, pts={}, pinch=0;
    var el=R.domElement;
    el.addEventListener("pointerdown",function(e){pts[e.pointerId]=[e.clientX,e.clientY];spinOn=false;yawTo=null;el.setPointerCapture(e.pointerId);});
    el.addEventListener("pointermove",function(e){var p=pts[e.pointerId];if(!p)return;var ids=Object.keys(pts);
      if(ids.length===1){yaw-=(e.clientX-p[0])*.008;tilt=Math.max(.12,Math.min(1.2,tilt+(e.clientY-p[1])*.005));}
      pts[e.pointerId]=[e.clientX,e.clientY];
      if(ids.length===2){var a=pts[ids[0]],b=pts[ids[1]],dd=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)zoom=Math.max(.5,Math.min(1.7,zoom*pinch/dd));pinch=dd;}});
    function up(e){delete pts[e.pointerId];pinch=0;}
    el.addEventListener("pointerup",up); el.addEventListener("pointercancel",up);
    el.addEventListener("wheel",function(e){e.preventDefault();zoom=Math.max(.5,Math.min(1.7,zoom*(1+e.deltaY*.001)));},{passive:false});
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
      P.skirt.forEach(function(s){s.visible=mt>.02;s.scale.y=H*Math.min(1,mt*1.4);s.position.y=TOP+s.scale.y/2;});
      P.clips.forEach(function(c){c.visible=mt>.75;}); M.drop.opacity=1-mt; P.drops.forEach(function(d){d.visible=mt<.98;});
      P.birds.forEach(function(b){if(b.k!==b.kt){b.k+=(b.kt-b.k)*Math.min(1,dt*1.8);if(Math.abs(b.k-b.kt)<.004)b.k=b.kt;}
        var k=b.k;b.m.visible=k<.97;b.m.position.copy(b.base).addScaledVector(b.dir,k*3);b.m.position.y=b.base.y+k*k*5;});
      spinGroup.forEach(function(g,i){g.userData.rot.rotation.y+=dt*(3.2+i*.3);});
      var d=camDist*(inHero?1.3:zoom)*(cam.aspect<1.1?1.3:1);
      cam.position.set(target.x+Math.sin(yaw)*Math.cos(tilt)*d,target.y+Math.sin(tilt)*d,target.z+Math.cos(yaw)*Math.cos(tilt)*d); cam.lookAt(target);
      R.render(scene,cam);
      if(inHero&&!R.userData){R.userData=1;$("r3dPoster").setAttribute("hidden","");}
    }
    return {
      attach:function(el){host=el;el.insertBefore(R.domElement,el.firstChild);size();},
      rebuild:function(){build();state();size();},
      panels:function(){if(st.panels!==built){build();}state();},
      retex:retex, state:state,
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
