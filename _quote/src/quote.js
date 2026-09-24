/* Tony's quick quote, core: prices, the three steps, service plan PDF, send, share, ZIP and the hero.
   Page settings come from window.TQ = {svc, mode, city, street, live}.
   The 3D preview (assets/quote/q3d.js on three.js) loads on demand.
   Source lives in _quote/src. Run _quote/build.py after editing. */
(function(){
"use strict";
var CFG=window.TQ||{}, doc=document;
function $(id){return doc.getElementById(id);}
function $$(sel,root){return [].slice.call((root||doc).querySelectorAll(sel));}
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var LIVE=CFG.live!==false; /* false only in previews, so a test never posts a real lead */
var FORM="https://formspree.io/f/mdkzdael", PHONE="714-559-0300", SMS="+17145590300";
function track(name,params){try{
  if(typeof window.gtag==="function")window.gtag("event",name,params||{});
  if(typeof window.fbq==="function"){if(name==="generate_lead")window.fbq("track","Lead",params||{});else window.fbq("trackCustom",name,params||{});}
  if(typeof window.clarity==="function")window.clarity("event",name);
}catch(e){}}

/* ---------- prices, all in one place ---------- */
var P={win:[0,149,249],more:[0,39,59],covers:[0,"10 to 12","18 to 20"],coverMax:[0,12,20],inside:49,panel:7,
  pig:450,pigUpTo:12,pigPer:50,spinner:50,mesh:[53.99,64.99],meshName:["charcoal fiberglass","all weather"],frame:10,scrMin:149,
  pane:12,pc:[0,249,349],roof:109,gr:129,ad:129,com:89,early:0.10,
  large:null /* extra labor for large custom homes; null means Tony confirms on site */};

/* ---------- state ---------- */
var MAIN=["win","sol","pig","scr"], EXTRA=["hw","roof","pc","gut","pw","ad","gr","com"], ALL=MAIN.concat(EXTRA);
var st={stories:1,more:false,inside:false,large:false,panels:16,spin:0,screens:4,build:0,pet:1,panes:6,day:"",time:-1,plan:0};
ALL.forEach(function(k){st[k]=false;});
(CFG.svc&&CFG.svc.length?CFG.svc:["win"]).forEach(function(k){if(ALL.indexOf(k)>=0)st[k]=true;});
var LIMIT={stories:[1,2],panels:[1,99],spin:[0,20],screens:[1,40],build:[0,40],pet:[0,1],panes:[1,60],plan:[0,2],time:[-1,1]};
function clamp(k,v){var L=LIMIT[k];v=L?Math.max(L[0],Math.min(L[1],v)):v;return k==="build"?Math.min(v,st.screens):v;}

function cents(n){return Math.round(n*100)/100;}
function money(n){n=cents(n);var neg=n<0;n=Math.abs(n);
  return (neg?"−":"")+"$"+n.toLocaleString("en-US",n%1?{minimumFractionDigits:2,maximumFractionDigits:2}:{maximumFractionDigits:0});}
function pl(n){return n===1?"":"s";}
function free(){return st.panels>=16?3:2;}
function anyOther(k){return ALL.some(function(x){return x!==k&&st[x];});}

function items(){
  var a=[],n=st.panels,s=st.stories;
  function add(t,v,o){o=o||{};a.push({t:t,v:v||0,note:o.note||"",from:!!o.from});}
  if(st.win){add((s===1?"Single":"Two")+" story windows, screens, tracks and sills",P.win[s]);
    if(st.more)add("More than "+P.coverMax[s]+" windows",P.more[s]);
    if(st.inside)add("Inside windows, whole house, tracks included",P.inside);
    if(st.large)add("Large custom home, extra labor",P.large||0,P.large?{}:{note:"Tony confirms"});}
  if(st.pig){add("Pigeon proofing, up to "+P.pigUpTo+" panels",P.pig);
    if(n>P.pigUpTo)add((n-P.pigUpTo)+" more panel"+pl(n-P.pigUpTo)+" × $"+P.pigPer,(n-P.pigUpTo)*P.pigPer);
    add(free()+" reflective spinners",0,{note:"Free"});
    if(st.spin)add(st.spin+" extra spinner"+pl(st.spin)+" × $"+P.spinner,st.spin*P.spinner);
    add(n+" solar panels washed",0,{note:"Free"});
    add("Roof soft wash",0,{note:"Free"});}
  else if(st.sol)add(n+" solar panel"+pl(n)+" × $"+P.panel,n*P.panel);
  if(st.scr){var each=P.mesh[st.pet],sub=cents(st.screens*each+st.build*P.frame);
    add(st.screens+" "+P.meshName[st.pet]+" screen"+pl(st.screens)+" × "+money(each),cents(st.screens*each));
    if(st.build)add(st.build+" new frame"+pl(st.build)+" built × $"+P.frame,st.build*P.frame);
    if(!anyOther("scr")&&sub<P.scrMin)add("$"+P.scrMin+" job minimum",cents(P.scrMin-sub));}
  if(st.hw)add("Hard water removal, "+st.panes+" pane"+pl(st.panes)+" × $"+P.pane,st.panes*P.pane,{from:true});
  if(st.roof&&!st.pig)add("Roof soft wash",P.roof,{from:true});
  if(st.pc)add("New construction clean, "+(s===1?"single":"two")+" story, inside and out",P.pc[s],{from:true});
  if(st.gut)add("Gutter cleanout",0,{note:"Quoted on site"});
  if(st.pw)add("Driveway and patio wash",0,{note:"Quoted on site"});
  if(st.ad)add("Decal and vinyl removal",P.ad,{from:true});
  if(st.gr)add("Graffiti removal",P.gr,{from:true});
  if(st.com)add("Storefront glass, per visit",P.com,{from:true});
  return a;
}
function totals(){
  var it=items(),sub=0;it.forEach(function(x){sub+=x.v;});sub=cents(sub);
  var early=st.day&&sub>0?cents(sub*P.early):0;
  return {it:it,sub:sub,early:early,total:cents(sub-early),from:it.some(function(x){return x.from;})};
}
function savings(t){
  var a=[];
  if(st.pig){a.push(["Solar wash for your "+st.panels+" panels, free with pigeon proofing",st.panels*P.panel]);a.push(["Roof soft wash, free with pigeon proofing",P.roof]);}
  if(t.early)a.push(["Early bird, date picked today",t.early]);
  return a;
}
/* what each maintenance visit costs on a plan */
function recurring(){
  var v=0,s=st.stories;
  if(st.win){v+=P.win[s];if(st.more)v+=P.more[s];if(st.inside)v+=P.inside;}
  if(st.sol||st.pig)v+=st.panels*P.panel;
  return v;
}

/* ---------- days: any day, the next 60 in a row, plus a date box for anything later ---------- */
var WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function iso(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);}
function parseIso(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?new Date(+m[1],+m[2]-1,+m[3],12):null;}
function fmt(d,long){return WD[d.getDay()]+" "+MO[d.getMonth()]+" "+d.getDate()+(long?", "+d.getFullYear():"");}
function addMonths(d,m){var x=new Date(d.getTime());var day=x.getDate();x.setDate(1);x.setMonth(x.getMonth()+m);
  var last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(day,last));return x;}
var TODAY=new Date();TODAY.setHours(12,0,0,0);
function dayText(){var d=parseIso(st.day);if(!d)return "";return fmt(d)+(st.time===0?", morning":st.time===1?", afternoon":"");}

/* ---------- lazy parts: other services' options and the 3D controls wait in <template> until first use ---------- */
var hydrated=false;
function hydrate(){if(hydrated)return;hydrated=true;
  $$("template[data-tpl]").forEach(function(t){if(t.content)t.parentNode.replaceChild(doc.importNode(t.content,true),t);});render();}
function setText(id,txt){var el=$(id);if(el)el.textContent=txt;}

/* ---------- delegated controls: data-seg, data-sw, data-step (3D-only controls use data-h*) ---------- */
function setKey(k,v){
  if(k==="pet"||k==="stories"||k==="plan"||k==="time")v=clamp(k,+v);
  st[k]=v;
  if(k==="plan")track("pick_plan",{plan:v});
  if(k==="time")track("pick_time",{time:v});
  render();
}
doc.addEventListener("click",function(e){
  var t=e.target;if(!t.closest)return;
  if(!hydrated&&t.closest(".tq"))hydrate();
  var b=t.closest("[data-seg] button[data-v]");
  if(b){var k=b.parentNode.getAttribute("data-seg"),v=+b.getAttribute("data-v");
    if(k==="time"&&st.time===v)v=-1; /* tap again to clear */
    setKey(k,v);return;}
  var s=t.closest("[data-sw]");
  if(s){var k2=s.getAttribute("data-sw");st[k2]=!st[k2];if(k2==="inside"&&st.inside&&!st.win)st.win=true;track("toggle_"+k2,{on:st[k2]});render();return;}
  var p=t.closest("[data-step] button[data-d]");
  if(p){var k3=p.parentNode.getAttribute("data-step");st[k3]=clamp(k3,st[k3]+(+p.getAttribute("data-d")));
    if(k3==="panels"&&!st.sol&&!st.pig)st.sol=true;render();return;}
  var tile=t.closest("[data-svc]");
  if(tile){var k4=tile.getAttribute("data-svc");if(ALL.indexOf(k4)<0)return;st[k4]=!st[k4];
    if(st[k4]&&k4==="hw"&&!st.win)st.win=true;
    if(st[k4]){var m={win:"win",sol:"sol",pig:"pig",scr:"scr"}[k4];if(m)core.mode=m;if(m&&api)api.pref(m);}
    track("select_service",{service:k4,on:st[k4]});render();return;}
  if(t.closest("#moreSvc")){var x=$("xtiles"),open=x.hidden;x.hidden=!open;$("moreSvc").setAttribute("aria-expanded",String(open));if(open)track("more_services");return;}
  var o3=t.closest(".open3d");
  if(o3){e.preventDefault();open3d(o3.getAttribute("data-mode")||core.mode);return;}
});

/* ---------- render ---------- */
var shown=0,anim=null,firstRender=true;
function render(){
  st.build=clamp("build",st.build);
  $$("[data-svc]").forEach(function(x){var k=x.getAttribute("data-svc");if(ALL.indexOf(k)>=0)x.setAttribute("aria-pressed",String(st[k]));});
  $$("[data-body]").forEach(function(x){x.hidden=!st[x.getAttribute("data-body")];});
  var anyOn=ALL.some(function(k){return st[k];});
  $("empty").hidden=anyOn;
  $("panelRow").hidden=!(st.sol||st.pig);
  if(EXTRA.some(function(k){return st[k];})&&$("xtiles").hidden){$("xtiles").hidden=false;$("moreSvc").setAttribute("aria-expanded","true");}
  $$("[data-seg]").forEach(function(g){var k=g.getAttribute("data-seg");$$("button[data-v]",g).forEach(function(b){b.setAttribute("aria-pressed",String(+b.getAttribute("data-v")===st[k]));});});
  $$("[data-sw]").forEach(function(x){x.setAttribute("aria-checked",String(!!st[x.getAttribute("data-sw")]));});
  $$("[data-step]").forEach(function(g){var o=g.querySelector("output");if(o)o.textContent=st[g.getAttribute("data-step")];});
  var s=st.stories;
  setText("winNote",(s===1?"1":"2")+" story price covers "+P.covers[s]+" windows.");
  setText("moreLbl","More than "+P.coverMax[s]+" windows ");
  setText("moreAmt","+$"+P.more[s]);
  setText("solNote",st.pig?"Free with pigeon proofing. Purified water and a soft brush.":"Purified water and a soft brush, dries spot free. Set your panel count below.");
  $$("[data-mesh-fact]").forEach(function(x){x.hidden=+x.getAttribute("data-mesh-fact")!==st.pet;});
  var hwWin=$("hwWin");if(hwWin)hwWin.hidden=!st.hw;

  var t=totals(),tl=$("tlines");tl.textContent="";
  if(!t.it.length){var e0=doc.createElement("div");e0.className="tline";e0.textContent="Tap a service above to see a price.";tl.appendChild(e0);}
  t.it.forEach(function(x){var d=doc.createElement("div");d.className="tline"+(x.note?" inc":"");var a=doc.createElement("span");a.textContent=x.t;var b2=doc.createElement("b");
    b2.textContent=x.note||((x.from?"from ":"")+money(x.v));d.appendChild(a);d.appendChild(b2);tl.appendChild(d);});
  if(t.early){var d2=doc.createElement("div");d2.className="tline early-l";var a2=doc.createElement("span");a2.textContent="Early bird, 10% off";var b3=doc.createElement("b");b3.textContent=money(-t.early);d2.appendChild(a2);d2.appendChild(b3);tl.appendChild(d2);}
  var sv=savings(t),box=$("save");box.textContent="";box.hidden=!sv.length;
  if(sv.length){var tot=0;sv.forEach(function(x){tot+=x[1];});var h=doc.createElement("b");h.textContent="You save "+money(tot);box.appendChild(h);
    sv.forEach(function(x){var r=doc.createElement("span");r.textContent=x[0]+": "+money(x[1]);box.appendChild(r);});}
  $("fromNote").hidden=!t.from;
  $("earlyTip").hidden=!!st.day||!anyOn;
  $("early").className="early"+(st.day?" on":"");
  $("earlyTxt").textContent=st.day?"Early bird locked in: 10% off, "+money(t.early)+" saved.":"Pick your date today and save 10%. Get ahead of everyone else.";
  var a0=shown,t0=performance.now(),target=t.total;if(anim)cancelAnimationFrame(anim);
  if(firstRender||reduce){shown=target;paint(target,true);firstRender=false;}
  else (function step(now){var q=Math.min(1,(now-t0)/380),v=q>=1?target:a0+(target-a0)*(1-Math.pow(1-q,3));shown=v;paint(q>=1?target:Math.round(v),q>=1);if(q<1)anim=requestAnimationFrame(step);})(t0);
  function paint(v,final){var txt=(t.from&&final?"from ":"")+money(v);$("ttotal").textContent=txt;var dt=$("dockTotal");if(dt)dt.textContent=money(v);}
  days();planBox(t);msg(t);
  if(api)api.sync();
}

/* ---------- step 2: days and plan ---------- */
var dayRow=$("days");
(function(){
  for(var i=1;i<=60;i++){var d=new Date(TODAY.getTime());d.setDate(d.getDate()+i);
    var b=doc.createElement("button");b.type="button";b.className="day";b.setAttribute("data-day",iso(d));b.setAttribute("aria-pressed","false");
    var w=doc.createElement("span");w.textContent=WD[d.getDay()];var n=doc.createElement("b");n.textContent=d.getDate();var m=doc.createElement("span");m.textContent=MO[d.getMonth()];
    b.appendChild(w);b.appendChild(n);b.appendChild(m);dayRow.appendChild(b);}
  var min=new Date(TODAY.getTime());min.setDate(min.getDate()+1);var max=new Date(TODAY.getTime());max.setFullYear(max.getFullYear()+1);
  var di=$("dateIn");di.min=iso(min);di.max=iso(max);
  di.addEventListener("change",function(){var d=parseIso(di.value);if(d&&d>=min&&d<=max){st.day=iso(d);track("pick_day",{other:1});}else st.day="";render();});
  dayRow.addEventListener("click",function(e){var b=e.target.closest(".day");if(!b)return;var v=b.getAttribute("data-day");st.day=st.day===v?"":v;if(st.day)track("pick_day");render();});
})();
function days(){
  $$(".day",dayRow).forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-day")===st.day));});
  var di=$("dateIn"),inRow=!!dayRow.querySelector('[data-day="'+st.day+'"]');di.value=st.day&&!inRow?st.day:"";
  var pick=$("dayPicked");pick.textContent=st.day?"Your day: "+dayText()+". Tony confirms by text.":"";
}
function schedule(t){
  var freq=[0,6,3][st.plan],per=recurring(),start=parseIso(st.day);
  if(!freq)return {freq:0,visits:[],per:per,year:t.total};
  var n=12/freq,v=[];
  for(var i=0;i<n;i++)v.push({i:i,date:start?addMonths(start,i*freq):null,amt:i===0?t.total:per,label:i===0?"First visit, everything on your quote":"Maintenance visit"});
  return {freq:freq,visits:v,per:per,year:cents(t.total+per*(n-1))};
}
function planBox(t){
  var sc=schedule(t),box=$("planbox"),ol=$("visits");
  $("pdfBtn").textContent=st.plan?"Download my plan (PDF)":"Download my quote (PDF)";
  if(!st.plan){box.hidden=true;return;}
  box.hidden=false;ol.textContent="";
  if(!sc.per){$("plantot").textContent="Plans cover window and solar cleaning. Add one of those above to build a plan.";return;}
  sc.visits.forEach(function(v){var li=doc.createElement("li");var a=doc.createElement("span");a.textContent=(v.date?fmt(v.date,true):(v.i===0?"Your first visit":"Month "+(v.i*sc.freq+1)))+" · "+v.label;
    var b=doc.createElement("b");b.textContent=money(v.amt);li.appendChild(a);li.appendChild(b);ol.appendChild(li);});
  $("plantot").textContent="About "+money(sc.year)+" for the year. Your price is locked for the year, and Tony writes the plan up before anything is scheduled.";
}

/* ---------- step 3: the text, send, copy ---------- */
var iOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function lineText(x){return x.t+" ("+(x.note?x.note.toLowerCase():(x.from?"from ":"")+money(x.v))+")";}
function msg(t){
  t=t||totals();
  var name=$("fname").value.trim(),street=$("fstreet").value.trim(),day=dayText();
  var s="Hi Tony"+(name?", it's "+name:"")+". ";
  s+=t.it.length?"I'd like "+t.it.map(function(x){return lineText(x).replace(/^./,function(c){return c.toLowerCase();});}).join(", ")+". Total "+(t.from?"from ":"")+money(t.total)+(t.early?" with the early bird 10% off":"")+".":"I'd like a quote.";
  if(st.plan)s+=" I'd like this on a plan, every "+(st.plan===1?"6":"3")+" months.";
  if(street)s+=" I'm on "+street+".";
  s+=day?" Best day for me is "+day+".":" When's your next opening?";
  $("msg").textContent=s;
  $("smsA").href="sms:"+SMS+(iOS?"&":"?")+"body="+encodeURIComponent(s);
  msg.text=s;msg.t=t;
}
["fname","fstreet"].forEach(function(id){$(id).addEventListener("input",function(){msg();});});
function copyText(txt,okMsg,node){
  var toast=$("toast");
  function sel(){try{var r=doc.createRange();r.selectNodeContents(node);var s=getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}toast.textContent="Selected. Copy it with your phone's menu.";}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){toast.textContent=okMsg;},sel);else sel();
}
$("smsA").addEventListener("click",function(){track("text_tap");copyText(msg.text,"Copied too. If Messages didn't open, paste it into a text to "+PHONE+".",$("msg"));});
$("copyBtn").addEventListener("click",function(){copyText(msg.text,"Copied. Paste it into a text to "+PHONE+".",$("msg"));});

/* send: the lead reaches Tony even if they never press send in Messages */
var lastSend=0;
$("sendForm").addEventListener("submit",function(e){
  e.preventDefault();
  if($("hp").value)return; /* bots fill the hidden field, people never see it */
  var ph=$("fphone").value.replace(/\D/g,"");if(ph.length===11&&ph.charAt(0)==="1")ph=ph.slice(1);
  if(ph.length!==10){$("fphone").setAttribute("aria-invalid","true");$("ferr").textContent="Add a 10 digit mobile number so Tony can text you back.";$("fphone").focus();return;}
  if(Date.now()-lastSend<30000){$("ferr").textContent="Got it already. Tony will text you back from "+PHONE+".";return;}
  $("fphone").removeAttribute("aria-invalid");$("ferr").textContent="";
  var btn=$("sendBtn");btn.disabled=true;btn.textContent="Sending…";
  var t=totals(),sc=schedule(t);
  var data={name:$("fname").value.trim().slice(0,80),phone:ph.slice(0,3)+"-"+ph.slice(3,6)+"-"+ph.slice(6),street:$("fstreet").value.trim().slice(0,120),
    quote:t.it.map(lineText).join("\n"),subtotal:money(t.sub),early_bird:t.early?money(-t.early):"none",total:(t.from?"from ":"")+money(t.total),
    day:dayText()||"Tony to suggest",plan:st.plan?("Every "+sc.freq+" months, "+sc.visits.length+" visits, about "+money(sc.year)+" a year. Maintenance visits "+money(sc.per)+" each"):"One time",
    message:msg.text,page:location.pathname,city:CFG.city||"",check_this_quote:shareUrl(),
    _subject:"New quote "+money(t.total)+(t.it.length?" · "+t.it[0].t:""),_gotcha:""};
  function done(ok){
    btn.disabled=false;btn.textContent=ok?"Sent ✓":"Send my quote";
    if(ok){lastSend=Date.now();$("sent").hidden=false;$("prevNote").hidden=LIVE;track("generate_lead",{value:t.total,currency:"USD"});try{doc.dispatchEvent(new CustomEvent("tq:lead",{detail:{value:t.total}}));}catch(x){}}
    else $("ferr").textContent="That didn't go through. Tap Text Tony instead, or call "+PHONE+".";
  }
  if(!LIVE){setTimeout(function(){done(true);},450);return;}
  fetch(FORM,{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json"},body:JSON.stringify(data)})
    .then(function(r){done(r.ok);},function(){done(false);});
});
$("fphone").addEventListener("input",function(){if(this.getAttribute("aria-invalid")){this.removeAttribute("aria-invalid");$("ferr").textContent="";}});

/* ---------- share: a real twindowclean.com link that reopens this exact quote ---------- */
var FLAGS=ALL.concat(["more","inside","large"]);
function token(){var f=0;FLAGS.forEach(function(k,i){if(st[k])f|=1<<i;});
  return "q"+f.toString(36)+"-"+st.stories+st.pet+st.plan+(st.time+1)+"-"+st.panels+"-"+st.spin+"-"+st.screens+"-"+st.panes+(st.scr&&st.build?"-"+st.build:"")+(st.day?"-d"+st.day.replace(/-/g,""):"");}
function loadToken(){
  var m=/^#q([0-9a-z]{1,4})-([12])([01])([012])([012])-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})(?:-(\d{1,2}))?(?:-d(\d{8}))?$/.exec(location.hash||"");
  if(!m)return false;
  var f=parseInt(m[1],36);if(!(f>=0)||f>=(1<<FLAGS.length))return false;
  FLAGS.forEach(function(k,i){st[k]=!!(f&(1<<i));});
  st.stories=clamp("stories",+m[2]);st.pet=clamp("pet",+m[3]);st.plan=clamp("plan",+m[4]);st.time=clamp("time",+m[5]-1);
  st.panels=clamp("panels",+m[6]);st.spin=clamp("spin",+m[7]);st.screens=clamp("screens",+m[8]);st.panes=clamp("panes",+m[9]);st.build=clamp("build",+(m[10]||0));
  /* the picked day comes along only while it's still ahead, so the early bird matches what was shared */
  if(m[11]){var d=parseIso(m[11].slice(0,4)+"-"+m[11].slice(4,6)+"-"+m[11].slice(6)),max=new Date(TODAY.getTime());max.setFullYear(max.getFullYear()+1);
    if(d&&d>TODAY&&d<=max)st.day=iso(d);}
  return true;
}
function canonical(){var l=doc.querySelector('link[rel="canonical"]');return (l&&/^https:\/\/twindowclean\.com\//.test(l.href))?l.href:"https://twindowclean.com"+location.pathname;}
function shareUrl(){return canonical().replace(/#.*$/,"")+"#"+token();}
$("shareBtn").addEventListener("click",function(){
  var url=shareUrl(),out=$("linkout");out.textContent=url.replace(/^https:\/\//,"");track("share_quote");
  var t=totals(),data={title:"Our quote from Tony's Window Cleaning",text:"Here's our quote from Tony's Window Cleaning: "+(t.from?"from ":"")+money(t.total),url:url};
  function copy(){copyText(url,"Link copied. It opens this exact quote on twindowclean.com.",out);}
  if(navigator.share&&LIVE)navigator.share(data).catch(copy);else copy();
});

/* ---------- plan or quote as a PDF, built right here with no library ---------- */
var HV=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
var HB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
function pdfClean(s){return String(s).replace(/[−–—]/g,"-").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/…/g,"...").replace(/[^\x20-\x7e\xa0-\xff×·]/g,"");}
function pdfW(s,size,bold){var w=0,tb=bold?HB:HV;s=pdfClean(s);for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);w+=(c>=32&&c<=126)?tb[c-32]:(c===215?584:c===183?278:556);}return w*size/1000;}
function makePdf(logo){
  var ops=[];
  function col(c){return (c[0]/255).toFixed(3)+" "+(c[1]/255).toFixed(3)+" "+(c[2]/255).toFixed(3);}
  function esc(s){return pdfClean(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");}
  function text(x,y,s,size,bold,c,align){var w=pdfW(s,size,bold);if(align==="r")x-=w;ops.push("BT /"+(bold?"F2":"F1")+" "+size+" Tf "+col(c||[16,48,80])+" rg "+x.toFixed(1)+" "+(792-y).toFixed(1)+" Td ("+esc(s)+") Tj ET");}
  function rect(x,y,w,h,c){ops.push(col(c)+" rg "+x+" "+(792-y-h)+" "+w+" "+h+" re f");}
  function line(x1,y,x2,c,w){ops.push(col(c)+" RG "+(w||.7)+" w "+x1+" "+(792-y)+" m "+x2+" "+(792-y)+" l S");}
  function wrap(s,size,maxW,bold){var words=pdfClean(s).split(" "),out=[],cur="";words.forEach(function(w){var tt=cur?cur+" "+w:w;if(pdfW(tt,size,bold)>maxW&&cur){out.push(cur);cur=w;}else cur=tt;});if(cur)out.push(cur);return out;}
  var t=totals(),sc=schedule(t),name=$("fname").value.trim(),street=$("fstreet").value.trim(),y=0,gold=[143,93,8],ink=[16,48,80],soft=[68,96,122];
  rect(0,0,612,110,[234,246,252]);rect(0,108,612,3,[240,176,64]);
  if(logo)ops.push("q 64 0 0 64 48 "+(792-94)+" cm /Im1 Do Q");
  text(logo?126:48,52,"Tony's Window Cleaning",22,true,ink);
  text(logo?126:48,74,(st.plan?"Your service plan":"Your quote")+" · "+fmt(TODAY,true),12,false,soft);
  text(564,52,PHONE,14,true,ink,"r");text(564,72,"twindowclean.com",11,false,soft,"r");
  y=146;
  if(name||street){text(48,y,(name?name:"")+(name&&street?" · ":"")+(street?street:""),13,true,ink);y+=24;}
  text(48,y,"What's included",11,true,gold);y+=10;line(48,y,564,[211,230,240]);y+=18;
  t.it.forEach(function(x){wrap(x.t,11,380).forEach(function(ln,i){text(48,y,ln,11,false,ink);if(i===0)text(564,y,x.note||((x.from?"from ":"")+money(x.v)),11,true,ink,"r");y+=16;});y+=2;});
  if(t.early){text(48,y,"Early bird, 10% off",11,false,[27,122,76]);text(564,y,money(-t.early),11,true,[27,122,76],"r");y+=18;}
  line(48,y,564,ink,1.4);y+=24;text(48,y,"Total",13,true,ink);text(564,y,(t.from?"from ":"")+money(t.total),20,true,ink,"r");y+=26;
  var sv=savings(t);if(sv.length){var tot=0;sv.forEach(function(x){tot+=x[1];});text(564,y,"You save "+money(tot),11,true,[27,122,76],"r");y+=22;}
  if(st.plan&&sc.per){y+=6;text(48,y,"Your plan: every "+sc.freq+" months",11,true,gold);y+=10;line(48,y,564,[211,230,240]);y+=18;
    sc.visits.forEach(function(v){text(48,y,(v.date?fmt(v.date,true):(v.i===0?"First visit":"Month "+(v.i*sc.freq+1)))+" · "+v.label,11,false,ink);text(564,y,money(v.amt),11,true,ink,"r");y+=17;});
    y+=4;text(48,y,"About "+money(sc.year)+" for the year.",11,true,ink);y+=20;}
  var day=dayText();if(day){text(48,y,"Requested day: "+day,11,false,ink);y+=20;}
  y+=6;wrap("Tony confirms every job by text before it's scheduled. The price here is firm for what's listed, and anything that changes the scope gets a written price before any work starts. Satisfaction guaranteed: if anything isn't right, we redo it before we leave.",10,516).forEach(function(ln){text(48,y,ln,10,false,soft);y+=14;});
  rect(0,742,612,50,[234,246,252]);text(48,772,"Text or call "+PHONE+" · twindowclean.com",11,true,ink);text(564,772,"Hesperia and the High Desert",10,false,soft,"r");
  /* assemble the file */
  var content=ops.join("\n"),objs=[],parts=[],bin=[];
  objs.push("<< /Type /Catalog /Pages 2 0 R >>");
  objs.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objs.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>"+(logo?" /XObject << /Im1 7 0 R >>":"")+" >> /Contents 6 0 R >>");
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  objs.push("<< /Length "+content.length+" >>\nstream\n"+content+"\nendstream");
  if(logo)objs.push({img:logo});
  var out=[],pos=0,offs=[];
  function push(s){for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);out.push(c===215?215:c===183?183:c>255?63:c);}pos+=s.length;}
  push("%PDF-1.4\n");
  objs.forEach(function(o,i){offs.push(pos);
    if(o.img){push((i+1)+" 0 obj\n<< /Type /XObject /Subtype /Image /Width "+o.img.w+" /Height "+o.img.h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+o.img.bytes.length+" >>\nstream\n");
      for(var j=0;j<o.img.bytes.length;j++)out.push(o.img.bytes[j]);pos+=o.img.bytes.length;push("\nendstream\nendobj\n");}
    else push((i+1)+" 0 obj\n"+o+"\nendobj\n");});
  var xref=pos;push("xref\n0 "+(objs.length+1)+"\n0000000000 65535 f \n");
  offs.forEach(function(o){push(("000000000"+o).slice(-10)+" 00000 n \n");});
  push("trailer\n<< /Size "+(objs.length+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF");
  return new Blob([new Uint8Array(out)],{type:"application/pdf"});
}
$("pdfBtn").addEventListener("click",function(){
  var note=$("pdfNote");note.textContent="Making your PDF…";
  function finish(logo){
    var blob;try{blob=makePdf(logo);}catch(e){note.textContent="Couldn't make the PDF on this device. Your quote is still on this page.";return;}
    track("download_plan",{plan:st.plan});
    if(!LIVE){note.textContent="Your PDF is ready. In this preview downloads are blocked, on twindowclean.com it saves to your phone.";window.__tqLastPdf=blob;return;}
    var url=URL.createObjectURL(blob),a=doc.createElement("a");a.href=url;a.download=st.plan?"Tonys-Window-Cleaning-plan.pdf":"Tonys-Window-Cleaning-quote.pdf";
    doc.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);a.remove();},4000);
    note.textContent="Saved. Send it with your quote below and Tony has everything in one place.";
  }
  fetch("assets/quote/logo-pdf.jpg").then(function(r){return r.ok?r.arrayBuffer():null;}).then(function(b){finish(b?{bytes:new Uint8Array(b),w:160,h:160}:null);},function(){finish(null);});
});

/* ---------- ZIP: say yes with a link to the work nearby, or turn a no into a quote ---------- */
var Z={"92345":["Hesperia and Silverwood","hesperia.html","Hesperia"],"92344":["Hesperia and Oak Hills","oak-hills.html","Oak Hills"],"92340":["Hesperia","hesperia.html","Hesperia"],
  "92392":["Victorville","victorville.html","Victorville"],"92393":["Victorville","victorville.html","Victorville"],"92394":["Victorville","victorville.html","Victorville"],
  "92395":["Victorville and Spring Valley Lake","spring-valley-lake.html","Spring Valley Lake"],"92307":["Apple Valley","apple-valley.html","Apple Valley"],"92308":["Apple Valley","apple-valley.html","Apple Valley"],
  "92301":["Adelanto","adelanto.html","Adelanto"],"92371":["Phelan","phelan.html","Phelan"],"92397":["Wrightwood","service-areas.html","the High Desert"],"92372":["Pinon Hills","service-areas.html","the High Desert"]};
var IE={"91739":"Etiwanda","91737":"Alta Loma","91701":"Rancho Cucamonga","92336":"North Fontana","92880":"Eastvale","91709":"Chino Hills","91784":"Upland","92374":"Redlands","91761":"Ontario"};
function zres(cls,bold,rest,href,linkTxt){
  var r=$("zres");r.className="zres"+(cls?" "+cls:"");r.textContent="";
  var b=doc.createElement("b");b.textContent=bold;r.appendChild(b);r.appendChild(doc.createTextNode(" "+rest));
  if(href){var a=doc.createElement("a");a.href=href;a.textContent=linkTxt;a.className="zlink";r.appendChild(doc.createTextNode(" "));r.appendChild(a);}
}
var zi=$("zipIn");
if(zi)zi.addEventListener("input",function(){
  var v=zi.value.replace(/\D/g,"").slice(0,5);zi.value=v;
  if(v.length<5){zres("","We cover the High Desert:","Hesperia, Victorville, Apple Valley, Oak Hills, Phelan, Adelanto, Spring Valley Lake and Silverwood.");return;}
  track("zip_check",{zip:v});
  if(Z[v]){var here=location.pathname.replace(/^\//,"")===Z[v][1];zres("yes","Yes, we come to "+Z[v][0]+".","No trip fee, and your price above is the price.",here?"#tq-send":Z[v][1],here?"Send your quote →":"See the work we've done in "+Z[v][2]+" →");}
  else if(IE[v])zres("maybe","Yes for pigeon proofing in "+IE[v]+".","We come down the hill for solar arrays. Windows and screens, send your quote and Tony will tell you straight.","pigeon-proofing.html","See pigeon proofing →");
  else zres("maybe","One thing about us: we don't charge for travel.","Add your address below and let's get you a custom quote.","#tq-send","Add my address →");
});
doc.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a.zlink[href="#tq-send"]');if(a){e.preventDefault();$("tq-send").scrollIntoView({behavior:reduce?"auto":"smooth"});setTimeout(function(){$("fstreet").focus({preventScroll:true});},reduce?0:500);}});

/* ---------- hero: live 3D first, then real finished jobs you can swipe ---------- */
var TABS={r3d:{lbl:"Live 3D",note:"A model home finished the way we leave yours. Tap it to try your own."},
  win:{lbl:"Windows",note:"Real finished jobs. Swipe for more."},sol:{lbl:"Solar",note:"Real finished jobs. Swipe for more."},pig:{lbl:"Pigeon proofing",note:"Real finished jobs. Swipe for more."}};
var heroTab="r3d",box=$("wipe"),curCar=null;
$$(".car",box).forEach(function(c){
  var tr=c.querySelector(".track"),n=tr.children.length,dots=c.querySelector(".dots");
  for(var i=0;i<n;i++)dots.appendChild(doc.createElement("i"));
  function mark(){var k=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));$$("i",dots).forEach(function(d,j){d.className=j===k?"on":"";});c._k=k;}
  tr.addEventListener("scroll",mark,{passive:true});
  ["pointerdown","touchstart","wheel"].forEach(function(ev){tr.addEventListener(ev,function(){c._held=Date.now();},{passive:true});});
  c._next=function(){if(Date.now()-(c._held||0)<6000)return;var k=((c._k||0)+1)%n;tr.scrollTo({left:k*tr.clientWidth,behavior:reduce?"auto":"smooth"});};
  mark();
});
setInterval(function(){if(curCar&&!doc.hidden)curCar._next();},3800);
function setTab(m){
  if(!TABS[m])return;heroTab=m;
  $$("#modes button").forEach(function(x){x.setAttribute("aria-pressed",String(x.getAttribute("data-m")===m));});
  curCar=null;$$(".lay",box).forEach(function(l){l.hidden=l.getAttribute("data-lay")!==m;if(!l.hidden&&l.classList.contains("car"))curCar=l;});
  $("wlbl").textContent=TABS[m].lbl;$("wnote").textContent=TABS[m].note;
  if(api)api.hero(m==="r3d");
}
$("modes").addEventListener("click",function(e){var b=e.target.closest("button");if(b)setTab(b.getAttribute("data-m"));});
$$(".r3d",box).forEach(function(r){r.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();open3d(core.mode);}});});

/* ---------- 3D: load on demand, full screen builder ---------- */
var api=null,loading=false,pend=[],ov=$("ov"),lastFocus=null;
var core={st:st,CFG:CFG,P:P,$:$,$$:$$,reduce:reduce,money:money,track:track,free:free,render:render,totals:totals,
  mode:CFG.mode||"home",close:function(){close3d();}};
function script(src,ok,bad){var s=doc.createElement("script");s.src=src;s.async=true;s.onload=ok;s.onerror=bad;doc.head.appendChild(s);}
function load3d(cb){
  if(api){if(cb)cb();return;}if(cb)pend.push(cb);if(loading)return;loading=true;
  function fail(msgTxt){loading=false;pend=[];var l=$("ovLoad");if(l){l.hidden=false;l.textContent=msgTxt||"The 3D preview couldn't load. Check your connection and try again.";}}
  function go(){script("assets/quote/q3d.js",function(){
    try{api=window.__tq3dInit(core);core.api=api;}catch(e){api=null;fail("3D isn't available on this device. Everything else on the page works.");if(window.console)console.warn(e);return;}
    var p=pend;pend=[];p.forEach(function(f){f();});},function(){fail();});}
  if(window.THREE)go();else script("assets/vendor/three.min.js",go,function(){fail();});
}
function autoLoad(){
  var slow=navigator.connection&&(navigator.connection.saveData||/2g/.test(navigator.connection.effectiveType||""));
  if(slow)return;
  load3d(function(){api.hero(heroTab==="r3d"&&ov.hidden);});
}
function open3d(mode){
  if(!ov)return;hydrate();lastFocus=doc.activeElement;ov.hidden=false;doc.documentElement.classList.add("tq-lock");
  track("view_3d",{mode:mode});try{$("ovX").focus({preventScroll:true});}catch(e){}
  if(!api){var l=$("ovLoad");l.hidden=false;l.textContent="Loading 3D…";}
  load3d(function(){api.open(mode);});
}
function close3d(){
  if(!ov||ov.hidden)return;if(api)api.close();ov.hidden=true;doc.documentElement.classList.remove("tq-lock");
  if(api)api.hero(heroTab==="r3d");
  if(lastFocus&&lastFocus.focus)try{lastFocus.focus({preventScroll:true});}catch(e){}
}
if(ov){
  $("ovX").addEventListener("click",close3d);
  $("ovCta").addEventListener("click",function(e){e.preventDefault();close3d();var q=$("quote");if(q)q.scrollIntoView({behavior:reduce?"auto":"smooth"});});
  doc.addEventListener("keydown",function(e){
    if(ov.hidden)return;
    if(e.key==="Escape"){close3d();return;}
    if(e.key==="Tab"){var f=$$("button:not([disabled]),a[href],input",ov).filter(function(x){return x.offsetParent!==null;});if(!f.length)return;
      var a=f[0],z=f[f.length-1];if(e.shiftKey&&doc.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&doc.activeElement===z){e.preventDefault();a.focus();}}
  });
}

/* ---------- start ---------- */
if(CFG.street)$("fstreet").placeholder=CFG.street;
if(loadToken()){hydrate();$("shared").hidden=false;setTimeout(function(){var q=$("quote");if(q)q.scrollIntoView({block:"start"});},60);}
if("IntersectionObserver" in window){var seen=false;new IntersectionObserver(function(en,o){if(en[0].isIntersecting&&!seen){seen=true;track("view_price");o.disconnect();}}).observe($("price"));}
render();
setTab("r3d");
if(doc.readyState==="complete")setTimeout(autoLoad,300);else window.addEventListener("load",function(){setTimeout(autoLoad,300);});
window.__tq=core; /* for testing and for the 3D module */
})();
