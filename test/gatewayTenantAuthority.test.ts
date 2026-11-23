/** Authenticated, tenant-scoped gateway calls: forged identity, cross-tenant access, revocation, replay and limits.
 * Everything runs against in-memory directories and injected fetchers. It proves the control logic; it is not a staging run. */
import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {authoriseCallsFor,canonicalHsiManifest,createGatewayCallerAuthority,type VerifiedPrincipal} from "../src/gatewayCallerAuthority";
import {createFileIdempotencyStore,createToolAuditLog,createToolGateway,defaultToolCatalogue,type ToolRequest} from "../src/governedToolGateway";
import {runHsiAgentOrchestration,type HsiAgentTask} from "../src/hsiAgentOrchestrator";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-tenant-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});

/** A fake server-side directory: sessions (revocable) and investigation ownership (transferable). */
const world=()=>{
 const sessions=new Map<string,VerifiedPrincipal>(),owners=new Map<string,{ownerSubjectId:string;organizationId:string}>();
 let clock=1_000_000;let throwing=false;
 const addSession=(token:string,subjectId:string,organizationId:string,roles:string[]=["researcher"],sessionId=`sess-${token}`)=>{sessions.set(token,{subjectId,organizationId,sessionId,roles});return token};
 const authority=createGatewayCallerAuthority({
  verifySession:async t=>{if(throwing)throw Error("db down");return sessions.get(t)??null},
  resolveInvestigation:async id=>{if(throwing)throw Error("db down");return owners.get(id)??null},
  now:()=>clock,ttlMs:60_000,
 });
 return {sessions,owners,addSession,authority,advance:(ms:number)=>{clock+=ms},setThrowing:(v:boolean)=>{throwing=v}};
};
const TOKEN_A="token-researcher-a-0123456789",TOKEN_B="token-researcher-b-0123456789",TOKEN_C="token-same-org-other-0123456789";
const epmc=(id="1")=>new Response(JSON.stringify({resultList:{result:[{id,source:"MED",pmid:id,title:"A title",doi:"10.1/x",pubYear:"2020"}]}}),{status:200});
const setup=(opts:Partial<Parameters<typeof createToolGateway>[0]>={})=>{
 const w=world();
 w.addSession(TOKEN_A,"subject-a","org-1");w.addSession(TOKEN_B,"subject-b","org-2");w.addSession(TOKEN_C,"subject-c","org-1");
 w.owners.set("inv-a",{ownerSubjectId:"subject-a",organizationId:"org-1"});w.owners.set("inv-b",{ownerSubjectId:"subject-b",organizationId:"org-2"});
 let fetches=0;const audit=createToolAuditLog();let n=0;
 const gw=createToolGateway({tools:defaultToolCatalogue(),audit,callerAuthority:w.authority,fetcher:(async()=>{fetches++;return epmc(String(++n))}) as never,sleep:async()=>{},now:()=>1_000_000,...opts});
 const auth=async(token:string,inv:string,task="t-1",role="evidence_retriever")=>{const r=await w.authority.authorise({sessionToken:token,investigationId:inv,taskId:task,role});if(!r.ok)throw Error("setup: "+r.code);return r.authorisation};
 let k=0;
 const call=(a:unknown,over:Partial<ToolRequest>={})=>gw.call({authorisation:a,manifest:{} as never,investigationId:"inv-a",taskId:"t-1",invocationId:`call-${String(++k).padStart(6,"0")}`,tool:"literature.search",input:{terms:["IL-21"+k],limit:3},...over});
 return {...w,gw,audit,auth,call,fetches:()=>fetches};
};
const code=(r:{ok:boolean}&Record<string,unknown>)=>r.ok?"ok":String(r.code);

/* ---------- happy path and identity source ---------- */
test("a researcher's verified, owned investigation can call a tool; the audit record carries hashed refs, never raw identity",async()=>{
 const s=setup();const a=await s.auth(TOKEN_A,"inv-a");
 const r=await s.call(a);expect(r.ok).toBe(true);expect(s.fetches()).toBe(1);
 const rec=s.audit.records()[0]!;
 expect(rec.tenantRef).toMatch(/^[a-f0-9]{24}$/);expect(rec.principalRef).toMatch(/^[a-f0-9]{24}$/);expect(rec.role).toBe("evidence_retriever");
 const dump=JSON.stringify(s.audit.records())+JSON.stringify(a);
 for(const raw of ["subject-a","org-1","sess-token",TOKEN_A])expect(dump).not.toContain(raw);
 expect(s.audit.verify().ok).toBe(true);expect(s.gw.mode).toBe("authenticated");
});
test("the gateway reports unauthenticated mode when no authority is configured",()=>{
 expect(createToolGateway({tools:defaultToolCatalogue(),audit:createToolAuditLog()}).mode).toBe("unauthenticated");
});

/* ---------- forgery ---------- */
test("forged authorisations are refused and nothing is fetched: literal, copy, clone, JSON round trip, other authority, missing",async()=>{
 const s=setup();const real=await s.auth(TOKEN_A,"inv-a");
 const other=setup();const foreign=await other.auth(TOKEN_A,"inv-a");
 const forged=[
  {kind:"hsi-gateway-authorisation-1",investigationId:"inv-a",taskId:"t-1",role:"evidence_retriever",principalRef:"x".repeat(24),tenantRef:"y".repeat(24),manifest:canonicalHsiManifest("evidence_retriever"),expiresAtMs:9e15},
  {...real},structuredClone(real),JSON.parse(JSON.stringify(real)),foreign,undefined,null,"string",42,[],
 ];
 for(const f of forged){const r=await s.call(f);expect(code(r as never)).toBe("unauthorised")}
 expect(s.fetches()).toBe(0);
});
test("a request-supplied manifest, tenant and ids are not proof: a generous manifest is ignored in authenticated mode",async()=>{
 const s=setup();
 const generous={...canonicalHsiManifest("evidence_retriever"),maxToolCalls:100,allowedTools:["literature.search"] as const};
 // entity_resolver may not use literature.search in the server's registry, whatever the request claims.
 const weak=await s.auth(TOKEN_A,"inv-a","t-weak","entity_resolver");
 expect(code(await s.call(weak,{taskId:"t-weak",manifest:generous}) as never)).toBe("permission_denied");
 // the canonical budget is 3 even though the request claimed 100
 const good=await s.auth(TOKEN_A,"inv-a","t-good");
 const rs=[];for(let i=0;i<5;i++)rs.push(code(await s.call(good,{taskId:"t-good",manifest:generous}) as never));
 expect(rs).toEqual(["ok","ok","ok","budget_exhausted","budget_exhausted"]);
});
test("an authorisation cannot be used for a different investigation or task than it was issued for",async()=>{
 const s=setup();const a=await s.auth(TOKEN_A,"inv-a","t-1");
 expect(code(await s.call(a,{investigationId:"inv-b"}) as never)).toBe("unauthorised");
 expect(code(await s.call(a,{taskId:"t-2"}) as never)).toBe("unauthorised");
 expect(code(await s.call(a) as never)).toBe("ok");
});
test("the authorisation and its manifest are deeply immutable",async()=>{
 const s=setup();const a=await s.auth(TOKEN_A,"inv-a");
 expect(()=>{(a as {investigationId:string}).investigationId="inv-b"}).toThrow();
 expect(()=>{(a.manifest as {maxToolCalls:number}).maxToolCalls=100}).toThrow();
 expect(()=>{(a.manifest.allowedTools as string[]).push("brief.export")}).toThrow();
 expect(Object.isFrozen(a.manifest.allowedTools)).toBe(true);
});
test("legacy callers cannot bypass an authenticated gateway by supplying only a manifest",async()=>{
 const s=setup();
 const r=await s.gw.call({manifest:canonicalHsiManifest("evidence_retriever"),investigationId:"inv-a",taskId:"t-1",invocationId:"call-legacy-1",tool:"literature.search",input:{terms:["x"]}});
 expect(code(r as never)).toBe("unauthorised");expect(s.fetches()).toBe(0);
});

/* ---------- cross-tenant, ownership, roles ---------- */
test("another organisation, another researcher in the same organisation, and an unknown investigation are all refused identically",async()=>{
 const s=setup();
 for(const [token,inv] of [[TOKEN_B,"inv-a"],[TOKEN_C,"inv-a"],[TOKEN_A,"inv-b"],[TOKEN_A,"inv-does-not-exist"]]){
  const r=await s.authority.authorise({sessionToken:token,investigationId:inv,taskId:"t-1",role:"evidence_retriever"});
  expect(r).toEqual({ok:false,code:"forbidden"});
 }
});
test("the organisation is part of ownership: the same subject id inside a different organisation is refused, in authorise and on a later call",async()=>{
 const s=setup();s.addSession("token-subject-a-other-org-0123","subject-a","org-9");
 expect(await s.authority.authorise({sessionToken:"token-subject-a-other-org-0123",investigationId:"inv-a",taskId:"t-1",role:"evidence_retriever"})).toEqual({ok:false,code:"forbidden"});
 const a=await s.auth(TOKEN_A,"inv-a");s.owners.set("inv-a",{ownerSubjectId:"subject-a",organizationId:"org-9"});
 expect(code(await s.call(a) as never)).toBe("unauthorised");
});
test("ownership is re-checked on every call: transferring or deleting the investigation stops an already-issued authorisation",async()=>{
 const s=setup();const a=await s.auth(TOKEN_A,"inv-a");expect(code(await s.call(a) as never)).toBe("ok");
 s.owners.set("inv-a",{ownerSubjectId:"subject-b",organizationId:"org-2"});
 expect(code(await s.call(a) as never)).toBe("unauthorised");
 s.owners.delete("inv-a");expect(code(await s.call(a) as never)).toBe("unauthorised");
 expect(s.fetches()).toBe(1);
});
test("a revoked, replaced or expired session stops working at the very next call",async()=>{
 const s=setup();const a=await s.auth(TOKEN_A,"inv-a");expect(code(await s.call(a) as never)).toBe("ok");
 s.sessions.delete(TOKEN_A);expect(code(await s.call(a) as never)).toBe("unauthorised");
 s.addSession(TOKEN_A,"subject-a","org-1",["researcher"],"sess-NEW"); // same token string, different session
 expect(code(await s.call(a) as never)).toBe("unauthorised");
 const s2=setup();const a2=await s2.auth(TOKEN_A,"inv-a");s2.advance(60_001);expect(code(await s2.call(a2) as never)).toBe("unauthorised");
});
test("role handling: a reviewer-only or role-less session is forbidden; admin and researcher may call",async()=>{
 const s=setup();
 for(const [t,roles] of [["tok-reviewer-only-0123456789",["scientific_reviewer"]],["tok-no-roles-0123456789",[]],["tok-unknown-role-0123456789",["root"]]] as [string,string[]][]){
  s.addSession(t,"subject-a","org-1",roles);
  expect(await s.authority.authorise({sessionToken:t,investigationId:"inv-a",taskId:"t-1",role:"evidence_retriever"})).toEqual({ok:false,code:"forbidden"});
 }
 s.addSession("tok-admin-0123456789abc","subject-a","org-1",["research_admin"]);
 expect((await s.authority.authorise({sessionToken:"tok-admin-0123456789abc",investigationId:"inv-a",taskId:"t-1",role:"evidence_retriever"})).ok).toBe(true);
});
test("malformed authorise requests and dependency failures fail closed without throwing",async()=>{
 const s=setup();
 const bad=[{sessionToken:TOKEN_A,investigationId:"../x",taskId:"t",role:"evidence_retriever"},{sessionToken:TOKEN_A,investigationId:"inv-a",taskId:"",role:"evidence_retriever"},{sessionToken:TOKEN_A,investigationId:"inv-a",taskId:"t",role:"root"},null,{} as never,{sessionToken:1 as never,investigationId:"inv-a",taskId:"t",role:"evidence_retriever"}];
 for(const b of bad)expect((await s.authority.authorise(b as never)).ok).toBe(false);
 for(const t of ["short","has space in token 0123456789","x".repeat(5_000)])expect(await s.authority.authorise({sessionToken:t,investigationId:"inv-a",taskId:"t",role:"evidence_retriever"})).toEqual({ok:false,code:"unauthenticated"});
 const a=await s.auth(TOKEN_A,"inv-a");s.setThrowing(true);
 expect(await s.authority.authorise({sessionToken:TOKEN_A,investigationId:"inv-a",taskId:"t",role:"evidence_retriever"})).toEqual({ok:false,code:"unavailable"});
 expect(code(await s.call(a) as never)).toBe("unauthorised");expect(s.fetches()).toBe(0);
});
test("the authority refuses a registry that returns a manifest for another role, an invalid manifest, or a non-public data class",async()=>{
 const w=world();w.addSession(TOKEN_A,"subject-a","org-1");w.owners.set("inv-a",{ownerSubjectId:"subject-a",organizationId:"org-1"});
 const mk=(manifests:(r:never)=>unknown)=>createGatewayCallerAuthority({verifySession:async t=>w.sessions.get(t)??null,resolveInvestigation:async id=>w.owners.get(id)??null,manifests:manifests as never});
 const ask=(a:ReturnType<typeof mk>)=>a.authorise({sessionToken:TOKEN_A,investigationId:"inv-a",taskId:"t",role:"evidence_retriever"});
 expect(await ask(mk(()=>canonicalHsiManifest("claim_verifier")))).toEqual({ok:false,code:"unavailable"});
 expect(await ask(mk(()=>({...canonicalHsiManifest("evidence_retriever"),maxToolCalls:1e6})))).toEqual({ok:false,code:"unavailable"});
 expect(await ask(mk(()=>undefined))).toEqual({ok:false,code:"unavailable"});
 expect(await ask(mk(()=>canonicalHsiManifest("evidence_retriever",{dataClass:"licensed_partner"})))).toEqual({ok:false,code:"forbidden"});
 expect(()=>createGatewayCallerAuthority({verifySession:async()=>null,resolveInvestigation:async()=>null,ttlMs:5})).toThrow();
});

/* ---------- replay and idempotency isolation ---------- */
test("two tenants using the same invocation id never collide, read or block each other, even through one shared durable store",async()=>{
 const idem=createFileIdempotencyStore(mkd());const s=setup({idempotency:idem});
 const a=await s.auth(TOKEN_A,"inv-a"),b=await s.auth(TOKEN_B,"inv-b");
 const same={invocationId:"call-shared-000001",input:{terms:["identical"],limit:3}};
 const ra=await s.call(a,{...same});
 const rb=await s.call(b,{...same,investigationId:"inv-b"});
 expect(ra.ok&&rb.ok).toBe(true);expect(s.fetches()).toBe(2);
 expect(ra.ok&&rb.ok&&ra.replayed===false&&rb.replayed===false).toBe(true);
 // each tenant replays only its own
 const ra2=await s.call(a,{...same});expect(ra2.ok&&ra2.replayed).toBe(true);expect(s.fetches()).toBe(2);
 expect(s.audit.records().map(x=>x.tenantRef).filter(Boolean)).toHaveLength(3);
});
test("a replay under a different task of the same tenant is still refused",async()=>{
 const s=setup();const a1=await s.auth(TOKEN_A,"inv-a","t-1"),a2=await s.auth(TOKEN_A,"inv-a","t-2");
 const same={invocationId:"call-shared-000002",input:{terms:["same"],limit:3}};
 expect((await s.call(a1,{...same})).ok).toBe(true);
 expect(code(await s.call(a2,{...same,taskId:"t-2"}) as never)).toBe("invalid_input");
});

/* ---------- per-tenant resource limits ---------- */
test("one tenant cannot take more than its share of a provider's window; another tenant is unaffected",async()=>{
 const s=setup(); // europe-pmc allows 30/min; the default share is 0.5, so 15 per tenant
 const bigA=await s.auth(TOKEN_A,"inv-a","t-1");
 // spread across tasks so the per-task budget (3) is not what stops us
 let okA=0,limitedA=0;
 for(let i=0;i<20;i++){const a=await s.auth(TOKEN_A,"inv-a",`task-${i}`);const r=await s.call(a,{taskId:`task-${i}`});if(r.ok)okA++;else if(code(r as never)==="rate_limited")limitedA++}
 expect(okA).toBe(15);expect(limitedA).toBe(5);
 const b=await s.auth(TOKEN_B,"inv-b","t-1");expect((await s.call(b,{investigationId:"inv-b"})).ok).toBe(true);
 void bigA;
});
test("a tenant-wide call ceiling stops a tenant that spreads calls over many investigations",async()=>{
 const s=setup({tenantCeiling:4,tenantRateShare:1});
 for(let i=0;i<6;i++)s.owners.set(`inv-a${i}`,{ownerSubjectId:"subject-a",organizationId:"org-1"});
 const codes:string[]=[];
 for(let i=0;i<6;i++){const a=await s.auth(TOKEN_A,`inv-a${i}`,"t-1");codes.push(code(await s.call(a,{investigationId:`inv-a${i}`}) as never))}
 expect(codes).toEqual(["ok","ok","ok","ok","budget_exhausted","budget_exhausted"]);
 const b=await s.auth(TOKEN_B,"inv-b");expect((await s.call(b,{investigationId:"inv-b"})).ok).toBe(true);
});
test("invalid tenant limits are refused at construction",()=>{
 for(const o of [{tenantCeiling:0},{tenantCeiling:1.5},{tenantRateShare:0},{tenantRateShare:1.5}])expect(()=>createToolGateway({tools:defaultToolCatalogue(),audit:createToolAuditLog(),...o})).toThrow();
});

/* ---------- through the real orchestrator ---------- */
const release={id:"rel-1",version:"1.0.0",manifestHash:"a".repeat(64)};
const taskOf=(role:"evidence_retriever"="evidence_retriever"):HsiAgentTask=>({id:"t-1",manifest:canonicalHsiManifest(role),dependsOn:[]});
test("orchestrator: with authoriseCall a task reaches the provider and the receipt is recorded; without it the gateway refuses",async()=>{
 const s=setup();
 const run=(authoriseCall?:Parameters<typeof runHsiAgentOrchestration>[0]["authoriseCall"])=>runHsiAgentOrchestration({
  investigationId:"inv-a",tasks:[taskOf()],graphRelease:release,dataClass:"public_biomedical",toolGateway:s.gw,authoriseCall,
  executors:{evidence_retriever:async ctx=>{const t=await ctx.callTool!("literature.search",{terms:["x"],limit:2});return {status:t.ok?"completed":"blocked",outputRef:t.ok?"out://1":null,reason:t.ok?null:t.code}}},
 });
 const ok=await run(authoriseCallsFor(s.authority,{sessionToken:TOKEN_A,investigationId:"inv-a"}));
 expect(ok.status).toBe("completed");expect(ok.gatewayCalls![0]).toMatchObject({ok:true});
 const no=await run(undefined);
 expect(no.status).toBe("blocked");expect(no.results["t-1"]?.reason).toBe("unauthorised");
 expect(s.fetches()).toBe(1);
});
test("orchestrator: a session for someone else's investigation cannot start tool calls (authoriser throws, nothing is fetched)",async()=>{
 const s=setup();
 const r=await runHsiAgentOrchestration({investigationId:"inv-a",tasks:[taskOf()],graphRelease:release,dataClass:"public_biomedical",toolGateway:s.gw,
  authoriseCall:authoriseCallsFor(s.authority,{sessionToken:TOKEN_B,investigationId:"inv-a"}),
  executors:{evidence_retriever:async ctx=>{await ctx.callTool!("literature.search",{terms:["x"]});return {status:"completed",outputRef:"o",reason:null}}}});
 expect(r.status).not.toBe("completed");expect(s.fetches()).toBe(0);
});
test("30 concurrent calls from two tenants stay attributed to the right tenant",async()=>{
 const s=setup({tenantRateShare:1,tenantCeiling:1000});
 const a=await s.auth(TOKEN_A,"inv-a","t-1"),b=await s.auth(TOKEN_B,"inv-b","t-1");
 s.owners.set("inv-a",{ownerSubjectId:"subject-a",organizationId:"org-1"});
 await Promise.all(Array.from({length:15},(_,i)=>[s.call(a,{input:{terms:["a"+i],limit:1},invocationId:`call-a-${String(i).padStart(5,"0")}`}),s.call(b,{investigationId:"inv-b",input:{terms:["b"+i],limit:1},invocationId:`call-b-${String(i).padStart(5,"0")}`})]).flat());
 const byInv=new Map<string,Set<string|undefined>>();
 for(const r of s.audit.records()){const set=byInv.get(r.investigationId)??new Set();set.add(r.tenantRef);byInv.set(r.investigationId,set)}
 expect(byInv.get("inv-a")!.size).toBe(1);expect(byInv.get("inv-b")!.size).toBe(1);
 expect([...byInv.get("inv-a")!][0]).not.toBe([...byInv.get("inv-b")!][0]);
});
