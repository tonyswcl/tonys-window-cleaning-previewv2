const {chromium}=require('playwright');const fs=require('fs');
const tag=process.argv[2]||'w';
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text().slice(0,200));});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8765/window-cleaning.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(2500);
const jobs=[];for(const h of [3,1,0,2]){jobs.push([`${tag}-h${h}-a`,{hood:h},{yaw:.55,tilt:.32,dist:1.6}]);jobs.push([`${tag}-h${h}-b`,{hood:h},{yaw:.9,tilt:.6,dist:3.2}]);jobs.push([`${tag}-h${h}-c`,{hood:h},{yaw:-2.4,tilt:.25,dist:1.5}]);}
for(const [n,look,cam] of jobs){const t0=Date.now();await p.evaluate(l=>window.__tq.api.look(l),look);const bt=Date.now()-t0;await p.waitForTimeout(800);
  const u=await p.evaluate(c=>window.__tq.api.snap(900,560,c),cam);fs.writeFileSync(n+'.png',Buffer.from(u.split(',')[1],'base64'));console.log(n,'build ms',bt);}
const info=await p.evaluate(()=>{const r=window.__tq.api.renderInfo&&window.__tq.api.renderInfo();return r;});console.log(JSON.stringify(info));
console.log('errors',errs);await b.close();})();
