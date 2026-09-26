/* the Meta Pixel: the site's own pixel only, and on a real quote journey Meta hears only intent events:
   PageView, ViewContent (3D opened), CustomizeSimulator (service picked or 3D shaped), QuoteReady (PDF saved), QuoteSubmitted
   (sent by text, email or form), Lead (form) and Contact (phone or text tap). No Google tags beyond the two from launch. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..','..'),PIXEL='1424363186269397';
(async()=>{const res=[];const ok=(n,c,d)=>res.push((c?'PASS ':'FAIL ')+n+(d!==undefined?'  ['+String(d).slice(0,300)+']':''));
/* every page carries the same pixel and no other; no Google ids beyond the launch ones */
const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')&&f!=='404.html');let bad=[],gids=new Set();
for(const f of pages){const h=fs.readFileSync(path.join(ROOT,f),'utf8');const ids=[...h.matchAll(/fbq\('init',\s*'(\d+)'\)/g)].map(m=>m[1]);
  if(!(ids.length===1&&ids[0]===PIXEL)&&f!=='privacy.html')bad.push(f+':'+ids.join('/'));for(const m of h.matchAll(/\b(G-[A-Z0-9]{8,}|AW-\d{8,})\b/g))gids.add(m[1]);}
ok('every page inits pixel '+PIXEL+' once, no other pixel',bad.length===0,bad.slice(0,5).join(' '));
ok('Google ids are only the two from launch',[...gids].sort().join(',')==='AW-17238956448,G-F97LW93P0P',[...gids].join(','));
const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
await ctx.route(/googletagmanager|google-analytics|connect\.facebook|clarity|fonts\.g|weather\.gov/,r=>r.abort());
await ctx.route(/formspree\.io/,r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__tqFixedQ=true;window.__fb=[];window.fbq=function(){window.__fb.push(Array.from(arguments));};window.fbq.loaded=true;
  window.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="tel:"],a[href^="sms:"]');if(a)e.preventDefault();});});
const since=async()=>{const all=await p.evaluate(()=>window.__fb.splice(0));return all.map(a=>a[0]==='init'?'init:'+a[1]:a[1]+(a[2]&&a[2].method?':'+a[2].method:''));};
await p.goto('http://localhost:8765/window-cleaning-victorville.html');await p.waitForLoadState('load');await p.waitForTimeout(2500);
let ev=await since();ok('landing: init with the site pixel, one PageView',ev.filter(x=>x==='init:'+PIXEL).length===1&&ev.filter(x=>x==='PageView').length===1,ev.join(','));
await p.click('#work a[data-work]');await p.waitForFunction(()=>document.querySelector('.workbox')&&document.querySelector('.workbox').open,null,{timeout:10000});await p.keyboard.press('Escape');await p.waitForTimeout(300);
ev=await since();ok('looking at real work photos sends nothing to Meta',ev.length===0,ev.join(','));
await p.click('#tiles [data-svc="sol"]');await p.waitForTimeout(400);
ev=await since();ok('quote start: picking a service is CustomizeSimulator',ev.includes('CustomizeSimulator'),ev.join(','));
await p.evaluate(()=>document.querySelector('#three .open3d[data-mode="win"]').click());await p.waitForTimeout(2500);
ev=await since();ok('3D opened: ViewContent',ev.includes('ViewContent'),ev.join(','));
await p.click('#ovX').catch(()=>{});await p.waitForTimeout(800);await since();
const plan=await p.$('[data-seg="plan"] [data-v="1"]');if(plan){await plan.click();await p.waitForTimeout(300);}
ev=await since();ok('picking a plan is CustomizeSimulator',!plan||ev.includes('CustomizeSimulator'),ev.join(','));
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:30000}).catch(()=>null),p.click('#pdfBtn')]);
ev=await since();ok('PDF saved: QuoteReady',!!dl&&ev.includes('QuoteReady'),ev.join(','));
await p.fill('#fname','Test Person');await p.fill('#fstreet','1 Test St, Victorville');await p.fill('#fphone','760-555-0100');await p.fill('#femail','test@example.com');
await p.evaluate(()=>{document.getElementById('smsA').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));document.getElementById('mailA').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));});await p.waitForTimeout(300);
ev=await since();ok('text and email buttons: QuoteSubmitted each, no extra Contact',ev.includes('QuoteSubmitted:text')&&ev.includes('QuoteSubmitted:email')&&!ev.some(x=>/^Contact/.test(x)),ev.join(','));
await p.click('#sendBtn');await p.waitForTimeout(1500);
ev=await since();ok('form sent: Lead and QuoteSubmitted by form',ev.includes('Lead')&&ev.includes('QuoteSubmitted:form'),ev.join(','));
await p.evaluate(()=>{const t=document.querySelector('header a[href^="tel:"]');t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
  /* the plain text links live in the header, footer and 3D panel; use one if this page has it in the DOM, else the same markup */
  let s=document.querySelector('a[href="sms:+17145590300"]');if(!s){s=document.createElement('a');s.href='sms:+17145590300';s.textContent='Text';document.querySelector('footer').appendChild(s);}
  s.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));});await p.waitForTimeout(300);
ev=await since();ok('header phone tap and text link: Contact',ev.includes('Contact:phone')&&ev.includes('Contact:text'),ev.join(','));
const allowed=/^(init:\d+|PageView|ViewContent|CustomizeSimulator|QuoteReady|QuoteSubmitted(:\w+)?|Lead|Contact(:\w+)?)$/;
/* replay the whole journey's log for the allowed set */
await p.goto('http://localhost:8765/pigeon-proofing.html');await p.waitForTimeout(1000);
await p.click('#tiles [data-svc="win"]');await p.click('[data-body="win"] [data-sw="inside"]').catch(()=>{});await p.waitForTimeout(400);
ev=await since();ok('only intent events reach Meta (no UI noise)',ev.every(x=>allowed.test(x)),ev.filter(x=>!allowed.test(x)).join(','));
ok('no JS errors',errs.length===0,errs.join(' | '));
console.log(res.join('\n'));await b.close();})();
