"""Tony's skin texture: one skin tone for the face and hands, softer lips, and short dark hair painted on the scalp
(the separate hair cards are dropped; they rendered as specks and poked through the cap).
usage: retex.py bind.json diffuse.png out.png"""
import json,sys,random,colorsys,math
from PIL import Image,ImageDraw,ImageFilter,ImageChops
bind,src,dst=sys.argv[1:4]
d=json.load(open(bind));B=d['Ch28_Body'];P,U,I=B['P'],B['U'],B['I'];H=d['Ch28_Hair']['P']
im=Image.open(src).convert('RGBA');W,Ht=im.size;rgb=im.convert('RGB');alpha=im.split()[3]
# 1. scalp: body vertices under the hair cards, weighted by how close the nearest hair vertex is (a fade at the edge)
cell=.01;grid={}
for p in H:grid.setdefault((int(p[0]//cell),int(p[1]//cell),int(p[2]//cell)),[]).append(p)
def near(p):
  best=1.0;cx,cy,cz=int(p[0]//cell),int(p[1]//cell),int(p[2]//cell)
  for dx in(-2,-1,0,1,2):
    for dy in(-2,-1,0,1,2):
      for dz in(-2,-1,0,1,2):
        for q in grid.get((cx+dx,cy+dy,cz+dz),()):
          dd=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2
          if dd<best:best=dd
  return math.sqrt(best)
w=[0.0]*len(P)
for i,p in enumerate(P):
  if p[1]>1.5:dn=near(p);w[i]=1.0 if dn<.008 else max(0.0,1-(dn-.008)/.012)
mask=Image.new('L',(W,Ht),0);md=ImageDraw.Draw(mask)
for t in range(0,len(I),3):
  a,b,c=I[t],I[t+1],I[t+2];ww=(w[a]+w[b]+w[c])/3
  if ww>0.02:md.polygon([(U[k][0]*W,U[k][1]*Ht) for k in(a,b,c)],fill=int(255*ww))
mask=mask.filter(ImageFilter.GaussianBlur(2.2))
random.seed(7);hair=Image.new('RGB',(W,Ht));hp=hair.load()
for y in range(Ht):
  for x in range(W):
    n=random.random();v=int(22+22*n);hp[x,y]=(v,int(v*.9),int(v*.82))
hair=hair.filter(ImageFilter.GaussianBlur(.6))
# 2. skin islands: head (face, ears, neck) and hands, from the vertex positions
def isl(pred):
  m=Image.new('L',(W,Ht),0);dd=ImageDraw.Draw(m)
  for t in range(0,len(I),3):
    a,b,c=I[t],I[t+1],I[t+2]
    if pred(P[a]) and pred(P[b]) and pred(P[c]):dd.polygon([(U[k][0]*W,U[k][1]*Ht) for k in(a,b,c)],fill=255)
  return m
head=isl(lambda p:p[1]>1.42 and abs(p[0])<.2);hands=isl(lambda p:abs(p[0])>.55)
def skinpix(m):
  px=rgb.load();mp=m.load();out=[]
  for y in range(0,Ht,2):
    for x in range(0,W,2):
      if mp[x,y]>200:
        r,g,b=px[x,y];h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
        if .02<h<.12 and .12<s<.75 and .3<v<.95:out.append((r,g,b))
  return out
def stats(l):
  n=len(l);mu=[sum(c[i] for c in l)/n for i in range(3)];sd=[math.sqrt(sum((c[i]-mu[i])**2 for c in l)/n) for i in range(3)];return mu,sd
fm,fs=stats(skinpix(head));hm,hs=stats(skinpix(hands))
print('face',[round(x) for x in fm],[round(x) for x in fs],'hands',[round(x) for x in hm],[round(x) for x in hs])
# the tone: Tony's light tan, a little less orange than the old texture
tgt=[fm[0]*1.04,fm[1]*1.05,fm[2]*1.10]
def tone(src_mu,src_sd,keep):
  lut=[]
  for ch in range(3):
    k=keep*fs[ch]/max(1,src_sd[ch]);lut+= [max(0,min(255,int(round(tgt[ch]+(v-src_mu[ch])*k)))) for v in range(256)]
  return lut
out=rgb.copy()
face_t=rgb.point(tone(fm,fs,.68));hand_t=rgb.point(tone(hm,hs,.75))
out=Image.composite(face_t,out,head);out=Image.composite(hand_t,out,hands)
# 3. lips: the dark red around the mouth moves toward a muted rose brown close to the skin
px=out.load();hm_=head.load()
for y in range(150,230):
  for x in range(700,840):
    if hm_[x,y]<200:continue
    r,g,b=px[x,y];h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
    red=(h>.93 or h<.045) and s>.35
    if red:
      L=.3*r+.59*g+.11*b;tr,tg,tb=tgt[0]*.86,tgt[1]*.70,tgt[2]*.70
      f=min(1,(s-.3)/.3)*.8;sh=min(1,L/max(1,.3*tr+.59*tg+.11*tb))
      nr,ng,nb=tr*max(.45,sh),tg*max(.45,sh),tb*max(.45,sh)
      px[x,y]=(int(r+(nr-r)*f),int(g+(ng-g)*f),int(b+(nb-b)*f))
# 4. eyebrows: Tony's are dark. A soft arched band above each eye, from the vertex positions
def brow(p):
  ax=abs(p[0])
  if not(.011<ax<.054 and p[2]>.09):return 0.0
  u=(ax-.011)/.043;c=1.6695+.0045*(1-(2*u-1)**2)-.002*u;th=.0042*(1-.45*u)
  dy=abs(p[1]-c);return max(0.0,1-dy/th)
bw=[brow(p) for p in P]
bm=Image.new('L',(W,Ht),0);bd=ImageDraw.Draw(bm)
for t in range(0,len(I),3):
  a_,b_,c_=I[t],I[t+1],I[t+2];ww=(bw[a_]+bw[b_]+bw[c_])/3
  if ww>0.05:bd.polygon([(U[k][0]*W,U[k][1]*Ht) for k in(a_,b_,c_)],fill=int(235*min(1,ww*1.6)))
bm=bm.filter(ImageFilter.GaussianBlur(1.1))
out=Image.composite(Image.new('RGB',(W,Ht),(40,31,26)),out,bm)
bm.save(dst.replace('.png','-brows.png'))
# 4. hair last, over the toned skin
out=Image.composite(hair,out,mask)
res=out.convert('RGBA');res.putalpha(alpha);res.save(dst)
mask.save(dst.replace('.png','-scalp.png'));print('ok')
