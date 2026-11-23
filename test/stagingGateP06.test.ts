/** The P0.6 staging gate: a passing run against a correct implementation, a failing run for every deliberately broken one (so a pass means
 * something), BLOCKED when anything is missing (and nothing sent), honest INCONCLUSIVE, no secrets in evidence, and tamper-evident evidence.
 * Rehearsal only: these tests run the gate against an in-process fake. They say nothing about any staging environment. */
import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {GATE_ACTORS,GATE_PLAN,MANDATE_ITEMS,gatePreflight,runStagingGate,verifyGateEvidence,type GateConfig,type GateEvidence} from "../src/ops/stagingGate";
import {createGateRehearsal,REHEARSAL_ORIGIN,type GateFault} from "../src/ops/stagingGateRehearsal";
import {hashHsiCheckpointInput} from "../src/hsiAgentDurableCheckpoint";

const dirs:string[]=[];afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const rehearse=(o:{fault?:GateFault;inspector?:boolean;revoke?:boolean}={})=>createGateRehearsal({...o,dirs});
const outcome=(e:GateEvidence,id:string)=>e.checks.find(c=>c.id===id)!.outcome;
const failedIds=(e:GateEvidence)=>e.checks.filter(c=>c.outcome==="failed").map(c=>c.id);
const rehash=(e:GateEvidence):GateEvidence=>{const {contentHash:_,...b}=e;return {...e,contentHash:hashHsiCheckpointInput(b)}};
const counting=(g:ReturnType<typeof rehearse>)=>{let n=0;return {n:()=>n,config:(over:Partial<GateConfig>={})=>g.config({transport:r=>{n++;return g.transport(r)},...over})}};

/* ---------- the gate passes against a correct implementation ---------- */
test("against the correct implementation every check passes with its controls; only graph and evidence access is outside the profile",async()=>{
 const g=rehearse();const e=await runStagingGate(g.config());
 expect(e.verdict).toBe("PASSED_PENDING_SIGNOFF");expect(e.mode).toBe("rehearsal");
 expect(e.checks.map(c=>c.id)).toEqual(GATE_PLAN.map(s=>s.id));
 for(const c of e.checks)expect([c.id,c.outcome]).toEqual([c.id,c.id==="unauthorised_graph_or_evidence_access"?"not_covered":"passed"]);
 expect(e.mandateCoverage.notCovered).toEqual(["Unauthorised graph or evidence access is denied"]);
 expect(e.mandateCoverage.covered.length+e.mandateCoverage.notCovered.length).toBe(MANDATE_ITEMS.length);
 expect(e).toMatchObject({accepted:false,mandateComplete:false,productionUntouched:true,securitySignoffRequired:true,scientificApproval:false,blockers:[]});
 expect(e.note).toContain("REHEARSAL");expect(verifyGateEvidence(e)).toEqual(e);
});
test("the controls are real: every denial check names a control that passed, and the owner could still read and export at the end",async()=>{
 const g=rehearse();const e=await runStagingGate(g.config());
 for(const s of GATE_PLAN)for(const r of s.requires)expect([s.id,r,outcome(e,r)]).toEqual([s.id,r,"passed"]);
 const obs=e.observations;
 expect(obs.find(o=>o.stepId==="a_reopen_after")!.status).toBe(200);expect(obs.find(o=>o.stepId==="a_export_after")!.status).toBe(200);
 expect(obs.filter(o=>o.stepId.startsWith("b_")||o.stepId.startsWith("c_")).filter(o=>o.stepId!=="b_health").every(o=>o.status===404)).toBe(true);
});
test("denials are compared to an unknown run, not just to a status code: B's refusal has the same body digest as a run that does not exist",async()=>{
 const g=rehearse();const e=await runStagingGate(g.config());
 const d=(id:string)=>e.observations.find(o=>o.stepId===id)!.bodySha256;
 expect(d("b_read")).toBe(d("ref_unknown_read"));expect(d("b_export")).toBe(d("ref_unknown_export"));expect(d("b_start_on_a")).toBe(d("ref_unknown_start"));expect(d("c_read")).toBe(d("ref_unknown_read"));
});

/* ---------- the gate FAILS when isolation is broken ---------- */
const FAULT_EXPECT:[GateFault,string[]][]=[
 ["leak_read",["b_cannot_read"]],["leak_export",["b_cannot_export"]],
 ["distinguishable_denial",["b_cannot_read","b_cannot_export","b_cannot_modify","c_cross_org_denied"]],
 ["revocation_ignored",["revoked_session_denied"]],["duplicate_rows",["retry_no_duplicate_rows"]],["audit_wrong_owner",["audit_preserves_ownership"]],
 ["cross_origin_accepted",["cross_origin_post_refused"]],["anonymous_allowed",["anonymous_denied"]],["health_leaks_counts",["health_is_coarse"]],["retry_not_idempotent",["retry_idempotent"]],["distinguishable_body",["b_cannot_read","b_cannot_export","b_cannot_modify","c_cross_org_denied"]],["retry_reports_created",["retry_idempotent"]],["missing_origin_accepted",["cross_origin_post_refused"]],["refs_not_distinct",["audit_preserves_ownership"]],["anonymous_403",["anonymous_denied"]],["owner_export_broken",["a_reopens_after"]],
];
for(const [fault,expected] of FAULT_EXPECT)test(`SENSITIVITY: with the fault "${fault}" the gate FAILS and names ${expected.join(", ")}`,async()=>{
 const g=rehearse({fault});const e=await runStagingGate(g.config());
 expect(e.verdict).toBe("FAILED");
 for(const id of expected)expect([fault,id,outcome(e,id)]).toEqual([fault,id,"failed"]);
 expect(outcome(e,"a_creates")).toBe("passed"); // a broken check is not a broken environment
 verifyGateEvidence(e);
});
test("every plan check that can fail is covered by at least one fault, so no check is untested",()=>{
 const covered=new Set(FAULT_EXPECT.flatMap(([,ids])=>ids));
 const needFault=GATE_PLAN.filter(s=>!s.control&&s.id!=="unauthorised_graph_or_evidence_access"&&s.id!=="b_wrote_nothing").map(s=>s.id);
 expect(needFault.filter(id=>!covered.has(id))).toEqual([]);
});

/* ---------- BLOCKED: nothing is sent ---------- */
test("BLOCKED: a configuration missing its prerequisites sends nothing, reports each missing piece and marks every check blocked",async()=>{
 const g=rehearse();const c=counting(g);
 const e=await runStagingGate(c.config({mode:"staging",approvedOrigin:"https://staging.invalid",targetHash:"",commitSha:"zz",allowMutations:false,investigations:{a:"",unknown:""},terms:[],hooks:{} as never}));
 expect(c.n()).toBe(0);expect(e.verdict).toBe("BLOCKED");expect(e.observations).toEqual([]);expect(e.checks.every(x=>x.outcome==="blocked")).toBe(true);
 const codes=e.blockers.map(b=>b.code);
 for(const code of ["staging_origin_not_approved","target_hash_missing","commit_sha_missing","mutations_not_allowed","investigation_ids_missing","terms_invalid","session_provider_missing"])expect(codes).toContain(code);
 verifyGateEvidence(e);
});
test("BLOCKED, one prerequisite at a time: each produces its own code and sends nothing",async()=>{
 const cases:[string,(g:ReturnType<typeof rehearse>)=>Partial<GateConfig>][]=[
  ["origin_not_https",()=>({mode:"staging",origin:"http://rehearsal.hsi.invalid",approvedOrigin:"http://rehearsal.hsi.invalid"})],
  ["staging_origin_not_approved",()=>({mode:"staging",approvedOrigin:"https://other.invalid"})],
  ["origin_is_production_or_unlisted",()=>({mode:"staging",productionOrigins:[REHEARSAL_ORIGIN]})],
  ["origin_is_production_or_unlisted",()=>({mode:"staging",productionOrigins:[]})],
  ["target_hash_missing",()=>({targetHash:"nope"})],["commit_sha_missing",()=>({commitSha:"abc"})],["mutations_not_allowed",()=>({allowMutations:false})],
  ["investigation_ids_missing",()=>({investigations:{a:"inv-a",unknown:"inv-a"}})],["terms_invalid",()=>({terms:Array(9).fill("x")})],
  ["transport_missing",()=>({transport:undefined as never})],["session_unavailable_researcher_b",g=>({hooks:{...g.hooks,session:async a=>a==="researcher_b"?null:g.hooks.session(a)}})],
  ["session_unavailable_researcher_c_other_org",g=>({hooks:{...g.hooks,session:async a=>{if(a==="researcher_c_other_org")throw Error("provider down");return g.hooks.session(a)}}})],
  ["session_reused_researcher_b",g=>({hooks:{...g.hooks,session:async a=>a==="researcher_b"?g.hooks.session("researcher_a"):g.hooks.session(a)}})],
  ["anonymous_not_null",g=>({hooks:{...g.hooks,session:async a=>a==="anonymous"?"session=x-0123456789ab":g.hooks.session(a)}})],
 ];
 for(const [code,over] of cases){
  const g=rehearse();const c=counting(g);const e=await runStagingGate(c.config(over(g)));
  expect([code,c.n(),e.verdict,e.blockers.map(b=>b.code).includes(code)]).toEqual([code,0,"BLOCKED",true]);
 }
});
test("a staging run cannot be pointed at a production origin, and a rehearsal cannot pass for staging",async()=>{
 const g=rehearse();
 const prod=await runStagingGate(g.config({mode:"staging",origin:"https://humansuperintelligence.tech",approvedOrigin:"https://humansuperintelligence.tech",productionOrigins:["https://humansuperintelligence.tech"]}));
 expect(prod.verdict).toBe("BLOCKED");expect(prod.blockers.map(b=>b.code)).toContain("origin_is_production_or_unlisted");expect(prod.observations).toEqual([]);
 const e=await runStagingGate(g.config());expect(e.mode).toBe("rehearsal");expect(() =>verifyGateEvidence({...e,mode:"staging"})).toThrow(); // relabelling breaks the hash
});

/* ---------- INCONCLUSIVE: not established is not passed ---------- */
test("without an inspector the store-level checks are BLOCKED and the verdict is INCONCLUSIVE, never a pass",async()=>{
 const g=rehearse({inspector:false});const e=await runStagingGate(g.config());
 for(const id of ["b_wrote_nothing","retry_no_duplicate_rows","audit_preserves_ownership"])expect(outcome(e,id)).toBe("blocked");
 expect(e.verdict).toBe("INCONCLUSIVE");expect(failedIds(e)).toEqual([]);expect(outcome(e,"b_cannot_read")).toBe("passed");
});
test("without a revocation hook that check is BLOCKED; without waiting for completion audit and export are inconclusive",async()=>{
 const e1=await runStagingGate(rehearse({revoke:false}).config());expect(outcome(e1,"revoked_session_denied")).toBe("blocked");expect(e1.verdict).toBe("INCONCLUSIVE");
 const g=rehearse();const e2=await runStagingGate(g.config({waitForCompletionMs:0,hooks:{...g.hooks,advance:undefined}}));
 expect(outcome(e2,"audit_preserves_ownership")).toBe("inconclusive");expect(outcome(e2,"a_reopens_after")).toBe("inconclusive");expect(e2.verdict).toBe("INCONCLUSIVE");
});
test("if the revocation control fails (the second session is already invalid), that check is INCONCLUSIVE, not passed",async()=>{
 const g=rehearse();g.sessions.delete("token-rehearsal-a2-0123456789");
 const e=await runStagingGate(g.config());
 expect(outcome(e,"revoked_session_denied")).toBe("inconclusive");expect(e.verdict).toBe("INCONCLUSIVE");
});
test("a denial without a working control proves nothing: if A cannot read their own run, B's refusal is INCONCLUSIVE, not passed",async()=>{
 const g=rehearse();
 // A cannot read the run, so it can never be seen to complete: keep the completion wait short instead of spending the default 5 s
 const e=await runStagingGate(g.config({waitForCompletionMs:100,transport:async r=>{const res=await g.transport(r);return /jobs\/fl-/.test(r.url)&&(r.headers.get("cookie")??"").includes("token-rehearsal-a-")&&r.method==="GET"?new Response("{}",{status:500}):res}}));
 expect(outcome(e,"a_reopens_before")).toBe("failed");
 for(const id of ["b_cannot_read","b_cannot_export","c_cross_org_denied","revoked_session_denied"])expect([id,outcome(e,id)]).toEqual([id,"inconclusive"]);
 expect(e.verdict).toBe("FAILED");
});
test("a transport that fails or times out is recorded as a null status, never as a pass",async()=>{
 const g=rehearse();
 const e=await runStagingGate(g.config({timeoutMs:50,transport:()=>new Promise<Response>(()=>{})}));
 expect(e.verdict).toBe("FAILED");expect(outcome(e,"a_creates")).toBe("failed");expect(e.observations[0]!.status).toBeNull();
 const e2=await runStagingGate(g.config({transport:async()=>{throw Error("network down with a secret detail")}}));
 expect(e2.verdict).toBe("FAILED");expect(JSON.stringify(e2)).not.toContain("secret detail");
 const e3=await runStagingGate(g.config({transport:async r=>{const x=await g.transport(r);return Object.defineProperty(x,"redirected",{value:true})}}));
 expect(e3.observations.every(o=>o.status===null)).toBe(true);
});

/* ---------- evidence hygiene ---------- */
test("evidence holds no cookie, token, id, request body or response body",async()=>{
 const g=rehearse();const e=await runStagingGate(g.config());const text=JSON.stringify(e);
 for(const secret of ["token-rehearsal","session=","cookie"])expect(text.toLowerCase()).not.toContain(secret);
 expect(text.replace(/fl-0{16}/g,"")).not.toMatch(/fl-[a-f0-9]{16}|inv-a|inv-b|inv-c|subject-|org-\d|\[FIXTURE\]/);
 for(const o of e.observations){expect(Object.keys(o).sort()).toEqual(["actor","bodySha256","keys","method","pathTemplate","status","stepId"]);expect(o.pathTemplate).toMatch(/^\/api\/research\/nexus\/(jobs(\/(<job-a>|fl-0{16})(\/brief)?)?|health)$/)}
 expect(e.originHost).toBe("rehearsal.hsi.invalid");
});
test("the runner refuses to emit evidence that contains a session value, however it got there",async()=>{
 const g=rehearse();
 await expect(runStagingGate(g.config({hooks:{...g.hooks,session:async a=>a==="anonymous"?null:a==="researcher_a"?"x=/api/research/nexus/jobs":g.hooks.session(a)}}))).rejects.toThrow("session value");
});
test("evidence is tamper-evident and its verdict must follow from its checks",async()=>{
 const g=rehearse();const e=await runStagingGate(g.config({}));
 const mut=(f:(x:GateEvidence)=>void)=>{const x=structuredClone(e);f(x);return x};
 expect(()=>verifyGateEvidence(mut(x=>{x.checks[2]!.outcome="failed"}))).toThrow("hash");
 expect(()=>verifyGateEvidence(rehash(mut(x=>{x.checks[2]!.outcome="failed"})))).toThrow("Verdict");            // a failed check cannot sit under a pass
 expect(()=>verifyGateEvidence(rehash(mut(x=>{x.checks[2]!.outcome="inconclusive"})))).toThrow("Verdict");
 for(const f of [(x:GateEvidence)=>{(x as {accepted:boolean}).accepted=true},(x:GateEvidence)=>{(x as {mandateComplete:boolean}).mandateComplete=true},(x:GateEvidence)=>{(x as {securitySignoffRequired:boolean}).securitySignoffRequired=false},(x:GateEvidence)=>{(x as {productionUntouched:boolean}).productionUntouched=false}])expect(()=>verifyGateEvidence(rehash(mut(f)))).toThrow("flags");
 expect(()=>verifyGateEvidence(rehash(mut(x=>{x.checks.pop()})))).toThrow("plan");
 expect(()=>verifyGateEvidence(rehash(mut(x=>{x.checks.reverse()})))).toThrow("plan");
 expect(()=>verifyGateEvidence(rehash(mut(x=>{x.verdict="FAILED"})))).toThrow("Verdict");
 expect(()=>verifyGateEvidence(rehash(mut(x=>{x.blockers=[{code:"x",detail:"y"}];x.verdict="BLOCKED"})))).toThrow("blocked run");
 expect(()=>verifyGateEvidence(null)).toThrow();expect(()=>verifyGateEvidence({...e,schemaVersion:"x"})).toThrow();
});
test("a pass cannot be assembled from an unresolved check even with a recomputed hash",async()=>{
 const e=await runStagingGate(rehearse({inspector:false}).config());expect(e.verdict).toBe("INCONCLUSIVE");
 const forged=structuredClone(e);forged.verdict="PASSED_PENDING_SIGNOFF";
 expect(()=>verifyGateEvidence(rehash(forged))).toThrow("Verdict");
});

/* ---------- the plan, the document and the code agree ---------- */
test("the plan document lists every check and every mandate item, and the runner produces exactly the plan",async()=>{
 const doc=readFileSync("docs/engineering/STAGING_GATE_P06.md","utf8");
 for(const s of GATE_PLAN)expect([s.id,doc.includes("`"+s.id+"`")]).toEqual([s.id,true]);
 for(const m of MANDATE_ITEMS)expect([m,doc.includes(m)]).toEqual([m,true]);
 const e=await runStagingGate(rehearse().config());expect(e.checks.map(c=>c.id)).toEqual(GATE_PLAN.map(s=>s.id));
 for(const a of GATE_ACTORS)expect(doc).toContain(a);
});
test("source scan: the gate reads no environment, opens no connection of its own and spawns nothing",()=>{
 const src=readFileSync("src/ops/stagingGate.ts","utf8").replace(/\/\*\*[\s\S]*?\*\//g,"");
 expect(/process\.env|(^|[^.\w])fetch\s*\(|child_process|execSync|spawn|writeFile|readFile|node:net|node:http/.test(src)).toBe(false);
});

/* ---------- the CLI ---------- */
const cli=(...a:string[])=>{const r=Bun.spawnSync(["bun","scripts/staging-gate-p06.ts",...a],{cwd:join(import.meta.dir,".."),env:{PATH:process.env.PATH??"",HOME:process.env.HOME??""},stdout:"pipe",stderr:"pipe"});return {code:r.exitCode,out:r.stdout.toString(),err:r.stderr.toString()}};
test("CLI: plan prints the checks; preflight with nothing configured is BLOCKED (exit 3) and sends nothing",()=>{
 const p=cli("--plan");expect(p.code).toBe(0);expect(JSON.parse(p.out).plan.map((x:{id:string})=>x.id)).toEqual(GATE_PLAN.map(s=>s.id));
 const pre=cli("--preflight");expect(pre.code).toBe(3);const j=JSON.parse(pre.out);expect(j).toMatchObject({verdict:"BLOCKED",sent:0});expect(j.blockers.length).toBeGreaterThan(5);
 const st=cli("--staging");expect(st.code).toBe(3);const ev=JSON.parse(st.out);expect(ev).toMatchObject({verdict:"BLOCKED",mode:"staging",observations:[]});verifyGateEvidence(ev);
 expect(cli().code).toBe(64);expect(cli("--rehearse","--fault","nope").code).toBe(64);
});
test("CLI: a staging run with a relative or missing hooks module, or a production origin, is BLOCKED and sends nothing",()=>{
 const base={HSI_GATE_ORIGIN:"https://staging.invalid",HSI_GATE_APPROVED_ORIGIN:"https://staging.invalid",HSI_GATE_PRODUCTION_ORIGINS:"https://humansuperintelligence.tech",HSI_GATE_TARGET_HASH:"a".repeat(64),HSI_GATE_COMMIT_SHA:"b".repeat(40),HSI_GATE_INVESTIGATION_A:"inv-a",HSI_GATE_INVESTIGATION_UNKNOWN:"inv-nope",HSI_GATE_TERMS:"x",HSI_GATE_ALLOW_MUTATIONS:"1"};
 const run=(extra:Record<string,string|undefined>)=>{const r=Bun.spawnSync(["bun","scripts/staging-gate-p06.ts","--staging"],{cwd:join(import.meta.dir,".."),env:{PATH:process.env.PATH??"",HOME:process.env.HOME??"",...base,...(extra as Record<string,string>)},stdout:"pipe",stderr:"pipe"});return {code:r.exitCode,ev:JSON.parse(r.stdout.toString()) as GateEvidence}};
 for(const extra of [{HSI_GATE_HOOKS_MODULE:"relative/hooks.ts"},{HSI_GATE_HOOKS_MODULE:"/does/not/exist.ts"},{HSI_GATE_HOOKS_MODULE:"/tmp/../etc/x.ts"},{}]){const r=run(extra);expect(r.code).toBe(3);expect(r.ev.blockers.map(b=>b.code)).toContain("session_provider_missing");expect(r.ev.observations).toEqual([])}
 const prod=run({HSI_GATE_ORIGIN:"https://humansuperintelligence.tech",HSI_GATE_APPROVED_ORIGIN:"https://humansuperintelligence.tech",HSI_GATE_PRODUCTION_ORIGINS:"https://humansuperintelligence.tech"});
 expect(prod.code).toBe(3);expect(prod.ev.blockers.map(b=>b.code)).toContain("origin_is_production_or_unlisted");
});
test("CLI: a rehearsal passes with exit 0 and says it is a rehearsal; a faulted one fails with exit 1; --out refuses to overwrite",()=>{
 const ok=cli("--rehearse");expect(ok.code).toBe(0);const ev=JSON.parse(ok.out) as GateEvidence;expect(ev).toMatchObject({verdict:"PASSED_PENDING_SIGNOFF",mode:"rehearsal"});verifyGateEvidence(ev);
 const bad=cli("--rehearse","--fault","revocation_ignored");expect(bad.code).toBe(1);expect(failedIds(JSON.parse(bad.out))).toContain("revoked_session_denied");
 const tmp=mkdtempSync(join(tmpdir(),"hsi-gate-out-"));dirs.push(tmp);const file=join(tmp,"evidence.json");
 expect(cli("--rehearse","--out",file).code).toBe(0);expect(verifyGateEvidence(JSON.parse(readFileSync(file,"utf8"))).mode).toBe("rehearsal");
 expect(cli("--rehearse","--out",file).code).not.toBe(0);
});
test("preflight alone never sends and never needs the network: it reports the session accounts it would use as distinct or not",async()=>{
 const g=rehearse();expect(await gatePreflight(g.config())).toEqual([]);
 expect(await gatePreflight(g.config({mode:"staging"}))).toEqual([]); // the rehearsal origin is https, approved and not a production origin
 expect((await gatePreflight(g.config({mode:"staging",origin:"http://rehearsal.hsi.invalid",approvedOrigin:"http://rehearsal.hsi.invalid"}))).map(b=>b.code)).toEqual(["origin_not_https"]);
});
