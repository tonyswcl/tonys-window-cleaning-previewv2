const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
await p.goto('http://localhost:8765/pigeon-proofing.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(1500);
await p.click('.tq-intro [data-mode="tour"]');await p.waitForTimeout(1500);await p.click('.obd [data-obd="skip"]');
for(let i=0;i<3;i++){await p.waitForTimeout(8000);console.log(i,JSON.stringify(await p.evaluate(()=>window.__tq.api.quality())));}
console.log('errors',errs);await b.close();})();
