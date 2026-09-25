const {chromium}=require('playwright');require('fs').mkdirSync('cards',{recursive:true});const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__tqFixedQ=true;});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
await p.goto('http://localhost:8765/commercial-window-cleaning.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(2500);
await p.evaluate(()=>{const st=window.__tq.st;st.cstk=3;window.__tq.render();});await p.waitForTimeout(1500);
for(const [n,w,h,o] of [['com-4x5',800,1000,{yaw:.5,tilt:.18,dist:.95}],['com-16x10',960,600,{yaw:.45,tilt:.14,dist:1.0}]]){const u=await p.evaluate(a=>window.__tq.api.snap(a[0],a[1],a[2]),[w,h,o]);fs.writeFileSync('cards/'+n+'.png',Buffer.from(u.split(',')[1],'base64'));}
console.log(errs);await b.close();})();
