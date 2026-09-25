const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__tqFixedQ=true;});
await p.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov/,r=>r.abort());
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__tq&&window.__tq.api,null,{timeout:90000});await p.waitForTimeout(2500);
const set=async(f)=>{await p.evaluate(f=>{const st=window.__tq.st;st.sol=!!f.sol;st.pig=!!f.pig;st.scr=!!f.scr;st.win=true;st.panels=16;st.arrays=1;window.__tq.api.look(f.look);},f);await p.waitForTimeout(1200);};
const save=(n,u)=>fs.writeFileSync('cards/'+n+'.png',Buffer.from(u.split(',')[1],'base64'));
fs.mkdirSync('cards',{recursive:true});
// home styles, on the lawn street
const styles=[[0,1,false,{yaw:.62,tilt:.22,dist:.95}],[1,1,false,{yaw:.62,tilt:.22,dist:.95}],[2,1,true,{yaw:.62,tilt:.22,dist:.95}],[3,2,false,{yaw:.62,tilt:.2,dist:.95}],[4,1,false,{yaw:.62,tilt:.22,dist:.95}]];
for(const [i,stories,grids,cam] of styles){await set({look:{style:i,hood:1,stories:stories,grids:grids}});save('style-'+i,await p.evaluate(c=>window.__tq.api.snap(480,320,c),cam));}
for(const h of [0,1,2,3,4]){await set({look:{style:h===4?4:0,hood:h,stories:1,grids:false}});save('hood-'+h,await p.evaluate(c=>window.__tq.api.snap(480,320,c),{yaw:h===3?.35:.55,tilt:.42,dist:h===2?2.4:2.1}));}
const probs=[['win',{}],['hw',{}],['scr',{scr:true}],['sol',{sol:true}],['pig',{pig:true}]];
for(const [k,f] of probs){await set(Object.assign({look:{style:0,hood:1,stories:1,grids:false}},f));save('prob-'+k,await p.evaluate(k=>window.__tq.api.probSnap(k,480,320),k));}
await set({look:{style:3,hood:1,stories:2,grids:false}});save('prob-large',await p.evaluate(c=>window.__tq.api.snap(480,320,c),{yaw:.62,tilt:.2,dist:.95}));
// posters for the hero, before 3D loads: pristine model home, lawn street
await set({look:{style:0,hood:1,stories:1,grids:false},pig:true});
for(const [n,w,h,o] of [['home-4x5',1200,1500,{yaw:.6,tilt:.3,dist:1.0}],['home-16x10',1440,900,{yaw:.62,tilt:.2,dist:1.05}]])save(n,await p.evaluate(a=>window.__tq.api.snap(a[0],a[1],a[2]),[w,h,o]));
console.log('errors',errs);await b.close();})();
