const {chromium}=require('playwright');require('fs').mkdirSync('shots-modes',{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g/,r=>r.abort());
const shot=async(n,w)=>{await p.waitForTimeout(w||2600);await p.evaluate(()=>window.__tq.api.settle());await p.waitForTimeout(700);await (await p.$('#stage')).screenshot({path:'shots-modes/'+n+'.png'});const m=await p.$eval('#ovMsg',e=>e.hidden?'':e.innerText.replace(/\n/g,' ')).catch(()=>'');console.log(n,'|',m.slice(0,150));};
await p.goto('http://localhost:8765/window-cleaning-hesperia.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(2500);
await p.screenshot({path:'shots-modes/hero-window-page.png'});
await p.click('.tq-intro [data-mode="tour"]');await shot('01-welcome');
await p.click('.obd [data-o="hood"] [data-v="1"]');await p.click('.obd [data-obd="next"]');await shot('02-problems',800);
await p.click('.obd input[value="sol"]');await p.click('.obd input[value="pig"]');await p.click('.obd [data-obd="build"]');await shot('03-tour-over',3500);
const hs=await p.$$eval('.hs',l=>l.filter(x=>!x.hidden).map(x=>x.textContent));console.log('labels',hs.join(','));
for(let i=4;i<=8;i++){await p.click('#ovNav .nx');await shot('0'+i+'-tour',3200);}
await p.click('.ov-tabs [data-hmode="pig"]');await p.waitForTimeout(1500);
await p.click('[data-hact="reach"]');await shot('10-reach',4500);
await p.click('#ovNav .nx');await shot('11-nextdoor',5500);
await p.click('.ov-tabs [data-hmode="home"]');await p.waitForTimeout(800);await p.click('[data-hseg="hood"] [data-v="2"]');await shot('12-acreage',4000);
await p.click('[data-hseg="hood"] [data-v="0"]');await shot('13-desert',3500);
await p.click('.ov-tabs [data-hmode="sol"]');await p.evaluate(()=>window.__tq.api.seek(4));await shot('14-solar',2500);
console.log(errs.join(' | ')||'no errors');await b.close();})();
