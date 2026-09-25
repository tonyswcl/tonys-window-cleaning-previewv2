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
/* Spanish pages get the same tool. Ticket, notes and plans read in Spanish; the message to Tony, the form and the PDF stay in English so he can read them fast. */
var LANG=CFG.lang||"en",ES=LANG==="es";function L(en,es){return ES?es:en;}
var ITEM_ES=ES;function ix(en,es){return ITEM_ES?es:en;}
var COMF_ES=["una vez","mensual","cada 2 semanas"],COMT_ES=["mes a mes","contrato trimestral","contrato anual"],MESH_ES=["fibra de vidrio gris","todo clima"];
/* what Meta hears. Standard events where one fits, then the three names the campaigns optimize on:
   CustomizeSimulator (someone shaped the 3D to their home), QuoteReady (they built a price), QuoteSubmitted (they sent it to Tony). */
var META_MAP={view_3d:["ViewContent",{content_type:"simulator"}],onboard_build:["CustomizeSimulator",{}],edit_done:["CustomizeSimulator",{}],home_style:["CustomizeSimulator",{}],
  select_service:["CustomizeSimulator",{}],pick_pigeon_package:["CustomizeSimulator",{}],pick_plan:["CustomizeSimulator",{}],
  download_plan:["QuoteReady",{}],share_quote:["QuoteReady",{}],text_tap:["QuoteSubmitted",{method:"text"}],email_tap:["QuoteSubmitted",{method:"email"}],phone_click:["Contact",{}]};
function track(name,params){try{
  params=params||{};
  if(typeof window.gtag==="function")window.gtag("event",name,params);
  if(typeof window.fbq==="function"){var mm=META_MAP[name];
    if(name==="generate_lead"){window.fbq("track","Lead",{value:params.value,currency:"USD",content_name:"quick quote"});window.fbq("trackCustom","QuoteSubmitted",{method:"form",value:params.value,currency:"USD"});}
    else if(mm){var mp={};for(var k in mm[1])mp[k]=mm[1][k];for(var k2 in params)if(typeof params[k2]!=="object")mp[k2]=params[k2];
      if(mm[0]==="ViewContent"||mm[0]==="Contact")window.fbq("track",mm[0],mp);else window.fbq("trackCustom",mm[0],mp);}
    else window.fbq("trackCustom",name,params);}
  if(typeof window.clarity==="function")window.clarity("event",name);
}catch(e){}}

/* ---------- prices, all in one place ---------- */
var P={win:[0,149,249],more:[0,39,39],covers:[0,"10 to 12","18 to 20"],coverMax:[0,12,20],inside:49,panel:7,
  pig:450,pigUpTo:12,pigPer:50,spinner:50,mesh:[53.99,64.99],meshName:["charcoal fiberglass","all weather"],frame:10,scrMin:149,
  planFreq:[0,12,6,3],planOff:[0,0,.15,.25],planName:["One time","Once a year","Twice a year","Every 3 months"],
  pane:12,pc:[0,249,349],roof:599,gr:129,ad:129,early:0.10,
  /* storefronts: a flat $149 for 8 to 10 panes inside and out (doors count), $50 flat past 10. Month to month is 15% off monthly
     or 25% off every 2 weeks; a quarterly agreement is 20% off, a yearly agreement 40% off. The best one applies, never stacked.
     Office buildings: $10 a pane inside and out on the ground floor, $10 more a pane for each story up. */
  com:149,comOff:[0,.15,.25],comFName:["one time","monthly","every 2 weeks"],comTermOff:[0,.20,.40],comTermName:["month to month","quarterly agreement","yearly agreement"],comUpTo:10,comOver:50,comIn:50,stk:10,bPane:10,
  large:null /* extra labor for large custom homes; null means Tony confirms on site */};

/* ---------- state ---------- */
var MAIN=["win","sol","pig","scr"], EXTRA=["hw","roof","pc","gut","pw","ad","gr","com"], ALL=MAIN.concat(EXTRA);
var st={stories:1,more:false,inside:false,large:false,pkg:0,panels:16,arrays:1,arr:[16,8,6],spin:0,screens:4,frames:false,pet:1,panes:6,day:"",time:-1,plan:0,wait:0,
  ctype:0,cfreq:0,cterm:0,cin:false,cpanes:8,cdoors:2,cstk:0,bsq:12,bst:2,bwin:48};
ALL.forEach(function(k){st[k]=false;});
(CFG.svc&&CFG.svc.length?CFG.svc:["win"]).forEach(function(k){if(ALL.indexOf(k)>=0)st[k]=true;});
var LIMIT={stories:[1,2],panels:[1,99],arrays:[1,3],arr0:[1,60],arr1:[1,60],arr2:[1,60],spin:[0,20],screens:[1,40],pet:[0,1],panes:[1,60],plan:[0,3],time:[-1,2],wait:[0,3],pkg:[0,1],
  ctype:[0,1],cfreq:[0,2],cterm:[0,2],csched:[0,4],cpanes:[1,60],cdoors:[0,12],cstk:[0,40],bsq:[1,300],bst:[1,20],bwin:[4,990]};
/* the storefront schedule is one row of five: how often we come and how long you sign for, folded into cfreq and cterm */
var CSCHED=[[0,0],[1,0],[2,0],[1,1],[1,2]];
function csched(){return st.cterm===2?4:st.cterm===1?3:st.cfreq;}
function clamp(k,v){var L=LIMIT[k];return L?Math.max(L[0],Math.min(L[1],v)):v;}
/* panels can sit in up to 3 sections; the total is always the sum */
function setArrays(a){a=clamp("arrays",a);if(a===st.arrays)return;
  if(a>1&&st.arrays===1){var n=Math.max(a,st.panels);for(var i=0;i<3;i++)st.arr[i]=i<a?Math.floor(n/a)+(i<n%a?1:0):Math.max(1,st.arr[i]);}
  st.arrays=a;sumPanels();}
function sumPanels(){if(st.arrays>1){var n=0;for(var i=0;i<st.arrays;i++)n+=st.arr[i];st.panels=clamp("panels",n);}}

function cents(n){return Math.round(n*100)/100;}
function money(n){n=cents(n);var neg=n<0;n=Math.abs(n);
  return (neg?"−":"")+"$"+n.toLocaleString("en-US",n%1?{minimumFractionDigits:2,maximumFractionDigits:2}:{maximumFractionDigits:0});}
function pl(n){return n===1?"":"s";}
function free(){return st.panels>=16?3:2;}
function anyOther(k){return ALL.some(function(x){return x!==k&&st[x];});}

function items(lang){ITEM_ES=(lang||LANG)==="es";
  var a=[],n=st.panels,s=st.stories;
  function add(t,v,o){o=o||{};a.push({t:t,v:v||0,note:o.note||"",from:!!o.from,alone:o.alone||0,later:o.later||0});}
  if(st.win){add(ix((s===1?"Single":"Two")+" story windows, screens, tracks and sills",(s===1?"Ventanas de un piso":"Ventanas de dos pisos")+", mosquiteros, rieles y repisas"),P.win[s]);
    if(st.more)add(ix("More than "+P.coverMax[s]+" windows","Más de "+P.coverMax[s]+" ventanas"),P.more[s]);
    if(st.inside)add(ix("Inside windows, whole house, tracks included","Ventanas por dentro, toda la casa, rieles incluidos"),P.inside);
    if(st.large)add(ix("Large custom home, extra labor","Casa grande, mano de obra extra"),P.large||0,P.large?{}:{note:ix("Tony confirms","Tony confirma")});}
  if(st.pig){add(ix("Pigeon proofing, up to "+P.pigUpTo+" panels","Control de palomas, hasta "+P.pigUpTo+" paneles"),P.pig);
    if(n>P.pigUpTo)add(ix((n-P.pigUpTo)+" more panel"+pl(n-P.pigUpTo)+" × $"+P.pigPer,(n-P.pigUpTo)+" panel"+(n-P.pigUpTo>1?"es":"")+" más × $"+P.pigPer),(n-P.pigUpTo)*P.pigPer);
    add(ix(free()+" reflective spinners",free()+" espantapájaros reflectantes"),0,{note:ix("Free","Gratis")});
    if(st.spin)add(ix(st.spin+" extra spinner"+pl(st.spin)+" × $"+P.spinner,st.spin+" espantapájaros extra × $"+P.spinner),st.spin*P.spinner);
    add(ix(n+" solar panels washed",n+" paneles solares lavados"),0,{note:ix("Free","Gratis"),alone:n*P.panel});
    add(ix("Roof soft wash","Lavado suave de techo"),0,{note:ix("Included","Incluido"),alone:P.roof,from:false});
    if(st.pkg)add(ix("A year of cleanings: 3 more washes, every 3 months, "+n+" panels × $"+P.panel,"Un año de lavados: 3 lavados más, cada 3 meses, "+n+" paneles × $"+P.panel),0,{note:money(n*P.panel)+ix(" a visit"," por visita"),later:3*n*P.panel});}
  else if(st.sol)add(ix(n+" solar panel"+pl(n)+" × $"+P.panel,n+" panel"+(n>1?"es":"")+" solar"+(n>1?"es":"")+" × $"+P.panel),n*P.panel);
  if(st.scr){var each=P.mesh[st.pet],sub=cents(st.screens*each+(st.frames?st.screens*P.frame:0));
    add(ix(st.screens+" "+P.meshName[st.pet]+" screen"+pl(st.screens)+" × "+money(each),st.screens+" mosquitero"+pl(st.screens)+", "+MESH_ES[st.pet]+" × "+money(each)),cents(st.screens*each));
    if(st.frames)add(ix("New frames and clips, "+st.screens+" × $"+P.frame,"Marcos y clips nuevos, "+st.screens+" × $"+P.frame),st.screens*P.frame);
    if(!anyOther("scr")&&sub<P.scrMin)add(ix("$"+P.scrMin+" job minimum","Mínimo de $"+P.scrMin),cents(P.scrMin-sub));}
  if(st.hw)add(ix("Hard water removal, "+st.panes+" pane"+pl(st.panes)+" × $"+P.pane,"Manchas de agua dura, "+st.panes+" vidrio"+pl(st.panes)+" × $"+P.pane),st.panes*P.pane,{from:true});
  if(st.roof&&!st.pig)add(ix("Roof soft wash","Lavado suave de techo"),P.roof,{from:true});
  if(st.pc)add(ix("New construction clean, "+(s===1?"single":"two")+" story, inside and out","Limpieza de obra nueva, "+(s===1?"un piso":"dos pisos")+", por dentro y por fuera"),P.pc[s],{from:true});
  if(st.gut)add(ix("Gutter cleanout","Limpieza de canaletas"),0,{note:ix("Quoted on site","Se cotiza en el lugar")});
  if(st.pw)add(ix("Driveway and patio wash","Lavado de cochera y patio"),0,{note:ix("Quoted on site","Se cotiza en el lugar")});
  if(st.ad)add(ix("Decal and vinyl removal","Quitar calcomanías y vinil"),P.ad,{from:true});
  if(st.gr)add(ix("Graffiti removal","Quitar grafiti"),P.gr,{from:true});
  if(st.com){if(st.ctype===0){var gl=st.cpanes+st.cdoors,ov=Math.max(0,gl-P.comUpTo),co=comOff();
      add(ix("Storefront glass inside and out, 8 to "+P.comUpTo+" panes"+(st.cfreq?", "+P.comFName[st.cfreq]:"")+(co?", "+comOffName("en")+", per visit":""),"Vidrio del local por dentro y por fuera, 8 a "+P.comUpTo+" vidrios"+(st.cfreq?", "+COMF_ES[st.cfreq]:"")+(co?", "+comOffName("es")+", por visita":"")),comVisit());
      if(ov)add(ix(ov+" more pane"+pl(ov)+" and door"+(ov>1?"s":"")+", flat",ov+" vidrio"+pl(ov)+" y puerta"+pl(ov)+" más, tarifa fija"),P.comOver);
      if(st.cin)add(ix("Interior partitions and mirrors","Divisiones y espejos interiores"),P.comIn);
      if(st.cstk)add(ix(st.cstk+" vinyl sticker"+pl(st.cstk)+" changed out × $"+P.stk,st.cstk+" calcomanía"+pl(st.cstk)+" de vinil cambiada"+pl(st.cstk)+" × $"+P.stk),st.cstk*P.stk);}
    else{var bp=bldgPrice();add(ix("Office building, "+st.bwin+" panes inside and out, "+st.bst+" stor"+(st.bst>1?"ies":"y")+", about "+(st.bsq*1000).toLocaleString("en-US")+" sq ft","Edificio de oficinas, "+st.bwin+" vidrios por dentro y por fuera, "+st.bst+" piso"+pl(st.bst)+", unos "+(st.bsq*1000).toLocaleString("en-US")+" pies cuadrados"),bp.total,{from:true});
      if(st.bst>1)add(ix("Upper floors: $"+P.bPane+" more a pane for each story up","Pisos altos: $"+P.bPane+" más por vidrio por cada piso"),0,{note:ix("In the price","En el precio")});}}
  return a;
}
/* the storefront discount that applies: the better of how often we come and how long you sign for */
function comOff(){var f=P.comOff[st.cfreq]||0,t=P.comTermOff[st.cterm]||0;return Math.max(f,t);}
function comOffName(lang){var es=(lang||LANG)==="es",f=P.comOff[st.cfreq]||0,t=P.comTermOff[st.cterm]||0;return (t>f?(es?COMT_ES:P.comTermName)[st.cterm]:(es?COMF_ES:P.comFName)[st.cfreq])+" "+Math.round(Math.max(f,t)*100)+(es?"% menos":"% off");}
function comVisit(){return cents(P.com*(1-comOff()));}
/* office buildings: panes spread over the stories, $10 a pane on the ground floor and $10 more a pane for each story up */
function bldgPrice(){var n=st.bwin,f=Math.max(1,st.bst),per=Math.floor(n/f),rem=n%f,total=0,rows=[];
  for(var s=1;s<=f;s++){var c=per+(s<=rem?1:0),rate=P.bPane*s;rows.push({story:s,n:c,rate:rate,amt:c*rate});total+=c*rate;}return {total:total,rows:rows};}
function totals(lang){
  var it=items(lang),sub=0;it.forEach(function(x){sub+=x.v;});sub=cents(sub);
  var early=st.day&&sub>0?cents(sub*P.early):0;
  return {it:it,sub:sub,early:early,total:cents(sub-early),from:it.some(function(x){return x.from;})};
}
function savings(t){
  var a=[];
  if(st.pig){a.push([L("Solar wash for your "+st.panels+" panels, free with pigeon proofing","Lavado solar de tus "+st.panels+" paneles, gratis con el control de palomas"),st.panels*P.panel]);a.push([L("Roof soft wash, included (from $"+P.roof+" on its own)","Lavado suave de techo, incluido (desde $"+P.roof+" por separado)"),P.roof]);}
  if(t.early)a.push([L("Booked on our website, 10% off","Reservado en nuestro sitio, 10% menos"),t.early]);
  return a;
}
/* what each maintenance visit costs, split so discounts land where they belong:
   windows always get the plan discount, solar only when it isn't paired with pigeon proofing
   (pigeon customers keep $7 a panel, their year of cleanings is the package) */
function recurParts(){var s=st.stories,w=0,so=0;
  if(st.win){w=P.win[s];if(st.more)w+=P.more[s];if(st.inside)w+=P.inside;}
  if(st.sol||st.pig)so=st.panels*P.panel;
  return {win:w,sol:so,solOff:!st.pig};}
function recurring(){var r=recurParts();return r.win+r.sol;}

/* ---------- days: any day, the next 60 in a row, plus a date box for anything later ---------- */
var WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var WD_ES=["dom","lun","mar","mié","jue","vie","sáb"], MO_ES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function iso(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);}
function parseIso(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?new Date(+m[1],+m[2]-1,+m[3],12):null;}
function fmt(d,long,es){if(es)return WD_ES[d.getDay()]+" "+d.getDate()+" "+MO_ES[d.getMonth()]+(long?" "+d.getFullYear():"");return WD[d.getDay()]+" "+MO[d.getMonth()]+" "+d.getDate()+(long?", "+d.getFullYear():"");}
function addMonths(d,m){var x=new Date(d.getTime());var day=x.getDate();x.setDate(1);x.setMonth(x.getMonth()+m);
  var last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(day,last));return x;}
var TODAY=new Date();TODAY.setHours(12,0,0,0);
function isWkend(d){return d&&(d.getDay()===0||d.getDay()===6);}
/* weekdays are morning or afternoon; a Saturday or Sunday, or no day at all, can simply say "I prefer weekends" */
function dayText(lang){var es=(lang||"en")==="es",d=parseIso(st.day);if(!d)return st.time===2?(es?"cualquier fin de semana":"any weekend"):"";return fmt(d,false,es)+(isWkend(d)?(es?", fin de semana":", weekend"):st.time===0?(es?", por la mañana":", morning"):st.time===1?(es?", por la tarde":", afternoon"):"");}
function fixTime(){var d=parseIso(st.day);if(isWkend(d))st.time=2;else if(d&&st.time===2)st.time=-1;}

/* ---------- lazy parts: other services' options and the 3D controls wait in <template> until first use ---------- */
var hydrated=false;
function hydrate(){if(hydrated)return;hydrated=true;
  $$("template[data-tpl]").forEach(function(t){if(t.content)t.parentNode.replaceChild(doc.importNode(t.content,true),t);});render();}
function setText(id,txt){var el=$(id);if(el)el.textContent=txt;}

/* ---------- delegated controls: data-seg, data-sw, data-step (3D-only controls use data-h*) ---------- */
function setKey(k,v){
  if(k==="arrays"){setArrays(+v);track("pick_arrays",{arrays:st.arrays});render();return;}
  if(k==="csched"){var cs=CSCHED[clamp("csched",+v)];st.cfreq=cs[0];st.cterm=cs[1];track("pick_commercial_schedule",{schedule:+v});render();return;}
  if(k==="pet"||k==="stories"||k==="plan"||k==="time"||k==="wait"||k==="pkg"||k==="ctype"||k==="cfreq"||k==="cterm")v=clamp(k,+v);
  if(k==="cterm"&&v&&!st.cfreq)st.cfreq=1; /* an agreement means we come back, so one time turns into monthly */
  if(k==="cfreq"&&!v)st.cterm=0;
  if(k==="ctype")track("pick_commercial",{type:v?"building":"storefront"});
  if(k==="pkg"){if(v&&!st.plan)st.plan=3;track("pick_pigeon_package",{year:v});}
  st[k]=v;
  if(k==="plan")track("pick_plan",{plan:v});
  if(k==="time")track("pick_time",{time:v});
  render();
}
doc.addEventListener("click",function(e){
  var t=e.target;if(!t.closest)return;
  if(!hydrated&&t.closest(".tq"))hydrate();
  /* the little i buttons: why an add on costs what it costs */
  var wy=t.closest("[data-why]");if(wy){var op=wy.closest(".opt,.note"),wb=op&&op.nextElementSibling;if(wb&&wb.classList.contains("why")){var op2=wb.hidden;wb.hidden=!op2;wy.setAttribute("aria-expanded",String(op2));if(op2)track("why_price");}return;}
  var b=t.closest("[data-seg] button[data-v]");
  if(b){var k=b.parentNode.getAttribute("data-seg"),v=+b.getAttribute("data-v");
    if(k==="time"&&st.time===v&&v!==2)v=-1; /* tap again to clear */
    setKey(k,v);return;}
  var s=t.closest("[data-sw]");
  if(s){var k2=s.getAttribute("data-sw");st[k2]=!st[k2];if(k2==="inside"&&st.inside&&!st.win)st.win=true;track("toggle_"+k2,{on:st[k2]});render();return;}
  var p=t.closest("[data-step] button[data-d]");
  if(p){var k3=p.parentNode.getAttribute("data-step"),d3=+p.getAttribute("data-d");
    if(/^arr\d$/.test(k3)){var ai=+k3.charAt(3);st.arr[ai]=clamp(k3,st.arr[ai]+d3);sumPanels();}
    else if(k3==="panels"&&st.arrays>1){st.arr[0]=clamp("arr0",st.arr[0]+d3);sumPanels();}
    else st[k3]=clamp(k3,st[k3]+d3);
    if((k3==="panels"||/^arr/.test(k3))&&!st.sol&&!st.pig)st.sol=true;render();return;}
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
  $$("[data-svc]").forEach(function(x){var k=x.getAttribute("data-svc");if(ALL.indexOf(k)>=0)x.setAttribute("aria-pressed",String(st[k]));});
  $$("[data-body]").forEach(function(x){x.hidden=!st[x.getAttribute("data-body")];});
  var anyOn=ALL.some(function(k){return st[k];});
  $("empty").hidden=anyOn;
  $("panelRow").hidden=!(st.sol||st.pig);
  if(EXTRA.some(function(k){return st[k];})&&$("xtiles").hidden){$("xtiles").hidden=false;$("moreSvc").setAttribute("aria-expanded","true");}
  st.csched=csched();
  $$("[data-seg]").forEach(function(g){var k=g.getAttribute("data-seg");$$("button[data-v]",g).forEach(function(b){b.setAttribute("aria-pressed",String(+b.getAttribute("data-v")===st[k]));});});
  $$("[data-sw]").forEach(function(x){x.setAttribute("aria-checked",String(!!st[x.getAttribute("data-sw")]));});
  $$("[data-step]").forEach(function(g){var k=g.getAttribute("data-step"),o=g.querySelector("output");if(o)o.textContent=/^arr\d$/.test(k)?st.arr[+k.charAt(3)]:st[k];});
  /* panel sections: one total, or a count for each section */
  $$("[data-sec]").forEach(function(r){r.hidden=st.arrays<2||+r.getAttribute("data-sec")>=st.arrays;});
  $$("[data-step='panels']").forEach(function(g){g.hidden=st.arrays>1;});
  $$(".ptotal").forEach(function(x){x.hidden=st.arrays<2;x.textContent=st.panels+" total";});
  var s=st.stories;
  setText("winNote",L((s===1?"1":"2")+" story price covers "+P.covers[s]+" windows.","El precio de "+(s===1?"1 piso":"2 pisos")+" cubre "+P.covers[s]+" ventanas."));
  setText("moreLbl",L("More than "+P.coverMax[s]+" windows ","Más de "+P.coverMax[s]+" ventanas "));
  setText("moreAmt","+$"+P.more[s]);
  setText("solNote",L(st.pig?"Free with pigeon proofing. Purified water and a soft brush.":"Purified water and a soft brush, dries spot free. Set your panel count below.",st.pig?"Gratis con el control de palomas. Agua purificada y cepillo suave.":"Agua purificada y cepillo suave, seca sin manchas. Pon tu cantidad de paneles abajo."));
  $$("[data-mesh-fact]").forEach(function(x){x.hidden=+x.getAttribute("data-mesh-fact")!==st.pet;});
  var pn=st.panels,pp=P.pig+Math.max(0,pn-P.pigUpTo)*P.pigPer+st.spin*P.spinner;
  setText("pkgA",money(pp));setText("pkgB","+"+money(3*pn*P.panel)+L(" for the year"," por el año"));
  setText("pkgNote",ES?(st.pkg?"Tu año: "+money(pp)+" hoy, luego 3 lavados cada 3 meses a "+money(pn*P.panel)+" cada uno ("+pn+" paneles × $"+P.panel+"). Los paneles lo necesitan aquí de todos modos, y cada visita es el momento de revisar espantapájaros, clips y malla. Queda en el calendario, no hay que acordarse de nada.":"Hoy incluye un lavado solar y un lavado suave de techo gratis. Agrega un año de lavados y cada visita también revisa espantapájaros, clips y malla."):
    st.pkg?"Your year: "+money(pp)+" now, then 3 washes every 3 months at "+money(pn*P.panel)+" each ("+pn+" panels × $"+P.panel+"). Panels need it out here anyway, and every visit is the right time to check the spinners, clips and mesh. It's on the calendar, so there's nothing to remember.":
    "Today includes a free solar wash and a roof soft wash. Add a year of cleanings and every visit doubles as a spinner, clip and mesh check.");
  var hwWin=$("hwWin");if(hwWin)hwWin.hidden=!st.hw;
  $$("[data-cg]").forEach(function(g){g.hidden=+g.getAttribute("data-cg")!==st.ctype;});
  var cgl=st.cpanes+st.cdoors;setText("comNote",ES?((cgl>P.comUpTo?"Son "+cgl+" vidrios contando puertas, así que $"+P.comOver+" fijos cubren todo lo que pase de "+P.comUpTo+", por dentro y por fuera. ":"$"+P.com+" fijos por 8 a "+P.comUpTo+" vidrios por dentro y por fuera, puertas incluidas. ")+"Mes a mes: 15% menos mensual, 25% menos cada 2 semanas. Con contrato trimestral es 20% menos en cada visita, con contrato anual 40% menos."):
    (cgl>P.comUpTo?"That's "+cgl+" panes counting doors, so a flat $"+P.comOver+" covers everything past "+P.comUpTo+", inside and out. ":"$"+P.com+" flat for 8 to "+P.comUpTo+" panes inside and out, doors included. ")+"Month to month: 15% off monthly, 25% off every 2 weeks. Sign for a quarter and it's 20% off every visit, sign for a year and it's 40% off.");
  var bp=bldgPrice();setText("bldgNote",ES?"$"+P.bPane+" por vidrio por dentro y por fuera en la planta baja, $"+P.bPane+" más por vidrio por cada piso hacia arriba"+(st.bst>1?": "+bp.rows.map(function(r){return "piso "+r.story+" "+r.n+" × $"+r.rate;}).join(", "):"")+". Revisamos cada vidrio por manchas de agua dura y respetamos el polarizado. Recorrido gratis, precio firme por escrito.":
    "$"+P.bPane+" a pane inside and out on the ground floor, $"+P.bPane+" more a pane for each story up"+(st.bst>1?": "+bp.rows.map(function(r){return "story "+r.story+" "+r.n+" × $"+r.rate;}).join(", "):"")+". We check every pane for hard water staining and work around existing tint. Free walkthrough, firm price in writing.");

  var t=totals(),tl=$("tlines");tl.textContent="";
  if(!t.it.length){var e0=doc.createElement("div");e0.className="tline";e0.textContent=L("Tap a service above to see a price.","Toca un servicio arriba para ver un precio.");tl.appendChild(e0);}
  t.it.forEach(function(x){var d=doc.createElement("div");d.className="tline"+(x.note?" inc":"");var a=doc.createElement("span");a.textContent=x.t;var b2=doc.createElement("b");
    b2.textContent=x.note||((x.from?L("from ","desde "):"")+money(x.v));d.appendChild(a);d.appendChild(b2);tl.appendChild(d);});
  if(t.early){var d2=doc.createElement("div");d2.className="tline early-l";var a2=doc.createElement("span");a2.textContent=L("Booked on our website, 10% off","Reservado en nuestro sitio, 10% menos");var b3=doc.createElement("b");b3.textContent=money(-t.early);d2.appendChild(a2);d2.appendChild(b3);tl.appendChild(d2);}
  var sv=savings(t),box=$("save");box.textContent="";box.hidden=!sv.length;
  if(sv.length){var tot=0;sv.forEach(function(x){tot+=x[1];});var h=doc.createElement("b");h.textContent=L("You save ","Ahorras ")+money(tot);box.appendChild(h);
    sv.forEach(function(x){var r=doc.createElement("span");r.textContent=x[0]+": "+money(x[1]);box.appendChild(r);});}
  $("fromNote").hidden=!t.from;
  /* one line from a public Google review, picked for the service on the quote */
  var pr=$("proof");if(pr){var q=proofFor();pr.hidden=!q||!anyOn;pr.textContent="";if(q){var qq=doc.createElement("q");qq.textContent=q[0];pr.appendChild(qq);var who=doc.createElement("span");who.textContent=" "+q[1]+L(" on Google"," en Google");pr.appendChild(who);}}
  $("earlyTip").hidden=!!st.day||!anyOn;
  $("early").className="early"+(st.day?" on":"");
  $("earlyTxt").textContent=st.day?L("Booked on our website: 10% off, "+money(t.early)+" saved.","Reservado en nuestro sitio: 10% menos, "+money(t.early)+" de ahorro."):L("Book on our website and save an extra 10%. Pick your day below.","Reserva en nuestro sitio y ahorra un 10% extra. Elige tu día abajo.");
  var a0=shown,t0=performance.now(),target=t.total;if(anim)cancelAnimationFrame(anim);
  if(firstRender||reduce){shown=target;paint(target,true);firstRender=false;}
  else (function step(now){var q=Math.min(1,(now-t0)/380),v=q>=1?target:a0+(target-a0)*(1-Math.pow(1-q,3));shown=v;paint(q>=1?target:Math.round(v),q>=1);if(q<1)anim=requestAnimationFrame(step);})(t0);
  /* a quote with nothing priced yet, like an office building, reads as a free walkthrough instead of $0 */
  function paint(v,final){var walk=final&&target===0&&t.it.length>0,txt=walk?L("Free walkthrough","Recorrido gratis"):(t.from&&final?L("from ","desde "):"")+money(v);$("ttotal").textContent=txt;var dt=$("dockTotal");if(dt)dt.textContent=walk?L("Quote","Cotizar"):money(v);}
  days();planBox(t);waitBox(t);msg(totals("en"));
  if(api)api.sync();
}

/* public Google reviews, the same ones on the reviews page, one line each. Pigeon quotes get a pigeon review, and so on. */
var PROOF={pig:[["Got the job done in one day at the best price.","Henry R."],["I recommend them to any one looking to get their solar pigeon proofed in the High Desert.","Oswaldo F."],["He cleaned my solar panels and whole roof, installed wire around the panels and he also installed the spinners for the pigeons.","Hailey B."]],
  hw:[["All hard water stains gone. Very professional and thorough.","Pam S."]],
  sol:[["The panels are so clean and look awesome.","Chelsi in Fontana"],["Tony did a great job and even cleaned the solar panels.","Staci M."]],
  win:[["Tony did an excellent job cleaning my windows as well as my solar panels.","Mike S."],["Very professional and thorough. Will use again. Reasonable price.","Pam S."]],
  any:[["Tony is a first class guy, very nice and professional.","Henry R."]]};
function proofFor(){var k=st.pig?"pig":st.hw?"hw":st.sol?"sol":st.win?"win":"any",list=PROOF[k];return list[TODAY.getDate()%list.length];}

/* ---------- step 2: days and plan ---------- */
var dayRow=$("days");
(function(){
  for(var i=1;i<=60;i++){var d=new Date(TODAY.getTime());d.setDate(d.getDate()+i);
    var we=isWkend(d),b=doc.createElement("button");b.type="button";b.className="day"+(we?" wk":"");b.setAttribute("data-day",iso(d));b.setAttribute("aria-pressed","false");
    var w=doc.createElement("span");w.textContent=(ES?WD_ES:WD)[d.getDay()];var n=doc.createElement("b");n.textContent=d.getDate();var m=doc.createElement("span");m.textContent=(ES?MO_ES:MO)[d.getMonth()];
    b.appendChild(w);b.appendChild(n);b.appendChild(m);dayRow.appendChild(b);}
  var min=new Date(TODAY.getTime());min.setDate(min.getDate()+1);var max=new Date(TODAY.getTime());max.setFullYear(max.getFullYear()+1);
  var di=$("dateIn");di.min=iso(min);di.max=iso(max);
  di.addEventListener("change",function(){var d=parseIso(di.value);if(d&&d>=min&&d<=max){st.day=iso(d);track("pick_day",{other:1});}else st.day="";fixTime();render();});
  dayRow.addEventListener("click",function(e){var b=e.target.closest(".day");if(!b)return;var v=b.getAttribute("data-day");st.day=st.day===v?"":v;if(st.day)track("pick_day",{weekend:isWkend(parseIso(st.day))});fixTime();render();});
})();
function days(){
  $$(".day",dayRow).forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-day")===st.day));});
  var di=$("dateIn"),inRow=!!dayRow.querySelector('[data-day="'+st.day+'"]');di.value=st.day&&!inRow?st.day:"";
  var pick=$("dayPicked");pick.textContent=(st.day||st.time===2)?L("Your day: ","Tu día: ")+dayText(LANG)+L(". Tony confirms by text.",". Tony confirma por mensaje."):"";
  var d=parseIso(st.day),we=isWkend(d);$$("[data-seg='time'] button").forEach(function(b){var v=+b.getAttribute("data-v");b.hidden=we?v!==2:(d?v===2:false);});
}
function schedule(t,plan,lang){var es=(lang||"en")==="es";
  plan=plan===undefined?st.plan:plan;
  var freq=P.planFreq[plan],off=P.planOff[plan],rp=recurParts(),per=rp.win+rp.sol,each=cents(rp.win*(1-off)+rp.sol*(rp.solOff?1-off:1)),start=parseIso(st.day);
  if(!freq)return {plan:0,freq:0,visits:[],per:per,each:per,off:0,year:t.total,save:0};
  var n=12/freq,v=[];
  for(var i=0;i<n;i++)v.push({i:i,date:start?addMonths(start,i*freq):null,amt:i===0?t.total:each,label:i===0?(es?"Primera visita, todo lo de tu cotización":"First visit, everything on your quote"):(es?"Visita de mantenimiento":"Maintenance visit")+(off?", "+Math.round(off*100)+(es?"% menos":"% off"):"")});
  return {plan:plan,freq:freq,visits:v,per:per,each:each,off:off,n:n,year:cents(t.total+each*(n-1)),save:cents((per-each)*(n-1))};
}
/* what each plan does for you, in plain words */
var PLAN_WHY_ES=["Una limpieza, y luego te toca a ti acordarte cuándo vuelve a tocar.","Tony te manda un mensaje una vez al año cuando toca. Precio normal, nada que recordar.","Primavera y otoño. 15% menos en cada visita después de la primera, y tu precio queda fijo por el año.","Cada temporada, y el mejor valor. 25% menos en cada visita después de la primera, precio fijo por el año. El vidrio y los paneles nunca se atrasan mucho, así que el agua dura y el polvo nunca alcanzan a fijarse."];
var PLAN_WHY=["One clean, then it's on you to remember when it's time again.",
  "Tony texts you once a year when it's time. Regular price, nothing to remember.",
  "Spring and fall. 15% off every visit after the first, and your price is locked for the year.",
  "Every season, and the best value. 25% off every visit after the first, price locked for the year. Glass and panels never fall far behind, so hard water and dust never get the chance to set in."];
function planBox(t){
  var box=$("planbox"),ol=$("visits"),per=recurring();
  /* each plan button shows what it costs for this quote */
  $$("[data-seg='plan'] button[data-v]").forEach(function(b){var v=+b.getAttribute("data-v"),sm=b.querySelector("small");if(!sm)return;
    var sc=schedule(t,v);sm.textContent=!per?(v?L("windows or solar","ventanas o solar"):L("just this visit","solo esta visita")):v===0?L("just this visit","solo esta visita"):v===1?money(sc.per)+L(" next year"," el próximo año"):money(sc.each)+L(" a visit, "," por visita, ")+Math.round(sc.off*100)+L("% off","% menos");});
  $("planWhy").textContent=(ES?PLAN_WHY_ES:PLAN_WHY)[st.plan];
  $("pdfBtn").textContent=L("Download my "+(st.plan?"plan":"quote")+" (PDF)","Descargar mi "+(st.plan?"plan":"cotización")+" (PDF)");
  if(!st.plan){box.hidden=true;return;}
  box.hidden=false;ol.textContent="";
  var sc=schedule(t,undefined,LANG);
  if(!per){$("plantot").textContent=L("Plans cover window and solar cleaning. Add one of those above to build a plan.","Los planes cubren ventanas y paneles solares. Agrega uno de esos arriba para armar un plan.");return;}
  sc.visits.forEach(function(v){var li=doc.createElement("li");var a=doc.createElement("span");a.textContent=(v.date?fmt(v.date,true,ES):(v.i===0?L("Your first visit","Tu primera visita"):L("Month ","Mes ")+(v.i*sc.freq+1)))+" · "+v.label;
    var b=doc.createElement("b");b.textContent=money(v.amt);li.appendChild(a);li.appendChild(b);ol.appendChild(li);});
  var pigNote=st.pig?L(" Solar upkeep is counted by panels: "," El mantenimiento solar se cuenta por paneles: ")+st.panels+" × $"+P.panel+" = "+money(st.panels*P.panel)+L(" a visit."," por visita."):"";
  $("plantot").textContent=st.plan===1?L("Next year's visit is "+money(sc.per)+". Tony texts you when it's time.","La visita del próximo año es "+money(sc.per)+". Tony te manda un mensaje cuando toca.")+pigNote:
    L("About "+money(sc.year)+" for the year."+(sc.save>0?" That's "+money(sc.save)+" less than booking each visit on its own.":""),"Unos "+money(sc.year)+" por el año."+(sc.save>0?" Son "+money(sc.save)+" menos que reservar cada visita por separado.":""))+pigNote+L(" Tony writes the plan up before anything is scheduled."," Tony pone el plan por escrito antes de agendar nada.");
}

/* ---------- what happens if you wait ---------- */
var WAIT={
  win:["Clear glass now, and hard water never gets a head start.","Dust and sprinkler spots build up. Still a normal clean.","Spots start to bond to the glass. The clean takes longer and some panes may need hard water work.","Hard water can etch the glass for good. Removal runs from $12 a pane, and deep etching can't be undone."],
  sol:["Panels back to full output from the day we leave.","Dust cuts into what your panels make every day. Up here there's almost no rain to rinse it.","Summer heat bakes the dust on, and any droppings block whole cells.","A year of output you don't get back, and a tougher clean."],
  pig:["Nests out, mesh on, panels washed and a roof wash free.","More nesting and droppings under the panels. The cleanout is the biggest part of the price.","Pigeons can raise more than one brood a year, so more birds call your roof home.","More birds, bigger nests, a stronger smell, and more droppings on the wiring and roof tile."],
  scr:["New mesh, and bugs stay out this season.","UV keeps working on the old mesh. Small tears get bigger.","Brittle mesh tears in the wind, and frames bend.","Bent or missing frames mean new ones, $10 more a screen."],
  hw:["Spots come off while they're still on the surface.","Minerals keep stacking with every sprinkler cycle.","Spots bond deeper and take more passes to lift.","Etching sets in, and some of it can't be polished out."]};
var WAIT_WHEN=["Book now","In 3 months","In 6 months","In a year"],WAIT_NAME={win:"Windows",sol:"Solar panels",pig:"Pigeons",scr:"Screens",hw:"Hard water"};
var WAIT_ES={win:["Vidrio claro ahora, y el agua dura nunca toma ventaja.","El polvo y las manchas de aspersores se acumulan. Todavía es una limpieza normal.","Las manchas empiezan a pegarse al vidrio. La limpieza tarda más y algunos vidrios pueden necesitar tratamiento de agua dura.","El agua dura puede marcar el vidrio para siempre. Quitarla cuesta desde $12 por vidrio, y una marca profunda no se revierte."],
  sol:["Paneles a plena producción desde el día que nos vamos.","El polvo le quita a lo que producen tus paneles cada día. Aquí casi no llueve para enjuagarlo.","El calor del verano hornea el polvo, y cualquier excremento tapa celdas enteras.","Un año de producción que no recuperas, y una limpieza más difícil."],
  pig:["Nidos fuera, malla puesta, paneles lavados y techo lavado gratis.","Más nidos y excremento debajo de los paneles. La limpieza es la parte más grande del precio.","Las palomas pueden criar más de una vez al año, así que más aves hacen su casa en tu techo.","Más aves, nidos más grandes, un olor más fuerte y más excremento en el cableado y la teja."],
  scr:["Malla nueva, y los bichos se quedan afuera esta temporada.","El sol sigue trabajando la malla vieja. Las rasgaduras chicas crecen.","La malla quebradiza se rompe con el viento, y los marcos se doblan.","Marcos doblados o perdidos significan marcos nuevos, $10 más por mosquitero."],
  hw:["Las manchas salen mientras siguen en la superficie.","Los minerales se siguen acumulando con cada riego.","Las manchas se pegan más hondo y toman más pasadas para salir.","Empieza el marcado, y parte de eso ya no se pule."]};
var WAIT_WHEN_ES=["Reservar ahora","En 3 meses","En 6 meses","En un año"],WAIT_NAME_ES={win:"Ventanas",sol:"Paneles solares",pig:"Palomas",scr:"Mosquiteros",hw:"Agua dura"};
function waitBox(t){
  var ul=$("waitList");if(!ul)return;ul.textContent="";
  var keys=["pig","sol","win","scr","hw"].filter(function(k){return st[k]&&!(k==="sol"&&st.pig);});if(!keys.length)keys=["win","sol"];
  keys.forEach(function(k){var li=doc.createElement("li");li.className="w"+st.wait;var b=doc.createElement("b");b.textContent=(ES?WAIT_NAME_ES:WAIT_NAME)[k];li.appendChild(b);
    var sp=doc.createElement("span");sp.textContent=(ES?WAIT_ES:WAIT)[k][st.wait];li.appendChild(sp);ul.appendChild(li);});
  var q=schedule(t,3),per=recurring();
  $("waitNote").textContent=st.wait===0?L("Book on our website today and the 10% is yours.","Reserva en nuestro sitio hoy y el 10% es tuyo."):
    (per?L("Like landscaping, glass and panels need upkeep, not one visit. Every 3 months keeps you ahead and saves "+money(q.save)+" over the year.","Como el jardín, el vidrio y los paneles necesitan mantenimiento, no una sola visita. Cada 3 meses te mantiene adelante y ahorra "+money(q.save)+" al año."):L("Like landscaping, upkeep beats catching up. Tony can put you on a reminder so it never gets this far.","Como el jardín, mantener es mejor que ponerse al corriente. Tony te puede poner un recordatorio para que no llegue a tanto."));
}

/* ---------- step 3: details once, then text, email or the form, all written out for Tony ---------- */
var iOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
var MAIL="twindowclean@gmail.com",zipCity="";
function lineText(x){return x.t+" ("+(x.note?x.note.toLowerCase():(x.from?"from ":"")+money(x.v))+")";}
function fld(id){var e=$(id);return e?e.value.trim():"";}
function cityOf(){var parts=fld("fstreet").split(","),c=parts.length>1?parts[parts.length-1]:"";c=c.replace(/\b(CA|California)\b/gi,"").replace(/\d{5}(-\d{4})?/g,"").trim();
  if(!c&&parts.length>2)c=parts[parts.length-2].trim();return c||zipCity||CFG.city||"";}
/* a storefront or building quote describes the business, not a home */
function comOnly(){return st.com&&!ALL.some(function(k){return k!=="com"&&k!=="gr"&&k!=="ad"&&st[k];});}
function comLine(){var bn=api&&api.bizName?pdfClean(api.bizName()||""):"";return st.ctype===0?"Storefront"+(bn?" ("+bn+")":"")+", "+st.cpanes+" pane"+pl(st.cpanes)+" and "+st.cdoors+" glass door"+pl(st.cdoors)+(st.cstk?", "+st.cstk+" vinyl sticker"+pl(st.cstk):"")+(st.cin?", partitions and mirrors too":"")+", "+P.comFName[st.cfreq]
  :"Office building, "+st.bst+" stor"+(st.bst>1?"ies":"y")+", about "+(st.bsq*1000).toLocaleString("en-US")+" sq ft, "+st.bwin+" panes inside and out";}
function propLabel(){return comOnly()?"Business":"Home";}
function homeLine(){if(comOnly())return comLine();var b=[st.stories+" story"];
  if(api&&api.homeDesc)b.push(api.homeDesc());
  if(st.sol||st.pig)b.push(st.panels+" solar panels"+(st.arrays>1?" in "+st.arrays+" sections ("+st.arr.slice(0,st.arrays).join(", ")+")":""));
  if(st.scr)b.push(st.screens+" screens, "+P.meshName[st.pet]+(st.frames?", new frames and clips":""));
  if(st.large)b.push("large custom home");return b.join(", ");}
function msg(t){
  t=t||totals();
  var name=fld("fname"),addr=fld("fstreet"),phone=fld("fphone"),email=fld("femail"),notes=fld("fnotes"),day=dayText(),L=[];
  L.push("Hi Tony"+(name?", it's "+name:"")+". I'd like to book:");
  if(t.it.length)t.it.forEach(function(x){L.push("• "+x.t+": "+(x.note||((x.from?"from ":"")+money(x.v))));});else L.push("• A free quote");
  if(t.early)L.push("Booked online, 10% off: "+money(-t.early));
  L.push("Total: "+(t.from?"from ":"")+money(t.total));
  if(st.plan&&recurring()){var sc=schedule(t);L.push("Plan: "+P.planName[st.plan]+(st.plan>1?", "+money(sc.each)+" a visit after the first":""));}
  L.push("Day: "+(day||"your next opening"));
  L.push(propLabel()+": "+homeLine());
  if(addr)L.push("Address: "+addr);
  if(phone)L.push("Phone: "+phone);
  if(email)L.push("Email: "+email);
  if(notes)L.push("Notes: "+notes);
  var s=L.join("\n"),subj="Quote request"+(name?" from "+name:"")+(cityOf()?", "+cityOf():"")+", "+(t.from?"from ":"")+money(t.total);
  $("msg").textContent=s;
  $("smsA").href="sms:"+SMS+(iOS?"&":"?")+"body="+encodeURIComponent(s);
  $("mailA").href="mailto:"+MAIL+"?subject="+encodeURIComponent(subj)+"&body="+encodeURIComponent(s);
  msg.text=s;msg.t=t;msg.subj=subj;
}
["fname","fstreet","fphone","femail","fnotes"].forEach(function(id){var e=$(id);if(e)e.addEventListener("input",function(){msg();});});
function copyText(txt,okMsg,node){
  var toast=$("toast");
  function sel(){try{var r=doc.createRange();r.selectNodeContents(node);var s=getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}toast.textContent=L("Selected. Copy it with your phone's menu.","Seleccionado. Cópialo con el menú de tu teléfono.");}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){toast.textContent=okMsg;},sel);else sel();
}
$("smsA").addEventListener("click",function(){track("text_tap");copyText(msg.text,L("Copied too. If Messages didn't open, paste it into a text to "+PHONE+".","También se copió. Si no se abrieron tus mensajes, pégalo en un texto al "+PHONE+"."),$("msg"));});
$("mailA").addEventListener("click",function(){track("email_tap");copyText(msg.text,L("Copied too. If your email didn't open, paste it into an email to "+MAIL+".","También se copió. Si no se abrió tu correo, pégalo en un correo a "+MAIL+"."),$("msg"));});
$("copyBtn").addEventListener("click",function(){copyText(msg.text,L("Copied. Paste it into a text to "+PHONE+" or an email to "+MAIL+".","Copiado. Pégalo en un texto al "+PHONE+" o en un correo a "+MAIL+"."),$("msg"));});
if(!("ontouchstart" in window)&&!(navigator.maxTouchPoints>0)){var wn=$("wayNote");if(wn)wn.textContent=L("On a computer, email or the form is easiest. Texting opens on a phone.","En computadora, el correo o el formulario es lo más fácil. El texto se abre en un celular.");}else{var wn2=$("wayNote");if(wn2)wn2.hidden=true;}

/* the form: straight to Tony's inbox, with everything he needs to send a crew */
var lastSend=0;
$("sendForm").addEventListener("submit",function(e){
  e.preventDefault();
  if($("hp").value)return; /* bots fill the hidden field, people never see it */
  var ph=$("fphone").value.replace(/\D/g,"");if(ph.length===11&&ph.charAt(0)==="1")ph=ph.slice(1);
  if(ph.length!==10){$("fphone").setAttribute("aria-invalid","true");$("ferr").textContent=L("Add a 10 digit mobile number so Tony can text you back.","Pon un celular de 10 dígitos para que Tony te pueda contestar por texto.");$("fphone").focus();return;}
  if(Date.now()-lastSend<30000){$("ferr").textContent=L("Got it already. Tony will text you back from "+PHONE+".","Ya lo tenemos. Tony te contesta por texto desde el "+PHONE+".");return;}
  $("fphone").removeAttribute("aria-invalid");$("ferr").textContent="";
  var btn=$("sendBtn"),lbl=btn.querySelector("b");btn.disabled=true;lbl.textContent=L("Sending…","Enviando…");
  var t=totals("en"),sc=schedule(t);
  var data={name:fld("fname").slice(0,80),phone:ph.slice(0,3)+"-"+ph.slice(3,6)+"-"+ph.slice(6),address:fld("fstreet").slice(0,140),email:fld("femail").slice(0,120),notes:fld("fnotes").slice(0,400),
    quote:t.it.map(lineText).join("\n"),subtotal:money(t.sub),booked_online:t.early?money(-t.early):"none",total:(t.from?"from ":"")+money(t.total),
    day:dayText()||"Tony to suggest",home:homeLine(),plan:st.plan&&sc.visits.length?(P.planName[st.plan]+", "+sc.visits.length+" visit"+pl(sc.visits.length)+" this year, about "+money(sc.year)+". Maintenance visits "+money(sc.each)):"One time",
    message:msg.text,page:location.pathname,city:cityOf(),check_this_quote:shareUrl(),
    _subject:msg.subj||("New quote "+money(t.total)),_replyto:fld("femail")||undefined,_gotcha:""};
  function done(ok){
    btn.disabled=false;lbl.textContent=ok?L("Sent ✓","Enviado ✓"):L("Send the form","Mandar el formulario");
    if(ok){lastSend=Date.now();$("sent").hidden=false;$("prevNote").hidden=LIVE;track("generate_lead",{value:t.total,currency:"USD",method:"form"});try{doc.dispatchEvent(new CustomEvent("tq:lead",{detail:{value:t.total}}));}catch(x){}}
    else $("ferr").textContent=L("That didn't go through. Tap Text Tony or Email Tony instead, or call "+PHONE+".","No se envió. Toca Texto a Tony o Correo a Tony, o llama al "+PHONE+".");
  }
  if(!LIVE){setTimeout(function(){done(true);},450);return;}
  fetch(FORM,{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json"},body:JSON.stringify(data)})
    .then(function(r){done(r.ok);},function(){done(false);});
});
$("fphone").addEventListener("input",function(){if(this.getAttribute("aria-invalid")){this.removeAttribute("aria-invalid");$("ferr").textContent="";}});

/* ---------- quote link: goes to Tony with the form so he can reopen the exact quote; customers share the PDF ---------- */
var FLAGS=ALL.concat(["more","inside","large","frames","pkg"]);
function token(){var f=0;FLAGS.forEach(function(k,i){if(st[k])f|=1<<i;});
  return "q"+f.toString(36)+"-"+st.stories+st.pet+st.plan+(st.time+1)+"-"+st.panels+"-"+st.spin+"-"+st.screens+"-"+st.panes+
    (st.arrays>1?"-a"+st.arr.slice(0,st.arrays).join("."):"")+
    (st.com?"-c"+st.ctype+st.cfreq+(st.cin?1:0)+st.cterm+"."+[st.cpanes,st.cdoors,st.cstk,st.bsq,st.bst,st.bwin].join("."):"")+(st.day?"-d"+st.day.replace(/-/g,""):"");}
function loadToken(){
  var m=/^#q([0-9a-z]{1,5})-([12])([01])([0-3])([0-3])-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})(?:-a(\d{1,2}(?:\.\d{1,2}){1,2}))?(?:-c([01])([0-2])([01])([0-2])?\.(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.(\d{1,3})\.(\d{1,2})\.(\d{1,3}))?(?:-d(\d{8}))?$/.exec(location.hash||"");
  if(!m)return false;
  var f=parseInt(m[1],36);if(!(f>=0)||f>=(1<<FLAGS.length))return false;
  FLAGS.forEach(function(k,i){st[k]=!!(f&(1<<i));});
  st.stories=clamp("stories",+m[2]);st.pet=clamp("pet",+m[3]);st.plan=clamp("plan",+m[4]);st.time=clamp("time",+m[5]-1);
  st.panels=clamp("panels",+m[6]);st.spin=clamp("spin",+m[7]);st.screens=clamp("screens",+m[8]);st.panes=clamp("panes",+m[9]);
  if(m[10]){var parts=m[10].split(".");st.arrays=parts.length;parts.forEach(function(x,i){st.arr[i]=clamp("arr"+i,+x);});sumPanels();}
  if(m[11]){st.ctype=clamp("ctype",+m[11]);st.cfreq=clamp("cfreq",+m[12]);st.cin=m[13]==="1";st.cterm=clamp("cterm",+(m[14]||0));st.cpanes=clamp("cpanes",+m[15]);st.cdoors=clamp("cdoors",+m[16]);st.cstk=clamp("cstk",+m[17]);
    st.bsq=clamp("bsq",+m[18]);st.bst=clamp("bst",+m[19]);st.bwin=clamp("bwin",+m[20]);}
  /* the picked day comes along only while it's still ahead, so the 10% matches what was shared */
  if(m[21]){var d=parseIso(m[21].slice(0,4)+"-"+m[21].slice(4,6)+"-"+m[21].slice(6)),max=new Date(TODAY.getTime());max.setFullYear(max.getFullYear()+1);
    if(d&&d>TODAY&&d<=max)st.day=iso(d);}
  st.pkg=st.pkg?1:0;fixTime();
  return true;
}
function canonical(){var l=doc.querySelector('link[rel="canonical"]');return (l&&/^https:\/\/twindowclean\.com\//.test(l.href))?l.href:"https://twindowclean.com"+location.pathname;}
function shareUrl(){return canonical().replace(/#.*$/,"")+"#"+token();}
/* ---------- plan or quote as a PDF, built right here with no library ---------- */
var HV=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
var HB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
function pdfClean(s){return String(s).replace(/[−–—]/g,"-").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/…/g,"...").replace(/[^\x20-\x7e\xa0-\xff×·]/g,"");}
function pdfW(s,size,bold){var w=0,tb=bold?HB:HV;s=pdfClean(s);for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);w+=(c>=32&&c<=126)?tb[c-32]:(c===215?584:c===183?278:556);}return w*size/1000;}
function makePdf(logo,home){
  var pages=[],ops=null,y=0,gold=[143,93,8],ink=[16,48,80],soft=[68,96,122],green=[27,122,76],rule=[211,230,240];
  function col(c){return (c[0]/255).toFixed(3)+" "+(c[1]/255).toFixed(3)+" "+(c[2]/255).toFixed(3);}
  function esc(s){return pdfClean(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");}
  function text(x,yy,s,size,bold,c,align){var w=pdfW(s,size,bold);if(align==="r")x-=w;ops.push("BT /"+(bold?"F2":"F1")+" "+size+" Tf "+col(c||ink)+" rg "+x.toFixed(1)+" "+(792-yy).toFixed(1)+" Td ("+esc(s)+") Tj ET");}
  function rect(x,yy,w,h,c){ops.push(col(c)+" rg "+x+" "+(792-yy-h).toFixed(1)+" "+w+" "+h.toFixed(1)+" re f");}
  function line(x1,yy,x2,c,w){ops.push(col(c)+" RG "+(w||.7)+" w "+x1+" "+(792-yy)+" m "+x2+" "+(792-yy)+" l S");}
  function wrap(s,size,maxW,bold){var words=pdfClean(s).split(" "),out=[],cur="";words.forEach(function(w){var tt=cur?cur+" "+w:w;if(pdfW(tt,size,bold)>maxW&&cur){out.push(cur);cur=w;}else cur=tt;});if(cur)out.push(cur);return out;}
  function page(){ops=[];pages.push(ops);rect(0,742,612,50,[234,246,252]);text(48,772,"Text or call "+PHONE+" · twindowclean.com",11,true,ink);text(564,772,"Hesperia and the High Desert",10,false,soft,"r");
    if(pages.length>1){text(48,48,"Tony's Window Cleaning",12,true,ink);text(564,48,who||"Your quote",10,false,soft,"r");line(48,58,564,rule);y=84;}}
  function need(h){if(y+h>724)page();}
  /* every downloaded copy carries a light watermark with who it was made for; the signed original is printed */
  function mark(o){var nm=pdfClean(name||"you").toUpperCase(),big="CUSTOMER COPY",small="PREPARED FOR "+nm+" · "+fmt(TODAY,true).toUpperCase()+" · TONY'S WINDOW CLEANING";
    o.push("q /GS1 gs");[[70,120],[70,390],[70,660]].forEach(function(p){o.push("BT /F2 54 Tf "+col(ink)+" rg 0.866 0.5 -0.5 0.866 "+p[0]+" "+p[1]+" Tm ("+esc(big)+") Tj ET");
      o.push("BT /F2 11 Tf "+col(ink)+" rg 0.866 0.5 -0.5 0.866 "+(p[0]+10)+" "+(p[1]-22)+" Tm ("+esc(small)+") Tj ET");});o.push("Q");
    o.push("BT /F1 8 Tf "+col(soft)+" rg 48 56 Td ("+esc("Customer copy for "+(name||"you")+". Tony brings the printed original to your visit for signatures. Not for reuse.")+") Tj ET");}
  function head(s){need(40);y+=8;text(48,y,s,11,true,gold);y+=10;line(48,y,564,rule);y+=18;}
  function para(s,size,c){wrap(s,size||10,516).forEach(function(ln){need(14);text(48,y,ln,size||10,false,c||soft);y+=(size||10)+4;});}
  var t=totals("en"),sc=schedule(t),per=recurring(),name=$("fname").value.trim(),street=$("fstreet").value.trim(),who=(name?name:"")+(name&&street?" · ":"")+street;
  page();
  rect(0,0,612,110,[234,246,252]);rect(0,108,612,3,[240,176,64]);
  if(logo)ops.push("q 64 0 0 64 48 "+(792-94)+" cm /Im1 Do Q");
  text(logo?126:48,52,"Tony's Window Cleaning",22,true,ink);
  text(logo?126:48,74,(st.plan?"Your service plan":"Your quote")+" · "+fmt(TODAY,true),12,false,soft);
  text(564,52,PHONE,14,true,ink,"r");text(564,72,"twindowclean.com",11,false,soft,"r");
  y=140;
  text(48,y,name?"Prepared for "+name:"Prepared for you",15,true,ink);y+=18;if(street){text(48,y,street,11,false,soft);y+=14;}
  /* their home, as they set it up in the 3D builder */
  if(home){var iw=516,ih=Math.min(258,Math.round(iw*home.h/home.w));y+=8;ops.push("q "+iw+" 0 0 "+ih+" 48 "+(792-y-ih)+" cm /Im2 Do Q");y+=ih+14;
    var hs=home.caption;if(hs){text(48,y,hs,10,false,soft);y+=16;}}
  head("What's included");
  t.it.forEach(function(x){wrap(x.t,11,x.alone?330:380).forEach(function(ln,i){need(16);text(48,y,ln,11,false,ink);if(i===0){text(564,y,x.note||((x.from?"from ":"")+money(x.v)),11,true,x.alone?green:ink,"r");if(x.alone)text(470,y,money(x.alone)+" on its own",9,false,soft,"r");}y+=16;});y+=2;});
  if(st.arrays>1&&(st.sol||st.pig)){need(16);text(60,y,st.arr.slice(0,st.arrays).map(function(n,i){return "Section "+(i+1)+": "+n+" panels";}).join("   "),10,false,soft);y+=18;}
  if(t.early){need(18);text(48,y,"Booked on our website, 10% off",11,false,green);text(564,y,money(-t.early),11,true,green,"r");y+=18;}
  need(60);line(48,y,564,ink,1.4);y+=24;text(48,y,"Total",13,true,ink);text(564,y,(t.from?"from ":"")+money(t.total),20,true,ink,"r");y+=26;
  var sv=savings(t);if(sv.length){var tot=0;sv.forEach(function(x){tot+=x[1];});text(564,y,"You save "+money(tot),11,true,green,"r");y+=22;}
  var day=dayText();if(day){need(18);text(48,y,"Requested day: "+day,11,true,ink);y+=20;}
  var hl=homeLine();need(16);text(48,y,propLabel()+": "+hl,10,false,soft);y+=16;
  var nt=fld("fnotes");if(nt){wrap("Notes: "+nt,10,516).forEach(function(ln){need(14);text(48,y,ln,10,false,soft);y+=14;});y+=4;}
  /* what the free parts of pigeon proofing would cost on their own */
  if(st.pig){head("If you booked these on their own");
    var sep=[["Solar panel wash, "+st.panels+" panels × $"+P.panel,st.panels*P.panel],["Roof soft wash, from",P.roof],[free()+" reflective spinners × $"+P.spinner,free()*P.spinner]],sepT=0;
    sep.forEach(function(r){need(16);text(48,y,r[0],10.5,false,ink);text(564,y,money(r[1]),10.5,false,soft,"r");sepT+=r[1];y+=16;});
    need(20);text(48,y,"Included with your pigeon proofing",11,true,green);text(564,y,"You keep "+money(sepT),11,true,green,"r");y+=20;
    if(st.pkg){para("Your year of cleanings: 3 more washes every 3 months at "+money(st.panels*P.panel)+" each ("+st.panels+" panels × $"+P.panel+"). Panels need it out here anyway, and every visit is the right time to check the spinners, clips and mesh, so nothing gets missed.",10,ink);}}
  /* the four ways to keep it up, priced for this home */
  if(per){head("Keeping it up: your options");
    need(18);text(48,y,"Plan",9,true,soft);text(240,y,"Visits a year",9,true,soft);text(450,y,"Each visit after the first",9,true,soft,"r");text(564,y,"About a year",9,true,soft,"r");y+=16;
    [0,1,2,3].forEach(function(v){var q=schedule(t,v);need(18);if(v===st.plan)rect(44,y-12,524,17,[253,244,226]);
      text(48,y,P.planName[v]+(v===3?"  (best value)":""),11,v===st.plan,ink);text(240,y,v===0?"1":v===1?"1 + reminder":String(q.n),11,false,ink);
      text(450,y,v===0?"-":v===1?money(q.per)+" next year":money(q.each)+" ("+Math.round(q.off*100)+"% off)",11,false,ink,"r");text(564,y,money(q.year),11,true,ink,"r");y+=18;});
    var q3=schedule(t,3);y+=2;para("Every 3 months saves "+money(q3.save)+" over the year compared with booking each visit on its own, and the price is locked for the year.",10,green);
    if(st.plan&&sc.visits.length){head("Your plan: "+P.planName[st.plan].toLowerCase());
      sc.visits.forEach(function(v){need(17);text(48,y,(v.date?fmt(v.date,true):(v.i===0?"First visit":"Month "+(v.i*sc.freq+1)))+" · "+v.label,11,false,ink);text(564,y,money(v.amt),11,true,ink,"r");y+=17;});}}
  /* storefront schedules, priced for this storefront */
  if(st.com&&st.ctype===0){head("Storefront schedules");
    need(18);text(48,y,"Schedule",9,true,soft);text(300,y,"Each visit",9,true,soft,"r");text(420,y,"Visits a year",9,true,soft,"r");text(564,y,"About a year",9,true,soft,"r");y+=16;
    var extra=(st.cin?P.comIn:0)+st.cstk*P.stk+(st.cpanes+st.cdoors>P.comUpTo?P.comOver:0),cur=comOff();
    [["One time",0,1,0],["Monthly, month to month",.15,12,1],["Every 2 weeks, month to month",.25,26,2],["Monthly, quarterly agreement",.20,12,3],["Monthly, yearly agreement",.40,12,4]].forEach(function(r){var v=cents(P.com*(1-r[1]))+extra,on=Math.abs(r[1]-cur)<.001&&(st.cfreq?r[1]>0:r[1]===0);need(18);if(on)rect(44,y-12,524,17,[253,244,226]);
      text(48,y,r[0]+(r[1]?"  ("+Math.round(r[1]*100)+"% off)":""),11,on,ink);text(300,y,money(v),11,false,ink,"r");text(420,y,String(r[2]),11,false,ink,"r");text(564,y,money(v*r[2]),11,true,ink,"r");y+=18;});
    if(st.cpanes+st.cdoors>P.comUpTo)para("Your storefront has "+(st.cpanes+st.cdoors)+" panes counting doors. The first "+P.comUpTo+" are in the base price and a flat $"+P.comOver+" covers the rest, inside and out.",10,soft);}
  if(st.com&&st.ctype===1){head("Your building");var bq=bldgPrice();
    need(18);text(48,y,"Story",9,true,soft);text(300,y,"Panes",9,true,soft,"r");text(420,y,"Each, in and out",9,true,soft,"r");text(564,y,"Amount",9,true,soft,"r");y+=16;
    bq.rows.forEach(function(r){need(18);text(48,y,r.story===1?"Ground floor":"Story "+r.story,11,false,ink);text(300,y,String(r.n),11,false,ink,"r");text(420,y,money(r.rate),11,false,ink,"r");text(564,y,money(r.amt),11,true,ink,"r");y+=18;});
    para("Every pane is checked for hard water staining and we work around existing tint. Pane counts are confirmed on a free walkthrough, then the price is firm in writing. Worked after hours, one invoice a month.",10,ink);}
  /* what waiting costs, for the services on this quote */
  var wk=["pig","sol","win","scr","hw"].filter(function(k){return st[k]&&!(k==="sol"&&st.pig);});
  if(wk.length){head("What happens if you wait");
    wk.forEach(function(k){need(30);text(48,y,WAIT_NAME[k],11,true,ink);y+=14;[2,3].forEach(function(l){wrap(WAIT_WHEN[l]+": "+WAIT[k][l],10,500).forEach(function(ln){need(14);text(60,y,ln,10,false,soft);y+=14;});});y+=4;});}
  y+=6;para("Tony confirms every job by text before it's scheduled. The price here is firm for what's listed, and anything that changes the scope gets a written price before any work starts. Satisfaction guaranteed: if anything isn't right, we redo it before we leave.");
  pages.forEach(mark);
  /* assemble the file: catalog, pages, 2 fonts, then each page and its content, then images, then the watermark's transparency */
  var np=pages.length,imgs=[],objs=[];
  if(logo)imgs.push({n:"Im1",img:logo});if(home)imgs.push({n:"Im2",img:home});
  var firstPage=5,firstImg=firstPage+np*2,gsObj=firstImg+imgs.length,xo=imgs.map(function(im,i){return "/"+im.n+" "+(firstImg+i)+" 0 R";}).join(" ");
  objs.push("<< /Type /Catalog /Pages 2 0 R >>");
  objs.push("<< /Type /Pages /Kids ["+pages.map(function(_,i){return (firstPage+i*2)+" 0 R";}).join(" ")+"] /Count "+np+" >>");
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  pages.forEach(function(o,i){var content=o.join("\n");
    objs.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /ExtGState << /GS1 "+gsObj+" 0 R >>"+(xo?" /XObject << "+xo+" >>":"")+" >> /Contents "+(firstPage+i*2+1)+" 0 R >>");
    objs.push("<< /Length "+content.length+" >>\nstream\n"+content+"\nendstream");});
  imgs.forEach(function(im){objs.push({img:im.img});});
  objs.push("<< /Type /ExtGState /ca 0.07 /CA 0.07 >>");
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
/* a picture of their home from the 3D builder, if it's loaded */
function homeShot(){
  if(!api||!api.snap)return null;
  var biz=comOnly();
  try{var url=api.snap(900,480,{type:"image/jpeg",q:.86,com:biz}),b64=url.split(",")[1],bin=atob(b64),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    if(u[0]!==0xFF||u[1]!==0xD8)return null;
    var info=api.state(),A=st.arrays>1?", "+st.arrays+" sections":"";
    if(biz)return {bytes:u,w:900,h:480,caption:(st.ctype?"Your building as set up in our 3D builder: ":"Your storefront as set up in our 3D builder: ")+comLine()+"."};
    return {bytes:u,w:900,h:480,caption:"Your home as set up in our 3D builder: "+(info.styleName||"your home")+", "+st.stories+" story"+((st.sol||st.pig)?", "+st.panels+" panels"+A:"")+"."};}catch(e){return null;}
}
/* simple names people aren't scared of: Date-Customer-City.pdf */
function pdfName(){function clean(x){return x.replace(/[^A-Za-z0-9 ]+/g," ").trim().replace(/\s+/g,"-");}
  var n=clean(fld("fname")),c=clean(cityOf());return [iso(TODAY),n||"Tonys-Window-Cleaning-Quote",c].filter(Boolean).join("-")+".pdf";}
function buildPdf(cb,note){note.textContent=L("Making your PDF…","Preparando tu PDF…");
  function finish(logo){var blob;try{blob=makePdf(logo,homeShot());}catch(e){note.textContent="Couldn't make the PDF on this device. Your quote is still on this page.";if(window.console)console.warn(e);return;}cb(blob);}
  fetch("assets/quote/logo-pdf.jpg").then(function(r){return r.ok?r.arrayBuffer():null;}).then(function(b){finish(b?{bytes:new Uint8Array(b),w:160,h:160}:null);},function(){finish(null);});}
function saveBlob(blob,name){var url=URL.createObjectURL(blob),a=doc.createElement("a");a.href=url;a.download=name;doc.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);a.remove();},4000);}
$("pdfBtn").addEventListener("click",function(){var note=$("pdfNote");
  buildPdf(function(blob){track("download_plan",{plan:st.plan});
    if(!LIVE){note.textContent="Your PDF is ready ("+pdfName()+"). In this preview downloads are blocked, on twindowclean.com it saves to your phone.";window.__tqLastPdf=blob;window.__tqLastName=pdfName();return;}
    saveBlob(blob,pdfName());note.textContent=L("Saved as "+pdfName()+". Send it with your quote and Tony has everything in one place.","Guardado como "+pdfName()+". Mándalo con tu cotización y Tony tiene todo en un solo lugar. El PDF va en inglés.");},note);});
/* share: the PDF itself goes into the share sheet, so a spouse or landlord gets a real document, not a link */
$("shareBtn").addEventListener("click",function(){var note=$("toast");
  buildPdf(function(blob){track("share_quote",{as:"pdf"});var name=pdfName();
    if(!LIVE){note.textContent="Your PDF is ready ("+name+"). Sharing is blocked in this preview, on twindowclean.com it opens your share menu.";window.__tqLastPdf=blob;window.__tqLastName=name;return;}
    var file=null;try{file=new File([blob],name,{type:"application/pdf"});}catch(e){}
    if(file&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:"Our quote from Tony's Window Cleaning"}).then(function(){note.textContent="Shared.";},function(){note.textContent="";});}
    else{saveBlob(blob,name);note.textContent="Saved as "+name+". Attach it to a text or email to share it.";}},note);});

/* ---------- ZIP: say yes with a link to the work nearby, or turn a no into a quote ---------- */
var Z={"92345":["Hesperia and Silverwood","hesperia.html","Hesperia"],"92344":["Hesperia and Oak Hills","oak-hills.html","Oak Hills"],"92340":["Hesperia","hesperia.html","Hesperia"],
  "92392":["Victorville","victorville.html","Victorville"],"92393":["Victorville","victorville.html","Victorville"],"92394":["Victorville","victorville.html","Victorville"],
  "92395":["Victorville and Spring Valley Lake","spring-valley-lake.html","Spring Valley Lake"],"92307":["Apple Valley","apple-valley.html","Apple Valley"],"92308":["Apple Valley","apple-valley.html","Apple Valley"],
  "92301":["Adelanto","adelanto.html","Adelanto"],"92371":["Phelan","phelan.html","Phelan"],"92397":["Wrightwood","service-areas.html","the High Desert"],"92372":["Pinon Hills","service-areas.html","the High Desert"]};
var HDX={"92342":"Helendale","92356":"Lucerne Valley","92311":"Barstow","92368":"Oro Grande","92358":"Lytle Creek","92329":"Phelan"};
/* down the hill: same prices, no travel fee */
var IER=[[91763,91763,"Montclair"],[92334,92337,"Fontana"],[92376,92377,"Rialto"],[92316,92316,"Bloomington"],[92324,92324,"Colton"],[92401,92427,"San Bernardino"],[92346,92346,"Highland"],
  [92373,92375,"Redlands"],[92354,92354,"Loma Linda"],[92399,92399,"Yucaipa"],[92313,92313,"Grand Terrace"],[92320,92320,"Calimesa"],[91701,91701,"Rancho Cucamonga"],[91729,91730,"Rancho Cucamonga"],
  [91737,91737,"Alta Loma"],[91739,91739,"Etiwanda"],[91784,91786,"Upland"],[91758,91758,"Ontario"],[91761,91764,"Ontario"],[91708,91708,"Chino"],[91710,91710,"Chino"],[91709,91709,"Chino Hills"],
  [92880,92880,"Eastvale"],[91752,91752,"Jurupa Valley"],[92509,92509,"Jurupa Valley"],[92860,92860,"Norco"],[92877,92883,"Corona"],[92501,92508,"Riverside"],[92518,92522,"Riverside"],
  [92551,92557,"Moreno Valley"],[92570,92572,"Perris"],[92223,92223,"Beaumont"],[92220,92220,"Banning"],[91711,91711,"Claremont"],[91766,91768,"Pomona"]];
function ieCity(z){var n=+z;for(var i=0;i<IER.length;i++)if(n>=IER[i][0]&&n<=IER[i][1])return IER[i][2];return "";}
function zres(cls,bold,rest,href,linkTxt){
  var r=$("zres");r.className="zres"+(cls?" "+cls:"");r.textContent="";
  var b=doc.createElement("b");b.textContent=bold;r.appendChild(b);r.appendChild(doc.createTextNode(" "+rest));
  if(href){var a=doc.createElement("a");a.href=href;a.textContent=linkTxt;a.className="zlink";r.appendChild(doc.createTextNode(" "));r.appendChild(a);}
}
var zi=$("zipIn");
if(zi)zi.addEventListener("input",function(){
  var v=zi.value.replace(/\D/g,"").slice(0,5);zi.value=v;
  if(v.length<5){zres("",L("We cover the High Desert and the Inland Empire:","Cubrimos el High Desert y el Inland Empire:"),L("Hesperia, Victorville, Apple Valley, Oak Hills, Phelan, Adelanto, Spring Valley Lake, Fontana, Rancho Cucamonga, Ontario, Riverside and more.","Hesperia, Victorville, Apple Valley, Oak Hills, Phelan, Adelanto, Spring Valley Lake, Fontana, Rancho Cucamonga, Ontario, Riverside y más."));return;}
  track("zip_check",{zip:v});
  var here=function(h){return location.pathname.replace(/^\//,"")===h;},ie=ieCity(v);
  if(Z[v]){zipCity=Z[v][2]==="the High Desert"?Z[v][0]:Z[v][2];zres("yes",L("Yes, we come to "+Z[v][0]+".","Sí, vamos a "+Z[v][0]+"."),L("No trip fee, and your price above is the price.","Sin cargo por viaje, y tu precio de arriba es el precio."),here(Z[v][1])?"#tq-send":Z[v][1],here(Z[v][1])?L("Send your quote →","Manda tu cotización →"):L("See the work we've done in "+Z[v][2]+" →","Ver nuestro trabajo en "+Z[v][2]+" →"));}
  else if(HDX[v]){zipCity=HDX[v];zres("yes",L("Yes, "+HDX[v]+" is on our High Desert route.","Sí, "+HDX[v]+" está en nuestra ruta del High Desert."),L("No trip fee, and your price above is the price.","Sin cargo por viaje, y tu precio de arriba es el precio."),"#tq-send",L("Send your quote →","Manda tu cotización →"));}
  else if(ie){zipCity=ie;zres("yes",L("Yes, we come down the hill to "+ie+".","Sí, bajamos la cuesta hasta "+ie+"."),L("Same prices as up here and no travel fee. Pigeon proofing, solar, windows and screens, all of it.","Los mismos precios que aquí arriba y sin cargo por viaje. Palomas, solar, ventanas y mosquiteros, todo."),here("inland-empire.html")?"#tq-send":"inland-empire.html",here("inland-empire.html")?L("Send your quote →","Manda tu cotización →"):L("See our Inland Empire work →","Ver nuestro trabajo en el Inland Empire →"));}
  else if(/^9[0-6]/.test(v)){zipCity="";zres("maybe",L("We go where the work is.","Vamos a donde está el trabajo."),L("We don't charge for travel. Add your address below and Tony will tell you straight, with a real price.","No cobramos el viaje. Pon tu dirección abajo y Tony te dice derecho, con un precio real."),"#tq-send",L("Add my address →","Poner mi dirección →"));}
  else{zipCity="";zres("maybe",L("We're a Southern California crew.","Somos una cuadrilla del sur de California."),L("If you have a home or property out here, add the address below and Tony will get you a real price.","Si tienes una casa o propiedad por aquí, pon la dirección abajo y Tony te da un precio real."),"#tq-send",L("Add my address →","Poner mi dirección →"));}
  msg();
});
doc.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a.zlink[href="#tq-send"]');if(a){e.preventDefault();$("tq-send").scrollIntoView({behavior:reduce?"auto":"smooth"});setTimeout(function(){$("fstreet").focus({preventScroll:true});},reduce?0:500);}});

/* ---------- hero: live 3D first, then real finished jobs you can swipe ---------- */
var TABS=ES?{r3d:{lbl:"3D en vivo",note:"Una casa modelo terminada como dejamos la tuya. Tócala para probar con la tuya."},win:{lbl:"Ventanas",note:"Trabajos reales terminados. Desliza para ver más."},sol:{lbl:"Solar",note:"Trabajos reales terminados. Desliza para ver más."},pig:{lbl:"Control de palomas",note:"Trabajos reales terminados. Desliza para ver más."}}:
  {r3d:{lbl:"Live 3D",note:"A model home finished the way we leave yours. Tap it to try your own."},
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
$$(".r3d",box).forEach(function(r){r.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();open3d("tour");}});});

/* ---------- 3D: load on demand, full screen builder ---------- */
var api=null,loading=false,pend=[],ov=$("ov"),lastFocus=null;
var core={st:st,CFG:CFG,P:P,$:$,$$:$$,reduce:reduce,money:money,track:track,free:free,render:render,totals:totals,
  mode:CFG.mode||"home",close:function(){close3d();},
  ie:function(){var v=zi&&zi.value;return !!(v&&v.length===5&&ieCity(v));},comVisit:function(){return comVisit();},comOffName:comOffName,bldgPrice:bldgPrice};
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
/* a link can land straight in the 3D: twindowclean.com/pigeon-proofing.html?see=pig, or #see-pig. Search snippets and ads use these. */
(function(){var m=/[?&]see=(tour|home|win|sol|scr|pig|com)\b/.exec(location.search)||/^#see-(tour|home|win|sol|scr|pig|com)$/.exec(location.hash||"");if(!m)return;
  var want=m[1];if(want==="win"||want==="sol"||want==="pig"||want==="scr")st[want]=true;
  var go=function(){if(!ov)return;hydrate();render();open3d(want==="home"?"tour":want);track("deep_link_3d",{see:want});};
  if(doc.readyState==="complete")setTimeout(go,150);else window.addEventListener("load",function(){setTimeout(go,150);});})();
if("IntersectionObserver" in window){var seen=false;new IntersectionObserver(function(en,o){if(en[0].isIntersecting&&!seen){seen=true;track("view_price");o.disconnect();}}).observe($("price"));}
render();
setTab("r3d");
if(doc.readyState==="complete")setTimeout(autoLoad,300);else window.addEventListener("load",function(){setTimeout(autoLoad,300);});
window.__tq=core; /* for testing and for the 3D module */
})();
