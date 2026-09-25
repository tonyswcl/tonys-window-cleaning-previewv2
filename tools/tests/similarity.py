import re,subprocess,itertools,collections,sys,glob,os
os.chdir(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
def vis(s,drop_tool=False):
    if drop_tool:
        s=re.sub(r'(?s)<!-- tq:(cta|media|steps|tail) -->.*?<!-- /tq:\1 -->',' ',s)
    s=re.sub(r'(?is)<template[^>]*>.*?</template>',' ',s)
    s=re.sub(r'(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>',' ',s)
    s=re.sub(r'(?is)<(header|nav|footer)[^>]*>.*?</\1>',' ',s)
    s=re.sub(r'(?s)<!--.*?-->',' ',s);s=re.sub(r'(?s)<[^>]+>',' ',s);s=re.sub(r'&[a-z#0-9]+;',' ',s)
    return re.findall(r"[a-z0-9$']+",s.lower())
def sh(w,k=5):return {' '.join(w[i:i+k]) for i in range(len(w)-k+1)}
def jac(a,b):return len(a&b)/max(1,len(a|b))
groups=collections.defaultdict(list)
for f in sorted(glob.glob('*.html')):
    b=f[:-5]
    for pre in ['window-cleaning-','solar-panel-cleaning-','pigeon-proofing-','screen-repair-','commercial-window-cleaning-']:
        if b.startswith(pre):groups[pre].append(f);break
    else:
        if b in ['hesperia','victorville','apple-valley','adelanto','oak-hills','phelan','spring-valley-lake','silverwood']:groups['city'].append(f)
old={}
for g,fs in groups.items():
    for f in fs:
        try:old[f]=subprocess.run(['git','show','32f612d:'+f],capture_output=True,text=True,check=True).stdout
        except Exception:old[f]=None
print('%-30s %6s %6s %6s %8s %8s'%('group','before','now','now-tool','words0','words'))
for g,fs in groups.items():
    r=[[],[],[]];w0=[];w1=[]
    for a,b in itertools.combinations(fs,2):
        A=open(a).read();B=open(b).read()
        if old[a] and old[b]:r[0].append(jac(sh(vis(old[a])),sh(vis(old[b]))))
        r[1].append(jac(sh(vis(A)),sh(vis(B))));r[2].append(jac(sh(vis(A,True)),sh(vis(B,True))))
    for f in fs:
        w1.append(len(vis(open(f).read())))
        if old[f]:w0.append(len(vis(old[f])))
    avg=lambda x:sum(x)/len(x) if x else 0
    print('%-30s %6.3f %6.3f %6.3f %8d %8d  max now %.3f'%(g,avg(r[0]),avg(r[1]),avg(r[2]),avg(w0),avg(w1),max(r[1])))
