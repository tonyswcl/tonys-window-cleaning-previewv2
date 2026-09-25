const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome')});
for(const pg of ['index.html','pigeon-proofing-hesperia.html','window-cleaning.html']){
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true});const p=await ctx.newPage();
const cdp=await ctx.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6e6/8*10,uploadThroughput:750e3/8});
const res=[];p.on('response',async r=>{try{const h=await r.allHeaders();res.push([r.url().replace('http://localhost:8765/',''),+(h['content-length']||0)]);}catch(e){}});
await p.route(/googletagmanager|google-analytics|facebook|clarity|fonts\.g/,r=>r.abort());
const t0=Date.now();await p.goto('http://localhost:8765/'+pg,{waitUntil:'load'});const tl=Date.now()-t0;
const lcp=await p.evaluate(()=>new Promise(res=>{new PerformanceObserver(l=>{const e=l.getEntries();res(e[e.length-1].startTime);}).observe({type:'largest-contentful-paint',buffered:true});setTimeout(()=>res(-1),3000);}));
const nav=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd)};});
await p.waitForTimeout(2500);const tot=res.reduce((a,r)=>a+r[1],0);
console.log(pg,'load',tl,'ms nav',JSON.stringify(nav),'LCP',Math.round(lcp),'total KB',Math.round(tot/1024));
res.sort((a,b)=>b[1]-a[1]).slice(0,8).forEach(r=>console.log('   ',Math.round(r[1]/1024)+'KB',r[0].slice(0,80)));await ctx.close();}
await b.close();})();
