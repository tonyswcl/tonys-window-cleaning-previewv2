// world bind pose positions and uvs of each skinned mesh (undoes the quantization baked into the inverse bind matrices)
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';import fs from 'fs';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(process.argv[2]);const out={};
function mul(a,b){const r=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)r[j*4+i]+=a[k*4+i]*b[j*4+k];return r;}
function ap(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}
for(const n of doc.getRoot().listNodes()){const m=n.getMesh(),sk=n.getSkin();if(!m||!sk)continue;
  const j0=sk.listJoints()[0],ibm=sk.getInverseBindMatrices().getElement(0,[]);const Q=mul(j0.getWorldMatrix(),ibm);
  const p=m.listPrimitives()[0],pos=p.getAttribute('POSITION'),uv=p.getAttribute('TEXCOORD_0'),idx=p.getIndices();
  const P=[],U=[];for(let i=0;i<pos.getCount();i++){P.push(ap(Q,pos.getElement(i,[])).map(v=>+v.toFixed(5)));U.push(uv.getElement(i,[]).map(v=>+v.toFixed(5)));}
  out[m.getName()]={P,U,I:Array.from(idx.getArray())};
  const ys=P.map(q=>q[1]);console.log(m.getName(),P.length,'y',Math.min(...ys).toFixed(3),Math.max(...ys).toFixed(3));}
fs.writeFileSync(process.argv[3],JSON.stringify(out));
