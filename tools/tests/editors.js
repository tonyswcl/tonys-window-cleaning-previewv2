const {chromium}=require('playwright');require('fs').mkdirSync('shots-editors',{recursive:true});
const W=+(process.argv[2]||390),Hh=+(process.argv[3]||844),mob=W<600;
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:W,height:Hh},isMobile:mob,hasTouch:mob});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|net::/.test(m.text()))errs.push(m.text().slice(0,200));});
await p.addInitScript(()=>{window.__tqFixedQ=true;});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
const tag=W+'';const snap=async(n)=>{await p.waitForTimeout(1300);await p.evaluate(()=>window.__tq.api.settle());await p.waitForTimeout(700);await (await p.$('#stage')).screenshot({path:`shots-editors/${tag}-${n}.png`});};
const st=async()=>p.evaluate(()=>window.__tq.api.edState());
const tap=async(u,v)=>{const pt=await p.evaluate(a=>window.__tq.api.edPt(a[0],a[1]),[u,v]);await p.mouse.click(pt.x,pt.y);await p.waitForTimeout(400);};
// ---- home
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(1500);
await p.click('.tq-intro [data-mode="tour"]');await p.waitForTimeout(2000);await p.click('.obd [data-obd="skip"]');await p.waitForTimeout(1500);
console.log('edit button:',await p.$eval('.edgo',e=>!e.hidden&&e.textContent));
await p.click('.edgo');await snap('h0');let s0=await st();console.log('home start',JSON.stringify(s0));
// tap to add in a high empty spot (second story area is empty on 1 story? use upper band near the ends)
await p.click('.edbar [data-ed="next"]');await p.click('.edbar [data-ed="next"]');await p.waitForTimeout(1500);const sR=await st();console.log('right side',JSON.stringify(sR));const len=sR.len;await tap(0,1.5);let s1=await st();console.log('after add',s1.items.length,'sel',s1.sel);
await p.click('.edbar [data-edseg="type"] [data-v="0"]');await p.click('.edbar [data-edseg="sz"] [data-v="2"]');await p.waitForTimeout(400);
let s2=await st();console.log('after type/size',JSON.stringify(s2.items.slice(-1)));
// drag the selected one
const last=s2.items[s2.items.length-1];const a1=await p.evaluate(a=>window.__tq.api.edPt(a[0],a[1]),[last[0],last[1]]);
await p.mouse.move(a1.x,a1.y);await p.mouse.down();await p.mouse.move(a1.x+30,a1.y+5,{steps:6});await p.mouse.up();await p.waitForTimeout(400);
let s3=await st();console.log('after drag',JSON.stringify(s3.items.slice(-1)));
await snap('h1');
await p.click('.edbar [data-ed="next"]');await snap('h2');console.log('side',JSON.stringify((await st()).f));
await p.click('.edbar [data-ed="done"]');await p.waitForTimeout(800);
console.log('quote after home edit: screens',await p.evaluate(()=>window.__tq.st.screens),'more',await p.evaluate(()=>window.__tq.st.more));
console.log('msg',await p.$eval('#ovMsg',e=>e.innerText.slice(0,160)));await snap('h3');
// ---- storefront
await p.goto('http://localhost:8765/commercial-window-cleaning.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(1500);
await p.click('.tq-intro [data-mode="tour"]');await p.waitForTimeout(2000);
await p.click('.ov-panel [data-hseg="cst"] [data-v="1"]').catch(e=>console.log('no cst',e.message.slice(0,80)));await p.fill('#cname','Desert Rose Cafe').catch(()=>{});await p.waitForTimeout(800);
await snap('s0');
await p.click('.edgo');await p.waitForTimeout(800);let c0=await st();console.log('shop start',c0.items.length,'len',c0.len);
await p.click('.edbar [data-edseg="type"] [data-v="1"]');await tap(c0.len/2-.6,1.5);let c1=await st();console.log('after door add',c1.items.length,JSON.stringify(c1.items.map(i=>i[3])),'counts',await p.evaluate(()=>{const s=window.__tq.st;return [s.cpanes,s.cdoors,s.cstk].join(',');}));
await p.click('.edbar [data-edseg="type"] [data-v="0"]');await p.click('.edbar [data-ed="wider"]');await p.waitForTimeout(1500);/* wider flies the camera; on the software renderer the tap point is only right once it lands */let c2=await st();await tap(c2.len/2-1.0,2.0);
await p.click('.edbar [data-ed="stk"]');await p.waitForTimeout(400);await snap('s1');
await p.click('.edbar [data-ed="done"]');await p.waitForTimeout(800);
console.log('shop counts',await p.evaluate(()=>{const s=window.__tq.st;return [s.cpanes,s.cdoors,s.cstk].join(',');}));
console.log('lines',await p.$$eval('#tlines .tline',a=>a.map(x=>x.innerText.replace(/\n/g,' = ')).join(' || ')));
await snap('s2');
console.log('errors',errs);await b.close();})();
