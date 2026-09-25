/* deep links open the 3D on the right module, and Meta hears the right events */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[],res=[];p.on('pageerror',e=>errs.push(e.message));
const ok=(n,c,d)=>res.push((c?'PASS ':'FAIL ')+n+(d!==undefined?'  ['+String(d).slice(0,160)+']':''));
await p.addInitScript(()=>{window.__tqFixedQ=true;window.__fb=[];window.fbq=function(){window.__fb.push(Array.from(arguments));};window.fbq.loaded=true;});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
for(const [url,mode,svc] of [['pigeon-proofing-hesperia.html?see=pig','pig','pig'],['window-cleaning.html#see-sol','sol','sol'],['commercial-window-cleaning.html?see=com','com',null],['index.html?see=tour','home',null]]){
  await p.goto('http://localhost:8765/'+url);await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(2500);
  const st=await p.evaluate(()=>({open:!document.getElementById('ov').hidden,mode:window.__tq.api.state().mode,st:window.__tq.st}));
  ok('deep link '+url+' opens '+mode,st.open&&st.mode===mode,JSON.stringify({open:st.open,mode:st.mode}));
  if(svc)ok('  service '+svc+' switched on',st.st[svc]);}
// pixel events on the pigeon page: ViewContent from the deep link, CustomizeSimulator, QuoteReady, QuoteSubmitted
await p.goto('http://localhost:8765/pigeon-proofing-hesperia.html?see=pig');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(2000);
await p.click('#ovX');await p.waitForTimeout(400);
await p.click('[data-svc="win"]');await p.waitForTimeout(300);
await p.fill('#fname','Test Person');
await p.evaluate(()=>{document.getElementById('mailA').addEventListener('click',e=>e.preventDefault());document.getElementById('mailA').click();});
const fb=await p.evaluate(()=>window.__fb.map(a=>a[1]+(a[2]&&a[2].method?':'+a[2].method:'')));
ok('Meta ViewContent fired',fb.includes('ViewContent'),fb.join(','));
ok('Meta CustomizeSimulator fired',fb.includes('CustomizeSimulator'));
ok('Meta QuoteSubmitted by email fired',fb.includes('QuoteSubmitted:email'));
ok('no JS errors',!errs.length,errs.join(' | '));
console.log(res.join('\n'));await b.close();})();
