const {chromium}=require('playwright');require('fs').mkdirSync('shots-home',{recursive:true});
const W=+(process.argv[2]||390),Hh=+(process.argv[3]||844),mob=W<600;
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:W,height:Hh},isMobile:mob,hasTouch:mob});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|net::/.test(m.text()))errs.push(m.text().slice(0,200));});
await p.addInitScript(()=>{window.__tqFixedQ=true;});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(1500);
const tag=W+'';const shot=async(n)=>{await p.waitForTimeout(1800);await p.evaluate(()=>window.__tq.api.settle());await p.waitForTimeout(900);await (await p.$('#stage')).screenshot({path:`shots-home/${tag}-${n}.png`});
  const m=await p.$eval('#ovMsg',e=>e.hidden?'':e.innerText.replace(/\n/g,' | ')).catch(()=>'');const dots=await p.$$eval('.dmg',a=>a.filter(x=>!x.hidden).length);const hs=await p.$$eval('.hs',a=>a.filter(x=>!x.hidden).map(x=>x.textContent));console.log(n,'|dots',dots,'|labels',hs.join(','),'|',m.slice(0,230));};
await p.click('.tq-intro [data-mode="tour"]');await p.waitForTimeout(2500);
console.log('welcome visible',await p.$eval('.obd',e=>!e.hidden));
await (await p.$('.obd')).screenshot({path:`shots-home/${tag}-obd1.png`});
await p.click('.obd [data-o="hood"] [data-v="3"]');await p.waitForTimeout(600);
await p.click('.obd [data-obd="next"]');await p.waitForTimeout(500);
const cards=await p.$$eval('.obd-pc',a=>a.map(x=>x.querySelector('b').textContent+(x.querySelector('input').checked?'*':'')));console.log('problem cards',cards.join(', '));
for(const v of ['win','pig','scr']){const on=await p.$eval(`.obd-pc input[value="${v}"]`,e=>e.checked);if(!on)await p.click(`.obd-pc:has(input[value="${v}"])`);}
await p.waitForTimeout(300);await (await p.$('.obd')).screenshot({path:`shots-home/${tag}-obd2.png`});
await p.click('.obd [data-obd="build"]');
await shot('s0');
for(let i=1;i<12;i++){const lbl=await p.$eval('#ovNav .nx',e=>e.textContent);if(/Start over|Watch again/.test(lbl))break;
  if(i===1||i===3){const d=await p.$('.dmg:not([hidden])');if(d){await d.click();await p.waitForTimeout(300);}}
  console.log('  next label:',lbl);await p.click('#ovNav .nx');await shot('s'+i);}
for(const k of [1,2,3]){await p.click('#wxChip');await p.waitForTimeout(400);console.log('weather chip:',await p.$eval('#wxChip',e=>e.textContent));await p.click('.ov-tabs [data-hmode="home"]').catch(()=>{});}
await p.waitForTimeout(1500);await (await p.$('#stage')).screenshot({path:`shots-home/${tag}-wx.png`});
console.log('quality',JSON.stringify(await p.evaluate(()=>window.__tq.api.quality())));
console.log('errors',errs);await b.close();})();
