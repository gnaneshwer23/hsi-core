import {test,expect} from "bun:test";
import {mkdtempSync,rmSync,readFileSync,writeFileSync,mkdirSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import pending from "../operations/pilot/evidence.pending.json";
import {createResearchProcessAdmission,withResearchRequestControls,type ResearchOperationalEvent} from "../src/server/researchRequestControls";
import {boundedRequestText,RequestBodyTooLarge,RequestBodyTimeout} from "../src/server/boundedRequestBody";
import {handleAuthGateway} from "../src/server/neonAuthGateway";
import {handleVercelResearch} from "../src/server/vercelResearch";
import {createPublicArtifactRecoveryBundle,verifyPublicArtifactRecoveryBundle,restorePublicArtifactRecoveryBundle,runPublicArtifactRecoveryDrill} from "../src/researchRecovery";
import {assessResearchPilotReadiness,parsePilotEvidence} from "../src/researchPilotReadiness";
const origin="https://hsi.example",request=()=>new Request(origin+"/api/research/account");
const controls=()=>({processAdmission:createResearchProcessAdmission(),emit:()=>{}});
test("request budgets reset by window and cannot create unbounded identity keys",async()=>{
 let time=0,called=0;const admission=createResearchProcessAdmission({windowMs:1000,budgets:{research_read:1},now:()=>time});const handler=async()=>{called++;return Response.json({ok:true})};
 expect((await withResearchRequestControls(request(),handler,{processAdmission:admission})).status).toBe(200);const denied=await withResearchRequestControls(new Request(origin+"/api/research/account?user=untrusted",{headers:{"x-forwarded-for":"spoofed","x-role":"admin"}}),handler,{processAdmission:admission});expect(denied.status).toBe(429);expect(denied.headers.get("retry-after")).toBe("1");expect(called).toBe(1);time=1001;expect((await withResearchRequestControls(request(),handler,{processAdmission:admission})).status).toBe(200);
});
test("concurrency admission is released exactly once after completion or failure",async()=>{
 const a=createResearchProcessAdmission({maxConcurrent:1});const first=a.enter("research_read");expect(first.allowed).toBe(true);expect(a.enter("auth").reason).toBe("over_capacity");first.release();first.release();expect(a.enter("auth").allowed).toBe(true);
 const b=createResearchProcessAdmission({maxConcurrent:1});expect((await withResearchRequestControls(request(),async()=>{throw Error("private database credentials")},{processAdmission:b})).status).toBe(503);expect(b.enter("research_read").allowed).toBe(true);
});
test("redacted telemetry cannot contain request URL, query, credentials, identity, headers or raw errors",async()=>{
 const events:ResearchOperationalEvent[]=[],secret="NEVER-LOG-TEST-SECRET";const r=await withResearchRequestControls(new Request(origin+"/api/research/interrogative/hsi-interrogative-private-12345678/decision?question="+secret,{method:"POST",headers:{Cookie:"session="+secret,Authorization:"Bearer "+secret,"X-Request-ID":secret},body:secret}),async()=>{throw Error(secret)},{...controls(),emit:e=>events.push(e)});
 const event=events[0]!;expect(JSON.stringify(events)).not.toContain(secret);expect(event.routeGroup).toBe("research_write");expect(event.status).toBe(503);expect(Object.keys(event).sort()).toEqual(["schemaVersion","requestId","routeGroup","method","status","durationMs","admission","limiterScope"].sort());expect(r.headers.get("x-request-id")).toMatch(/^[a-f0-9-]{36}$/);expect(r.headers.get("cache-control")).toBe("no-store");expect(r.headers.get("server-timing")).toMatch(/^hsi;dur=/);expect(await r.text()).not.toContain(secret);
});
test("logging failure preserves a successful decision response and multiple auth cookies",async()=>{
 const headers=new Headers();headers.append("Set-Cookie","a=one; Secure");headers.append("Set-Cookie","b=two; Secure");const r=await withResearchRequestControls(request(),async()=>new Response("committed",{status:201,headers}),{...controls(),emit:()=>{throw Error("Log transport failed")}});expect(r.status).toBe(201);expect(await r.text()).toBe("committed");expect(r.headers.getSetCookie()).toHaveLength(2);
});
test("shared limiter requirements, failures and rejections fail closed before provider work",async()=>{
 let called=0;const handler=async()=>{called++;return Response.json({})};
 expect((await withResearchRequestControls(request(),handler,{...controls(),requireShared:true})).status).toBe(503);
 expect((await withResearchRequestControls(request(),handler,{...controls(),sharedAdmission:async()=>{throw Error("Secret upstream details")}})).status).toBe(503);
 const limited=await withResearchRequestControls(request(),handler,{...controls(),requireShared:true,sharedAdmission:async()=>({allowed:false,retryAfterSeconds:23})});expect(limited.status).toBe(429);expect(limited.headers.get("retry-after")).toBe("23");expect(called).toBe(0);
 expect((await withResearchRequestControls(request(),handler,{...controls(),requireShared:true,sharedAdmission:async()=>({allowed:true,retryAfterSeconds:0})})).status).toBe(200);
});
test("oversized request target or headers do not reach services",async()=>{
 let calls=0;const handler=async()=>{calls++;return Response.json({})};expect((await withResearchRequestControls(new Request(origin+"/api/research/account?x="+"a".repeat(8200)),handler,controls())).status).toBe(414);expect((await withResearchRequestControls(new Request(origin+"/api/research/account",{headers:{Cookie:"x="+"a".repeat(25000)}}),handler,controls())).status).toBe(431);expect((await withResearchRequestControls(new Request(origin+"/api/research/account",{headers:{"X-Info":"é".repeat(13000)}}),handler,controls())).status).toBe(431);expect(calls).toBe(0);
});
test("auth requests enforce bytes while streaming, even with lying content length and multibyte input",async()=>{
 let calls=0;const r=await handleAuthGateway(new Request(origin+"/api/auth/sign-in/email",{method:"POST",headers:{Origin:origin,"content-type":"application/json","content-length":"1"},body:JSON.stringify({email:"test@example.invalid",password:"é".repeat(11000)})}),{authBaseUrl:"https://auth.example/neondb/auth",publicOrigin:origin},(async()=>{calls++;return Response.json({})}) as typeof fetch);expect(r.status).toBe(413);expect(calls).toBe(0);
 const req=new Request(origin,{method:"POST",body:"éé"});await expect(boundedRequestText(req,3)).rejects.toBeInstanceOf(RequestBodyTooLarge);
});
test("stalled streams are cancelled at the body deadline",async()=>{
 let cancelled=false;const stream=new ReadableStream<Uint8Array>({start(){},cancel(){cancelled=true}});const req=new Request(origin,{method:"POST",body:stream,duplex:"half"} as RequestInit);await expect(boundedRequestText(req,100,15)).rejects.toBeInstanceOf(RequestBodyTimeout);expect(cancelled).toBe(true);
});
test("maintenance leaves health honest and protected calls blocked without DB/provider work",async()=>{
 const env={HSI_DATABASE_URL:"postgresql://fixture:unused@ep-sweet-hill-zasb0lni.c-2.eu-west-2.aws.neon.tech/neondb",HSI_NEON_PROJECT_ID:"red-wave-06625195",HSI_AUTH_BASE_URL:"https://auth.example/neondb/auth",HSI_PUBLIC_ORIGIN:origin,HSI_RESEARCH_MAINTENANCE:"true"};const deps={controls:controls(),transport:(async()=>{throw Error("Must not call provider")}) as typeof fetch};const health=await handleVercelResearch(new Request(origin+"/api/research/health"),env,deps);expect(health.status).toBe(503);expect(await health.json()).toMatchObject({status:"maintenance",databaseConnectionTested:false,maintenance:true});expect((await handleVercelResearch(request(),env,deps)).status).toBe(503);
 expect((await handleVercelResearch(request(),{HSI_PILOT_REQUIRE_SHARED_LIMITER:"true"},deps)).status).toBe(503);
});
function temp<T>(fn:(d:string)=>T){const d=mkdtempSync(join(tmpdir(),"hsi-h-test-"));try{return fn(d)}finally{rmSync(d,{recursive:true,force:true})}}
test("public artifact recovery reproduces bytes and semantics without restoring accounts/database",async()=>{
 const report=await runPublicArtifactRecoveryDrill(process.cwd(),"a".repeat(40));expect(report.status).toBe("local_artifact_drill_passed");expect(report.filesVerified).toBe(6);expect(report.semantics).toMatchObject({sources:2,passages:8,claims:0});expect(report.databaseRestoreVerified).toBe(false);expect(report.accountIsolationVerified).toBe(false);expect(report.canonicalFilesChanged).toBe(false);
});
test("recovery refuses tampering, unknown/private paths, duplicate files and changed independent pin",()=>{
 const b=createPublicArtifactRecoveryBundle(process.cwd(),"a".repeat(40));for(const mutate of [(x:any)=>x.files[0].content="tampered",(x:any)=>x.files[0].path=".env.local",(x:any)=>x.files[0].path="../secret",(x:any)=>x.files[0].path=x.files[1].path,(x:any)=>x.scope="database_backup"]){const bad=structuredClone(b);mutate(bad);expect(()=>verifyPublicArtifactRecoveryBundle(bad,b.bundleHash)).toThrow()}
 expect(()=>verifyPublicArtifactRecoveryBundle(b,"f".repeat(64))).toThrow("pin");
});
test("restore refuses existing destinations and validates everything before any extraction",()=>temp(d=>{
 const b=createPublicArtifactRecoveryBundle(process.cwd(),"a".repeat(40)),existing=join(d,"existing");mkdirSync(existing);writeFileSync(join(existing,"sentinel"),"keep");expect(()=>restorePublicArtifactRecoveryBundle(b,b.bundleHash,existing)).toThrow();expect(readFileSync(join(existing,"sentinel"),"utf8")).toBe("keep");const bad=structuredClone(b);bad.files[0]!.content="tampered";const destination=join(d,"never-created");expect(()=>restorePublicArtifactRecoveryBundle(bad,b.bundleHash,destination)).toThrow();expect(existsSync(destination)).toBe(false);
}));
test("pilot evidence begins unassigned and cannot be self-approved through JSON",()=>{
 const r=assessResearchPilotReadiness(pending);expect(r.pilotReady).toBe(false);expect(r.gates).toHaveLength(13);expect(r.gates.every(g=>g.ownerRef===null&&g.trustedAcceptanceVerified===false)).toBe(true);expect(()=>parsePilotEvidence({...pending,pilotReady:true})).toThrow();const bad=structuredClone(pending);(bad.records[0] as any).status="passed";expect(()=>parsePilotEvidence(bad)).toThrow("approval");
});
test("even complete operator-reported receipts remain unverified and cannot activate a pilot",()=>{
 const e=structuredClone(pending);for(const r of e.records){r.status="operator_reported_unverified";(r as any).ownerRef="ops:test-only";(r as any).evidenceRef="record:test-only";(r as any).evidenceSha256="a".repeat(64)}const r=assessResearchPilotReadiness(e);expect(r.pilotReady).toBe(false);expect(r.operatorEvidenceAuthenticated).toBe(false);expect(r.scientificApprovalGranted).toBe(false);
});
test("readiness evidence rejects missing gates, secret URLs and identity-shaped free text",()=>{
 const e=structuredClone(pending);e.records.pop();expect(()=>parsePilotEvidence(e)).toThrow("exactly once");const bad=structuredClone(pending);Object.assign(bad.records[0]!,{status:"operator_reported_unverified",ownerRef:"ops:test-only",evidenceRef:"https://secret.invalid/?token=secret",evidenceSha256:"a".repeat(64)});expect(()=>parsePilotEvidence(bad)).toThrow("secret URLs");
});
test("stalled shared admission cannot occupy a process slot indefinitely",async()=>{
 const admission=createResearchProcessAdmission({maxConcurrent:1});let calls=0;const r=await withResearchRequestControls(request(),async()=>{calls++;return Response.json({})},{processAdmission:admission,requireShared:true,sharedAdmission:async()=>new Promise(()=>{})});expect(r.status).toBe(503);expect(calls).toBe(0);expect(admission.enter("research_read").allowed).toBe(true);
});
