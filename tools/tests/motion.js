/* Tony moves like a person, not in jumps: the window demo played frame by frame at a fixed step through the moment he gets down
   to lean the screen on the wall (where the crouch used to flip every other frame), and his head and hips never change speed by
   more than a few centimetres from one frame to the next. Uses the test hooks trace, __tqFixedDt and __tqNoHold. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:360,height:300}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__tqFixedQ=true;});await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
const res=[];const ok=(n,c,d)=>res.push((c?'PASS ':'FAIL ')+n+(d!==undefined?'  ['+d+']':''));
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});
await p.evaluate(()=>document.querySelector('#three .open3d[data-mode="win"]').click());
await p.waitForFunction(()=>window.__tq.api.state().rig,null,{timeout:90000});await p.waitForTimeout(1000);
await p.evaluate(()=>{window.__tqFixedDt=1/30;window.__tqNoHold=true;window.__tq.api.seek(2.2);});await p.waitForTimeout(600);
await p.evaluate(()=>window.__tq.api.trace(true));
await p.waitForFunction(()=>window.__tq.api.state().tl>=3.4,null,{timeout:300000});
const tr=await p.evaluate(()=>window.__tq.api.trace());
const acc=(j)=>{let m=0,at=0;for(let i=1;i<tr.length-1;i++){const a=tr[i-1],c=tr[i],n=tr[i+1];let s=0;for(let k=0;k<3;k++){const x=n[1+3*j+k]-2*c[1+3*j+k]+a[1+3*j+k];s+=x*x;}s=Math.sqrt(s);if(s>m){m=s;at=c[0];}}return [m,at];};
const [hm,ht]=acc(0),[pm,pt]=acc(5);
ok('frames traced through the crouch',tr.length>=30,tr.length);
ok('head changes speed by under 10 cm a frame',hm<.10,(hm*100).toFixed(1)+' cm at '+ht.toFixed(2)+' s');
ok('hips change speed by under 6 cm a frame',pm<.06,(pm*100).toFixed(1)+' cm at '+pt.toFixed(2)+' s');
ok('no JS errors',!errs.length,errs.join(' | '));
console.log(res.join('\n'));await b.close();})();
