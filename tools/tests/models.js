/* the property models: every home style builds, picking a style sets only its own defaults and puts back what it set
   when another is picked, the message to Tony names the home, and the auto shop builds in the storefront view */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1100,height:760}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__tqFixedQ=true;});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
const res=[];const ok=(n,c,d)=>res.push((c?'PASS ':'FAIL ')+n+(d!==undefined?'  ['+String(d).slice(0,200)+']':''));
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(1500);
const S=async()=>JSON.parse(await p.evaluate(()=>{const s=window.__tq.api.state(),st=window.__tq.st,lc=document.querySelector('.obd-pc input[value="large"]');
  return JSON.stringify({style:s.style,roof:s.h3.roof,rc:s.h3.rc,grids:s.h3.grids,stories:st.stories,large:st.large,box:lc?lc.checked:null,desc:window.__tq.api.homeDesc()});}));
/* every style builds a house */
const ids=[];for(let v=0;v<7;v++){await p.evaluate(v=>window.__tq.api.look({style:v}),v);await p.waitForTimeout(400);ids.push((await S()).style);}
ok('all seven home styles build',ids.join(',')==='new,ranch,classic,estate,cabin,older,mfg',ids.join(','));
await p.evaluate(()=>window.__tq.api.look({style:0,roof:0,rc:0}));
/* the welcome */
await p.click('.tq-intro [data-mode="tour"]');await p.waitForTimeout(1500);const s0=await S();
ok('welcome shows seven style cards',(await p.$$('.obd [data-o="style"] button')).length===7);
await p.click('.obd [data-o="style"] [data-v="6"]');await p.waitForTimeout(300);let s=await S();
ok('manufactured home: one story, charcoal shingles',s.style==='mfg'&&s.stories===1&&s.roof===2&&s.rc===2,JSON.stringify(s));
ok('message to Tony names it',/manufactured home/.test(s.desc),s.desc);
await p.click('.obd [data-o="style"] [data-v="5"]');await p.waitForTimeout(300);s=await S();
ok('older desert home puts the roof back',s.style==='older'&&s.roof===s0.roof&&s.rc===s0.rc&&/older desert home/.test(s.desc),JSON.stringify(s));
await p.click('.obd [data-o="style"] [data-v="3"]');await p.waitForTimeout(300);s=await S();
ok('large two story: two stories and the large home card checked',s.stories===2&&s.large===true&&s.box===true,JSON.stringify(s));
await p.click('.obd [data-o="style"] [data-v="0"]');await p.waitForTimeout(300);s=await S();
ok('another style clears the large flag it set',s.large===false&&s.box===false,JSON.stringify(s));
await p.click('.obd [data-obd="skip"]');await p.waitForTimeout(1200);
/* the panel */
await p.click('.ov-panel [data-otab="home"]').catch(()=>{});
await p.click('.ov-panel [data-hseg="style"] [data-v="6"]');await p.waitForTimeout(300);
await p.click('.ov-panel [data-hseg="roof"] [data-v="1"]');await p.waitForTimeout(300);
await p.click('.ov-panel [data-hseg="style"] [data-v="1"]');await p.waitForTimeout(300);s=await S();
ok('a roof picked by hand stays when the style changes',s.style==='ranch'&&s.roof===1,JSON.stringify(s));
await p.click('.ov-panel [data-hseg="style"] [data-v="2"]');await p.waitForTimeout(300);s=await S();ok('classic turns window grids on',s.grids===true);
await p.click('.ov-panel [data-hseg="style"] [data-v="5"]');await p.waitForTimeout(300);s=await S();ok('aluminum sliders turn window grids off',s.grids===false);
ok('panel buttons follow the state',(await p.$$eval('.ov-panel [data-hseg="roof"] button',l=>l.map(x=>x.getAttribute('aria-pressed')).join(',')))==='false,true,false');
/* the auto shop */
await p.click('.ov-tabs [data-hmode="com"]');await p.waitForTimeout(2500);
await p.click('.ov-panel [data-otab="look"]').catch(()=>{});await p.click('.ov-panel [data-hseg="cst"] [data-v="4"]');await p.waitForTimeout(2000);
ok('auto shop builds in the storefront view',(await p.evaluate(()=>{const s=window.__tq.api.state();return s.mode+' '+s.h3.cst;}))==='com 4');
ok('no JS errors',!errs.length,errs.join(' | '));
console.log(res.join('\n'));await b.close();})();
