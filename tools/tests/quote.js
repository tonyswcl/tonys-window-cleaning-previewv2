const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome')});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
const posts=[];const res=[];const ok=(n,c,d)=>res.push((c?'PASS ':'FAIL ')+n+(d!==undefined?'  ['+String(d).slice(0,240)+']':''));
await ctx.route(/googletagmanager|google-analytics|facebook|clarity|fonts\.g|three\.min\.js|q3d\.js/,r=>r.abort());
await ctx.route(/formspree\.io/,r=>{posts.push(JSON.parse(r.request().postData()));r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/pigeon-proofing-hesperia.html');await p.waitForTimeout(700);
const T=async()=>{await p.waitForTimeout(500);return p.$eval('#ttotal',e=>e.textContent);};const SV=()=>p.$eval('#save',e=>e.hidden?'':e.innerText.replace(/\n/g,' | '));
ok('pigeon $650',await T()==='$650',await T());
ok('savings include roof from $599: $711',/You save \$711/.test(await SV()),await SV());
await p.click('[data-body="pig"] [data-seg="pkg"] [data-v="1"]');await p.waitForTimeout(300);
ok('package note',/3 washes every 3 months at \$112/.test(await p.$eval('#pkgNote',e=>e.textContent)),await p.$eval('#pkgNote',e=>e.textContent));
ok('package line on ticket',/A year of cleanings/.test(await p.$eval('#tlines',e=>e.innerText)));
ok('total stays $650 today',await T()==='$650');
const vis=await p.$$eval('#visits li b',l=>l.map(x=>x.textContent));ok('plan auto every 3 months, visits $112 at $7 a panel',vis.length===4&&vis[1]==='$112',vis.join(','));
ok('pigeon upkeep counted by panels',/16 × \$7 = \$112 a visit/.test(await p.$eval('#plantot',e=>e.textContent)));
/* info buttons, and the questions stay out of the flow */
await p.click('[data-body="pig"] [data-why] >> nth=0');ok('info opens why',await p.$eval('[data-body="pig"] .why',e=>!e.hidden));
ok('no need tabs in the steps',(await p.$$('[data-need], .ntabs')).length===0&&!/Do I really need this|Not sure I need it|Now or later/.test(await p.$eval('#quote',e=>e.innerText)+await p.$eval('#day',e=>e.innerText)));
ok('what you get lines on the pigeon card',/What you get\./.test(await p.$eval('[data-body="pig"] .get',e=>e.textContent)));
ok('signs tucked under step 3, closed',await p.$eval('#signs',e=>!e.open&&e.closest('#tq-send')!==null&&/How to tell it's time/.test(e.querySelector('summary').textContent)));
/* weekend */
const tb0=await p.$$eval('[data-seg="time"] button',l=>l.filter(x=>!x.hidden).map(x=>x.textContent));ok('no day yet: morning, afternoon, I prefer weekends',tb0.join(',')==='Morning,Afternoon,I prefer weekends',tb0.join(','));
ok('day strip never says quote',!/quote/i.test(await p.$eval('#days',e=>e.innerText)));
await p.click('[data-seg="time"] [data-v="2"]');await p.waitForTimeout(200);ok('weekends with no day reads any weekend',/Your day: any weekend/.test(await p.$eval('#dayPicked',e=>e.textContent))&&/Day: any weekend/.test(await p.$eval('#msg',e=>e.textContent)));
const wk=await p.$('.days .day.wk');await wk.click();await p.waitForTimeout(200);
const tb=await p.$$eval('[data-seg="time"] button',l=>l.filter(x=>!x.hidden).map(x=>x.textContent));
ok('weekend shows only I prefer weekends',tb.length===1&&tb[0]==='I prefer weekends',tb.join(','));
ok('weekend day text',/, weekend\. Tony confirms by text/.test(await p.$eval('#dayPicked',e=>e.textContent))&&!/quote|3 PM/.test(await p.$eval('#dayPicked',e=>e.textContent)),await p.$eval('#dayPicked',e=>e.textContent));
const wd=await p.$('.days .day:not(.wk)');await wd.click();await p.waitForTimeout(200);
const tb2=await p.$$eval('[data-seg="time"] button',l=>l.filter(x=>!x.hidden).map(x=>x.textContent));ok('weekday shows morning and afternoon',tb2.join(',')==='Morning,Afternoon',tb2.join(','));
ok('weekday clears the weekend preference',await p.evaluate(()=>window.__tq.st.time===-1));
/* ZIP */
for(const [z,re] of [['92505',/down the hill to Riverside/],['92335',/down the hill to Fontana/],['91739',/down the hill to Etiwanda/],['92356',/Lucerne Valley is on our High Desert route/],['92345',/Yes, we come to Hesperia/],['90210',/We go where the work is/],['10001',/Southern California crew/]]){
  await p.fill('#zipIn',z);await p.dispatchEvent('#zipIn','input');const t=await p.$eval('#zres',e=>e.innerText);ok('ZIP '+z,re.test(t),t);}
/* message and ways */
await p.fill('#fname','Maria Lopez');await p.fill('#fstreet','123 Main St, Hesperia');await p.fill('#fphone','760-555-0123');await p.fill('#femail','maria@example.com');await p.fill('#fnotes','Gate code 1234');
const m=await p.$eval('#msg',e=>e.textContent);ok('message has everything',/Maria Lopez/.test(m)&&/Address: 123 Main St, Hesperia/.test(m)&&/Phone: 760-555-0123/.test(m)&&/Notes: Gate code 1234/.test(m)&&/Home: 1 story/.test(m)&&/Day: /.test(m),m.replace(/\n/g,' / '));
const mail=await p.$eval('#mailA',a=>a.getAttribute('href'));ok('email link prefilled',/^mailto:twindowclean@gmail\.com\?subject=Quote%20request%20from%20Maria%20Lopez%2C%20Hesperia/.test(mail),mail.slice(0,120));
const sms=await p.$eval('#smsA',a=>a.getAttribute('href'));ok('text link prefilled',/^sms:\+17145590300\?body=Hi%20Tony/.test(sms));
/* PDF share with simple name */
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:10000}).catch(()=>null),p.click('#shareBtn')]);
ok('share saves a PDF named date customer city',dl&&/^\d{4}-\d{2}-\d{2}-Maria-Lopez-Hesperia\.pdf$/.test(dl.suggestedFilename()),dl&&dl.suggestedFilename());
if(dl){const s=fs.readFileSync(await dl.path()).toString('latin1');ok('PDF shows stand alone values',/on its own/.test(s)&&/If you booked these on their own/.test(s)&&/year of cleanings/i.test(s));}
/* form */
await p.click('#sendBtn');await p.waitForTimeout(1200);const d=posts[0]||{};
ok('form payload complete',d.address==='123 Main St, Hesperia'&&d.email==='maria@example.com'&&d.notes==='Gate code 1234'&&/Every 3 months/.test(d.plan)&&d.city==='Hesperia',JSON.stringify({a:d.address,e:d.email,n:d.notes,p:d.plan,c:d.city,s:d._subject}));
ok('no JS errors',errs.length===0,errs.join(' | '));
console.log(res.join('\n'));await b.close();})();
