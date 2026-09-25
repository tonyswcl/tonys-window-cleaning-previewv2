const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [pg,tag] of [['commercial-window-cleaning-hesperia.html','com'],['pigeon-proofing-hesperia.html','res']]){
const ctx=await b.newContext({viewport:{width:900,height:800},acceptDownloads:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__tqFixedQ=true;});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
await p.goto('http://localhost:8765/'+pg);await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(2500);
if(tag==='com'){for(let i=0;i<3;i++)await p.click('[data-step="cstk"] [data-d="1"]');await p.click('[data-seg="cfreq"] [data-v="1"]');}
await p.fill('#fname','Sample Customer');await p.fill('#fstreet','100 Main St, Hesperia');
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:30000}),p.click('#pdfBtn')]);await dl.saveAs('pdf-'+tag+'.pdf');console.log(tag,dl.suggestedFilename(),errs);await ctx.close();}
await b.close();})();
