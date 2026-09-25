const {chromium}=require('playwright');const fs=require('fs');
const ROOT=require('path').resolve(__dirname,'..','..');
const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')).sort();
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const fails=[];let n=0;
for(const vp of [{width:390,height:844,isMobile:true,hasTouch:true},{width:1360,height:900}]){
  const ctx=await b.newContext({viewport:{width:vp.width,height:vp.height},isMobile:!!vp.isMobile,hasTouch:!!vp.hasTouch});
  await ctx.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|three\.min\.js|q3d\.js/,r=>r.abort());
  for(const f of pages){
    const p=await ctx.newPage();const errs=[];
    p.on('pageerror',e=>errs.push('JS '+e.message));
    p.on('response',r=>{if(r.url().startsWith('http://localhost')&&r.status()>=400&&!(f==='404.html'))errs.push('HTTP '+r.status()+' '+r.url().replace('http://localhost:8765/',''));});
    await p.goto('http://localhost:8765/'+f,{waitUntil:'load'});await p.waitForTimeout(700);
    const r=await p.evaluate(()=>{const o={};o.over=document.documentElement.scrollWidth-innerWidth;
      o.tq=!!window.__tq;o.total=(document.getElementById('ttotal')||{}).textContent||'';o.tpl=document.querySelectorAll('template[data-tpl]').length;
      o.h1=document.querySelectorAll('h1').length;o.brokenImg=[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.loading!=='lazy'&&!/facebook/.test(i.src)).map(i=>i.src.slice(-40));
      return o;});
    if(r.over>1)errs.push('overflow '+r.over+'px');
    if(r.h1!==1)errs.push('h1 x'+r.h1);
    if(r.brokenImg.length)errs.push('broken img '+r.brokenImg.join(','));
    if(r.tq){
      if(!/^\$|^from \$/.test(r.total))errs.push('total "'+r.total+'"');
      /* first touch unpacks the lazy parts and the page keeps working */
      await p.click('#moreSvc');await p.waitForTimeout(150);
      const h=await p.evaluate(()=>({tpl:document.querySelectorAll('template[data-tpl]').length,x:!document.getElementById('xtiles').hidden,bodies:document.querySelectorAll('[data-body]').length,ops:document.querySelectorAll('#ov .ops').length}));
      if(h.tpl||h.bodies!==12||h.ops!==6)errs.push('hydrate '+JSON.stringify(h));
      const tile=await p.$('.tile[data-svc="scr"]');await tile.click();await p.waitForTimeout(120);
      const vis=await p.evaluate(()=>[!document.querySelector('[data-body="scr"]').hidden,window.__tq.st.scr]);if(vis[0]!==vis[1])errs.push('scr body out of sync');
      const o2=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(o2>1)errs.push('overflow after open '+o2);
    }
    const ok=r.tq||['privacy.html','404.html'].includes(f);if(!ok)errs.push('no tool');
    if(errs.length)fails.push(vp.width+' '+f+': '+errs.join(' | '));n++;
    await p.close();
  }
  await ctx.close();
}
console.log('checked',n,'page loads');console.log(fails.length?fails.join('\n'):'ALL PAGES CLEAN');
await b.close();})();
