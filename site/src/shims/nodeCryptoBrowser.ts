/** Browser stand-in for the one part of `node:crypto` that shared evidence code uses: `createHash("sha256").update(x).digest("hex")`.
 *
 * Why it exists. Eighteen modules under `src/` (evidence contracts, the interrogative engine, lookups) hash with `node:crypto` and are also
 * bundled into the site. Vite cannot give a browser `node:crypto`: in dev it throws at import time (every route rendered a blank page) and in
 * a production build it substitutes an empty module, so any call in the browser would fail with "createHash is not a function". `vite.config.ts`
 * aliases `node:crypto` to this file for client builds and the dev server only; the server-side prerender build keeps the real module.
 *
 * It is a plain, synchronous SHA-256 (FIPS 180-4) with the same digests as Node. A test compares it with `node:crypto` across block boundaries,
 * Unicode and chunked updates. Anything else (another algorithm, another encoding) throws rather than silently returning something wrong. */
const K=new Uint32Array([
 0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
 0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
 0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
 0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
]);
const rotr=(x:number,n:number)=>(x>>>n)|(x<<(32-n));

/** SHA-256 of a byte array. */
export function sha256(message:Uint8Array):Uint8Array{
 const h=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
 const bitLenHi=Math.floor(message.length/0x20000000),bitLenLo=(message.length<<3)>>>0;
 const padded=new Uint8Array(((message.length+9+63)>>6)<<6);
 padded.set(message);padded[message.length]=0x80;
 const view=new DataView(padded.buffer);
 view.setUint32(padded.length-8,bitLenHi,false);view.setUint32(padded.length-4,bitLenLo,false);
 const w=new Uint32Array(64);
 for(let off=0;off<padded.length;off+=64){
  for(let i=0;i<16;i++)w[i]=view.getUint32(off+i*4,false);
  for(let i=16;i<64;i++){
   const s0=rotr(w[i-15]!,7)^rotr(w[i-15]!,18)^(w[i-15]!>>>3),s1=rotr(w[i-2]!,17)^rotr(w[i-2]!,19)^(w[i-2]!>>>10);
   w[i]=(w[i-16]!+s0+w[i-7]!+s1)>>>0;
  }
  let a=h[0]!,b=h[1]!,c=h[2]!,d=h[3]!,e=h[4]!,f=h[5]!,g=h[6]!,hh=h[7]!;
  for(let i=0;i<64;i++){
   const S1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K[i]!+w[i]!)>>>0;
   const S0=rotr(a,2)^rotr(a,13)^rotr(a,22),maj=(a&b)^(a&c)^(b&c),t2=(S0+maj)>>>0;
   hh=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
  }
  h[0]=(h[0]!+a)>>>0;h[1]=(h[1]!+b)>>>0;h[2]=(h[2]!+c)>>>0;h[3]=(h[3]!+d)>>>0;h[4]=(h[4]!+e)>>>0;h[5]=(h[5]!+f)>>>0;h[6]=(h[6]!+g)>>>0;h[7]=(h[7]!+hh)>>>0;
 }
 const out=new Uint8Array(32),ov=new DataView(out.buffer);
 for(let i=0;i<8;i++)ov.setUint32(i*4,h[i]!,false);
 return out;
}

type Data=string|Uint8Array|ArrayBufferView;
class Sha256Hash{
 private parts:Uint8Array[]=[];private finished=false;
 update(data:Data):this{
  if(this.finished)throw Error("Digest already called");
  if(typeof data==="string")this.parts.push(new TextEncoder().encode(data));
  else if(ArrayBuffer.isView(data))this.parts.push(new Uint8Array(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)));
  else throw TypeError("The data argument must be a string or a byte array");
  return this;
 }
 digest():Uint8Array;digest(encoding:"hex"|"base64"):string;
 digest(encoding?:"hex"|"base64"):string|Uint8Array{
  if(this.finished)throw Error("Digest already called");
  this.finished=true;
  let n=0;for(const p of this.parts)n+=p.length;
  const all=new Uint8Array(n);let o=0;for(const p of this.parts){all.set(p,o);o+=p.length}
  const d=sha256(all);
  if(encoding===undefined)return d;
  if(encoding==="hex")return Array.from(d,b=>b.toString(16).padStart(2,"0")).join("");
  if(encoding==="base64")return btoa(String.fromCharCode(...d));
  throw Error(`Unsupported digest encoding in the browser: ${String(encoding)}`);
 }
}
export function createHash(algorithm:string):Sha256Hash{
 if(!/^sha-?256$/i.test(algorithm))throw Error(`Unsupported hash algorithm in the browser: ${algorithm}`);
 return new Sha256Hash();
}
export default {createHash};
