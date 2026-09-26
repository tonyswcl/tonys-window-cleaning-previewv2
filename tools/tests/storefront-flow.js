const {chromium}=require('playwright');require('fs').mkdirSync('shots-storefront',{recursive:true});
const W=+(process.argv[2]||390),Hh=+(process.argv[3]||844),mob=W<600;
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:W,height:Hh},isMobile:mob,hasTouch:mob});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|net::/.test(m.text()))errs.push(m.text().slice(0,200));});
await p.addInitScript(()=>{window.__tqFixedQ=true;});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
await p.goto('http://localhost:8765/commercial-window-cleaning.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(3000);
await p.screenshot({path:`shots-storefront/${W}-hero.png`});
const tag=W+'';const shot=async(n)=>{await p.waitForTimeout(1500);await p.evaluate(()=>window.__tq.api.settle());await p.waitForTimeout(800);await (await p.$('#stage')).screenshot({path:`shots-storefront/${tag}-${n}.png`});
  const m=await p.$eval('#ovMsg',e=>e.hidden?'':e.innerText.replace(/\n/g,' | ')).catch(()=>'');console.log(n,'|',m.slice(0,220));};
// set stickers in the quote first
await p.click('[data-step="cstk"] [data-d="1"]');await p.click('[data-step="cstk"] [data-d="1"]');await p.click('[data-step="cstk"] [data-d="1"]');
await p.click('[data-step="cpanes"] [data-d="1"]');await p.click('[data-step="cpanes"] [data-d="1"]');await p.click('[data-step="cpanes"] [data-d="1"]');
console.log('lines',await p.$$eval('#tlines .tline',a=>a.map(x=>x.innerText.replace(/\n/g,' = ')).join(' || ')));
console.log('total',await p.$eval('#ttotal',e=>e.textContent));
await p.click('.tq-intro [data-mode="tour"]');await shot('c0');
for(let i=1;i<7;i++){const lbl=await p.$eval('#ovNav .nx',e=>e.textContent);if(/Start over/.test(lbl))break;console.log('  next',lbl);await p.click('#ovNav .nx');await shot('c'+i);}
// the auto service shop: office glass plus the service bays
await p.click('.ov-panel [data-otab="look"]');await p.click('.ov-panel [data-hseg="cst"] [data-v="4"]');await shot('auto');
console.log('auto shop built',JSON.stringify(await p.evaluate(()=>window.__tq.api.state().h3.cst)));
await p.click('.ov-panel [data-hseg="cst"] [data-v="0"]');await p.waitForTimeout(800);
// building
await p.click('.ov-panel [data-seg="ctype"] [data-v="1"]');await p.waitForTimeout(500);await p.click('.ov-panel [data-step="bst"] [data-d="1"]');await p.click('.ov-panel [data-step="bwin"] [data-d="4"]');
await shot('b0');console.log('title',await p.$eval('#ovT',e=>e.textContent));console.log('lines',await p.$$eval('#tlines .tline',a=>a.map(x=>x.innerText.replace(/\n/g,' = ')).join(' || ')));
// back to house tab
await p.click('.ov-tabs [data-hmode="home"]');await shot('h0');
console.log('errors',errs);await b.close();})();
