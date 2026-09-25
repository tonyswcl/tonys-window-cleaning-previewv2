import os,re,json,shutil,sys,html as H
HERE=os.path.dirname(os.path.abspath(__file__));REPO=os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0,os.path.join(REPO,'_quote'))
import build
R=REPO;OUTD=os.environ.get('PREVIEW_OUT','/tmp/twc-preview');os.makedirs(OUTD,exist_ok=True);S=OUTD+'/site'
if os.path.exists(S):shutil.rmtree(S)
os.makedirs(S)
pages=sorted(f for f in os.listdir(R) if f.endswith('.html'))
need=set();rows=[]
# The private preview host serves no .glb files. The preview gets the same character packed into a script,
# named in each page's TQ.techjs; q3d.js loads it only when it asks for the character. The live site is untouched.
GLB=os.path.join(R,'assets/quote/tech.glb');TJ=''
if os.path.exists(GLB):
    import base64,hashlib
    raw=open(GLB,'rb').read();os.makedirs(S+'/assets/quote',exist_ok=True)
    open(S+'/assets/quote/tech-glb.js','w').write('window.TQ_TECH_URL="data:model/gltf-binary;base64,'+base64.b64encode(raw).decode()+'";\n')
    TJ='"techjs":"assets/quote/tech-glb.js?v=%s",'%hashlib.sha1(raw).hexdigest()[:10]
def local(u):
    u=u.split('#')[0].split('?')[0]
    if not u or u.startswith(('http','mailto:','tel:','sms:','data:','javascript','//')):return None
    return u.lstrip('/')
for f in pages:
    s=open(os.path.join(R,f),encoding='utf-8').read()
    out='home.html' if f=='index.html' else f
    s=s.replace('href="/"','href="home.html"').replace('href="/#','href="home.html#').replace('href="index.html"','href="home.html"').replace('href="index.html#','href="home.html#')
    s=re.sub(r'(src|href)="/(?!/)',r'\1="',s)
    s=s.replace('<script>window.TQ={','<script>window.TQ={"live":false,'+TJ,1)
    s=s.replace('</body>','<script>try{history.scrollRestoration="manual"}catch(e){}addEventListener("load",function(){if(!location.hash)scrollTo(0,0)});</script>\n</body>',1)
    for u in re.findall(r'(?:src|href|srcset)="([^"]+)"',s):
        for part in u.split(','):
            l=local(part.strip().split(' ')[0])
            if l and not l.endswith('.html'):need.add(l)
    open(os.path.join(S,out),'w',encoding='utf-8').write(s)
    if f not in ('404.html','privacy.html'):
        t=H.unescape(re.search(r'<title>(.*?)</title>',s,re.S).group(1)).split(' | ')[0].strip()
        rows.append((out,t,build.page_config(f)['mode']))
for css in ['style.css','assets/fonts.css']:
    if os.path.exists(os.path.join(R,css)):
        need.add(css);base=os.path.dirname(css)
        for u in re.findall(r'url\(["\']?([^"\')]+)',open(os.path.join(R,css)).read()):
            l=local(u);
            if l:need.add(os.path.normpath(os.path.join(base,l)))
need|={'assets/quote/q3d.js','assets/vendor/three.min.js','assets/quote/logo-pdf.jpg','assets/quote/home-4x5.webp','assets/quote/home-16x10.webp','assets/quote/com-4x5.webp','assets/quote/com-16x10.webp'}
need|={'assets/quote/%s-%s.webp'%(a,b) for a,bs in [('style','01234'),('hood','01234')] for b in bs}|{'assets/quote/prob-%s.webp'%k for k in ['win','hw','sol','pig','scr','large']}|{'assets/quote/tony-192.jpg','assets/vendor/gltf.min.js'}
miss=[n for n in need if not os.path.exists(os.path.join(R,n))]
for n in sorted(need):
    if n in miss:continue
    os.makedirs(os.path.dirname(os.path.join(S,n)) or S,exist_ok=True);shutil.copyfile(os.path.join(R,n),os.path.join(S,n))
files={}
for d,_,fs in os.walk(S):
    for x in fs:
        p=os.path.relpath(os.path.join(d,x),S);files[p]=p
prev=os.path.join(OUTD,'files-prev.json');old=json.load(open(prev)) if os.path.exists(prev) else {}
for k,v in old.items():
    if v is not None and k not in files:files[k]=None
json.dump(files,open(os.path.join(os.path.dirname(S),'files-v3.json'),'w'),indent=0)
json.dump(rows,open(os.path.join(os.path.dirname(S),'rows-v3.json'),'w'))
print('pages',len(pages),'assets',len(need)-len(miss),'missing',miss,'publish',sum(1 for v in files.values() if v),'remove',sum(1 for v in files.values() if v is None))
print('bytes',sum(os.path.getsize(os.path.join(S,p)) for p,v in files.items() if v))

# the landing page: preview-landing.html with the page list rebuilt from what's in the repo
lab={'home':'3D home','pig':'Pigeon story','sol':'Solar demo','win':'Window demo','scr':'Screen demo','com':'Storefront 3D'}
def grp(o):
    for pre,n in [('pigeon-proofing','Pigeon proofing'),('solar-panel-cleaning','Solar panel cleaning'),('window-cleaning','Window cleaning'),('screen-repair','Screen repair'),('commercial','Storefronts and buildings')]:
        if o.startswith(pre):return n
    if o in ['adelanto.html','apple-valley.html','hesperia.html','oak-hills.html','phelan.html','silverwood.html','spring-valley-lake.html','victorville.html','inland-empire.html']:return 'Cities'
    if o in ['adhesive-removal.html','graffiti-removal-victorville.html','graffiti-removal.html','hard-water-removal.html','post-construction-window-cleaning.html']:return 'Other services'
    return 'Main'
order=['Main','Pigeon proofing','Solar panel cleaning','Window cleaning','Screen repair','Storefronts and buildings','Cities','Other services']
G={k:[] for k in order}
for r in rows:G[grp(r[0])].append(r)
sec=''.join('<section class="grp"><h2>%s <small>%d</small></h2><ul>'%(k,len(G[k]))+''.join('<li><a href="%s"><span>%s</span><em class="t3">%s</em></a></li>'%(r[0],H.escape(r[1]),lab.get(r[2],'3D home')) for r in sorted(G[k]))+'</ul></section>\n' for k in order if G[k])
land=open(os.path.join(HERE,'preview-landing.html'),encoding='utf-8').read()
land=re.sub(r'(?s)(<div class="grid">\n).*?(  </div>\n</div>)',lambda m:m.group(1)+sec+m.group(2),land)
land=re.sub(r'All \d+ pages','All %d pages'%len(pages),land);land=re.sub(r'<li><b>\d+</b> pages</li>','<li><b>%d</b> pages</li>'%len(pages),land)
open(os.path.join(S,'index.html'),'w',encoding='utf-8').write(land)
files['index.html']='index.html';json.dump(files,open(os.path.join(OUTD,'files-v3.json'),'w'),indent=0)
print('landing written, pages listed',len(rows))
