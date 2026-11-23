/** The browser SHA-256 stand-in must produce exactly the digests Node does, and refuse anything it does not implement. */
import {createHash as nodeHash,randomBytes} from "node:crypto";
import {readFileSync} from "node:fs";
import {expect,test} from "bun:test";
import {createHash,sha256} from "../site/src/shims/nodeCryptoBrowser";

const node=(d:string|Uint8Array)=>nodeHash("sha256").update(d).digest("hex");
const shim=(d:string|Uint8Array)=>createHash("sha256").update(d).digest("hex");

test("published SHA-256 test vectors",()=>{
 expect(shim("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
 expect(shim("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
 expect(shim("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")).toBe("248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1");
 expect(shim("a".repeat(1_000_000))).toBe("cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0");
});
test("matches Node at every padding and block boundary from 0 to 200 bytes",()=>{
 for(let n=0;n<=200;n++){const b=new Uint8Array(n).map((_,i)=>(i*31+n)&255);expect([n,shim(b)]).toEqual([n,node(b)])}
});
test("matches Node on 300 random inputs up to 20 kB, as bytes",()=>{
 for(let i=0;i<300;i++){const b=new Uint8Array(randomBytes(Math.floor(Math.random()*20_000)));expect(shim(b)).toBe(node(b))}
});
test("matches Node on Unicode, including surrogate pairs and combining marks (UTF-8 encoded)",()=>{
 for(const s of ["héllo wörld","日本語のテキスト","😀 emoji 🧬 pair","é combining","\u0000nul\u0000","IL-21 → fibrosis ≥ 2×","a".repeat(1000)+"é"])expect([s,shim(s)]).toEqual([s,node(s)]);
});
test("chunked and repeated updates equal one update, for strings, bytes and views into larger buffers",()=>{
 const text="The quick brown fox jumps over the lazy dog".repeat(40);
 for(const cut of [0,1,7,63,64,65,200,text.length]){
  const h=createHash("sha256");h.update(text.slice(0,cut));h.update(text.slice(cut));
  expect([cut,h.digest("hex")]).toEqual([cut,node(text)]);
 }
 const big=new Uint8Array(randomBytes(1000));const view=big.subarray(100,900);
 expect(shim(view)).toBe(node(big.slice(100,900))); // an offset view must not leak the bytes around it
 const mixed=createHash("sha256").update("ab").update(new Uint8Array([99,100])).digest("hex");expect(mixed).toBe(node("abcd"));
});
test("digest output forms: hex, base64 and raw bytes agree with Node; an unsupported form throws",()=>{
 const h=()=>createHash("sha256").update("x");
 expect(h().digest("base64")).toBe(nodeHash("sha256").update("x").digest("base64"));
 expect(Array.from(h().digest())).toEqual(Array.from(nodeHash("sha256").update("x").digest()));
 expect(()=>h().digest("latin1" as never)).toThrow("Unsupported digest encoding");
 expect(sha256(new Uint8Array()).length).toBe(32);
});
test("it fails loudly rather than returning a wrong answer: other algorithms, reuse after digest, bad input",()=>{
 for(const alg of ["md5","sha1","sha512","sha384",""])expect(()=>createHash(alg)).toThrow("Unsupported hash algorithm");
 for(const alg of ["sha256","SHA256","sha-256","SHA-256"])expect(shim("x")).toBe(createHash(alg).update("x").digest("hex"));
 const h=createHash("sha256").update("x");h.digest("hex");
 expect(()=>h.update("y")).toThrow("Digest already called");expect(()=>h.digest("hex")).toThrow("Digest already called");
 expect(()=>createHash("sha256").update(42 as never)).toThrow(TypeError);expect(()=>createHash("sha256").update(null as never)).toThrow(TypeError);
});
test("it produces the same digest as the real call sites do: the canonical content hash and the interrogative engine's ids",async()=>{
 const {hashHsiCheckpointInput}=await import("../src/hsiAgentDurableCheckpoint");
 const value={b:[1,2,{z:"é"}],a:"IL-21"};
 const canon=(x:unknown):string=>Array.isArray(x)?"["+x.map(canon).join(",")+"]":x&&typeof x==="object"?"{"+Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canon(v)).join(",")+"}":JSON.stringify(x)??"null";
 expect(shim(canon(value))).toBe(hashHsiCheckpointInput(value));
});
test("the shim is only wired for client builds: the config aliases node:crypto unless the build is server-side, and nothing else",()=>{
 const cfg=readFileSync("site/vite.config.ts","utf8");
 expect(cfg).toContain("isSsrBuild");expect(cfg).toMatch(/isSsrBuild\s*\?\s*\[\]\s*:\s*\[\{\s*find:\s*\/\^node:crypto\$\/\s*,\s*replacement:\s*browserNodeCrypto/);
 expect(cfg.match(/node:crypto/g)!.length).toBeLessThanOrEqual(4);
 const shimSrc=readFileSync("site/src/shims/nodeCryptoBrowser.ts","utf8").replace(/\/\*\*[\s\S]*?\*\//g,"");
 expect(/from\s+["']node:|require\(|process\.|(^|[^A-Za-z])Buffer\b/.test(shimSrc)).toBe(false); // the shim itself must not depend on Node
});
