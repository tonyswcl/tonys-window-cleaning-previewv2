// Tony's model: swap in the retouched skin texture, drop the hair cards (short hair is painted on the scalp now),
// give the eyes their own glossy material so they catch a highlight, then meshopt compress like pack.mjs.
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {prune,reorder} from '@gltf-transform/functions';import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';import fs from 'fs';
const [src,tex,dst,eyeU]=process.argv.slice(2); /* see tools/tech/README.md */
await MeshoptEncoder.ready;await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const doc=await io.read(src);const root=doc.getRoot();
for(const t of root.listTextures())if(/Diffuse/.test(t.getName()))t.setImage(new Uint8Array(fs.readFileSync(tex))).setMimeType('image/webp');
for(const n of root.listNodes())if(n.getMesh()&&/Hair/.test(n.getMesh().getName())){const m=n.getMesh();n.setMesh(null);m.dispose();}
/* eyes: the body triangles whose uvs sit in the eyeball patch of the atlas become a second primitive */
if(eyeU){const [u0,v0,u1,v1]=eyeU.split(',').map(Number);
  const body=root.listMeshes().find(m=>/Body/.test(m.getName())),p=body.listPrimitives()[0],uv=p.getAttribute('TEXCOORD_0'),idx=p.getIndices(),A=idx.getArray();
  const keep=[],eye=[];const e=[0,0];
  for(let t=0;t<A.length;t+=3){let inEye=true;for(let k=0;k<3;k++){uv.getElement(A[t+k],e);if(!(e[0]>u0&&e[0]<u1&&e[1]>v0&&e[1]<v1))inEye=false;}(inEye?eye:keep).push(A[t],A[t+1],A[t+2]);}
  console.log('eye triangles',eye.length/3,'of',A.length/3);
  if(eye.length){const Ctor=A.constructor;idx.setArray(new Ctor(keep));
    const ep=p.clone();ep.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Ctor(eye)).setBuffer(idx.getBuffer()));
    const em=p.getMaterial().clone().setName('Ch28_eye').setRoughnessFactor(.18);ep.setMaterial(em);body.addPrimitive(ep);}}
/* lips: the model's lips stood out almost as far as the tip of the nose, which read as swollen. In the rest pose, pull the
   part in front of the face surface back by about half and a touch toward the middle of the mouth. */
function mul(a,b){const r=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)r[j*4+i]+=a[k*4+i]*b[j*4+k];return r;}
function ap(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}
function inv(m){/* affine inverse */const a=m,r=new Array(16).fill(0);const d=a[0]*(a[5]*a[10]-a[9]*a[6])-a[4]*(a[1]*a[10]-a[9]*a[2])+a[8]*(a[1]*a[6]-a[5]*a[2]);
  r[0]=(a[5]*a[10]-a[9]*a[6])/d;r[4]=-(a[4]*a[10]-a[8]*a[6])/d;r[8]=(a[4]*a[9]-a[8]*a[5])/d;r[1]=-(a[1]*a[10]-a[9]*a[2])/d;r[5]=(a[0]*a[10]-a[8]*a[2])/d;r[9]=-(a[0]*a[9]-a[8]*a[1])/d;
  r[2]=(a[1]*a[6]-a[5]*a[2])/d;r[6]=-(a[0]*a[6]-a[4]*a[2])/d;r[10]=(a[0]*a[5]-a[4]*a[1])/d;r[15]=1;
  for(let i=0;i<3;i++)r[12+i]=-(r[i]*a[12]+r[4+i]*a[13]+r[8+i]*a[14]);return r;}
for(const n of root.listNodes()){const m=n.getMesh(),sk=n.getSkin();if(!m||!sk||!/Body/.test(m.getName()))continue;
  const j0=sk.listJoints()[0],Q=mul(j0.getWorldMatrix(),sk.getInverseBindMatrices().getElement(0,[])),Qi=inv(Q);let moved=0;
  const done=new Set();for(const p of m.listPrimitives()){const pos=p.getAttribute('POSITION');if(done.has(pos))continue;done.add(pos);
    const e=[0,0,0];for(let i=0;i<pos.getCount();i++){pos.getElement(i,e);const w=ap(Q,e);
      const ax=Math.abs(w[0]),dy=w[1]-1.5745;if(ax>.034||Math.abs(dy)>.024||w[2]<.1)continue;
      const zb=.1265+.004*(ax/.034);if(w[2]<=zb)continue;
      const f=(1-Math.pow(ax/.034,2))*(1-Math.pow(dy/.024,2));const k=.78*f;
      w[2]-=(w[2]-zb)*k;w[1]-=dy*.24*f;pos.setElement(i,ap(Qi,w));moved++;}}
  console.log('lip vertices moved',moved);}
await doc.transform(prune(),reorder({encoder:MeshoptEncoder,target:'size'}));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await io.write(dst,doc);console.log('ok',fs.statSync(dst).size);
