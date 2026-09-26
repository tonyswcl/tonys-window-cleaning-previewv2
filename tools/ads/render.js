/* Meta ad images from real job photos, drawn with the site's own fonts and colors, rendered by headless Chromium.
   The photo does the work; one short line sits in a band under it, never on it.
   The try it on your phone ad uses tools/ads/explore-phone.jpg, a phone screenshot of the 3D tour (390x844 at 3x).
   usage (repo server on :8765): node tools/ads/render.js [outdir]   -> assets/ads/meta/*.jpg by default */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..','..'),OUT=process.argv[2]||path.join(ROOT,'assets','ads','meta'),BASE='http://localhost:8765/';
const ADS=require('./ads.json');
/* the fonts go in as data so they load without a cross origin request */
const font=f=>'data:font/woff2;base64,'+fs.readFileSync(path.join(ROOT,'assets','fonts',f)).toString('base64');
const css=`@font-face{font-family:Sora;src:url(${font('sora.woff2')}) format("woff2");font-weight:100 900}
@font-face{font-family:Jakarta;src:url(${font('plus-jakarta-sans.woff2')}) format("woff2");font-weight:200 800}
*{box-sizing:border-box;margin:0}body{width:var(--w);height:var(--h);overflow:hidden;background:#eaf6fc;font-family:Jakarta,sans-serif;color:#103050}
.ad{position:relative;width:var(--w);height:var(--h);display:flex;flex-direction:column}
.ph{flex:0 0 var(--ph);background-size:cover;background-repeat:no-repeat;position:relative}
.ph.two{display:grid;grid-template-rows:1fr 1fr;gap:6px;background:#fff}.ph.two>div{background-size:cover;position:relative}
.tag{position:absolute;left:28px;bottom:24px;background:rgba(255,255,255,.94);color:#103050;font:800 26px Sora;padding:10px 18px;border-radius:999px;letter-spacing:.02em}
.band{flex:1;border-top:10px solid #f0b040;padding:34px 56px 30px;display:flex;flex-direction:column;gap:14px}
.kick{font:800 25px Jakarta;letter-spacing:.14em;text-transform:uppercase;color:#8f5d08}
.hd{font:800 var(--hs) Sora;line-height:1.08;letter-spacing:-.02em;text-wrap:balance}
.sub{font:600 29px Jakarta;color:#35516b}
.ft{margin-top:auto;display:flex;align-items:center;gap:16px;font:700 25px Jakarta;color:#35516b}
.ft img{width:58px;height:58px;border-radius:50%;background:#fff}.ft .st{margin-left:auto;color:#103050}.ft .st b{color:#f0b040;letter-spacing:2px}
.phone{position:absolute;border-radius:54px;background:#0e1b2a;padding:16px;box-shadow:0 30px 60px rgba(16,48,80,.28)}
.phone div{width:100%;height:100%;border-radius:40px;background-size:100% 100%}
.ex .band{border-top:0;background:transparent}
.ex .ft{position:absolute;left:56px;right:56px;bottom:var(--ftb)}`;
function page(a,f){const [w,h]=f.size;const ph=f.ph,hs=f.hs||'60px';
  let photo;
  if(a.kind==='phone')photo='';
  else if(a.pair)photo=`<div class="ph two" style="--ph:${ph}px">${a.pair.map((p,i)=>`<div style="background-image:url(${BASE}assets/photos/${p.f}.jpg);background-position:${p.pos||'center'}"><span class="tag">${p.tag}</span></div>`).join('')}</div>`;
  else photo=`<div class="ph" style="--ph:${ph}px;background-image:url(${BASE}assets/photos/${a.photo}.jpg);background-position:${f.pos||a.pos||'center'}">${a.tag?`<span class="tag">${a.tag}</span>`:''}</div>`;
  const band=a.band===false?'':`<div class="band" style="padding-bottom:${f.padb||30}px;${f.col?`max-width:${f.col}px;justify-content:center;gap:26px;`:''}"><div class="kick">${a.kick}</div><div class="hd">${a.head}</div>${a.sub?`<div class="sub">${a.sub}</div>`:''}
    <div class="ft"><img src="${BASE}assets/logo-92.png" alt=""><span>Tony's Window Cleaning · twindowclean.com</span><span class="st"><b>★★★★★</b> 5.0 Google</span></div></div>`;
  let phone='';if(a.kind==='phone'){const sp=process.env.SHOT||path.join(__dirname,'explore-phone.jpg'),shot=a.shot==='SHOT'?'data:image/'+(/png$/.test(sp)?'png':'jpeg')+';base64,'+fs.readFileSync(sp).toString('base64'):a.shot;const pw=f.pw,phh=Math.round((pw-32)*(f.ratio||2.1641)+32);phone=`<div class="phone" style="width:${pw}px;height:${phh}px;left:${f.px}px;top:${f.py}px"><div style="background-image:url(${shot})"></div></div>`;}
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="--w:${w}px;--h:${h}px;--hs:${hs};--ftb:${f.ftb||40}px"><div class="ad ${a.kind==='phone'?'ex':''}" style="${a.kind==='phone'?'background:linear-gradient(160deg,#eaf6fc,#c0e0f0)':''}">${phone}${photo}${a.kind==='phone'?`<div style="flex:0 0 ${f.top}px"></div>`:''}${band}</div></body></html>`;}
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({executablePath:(process.env.CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome')});
  const only=process.env.ONLY?process.env.ONLY.split(','):null;
  for(const a of ADS.ads){if(only&&!only.includes(a.id))continue;
    for(const f of a.formats){const [w,h]=f.size;const p=await b.newPage({viewport:{width:w,height:h}});
      await p.setContent(page(a,f),{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
      const fn=path.join(OUT,`${a.id}-${w}x${h}.jpg`);await p.screenshot({path:fn,type:'jpeg',quality:86});await p.close();console.log(path.relative(ROOT,fn));}}
  await b.close();})();
