/* inside windows are one flat $49 add on for the whole house: not per window, not a percentage, not a starting price.
   Checked on the ticket, with two stories, with more windows and a big window count, with a plan, in Spanish, and in the PDF. */
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome')});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
await ctx.route(/googletagmanager|google-analytics|facebook|clarity|fonts\.g|three\.min\.js|q3d\.js|formspree/,r=>r.abort());
const res=[];const ok=(n,c,d)=>res.push((c?'PASS ':'FAIL ')+n+(d!==undefined?'  ['+String(d).slice(0,240)+']':''));
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const T=async()=>{await p.waitForTimeout(400);return p.$eval('#ttotal',e=>e.textContent);};
const lines=()=>p.$eval('#tlines',e=>e.innerText.replace(/\n/g,' | '));
const insideLine=async()=>{const l=await lines();const m=/(Inside windows[^|]*|Ventanas por dentro[^|]*)\|\s*([^|]+)/.exec(l);return m?m[2].trim():null;};
await p.goto('http://localhost:8765/window-cleaning-hesperia.html');await p.waitForTimeout(700);
await p.evaluate(()=>{window.__tq.st.win=true;window.__tq.render();});
ok('single story windows $149',await T()==='$149',await T());
await p.click('#tiles [data-svc="win"]').catch(()=>{});await p.evaluate(()=>{const st=window.__tq.st;if(!st.win){st.win=true;window.__tq.render();}});
await p.click('[data-body="win"] [data-sw="inside"]');
ok('inside on: $149 + $49 = $198',await T()==='$198',await T());
ok('ticket line is $49 for the whole house',await insideLine()==='$49'&&/whole house/.test(await lines()),await lines());
await p.click('[data-body="win"] [data-seg="stories"] [data-v="2"]');
ok('two story with inside: $249 + $49 = $298',await T()==='$298',await T());
await p.click('[data-body="win"] [data-sw="more"]');
ok('more windows adds the flat $39, inside stays $49',await T()==='$337'&&await insideLine()==='$49',(await T())+' '+await insideLine());
await p.evaluate(()=>{const st=window.__tq.st;st.wins=60;st.winsSet=true;window.__tq.render();});
ok('a 60 window house: inside still $49',await insideLine()==='$49'&&await T()==='$337',(await T())+' '+await insideLine());
await p.click('[data-body="win"] [data-sw="more"]');await p.evaluate(()=>{const st=window.__tq.st;st.wins=12;st.winsSet=false;window.__tq.render();});
const planBtn=await p.$('[data-seg="plan"] [data-v="2"]');if(planBtn){await planBtn.click();await p.waitForTimeout(300);}
ok('with a plan the inside line is still $49 and today is $298',await insideLine()==='$49'&&await T()==='$298',(await T())+' '+await insideLine());
ok('no page wording prices inside per window or as a percent',!/\$49 (a|per|each) (window|pane)|inside[^.]{0,30}\d+%/i.test(await p.$eval('body',e=>e.innerText)));
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:10000}).catch(()=>null),p.click('#pdfBtn')]);
if(dl){const s=fs.readFileSync(await dl.path()).toString('latin1');ok('PDF lists inside windows at $49',/Inside windows, whole house, tracks included/.test(s)&&/\$49\b/.test(s)&&!/\$50\b/.test(s));}else ok('PDF downloaded',false);
/* Spanish */
await p.goto('http://localhost:8765/limpieza-de-ventanas.html');await p.waitForTimeout(700);
await p.evaluate(()=>{window.__tq.st.win=true;window.__tq.render();});await p.click('#tiles [data-svc="win"]').catch(()=>{});await p.evaluate(()=>{const st=window.__tq.st;if(!st.win){st.win=true;window.__tq.render();}});
await p.click('[data-body="win"] [data-sw="inside"]');
ok('Spanish: $198 and the inside line is $49',await T()==='$198'&&await insideLine()==='$49',(await T())+' '+await lines());
ok('no JS errors',errs.length===0,errs.join(' | '));
console.log(res.join('\n'));await b.close();})();
