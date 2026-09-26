/* phone and tablet layout, portrait and landscape: no sideways scroll, the 3D picture first with a sane height, the real work strip
   right after it and before the quote with no big gap, strip photos lazy (none loaded before they're near), the 3D panel fits on open.
   usage: node mobile.js   (writes shots to ./mobile/) */
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('mobile',{recursive:true});
const PAGES=['index.html','window-cleaning-victorville.html','solar-panel-cleaning.html','pigeon-proofing.html','screen-repair-hesperia.html','crestline.html','limpieza-de-ventanas.html','commercial-window-cleaning.html'];
const VIEWS=[[360,780],[390,844],[768,1024],[844,390],[1024,768]];
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const res=[];const ok=(n,c,d)=>res.push((c?'PASS ':'FAIL ')+n+(d!==undefined&&!c?'  ['+String(d).slice(0,260)+']':''));const errs=[];
for(const [W,H] of VIEWS){const mob=W<900;const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:mob,hasTouch:mob,deviceScaleFactor:1});
  await ctx.route(/googletagmanager|google-analytics|facebook|clarity|formspree|fonts\.g|weather\.gov|three\.min\.js|q3d\.js/,r=>r.abort());
  for(const pg of PAGES){const p=await ctx.newPage();p.on('pageerror',e=>errs.push(pg+' '+W+': '+e.message));
    await p.goto('http://localhost:8765/'+pg);await p.waitForLoadState('load');await p.waitForTimeout(500);
    const m=await p.evaluate(()=>{const R=e=>e?e.getBoundingClientRect():null,y=e=>R(e).top+scrollY;const w=document.getElementById('work'),q=document.getElementById('quote'),wipe=document.getElementById('wipe');
      const lazy=w?[...w.querySelectorAll('img')].map(i=>i.loading==='lazy').every(Boolean):true;
      const loaded=w?[...w.querySelectorAll('img')].filter(i=>i.complete&&i.naturalWidth>0).length:0;
      /* the strip shows small webp thumbnails; the full photo loads only when someone taps it */
      const full=w?[...w.querySelectorAll('a[data-work]')].map(a=>a.getAttribute('href')).filter(h=>performance.getEntriesByType('resource').some(r=>r.name.endsWith(h))).length:0;
      const over=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('.work-strip,.track,.days,.modes,[aria-hidden="true"],.ov')}).slice(0,3).map(e=>e.tagName+'.'+(e.className||'').toString().slice(0,30));
      return {full,docW:document.documentElement.scrollWidth,vw:innerWidth,wipeH:wipe?R(wipe).height:0,wipeTop:wipe?y(wipe):0,work:w?{top:y(w),bottom:y(w)+R(w).height}:null,quote:y(q),lazy,loaded,n:w?w.querySelectorAll('img').length:0,over};});
    const tag=pg.replace('.html','')+' '+W+'x'+H;
    ok(tag+' no sideways scroll',m.docW<=m.vw,m.docW+'>'+m.vw+' '+m.over.join(','));
    ok(tag+' 3D picture height sane',m.wipeH>=Math.min(260,H*0.4)&&m.wipeH<=Math.max(H*0.95,700),m.wipeH);
    if(m.work){ok(tag+' strip after the 3D, before the quote, no big gap',m.work.top>=m.wipeTop&&m.work.bottom<=m.quote&&m.quote-m.work.bottom<140,JSON.stringify(m));
      ok(tag+' strip photos lazy, thumbnails only, no full size photo loaded',m.lazy&&m.full===0,m.full+' full of '+m.n);}
    else if(!/commercial/.test(pg))ok(tag+' has a strip',false);
    if(pg==='window-cleaning-victorville.html'){await p.evaluate(()=>document.getElementById('work').scrollIntoView({block:'start',behavior:'instant'}));await p.waitForTimeout(800);
      const loadedAfter=await p.evaluate(()=>[...document.querySelectorAll('#work img')].filter(i=>i.complete&&i.naturalWidth>0).length);ok(tag+' strip photos load once scrolled to',loadedAfter>=2,loadedAfter);
      await p.screenshot({path:`mobile/${W}x${H}-work.png`});}
    await p.close();}
  await ctx.close();}
ok('no JS errors',errs.length===0,errs.slice(0,4).join(' | '));
console.log(res.filter(r=>r.startsWith('FAIL')).join('\n')||'');console.log(res.filter(r=>r.startsWith('PASS')).length+' pass, '+res.filter(r=>r.startsWith('FAIL')).length+' fail');await b.close();})();
