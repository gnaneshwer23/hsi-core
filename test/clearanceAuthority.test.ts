import {describe,expect,test} from "bun:test";
import {existsSync} from "node:fs";
import {appendFile,mkdtemp,readFile,readdir,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {ALL_ACTIONS,buildUnsignedReceipt,generateAuthorityKeyPair,loadPrivateKey,loadPublicKey,sha256Hex,signReceipt,signRevocation,verifyReceipt,verifyRevocation} from "../src/researchV2/clearanceSigning";
import {attestSource,createFileSourceAuthority,receiptFileName,revokeReceipt,type AttestRequest,type AuthorityInfo} from "../src/researchV2/clearanceAuthority";
import {createOperationalSourceClearance} from "../src/researchV2/operationalSourceClearance";
import {createSourceClearanceVerifier,type SourceUseAction} from "../src/researchV2/sourceClearanceReceipt";
import {openStagingOperationStore} from "../src/researchV2/stagingOperationStore";
import {createLiveSearch} from "../src/liveSearch";
import type {ContextAuditTarget} from "../src/evidence/contextConflictAudit";

const PASSAGE="In a synthetic mouse cohort, gut microbial metabolites were associated with immune signalling in colonic regulatory T cells after seven days (flow cytometry, n=10).";
const T0=new Date("2026-11-13T12:00:00Z");
const base={issuer:"authority:independent",keyId:"key-1",sourceId:"europepmc:PMC101",sourceVersion:"v1",canonicalId:"PMID:12345",passage:PASSAGE,permittedActions:["storage","display","comparison","export"] as SourceUseAction[],licenceId:"CC-BY-4.0",attribution:"Synthetic attribution",checkedAt:T0,validForMs:12*3600_000};
const pair=()=>{const p=generateAuthorityKeyPair();return {...p,publicKey:loadPublicKey(p.publicKeyPem),privateKey:loadPrivateKey(p.privateKeyPem)}};
const dirs=async()=>({publishDir:await mkdtemp(join(tmpdir(),"hsi-pub-")),privateDir:await mkdtemp(join(tmpdir(),"hsi-priv-"))});
const cleanup=(...d:string[])=>Promise.all(d.map(x=>rm(x,{recursive:true,force:true})));
const info=(p:{publicKeyPem:string}):AuthorityInfo=>({schemaVersion:"hsi-clearance-authority-1",issuer:base.issuer,keyId:base.keyId,publicKeyPem:p.publicKeyPem});

describe("receipt building and signing",()=>{
 test("a signed receipt is accepted by the runtime's own verifier, with fixed clean outcomes and a canonical signature",async()=>{
  const k=pair(),r=signReceipt(buildUnsignedReceipt(base),k.privateKey);
  expect(r.signature).toMatch(/^[A-Za-z0-9_-]{86}$/);expect(r.identity).toBe("matched");expect(r.rights).toBe("verified");expect(r.retraction).toBe("clear");
  expect(r.passageSha256).toBe(sha256Hex(PASSAGE));expect(Date.parse(r.expiresAt)-Date.parse(r.checkedAt)).toBe(12*3600_000);
  expect(await verifyReceipt(r,{publicKey:k.publicKey,passage:PASSAGE,now:()=>T0.getTime()+60_000})).toBe(true);
  expect(buildUnsignedReceipt(base).id).not.toBe(buildUnsignedReceipt(base).id);
 });
 test("anything tampered, wrongly keyed, stale or for another passage is rejected",async()=>{
  const k=pair(),other=pair(),r=signReceipt(buildUnsignedReceipt(base),k.privateKey),now=()=>T0.getTime()+60_000;
  const ok=(rec:unknown,p=PASSAGE,key=k.publicKey,n=now)=>verifyReceipt(rec,{publicKey:key,passage:p,now:n});
  for(const [field,value] of [["sourceId","europepmc:PMC999"],["sourceVersion","v2"],["canonicalId","PMID:999"],["licenceId","CC0"],["attribution","x"],["expiresAt","2027-01-01T00:00:00.000Z"],["permittedActions",["storage","display","comparison","export","model_transmission"]],["issuer","authority:other"]] as const)
   expect(await ok({...r,[field]:value})).toBe(false);
  expect(await ok(r,PASSAGE+" ")).toBe(false);expect(await ok(r,PASSAGE,other.publicKey)).toBe(false);
  expect(await ok(r,PASSAGE,k.publicKey,()=>Date.parse(r.expiresAt)+1)).toBe(false);expect(await ok(r,PASSAGE,k.publicKey,()=>T0.getTime()-1)).toBe(false);
  expect(await ok({...r,signature:"x"})).toBe(false);expect(await ok(null)).toBe(false);expect(await ok({...r,extra:1})).toBe(false);
  expect(await verifyReceipt(r,{publicKey:k.publicKey,passage:PASSAGE,now,isRevoked:async()=>true})).toBe(false);
 });
 test("invalid inputs are refused before anything is signed",()=>{
  const bad=(o:Partial<typeof base>)=>()=>buildUnsignedReceipt({...base,...o} as never);
  expect(bad({canonicalId:"12345"})).toThrow();expect(bad({canonicalId:"PMID:0"})).toThrow();expect(bad({permittedActions:[]})).toThrow();
  expect(bad({permittedActions:["delete" as never]})).toThrow();expect(bad({validForMs:0})).toThrow();expect(bad({validForMs:24*3600_000+1})).toThrow();expect(bad({validForMs:1000})).toThrow();
  expect(bad({passage:""})).toThrow();expect(bad({passage:"x".repeat(3001)})).toThrow();expect(bad({attribution:" "})).toThrow();expect(bad({sourceId:"bad id!"})).toThrow();expect(bad({checkedAt:new Date("nope")})).toThrow();
  expect(ALL_ACTIONS).toContain("model_transmission");expect(()=>signReceipt(buildUnsignedReceipt(base),pair().publicKey as never)).toThrow();
 });
 test("revocations verify only with the authority's key and cannot be altered",()=>{
  const k=pair(),other=pair(),rev=signRevocation({receiptId:"clearance:abc",issuer:base.issuer,keyId:base.keyId,reason:"Correction published",revokedAt:T0},k.privateKey);
  expect(verifyRevocation(rev,k.publicKey)).toBe(true);expect(verifyRevocation(rev,other.publicKey)).toBe(false);
  expect(verifyRevocation({...rev,receiptId:"clearance:other"},k.publicKey)).toBe(false);expect(verifyRevocation({...rev,reason:"x"},k.publicKey)).toBe(false);expect(verifyRevocation(null,k.publicKey)).toBe(false);
  expect(()=>signRevocation({receiptId:"x",issuer:base.issuer,keyId:base.keyId,reason:" ",revokedAt:T0},k.privateKey)).toThrow();
 });
});

describe("attestation workflow",()=>{
 const request:AttestRequest={sourceId:base.sourceId,sourceVersion:base.sourceVersion,canonicalId:base.canonicalId,licenceId:base.licenceId,attribution:base.attribution,passages:[PASSAGE,PASSAGE+" Second."]};
 const opts=(k:ReturnType<typeof pair>,d:{publishDir:string;privateDir:string},over:Record<string,unknown>={})=>({request,authority:info(k),privateKey:k.privateKey,...d,actions:base.permittedActions,validForMs:base.validForMs,evidence:"Checked licence field and retraction notices on 2026-11-13",operator:"Dr Example",confirm:async()=>true,now:()=>T0,...over});
 test("declining signs and writes nothing; accepting writes one receipt per passage plus an audit entry with no key material",async()=>{
  const k=pair(),d=await dirs();
  try{
   const declined=await attestSource(opts(k,d,{confirm:async()=>false}));
   expect(declined.declined).toBe(true);expect(existsSync(join(d.publishDir,"receipts"))).toBe(false);expect(existsSync(join(d.privateDir,"attestations.jsonl"))).toBe(false);
   let seen:unknown;const done=await attestSource(opts(k,d,{confirm:async(s:unknown)=>{seen=s;return true}}));
   expect(done.receipts).toHaveLength(2);expect((await readdir(join(d.publishDir,"receipts"))).length).toBe(2);
   expect((seen as {passages:{preview:string;sha256:string}[]}).passages[0]!.sha256).toBe(sha256Hex(PASSAGE));
   const log=await readFile(join(d.privateDir,"attestations.jsonl"),"utf8");expect(log).toContain("Dr Example");expect(log).toContain("Checked licence field");expect(log).not.toContain("PRIVATE KEY");
  }finally{await cleanup(d.publishDir,d.privateDir)}
 });
 test("missing evidence, operator, duplicates or invalid fields fail before the human is even asked",async()=>{
  const k=pair(),d=await dirs();let asked=0;const confirm=async()=>{asked++;return true};
  try{
   await expect(attestSource(opts(k,d,{evidence:"ok",confirm}))).rejects.toThrow();await expect(attestSource(opts(k,d,{operator:" ",confirm}))).rejects.toThrow();
   await expect(attestSource(opts(k,d,{request:{...request,passages:[PASSAGE,PASSAGE]},confirm}))).rejects.toThrow();await expect(attestSource(opts(k,d,{request:{...request,passages:[]},confirm}))).rejects.toThrow();
   await expect(attestSource(opts(k,d,{request:{...request,canonicalId:"nope"},confirm}))).rejects.toThrow();
   expect(asked).toBe(0);
  }finally{await cleanup(d.publishDir,d.privateDir)}
 });
});

describe("file authority feeding the real operational clearance",()=>{
 const request:AttestRequest={sourceId:base.sourceId,sourceVersion:base.sourceVersion,canonicalId:base.canonicalId,licenceId:base.licenceId,attribution:base.attribution,passages:[PASSAGE]};
 async function setup(){
  const k=pair(),d=await dirs();await writeFile(join(d.publishDir,"authority.json"),JSON.stringify(info(k)));
  const now={t:T0.getTime()+60_000};
  const att=await attestSource({request,authority:info(k),privateKey:k.privateKey,...d,actions:base.permittedActions,validForMs:base.validForMs,evidence:"Checked licence and retraction status",operator:"Dr Example",confirm:async()=>true,now:()=>T0});
  const fa=await createFileSourceAuthority({publishDir:d.publishDir,policyRef:"policy:public-oa-v1"});
  const store=await openStagingOperationStore(join(d.privateDir,"ops.jsonl"));
  const verifier=createSourceClearanceVerifier({authorities:[{issuer:base.issuer,keyId:base.keyId,publicKey:fa.publicKey}],isRevoked:async(id,issuer)=>fa.isRevoked(id,issuer),requiredActions:["storage"],now:()=>now.t});
  const op=createOperationalSourceClearance({authority:fa.authority,verifier,store,now:()=>now.t});
  const binding={receipt:null,sourceId:base.sourceId,sourceVersion:base.sourceVersion,passage:PASSAGE,requiredActions:["storage","display","comparison","export"] as const};
  return {k,d,fa,store,op,binding,now,att};
 }
 test("an issued receipt is cleared; an unknown passage is unknown; the decision names the policy",async()=>{
  const s=await setup();
  try{
   const ok=await s.op.decide(s.binding);expect(ok.state).toBe("cleared");expect(ok.policyRef).toBe("policy:public-oa-v1");expect(ok.receipt!.id).toBe(s.att.receipts[0]!.id);
   expect((await s.op.decide({...s.binding,passage:PASSAGE+" other"})).state).toBe("unknown");
   expect((await s.op.decide({...s.binding,sourceId:"europepmc:PMC555"})).state).toBe("unknown");
   expect((await s.op.decide({...s.binding,requiredActions:["model_transmission"]})).state).not.toBe("cleared");
  }finally{await s.store.close();await cleanup(s.d.publishDir,s.d.privateDir)}
 });
 test("a signed revocation clears nothing afterwards; a forged one, or one for another receipt, changes nothing",async()=>{
  const s=await setup();
  try{
   const forged=signRevocation({receiptId:s.att.receipts[0]!.id,issuer:base.issuer,keyId:base.keyId,reason:"forged",revokedAt:T0},pair().privateKey);
   await appendFile(join(s.d.publishDir,"revocations.jsonl"),JSON.stringify(forged)+"\n");
   expect((await s.op.decide(s.binding)).state).toBe("cleared");
   const out=await revokeReceipt({receiptId:s.att.receipts[0]!.id,reason:"Correction published",authority:info(s.k),privateKey:s.k.privateKey,publishDir:s.d.publishDir,confirm:async()=>true,now:()=>T0});
   expect(out.declined).toBe(false);expect((await s.op.decide(s.binding)).state).toBe("revoked");
   expect((await revokeReceipt({receiptId:"x",reason:"r",authority:info(s.k),privateKey:s.k.privateKey,publishDir:s.d.publishDir,confirm:async()=>false})).declined).toBe(true);
  }finally{await s.store.close();await cleanup(s.d.publishDir,s.d.privateDir)}
 });
 test("fails closed: corrupt revocation file, tampered receipt file and expiry never produce a cleared decision",async()=>{
  const s=await setup();
  try{
   const file=join(s.d.publishDir,"receipts",receiptFileName(base.sourceId,base.sourceVersion,sha256Hex(PASSAGE)));
   const original=await readFile(file,"utf8");
   await writeFile(file,original.replace("Synthetic attribution","Tampered attribution"));expect((await s.op.decide(s.binding)).state).not.toBe("cleared");
   await writeFile(file,original);expect((await s.op.decide(s.binding)).state).toBe("cleared");
   await appendFile(join(s.d.publishDir,"revocations.jsonl"),"{not json\n");expect((await s.op.decide(s.binding)).state).not.toBe("cleared");
  }finally{await s.store.close();await cleanup(s.d.publishDir,s.d.privateDir)}
  const s2=await setup();
  try{s2.now.t=Date.parse(s2.att.receipts[0]!.expiresAt)+1;expect((await s2.op.decide(s2.binding)).state).toBe("expired")}finally{await s2.store.close();await cleanup(s2.d.publishDir,s2.d.privateDir)}
 });
 test("the adapter refuses a missing or invalid authority record and an invalid policy reference",async()=>{
  const d=await dirs();
  try{
   await expect(createFileSourceAuthority({publishDir:d.publishDir,policyRef:"policy:x"})).rejects.toThrow();
   await writeFile(join(d.publishDir,"authority.json"),JSON.stringify({schemaVersion:"hsi-clearance-authority-1",issuer:"a",keyId:"b",publicKeyPem:"not a key"}));
   await expect(createFileSourceAuthority({publishDir:d.publishDir,policyRef:"policy:x"})).rejects.toThrow();
  }finally{await cleanup(d.publishDir,d.privateDir)}
 });
 test("live search accepts a passage only through this chain, and stops after a revocation",async()=>{
  const s=await setup();
  const xml=`<article><body><sec><title>Results</title><p>${PASSAGE}</p></sec></body></article>`;
  const fetcher=(async(u:unknown)=>String(u).includes("/search?")?new Response(JSON.stringify({resultList:{result:[{pmcid:"PMC101",isOpenAccess:"Y",title:"Synthetic",pmid:"12345",doi:"10.1/x"}]}})):new Response(xml,{status:200,headers:{"content-type":"application/xml"}})) as never;
  const target:ContextAuditTarget={investigationId:"chain",diseaseScope:"gut-immune-metabolic",question:"How might gut microbial metabolites influence immune signalling?",release:{id:"r",version:"1",manifestHash:sha256Hex("r")}};
  try{
   const search=createLiveSearch({fetcher,clearance:{decide:b=>s.op.decide(b)},sleep:async()=>{},now:()=>"2026-11-13T12:00:00Z",});
   // the live search versions sources as europepmc-fulltext-<date>, so attest exactly that version for this passage
   await attestSource({request:{...request,sourceVersion:"europepmc-fulltext-2026-11-13"},authority:info(s.k),privateKey:s.k.privateKey,...s.d,actions:base.permittedActions,validForMs:base.validForMs,evidence:"Checked licence and retraction status",operator:"Dr Example",confirm:async()=>true,now:()=>T0});
   const first=await search(target,"support");expect(first.hits).toHaveLength(1);expect(first.hits[0]!.source.licence.identifier).toBe("CC-BY-4.0");
   const rid=first.hits[0]!.clearanceReceiptId;
   await revokeReceipt({receiptId:rid,reason:"Correction published",authority:info(s.k),privateKey:s.k.privateKey,publishDir:s.d.publishDir,confirm:async()=>true,now:()=>T0});
   const after=await search(target,"support");expect(after.hits).toEqual([]);expect(after.status).toBe("partial");
  }finally{await s.store.close();await cleanup(s.d.publishDir,s.d.privateDir)}
 });
});

describe("command line tool",()=>{
 const run=async(argv:string[])=>{const p=Bun.spawn(["bun","scripts/clearance-authority.ts",...argv],{cwd:join(import.meta.dir,".."),stdin:"ignore",stdout:"pipe",stderr:"pipe"});const [out,err,code]=await Promise.all([new Response(p.stdout).text(),new Response(p.stderr).text(),p.exited]);return {out,err,code}};
 test("keygen, attest and revoke refuse to run without an interactive terminal and write nothing",async()=>{
  const d=await dirs();
  try{
   for(const argv of [["keygen","--issuer","i","--key-id","k"],["attest","--request","/nonexistent.json","--actions","storage"],["revoke","--receipt-id","x","--reason","y"]]){
    const r=await run([...argv,"--publish-dir",d.publishDir,"--private-dir",d.privateDir]);
    expect(r.code).toBe(2);expect(r.err).toContain("interactive terminal");
   }
   expect(await readdir(d.publishDir)).toEqual([]);expect(await readdir(d.privateDir)).toEqual([]);
  }finally{await cleanup(d.publishDir,d.privateDir)}
 });
 test("verify and list are read-only and tell the truth about a receipt",async()=>{
  const k=pair(),d=await dirs();
  try{
   await writeFile(join(d.publishDir,"authority.json"),JSON.stringify(info(k)));
   const now=new Date();
   const att=await attestSource({request:{sourceId:base.sourceId,sourceVersion:base.sourceVersion,canonicalId:base.canonicalId,licenceId:base.licenceId,attribution:base.attribution,passages:[PASSAGE]},authority:info(k),privateKey:k.privateKey,...d,actions:base.permittedActions,validForMs:base.validForMs,evidence:"Checked licence and retraction status",operator:"Dr Example",confirm:async()=>true,now:()=>now});
   const receiptFile=join(d.publishDir,"receipts",receiptFileName(base.sourceId,base.sourceVersion,sha256Hex(PASSAGE))),passageFile=join(d.privateDir,"passage.txt");
   await writeFile(passageFile,PASSAGE);
   const good=await run(["verify","--publish-dir",d.publishDir,"--receipt",receiptFile,"--passage-file",passageFile]);expect(good.code).toBe(0);expect(good.out).toContain("VALID");
   await writeFile(passageFile,PASSAGE+" changed");const bad=await run(["verify","--publish-dir",d.publishDir,"--receipt",receiptFile,"--passage-file",passageFile]);expect(bad.code).toBe(1);expect(bad.out).toContain("INVALID");
   const listed=await run(["list","--publish-dir",d.publishDir]);expect(listed.out).toContain(att.receipts[0]!.id);expect(listed.out).not.toContain("REVOKED");
   await revokeReceipt({receiptId:att.receipts[0]!.id,reason:"Correction",authority:info(k),privateKey:k.privateKey,publishDir:d.publishDir,confirm:async()=>true});
   expect((await run(["list","--publish-dir",d.publishDir])).out).toContain("REVOKED");
   await writeFile(passageFile,PASSAGE);expect((await run(["verify","--publish-dir",d.publishDir,"--receipt",receiptFile,"--passage-file",passageFile])).code).toBe(1);
  }finally{await cleanup(d.publishDir,d.privateDir)}
 });
});
