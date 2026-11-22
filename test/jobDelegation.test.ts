/** Delegation grants for background jobs: creation needs a live session, use needs no session, and every use re-checks everything.
 * Fixture directories only: this proves the control logic, not a staging run. */
import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,readFileSync,readdirSync,renameSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHmac} from "node:crypto";
import {authoriseCallsFor,authoriseJobCallsFor,canonicalHsiManifest,createGatewayCallerAuthority,type VerifiedPrincipal} from "../src/gatewayCallerAuthority";
import {createFileIdempotencyStore,createToolAuditLog,createToolGateway,defaultToolCatalogue} from "../src/governedToolGateway";
import {runHsiAgentOrchestration} from "../src/hsiAgentOrchestrator";
import {createFileGrantStore,isGrantId} from "../src/jobDelegationGrants";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-grant-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const KEY="k".repeat(40),OTHER_KEY="z".repeat(40);
const TA="token-researcher-a-0123456789",TB="token-researcher-b-0123456789";

const world=(dir=mkd(),over:{key?:string}={})=>{
 const sessions=new Map<string,VerifiedPrincipal>(),owners=new Map<string,{ownerSubjectId:string;organizationId:string}>(),standing=new Map<string,{roles:string[]}>();
 let clock=1_000_000;let boom=false;
 sessions.set(TA,{subjectId:"subject-a",organizationId:"org-1",sessionId:"sess-a",roles:["researcher"]});
 sessions.set(TB,{subjectId:"subject-b",organizationId:"org-2",sessionId:"sess-b",roles:["researcher"]});
 owners.set("inv-a",{ownerSubjectId:"subject-a",organizationId:"org-1"});owners.set("inv-b",{ownerSubjectId:"subject-b",organizationId:"org-2"});
 standing.set("subject-a|org-1",{roles:["researcher"]});standing.set("subject-b|org-2",{roles:["researcher"]});
 const store=createFileGrantStore(dir,{signingKey:over.key??KEY,now:()=>clock});
 const mkAuthority=()=>createGatewayCallerAuthority({
  verifySession:async t=>{if(boom)throw Error("down");return sessions.get(t)??null},
  resolveInvestigation:async id=>{if(boom)throw Error("down");return owners.get(id)??null},
  resolveStanding:async(s,o)=>{if(boom)throw Error("down");return standing.get(`${s}|${o}`)??null},
  grants:store,now:()=>clock,ttlMs:60_000,
 });
 const authority=mkAuthority();
 return {dir,sessions,owners,standing,store,authority,mkAuthority,advance:(ms:number)=>{clock+=ms},now:()=>clock,setBoom:(v:boolean)=>{boom=v}};
};
const epmc=(id:string)=>new Response(JSON.stringify({resultList:{result:[{id,source:"MED",pmid:id,title:"T",doi:"10.1/x",pubYear:"2020"}]}}),{status:200});
const gwFor=(w:ReturnType<typeof world>,extra:Partial<Parameters<typeof createToolGateway>[0]>={})=>{
 let fetches=0,n=0;const audit=createToolAuditLog();
 const gw=createToolGateway({tools:defaultToolCatalogue(),audit,callerAuthority:w.authority,fetcher:(async()=>{fetches++;return epmc(String(++n))}) as never,sleep:async()=>{},now:()=>w.now(),...extra});
 return {gw,audit,fetches:()=>fetches};
};
let k=0;
const callWith=(gw:ReturnType<typeof createToolGateway>,a:unknown,over:Record<string,unknown>={})=>gw.call({authorisation:a,manifest:{} as never,investigationId:"inv-a",taskId:"t-1",invocationId:`call-${String(++k).padStart(6,"0")}`,tool:"literature.search",input:{terms:["IL-21"+k],limit:3},...over} as never);
const code=(r:{ok:boolean}&Record<string,unknown>)=>r.ok?"ok":String(r.code);
const delegate=async(w:ReturnType<typeof world>,over:Record<string,unknown>={})=>{const r=await w.authority.delegate({sessionToken:TA,investigationId:"inv-a",jobId:"job-1",roles:["evidence_retriever"],...over} as never);if(!r.ok)throw Error("setup: "+r.code);return r.grantId};

/* ---------- store ---------- */
test("store: create and read back; ids are unguessable and unique under concurrency",async()=>{
 const w=world();
 const ids=await Promise.all(Array.from({length:20},(_,i)=>w.store.create({jobId:`job-${i}`,subjectId:"subject-a",organizationId:"org-1",investigationId:"inv-a",roles:["evidence_retriever"],createdAtMs:w.now(),expiresAtMs:w.now()+60_000,createdBySessionRef:"a".repeat(24)}).then(r=>r.grantId)));
 expect(new Set(ids).size).toBe(20);expect(ids.every(isGrantId)).toBe(true);
 const s=await w.store.get(ids[0]!);expect(s!.grant).toMatchObject({jobId:"job-0",roles:["evidence_retriever"]});expect(s!.revoked).toBeNull();
 expect(await w.store.get("g-"+"0".repeat(32))).toBeNull();expect(await w.store.get("../../etc/passwd")).toBeNull();
});
test("store: invalid grants and configuration are refused (lifetime, roles, identity, key length)",async()=>{
 const w=world();const ok={jobId:"job-1",subjectId:"s",organizationId:"org-1",investigationId:"inv-a",roles:["evidence_retriever" as const],createdAtMs:w.now(),expiresAtMs:w.now()+60_000,createdBySessionRef:"a".repeat(24)};
 for(const bad of [{...ok,expiresAtMs:w.now()+86_400_001},{...ok,expiresAtMs:w.now()},{...ok,expiresAtMs:w.now()-1,createdAtMs:w.now()-100},{...ok,roles:[]},{...ok,roles:["root" as never]},{...ok,roles:["evidence_retriever" as const,"evidence_retriever" as const]},{...ok,jobId:"../x"},{...ok,subjectId:""},{...ok,createdBySessionRef:"nope"}])await expect(w.store.create(bad)).rejects.toThrow();
 expect(()=>createFileGrantStore(mkd(),{signingKey:"short"})).toThrow();
 expect(()=>createFileGrantStore(mkd(),{signingKey:KEY,maxLifetimeMs:8*86_400_000})).toThrow();
 expect(()=>createFileGrantStore(mkd(),{signingKey:KEY,maxLifetimeMs:5})).toThrow();
});
test("store: any edit to a grant record, a wrong key, a missing MAC or a swapped file makes reads throw (never a silent pass)",async()=>{
 const w=world();const a=await delegate(w),b=await delegate(w,{jobId:"job-2"});
 const fa=join(w.dir,"grants",`${a}.json`),fb=join(w.dir,"grants",`${b}.json`);
 const orig=readFileSync(fa,"utf8");
 const edit=(f:(g:Record<string,unknown>)=>void)=>{const r=JSON.parse(orig);f(r.body);writeFileSync(fa,JSON.stringify(r))};
 for(const f of [(g:Record<string,unknown>)=>{g.expiresAtMs=(g.expiresAtMs as number)+1_000_000},(g:Record<string,unknown>)=>{g.subjectId="subject-b"},(g:Record<string,unknown>)=>{g.roles=["evidence_retriever","claim_verifier"]},(g:Record<string,unknown>)=>{g.investigationId="inv-b"},(g:Record<string,unknown>)=>{g.jobId="job-other"}]){edit(f);await expect(w.store.get(a)).rejects.toThrow()}
 const r=JSON.parse(orig);delete r.mac;writeFileSync(fa,JSON.stringify(r));await expect(w.store.get(a)).rejects.toThrow();
 writeFileSync(fa,"not json");await expect(w.store.get(a)).rejects.toThrow();
 writeFileSync(fa,orig);expect((await w.store.get(a))!.grant.grantId).toBe(a);
 const other=createFileGrantStore(w.dir,{signingKey:OTHER_KEY,now:w.now});await expect(other.get(a)).rejects.toThrow(); // a different key verifies nothing
 renameSync(fb,fa); // job-2's valid, signed record placed under job-1's id
 await expect(w.store.get(a)).rejects.toThrow();
});
test("store: revocation is signed, idempotent, keeps its first time, rejects unknown grants, and a forged marker fails closed",async()=>{
 const w=world();const a=await delegate(w);
 await w.store.revoke(a,"user_cancelled");const t1=(await w.store.get(a))!.revoked!;
 w.advance(5_000);await w.store.revoke(a,"admin_revoked");
 expect((await w.store.get(a))!.revoked).toEqual(t1);expect(t1.reason).toBe("user_cancelled");
 await expect(w.store.revoke("g-"+"1".repeat(32),"user_cancelled")).rejects.toThrow();
 await expect(w.store.revoke(a,"because" as never)).rejects.toThrow();
 const b=await delegate(w,{jobId:"job-2"});
 writeFileSync(join(w.dir,"revocations",`${b}.json`),JSON.stringify({body:{grantId:b,atMs:1,reason:"user_cancelled"},mac:"0".repeat(64)}));
 await expect(w.store.get(b)).rejects.toThrow();
 // rewriting the grant file cannot clear a revocation
 const fa=join(w.dir,"grants",`${a}.json`);writeFileSync(fa,readFileSync(fa,"utf8"));expect((await w.store.get(a))!.revoked).not.toBeNull();
});

test("store: even a validly signed revocation record with a malformed reason or another grant\'s id fails closed (defence in depth for buggy writers)",async()=>{
 const w=world();const a=await delegate(w),b=await delegate(w,{jobId:"job-2"});
 const sign=(body:{grantId:string;atMs:number;reason:string})=>createHmac("sha256",Buffer.from(KEY)).update(JSON.stringify({kind:"hsi-job-grant-revocation-1",grantId:body.grantId,atMs:body.atMs,reason:body.reason})).digest("hex");
 for(const body of [{grantId:a,atMs:5,reason:"nonsense"},{grantId:b,atMs:5,reason:"user_cancelled"},{grantId:a,atMs:1.5,reason:"user_cancelled"}]){
  writeFileSync(join(w.dir,"revocations",`${a}.json`),JSON.stringify({body,mac:sign(body)}));
  await expect(w.store.get(a)).rejects.toThrow();
 }
});

/* ---------- creating a grant needs a live, verified, owning session ---------- */
test("delegate: requires a live verified session that owns the investigation; everything else is refused and creates nothing",async()=>{
 const w=world();
 const ask=(o:Record<string,unknown>)=>w.authority.delegate({sessionToken:TA,investigationId:"inv-a",jobId:"job-1",roles:["evidence_retriever"],...o} as never);
 expect(await ask({sessionToken:TB})).toEqual({ok:false,code:"forbidden"});               // other tenant
 expect(await ask({investigationId:"inv-b"})).toEqual({ok:false,code:"forbidden"});        // not mine
 expect(await ask({investigationId:"inv-none"})).toEqual({ok:false,code:"forbidden"});     // unknown looks the same
 expect(await ask({sessionToken:"short"})).toEqual({ok:false,code:"unauthenticated"});
 expect(await ask({sessionToken:"token-not-a-session-0123456789"})).toEqual({ok:false,code:"unauthenticated"});
 for(const bad of [{jobId:"../x"},{jobId:""},{roles:[]},{roles:["root"]},{roles:"evidence_retriever"},{lifetimeMs:5},{lifetimeMs:1.5}])expect((await ask(bad as never)).ok).toBe(false);
 expect(await ask({lifetimeMs:86_400_001})).toEqual({ok:false,code:"invalid_request"}); // beyond the store's maximum
 w.sessions.set("tok-reviewer-0123456789abc",{subjectId:"subject-a",organizationId:"org-1",sessionId:"x",roles:["scientific_reviewer"]});
 expect(await ask({sessionToken:"tok-reviewer-0123456789abc"})).toEqual({ok:false,code:"forbidden"});
 expect(readdirSync(join(w.dir,"grants"))).toHaveLength(0);
 const bare=createGatewayCallerAuthority({verifySession:async t=>w.sessions.get(t)??null,resolveInvestigation:async i=>w.owners.get(i)??null});
 expect(await bare.delegate({sessionToken:TA,investigationId:"inv-a",jobId:"job-1",roles:["evidence_retriever"]})).toEqual({ok:false,code:"unavailable"});
 expect((await ask({})).ok).toBe(true);
});

/* ---------- using a grant needs no session, and re-checks everything ---------- */
test("a job keeps working after its session is gone; its authorisation is attributed to the same principal and tenant as the session's",async()=>{
 const w=world();const {gw,audit,fetches}=gwFor(w);
 const sessionAuth=(await w.authority.authorise({sessionToken:TA,investigationId:"inv-a",taskId:"t-1",role:"evidence_retriever"}) as {ok:true;authorisation:{principalRef:string;tenantRef:string}}).authorisation;
 const g=await delegate(w);
 w.sessions.delete(TA); // logout, expiry, revocation: the session is gone
 const r=await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"});
 expect(r.ok).toBe(true);if(!r.ok)return;
 expect([r.authorisation.principalRef,r.authorisation.tenantRef]).toEqual([sessionAuth.principalRef,sessionAuth.tenantRef]);
 expect(code(await callWith(gw,r.authorisation) as never)).toBe("ok");expect(fetches()).toBe(1);
 expect(audit.records()[0]!.tenantRef).toBe(sessionAuth.tenantRef);
 expect(JSON.stringify(audit.records())+JSON.stringify(r.authorisation)).not.toContain(g);
});
test("a grant is scoped: wrong job id, wrong role, unknown or malformed grant id, and another investigation are all refused",async()=>{
 const w=world();const {gw,fetches}=gwFor(w);const g=await delegate(w);
 const ask=(o:Record<string,unknown>)=>w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever",...o} as never);
 expect(await ask({jobId:"job-2"})).toEqual({ok:false,code:"forbidden"});
 expect(await ask({role:"claim_verifier"})).toEqual({ok:false,code:"forbidden"});
 expect(await ask({grantId:"g-"+"2".repeat(32)})).toEqual({ok:false,code:"forbidden"});
 for(const bad of [{grantId:"nope"},{grantId:undefined},{taskId:"../x"},{role:"root"}])expect(await ask(bad)).toEqual({ok:false,code:"invalid_request"});
 const ok=await ask({});if(!ok.ok)throw Error("x");
 expect(code(await callWith(gw,ok.authorisation,{investigationId:"inv-b"}) as never)).toBe("unauthorised");
 expect(code(await callWith(gw,ok.authorisation,{taskId:"t-other"}) as never)).toBe("unauthorised");
 expect(fetches()).toBe(0);
});
test("revocation stops new authorisations and already-issued ones at the very next call",async()=>{
 const w=world();const {gw,fetches}=gwFor(w);const g=await delegate(w);
 const a=await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"});if(!a.ok)throw Error("x");
 expect(code(await callWith(gw,a.authorisation) as never)).toBe("ok");
 await w.store.revoke(g,"suspected_compromise");
 expect(code(await callWith(gw,a.authorisation) as never)).toBe("unauthorised");
 expect(await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"})).toEqual({ok:false,code:"forbidden"});
 expect(fetches()).toBe(1);
});
test("expiry: a grant ends on time, and an authorisation never outlives its grant even when its own lifetime is longer",async()=>{
 const w=world();const {gw}=gwFor(w);const g=await delegate(w,{lifetimeMs:90_000});
 const a=await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"});if(!a.ok)throw Error("x");
 expect(a.authorisation.expiresAtMs).toBe(w.now()+60_000);
 w.advance(50_000);const b=await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"});if(!b.ok)throw Error("x");
 expect(b.authorisation.expiresAtMs).toBe(1_000_000+90_000); // capped at the grant's end, not now+60s
 w.advance(41_000); // past the grant's end
 expect(code(await callWith(gw,b.authorisation) as never)).toBe("unauthorised");
 expect(await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"})).toEqual({ok:false,code:"forbidden"});
});
test("account changes stop a job at once: user disabled, researcher role removed, organisation membership ended, reviewer-only",async()=>{
 for(const change of [(w:ReturnType<typeof world>)=>w.standing.delete("subject-a|org-1"),(w:ReturnType<typeof world>)=>w.standing.set("subject-a|org-1",{roles:[]}),(w:ReturnType<typeof world>)=>w.standing.set("subject-a|org-1",{roles:["scientific_reviewer"]})]){
  const w=world();const {gw}=gwFor(w);const g=await delegate(w);
  const a=await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"});if(!a.ok)throw Error("x");
  change(w);
  expect(code(await callWith(gw,a.authorisation) as never)).toBe("unauthorised");
  expect(await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"})).toEqual({ok:false,code:"forbidden"});
 }
});
test("ownership is re-checked: transferring or deleting the investigation, or moving it to another organisation, stops the job",async()=>{
 for(const change of [(w:ReturnType<typeof world>)=>w.owners.set("inv-a",{ownerSubjectId:"subject-b",organizationId:"org-2"}),(w:ReturnType<typeof world>)=>w.owners.delete("inv-a"),(w:ReturnType<typeof world>)=>w.owners.set("inv-a",{ownerSubjectId:"subject-a",organizationId:"org-9"})]){
  const w=world();const {gw}=gwFor(w);const g=await delegate(w);
  const a=await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"});if(!a.ok)throw Error("x");
  change(w);expect(code(await callWith(gw,a.authorisation) as never)).toBe("unauthorised");
 }
});
test("fail closed: a corrupt or forged grant, or any dependency outage, refuses and never throws",async()=>{
 const w=world();const {gw,fetches}=gwFor(w);const g=await delegate(w);
 const a=await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"});if(!a.ok)throw Error("x");
 w.setBoom(true);
 expect(await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"})).toEqual({ok:false,code:"unavailable"});
 expect(code(await callWith(gw,a.authorisation) as never)).toBe("unauthorised");
 w.setBoom(false);
 const f=join(w.dir,"grants",`${g}.json`);const orig=readFileSync(f,"utf8");
 const r=JSON.parse(orig);r.body.expiresAtMs+=10_000_000;writeFileSync(f,JSON.stringify(r));
 expect(await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"})).toEqual({ok:false,code:"unavailable"});
 expect(code(await callWith(gw,a.authorisation) as never)).toBe("unauthorised");expect(fetches()).toBe(0);
});
test("grant authorisations are as unforgeable as session ones: copies, clones and literals are refused",async()=>{
 const w=world();const {gw,fetches}=gwFor(w);const g=await delegate(w);
 const a=await w.authority.authoriseDelegated({grantId:g,jobId:"job-1",taskId:"t-1",role:"evidence_retriever"});if(!a.ok)throw Error("x");
 for(const f of [{...a.authorisation},structuredClone(a.authorisation),JSON.parse(JSON.stringify(a.authorisation))])expect(code(await callWith(gw,f) as never)).toBe("unauthorised");
 expect(fetches()).toBe(0);
});

/* ---------- through the real orchestrator, restart and recovery ---------- */
const release={id:"rel-1",version:"1.0.0",manifestHash:"a".repeat(64)};
const task={id:"t-1",manifest:canonicalHsiManifest("evidence_retriever"),dependsOn:[]};
test("orchestrator: a delegated job runs after logout, and revoking the grant mid-run stops the next call",async()=>{
 const w=world();const {gw,fetches}=gwFor(w);const g=await delegate(w);w.sessions.delete(TA);
 const r=await runHsiAgentOrchestration({investigationId:"inv-a",tasks:[task],graphRelease:release,dataClass:"public_biomedical",toolGateway:gw,authoriseCall:authoriseJobCallsFor(w.authority,{grantId:g,jobId:"job-1"}),
  executors:{evidence_retriever:async ctx=>{
   const one=await ctx.callTool!("literature.search",{terms:["first"],limit:2});
   await w.store.revoke(g,"user_cancelled"); // cancelled while running
   await ctx.callTool!("literature.search",{terms:["second"],limit:2}); // must not be allowed to proceed
   return {status:"completed",outputRef:one.ok?"o":null,reason:null};
  }}});
 expect(r.status).not.toBe("completed");expect(fetches()).toBe(1);
});
test("DEMONSTRATION: restart with a new authority over the same grant store and idempotency store: the job resumes authenticated and makes no duplicate provider call",async()=>{
 const dir=mkd(),idem=createFileIdempotencyStore(mkd());
 const w1=world(dir);const g=await delegate(w1);w1.sessions.delete(TA);
 const run=async(w:ReturnType<typeof world>)=>{
  const s=gwFor(w,{idempotency:idem});
  const r=await runHsiAgentOrchestration({investigationId:"inv-a",tasks:[task],graphRelease:release,dataClass:"public_biomedical",toolGateway:s.gw,authoriseCall:authoriseJobCallsFor(w.authority,{grantId:g,jobId:"job-1"}),
   executors:{evidence_retriever:async ctx=>{const t=await ctx.callTool!("literature.search",{terms:["stable"],limit:2});return {status:t.ok?"completed":"blocked",outputRef:t.ok?"o":null,reason:t.ok?null:t.code}}}});
  return {r,fetches:s.fetches()};
 };
 const first=await run(w1);
 // "restart": everything rebuilt from disk, the old session still gone, a fresh authority instance
 const w2=world(dir);w2.sessions.delete(TA);
 const second=await run(w2);
 expect(first.r.status).toBe("completed");expect(first.fetches).toBe(1);
 expect(second.r.status).toBe("completed");expect(second.fetches).toBe(0);
 expect(second.r.gatewayCalls![0]).toMatchObject({ok:true,replayed:true});
});
test("session-based and grant-based paths coexist on one authority",async()=>{
 const w=world();const {gw}=gwFor(w);const g=await delegate(w);
 const viaSession=authoriseCallsFor(w.authority,{sessionToken:TA,investigationId:"inv-a"}),viaGrant=authoriseJobCallsFor(w.authority,{grantId:g,jobId:"job-1"});
 expect(code(await callWith(gw,await viaSession({taskId:"t-1",role:"evidence_retriever"})) as never)).toBe("ok");
 expect(code(await callWith(gw,await viaGrant({taskId:"t-1",role:"evidence_retriever"})) as never)).toBe("ok");
});
