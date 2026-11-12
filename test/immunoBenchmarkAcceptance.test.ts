import {test,expect} from "bun:test";
import {fixtureCases,fixturePolicy,TEST_GOLD,hash,observation} from "./fixtures/immunoBenchmark";
import {prepareImmunoFreeze,buildImmunoProtocol,benchmarkDigest} from "../src/evidence/immunoBenchmark";
import {validateImmunoThresholds,authorizeImmunoLockedRun,createImmunoLockedEvaluator,assessImmunoAcceptance,type ImmunoRunLock} from "../src/evidence/immunoBenchmarkAcceptance";
import {IMMUNO_CONFIGURATIONS,reportImmunoEvaluation} from "../src/evidence/immunoBenchmarkScoring";
async function setup(){
 const cases=fixtureCases(),policy=fixturePolicy(cases),freeze=await prepareImmunoFreeze({cases,protocolHash:buildImmunoProtocol().protocolHash,rubricHash:hash("rubric"),thresholdPolicyHash:benchmarkDigest(policy),disputeRuleHash:hash("dispute"),contaminationReceiptHash:hash("scan")},{loadGold:async()=>TEST_GOLD,expertReview:async()=>true,sourceUse:async()=>true,approveProtocol:async()=>true});
 const lock:ImmunoRunLock={freezeHash:freeze.freezeHash,thresholdPolicyHash:freeze.thresholdPolicyHash,retrievalPolicyHash:hash("retrieval"),budgetPolicyHash:hash("budget"),approvalReceiptHash:hash("approval"),lockedAt:"2026-11-12T12:00:00Z",executionNotBefore:"2026-11-12T13:00:00Z",configurations:Object.fromEntries(IMMUNO_CONFIGURATIONS.map(c=>[c,{deploymentRef:"TEST_ONLY_"+c,configurationHash:hash(c)}])) as ImmunoRunLock["configurations"]};
 return {cases,policy,freeze,lock};
}
test("preregistration requires eight overall floors and explicit subgroup/risk applicability",()=>{
 const c=fixtureCases(),p=fixturePolicy(c);validateImmunoThresholds(p,c.slice(0,120));p.scopes[0]!.metrics.pop();expect(()=>validateImmunoThresholds(p,c.slice(0,120))).toThrow("Eight");const q=fixturePolicy(c);q.scopes.pop();expect(()=>validateImmunoThresholds(q,c.slice(0,120))).toThrow("Every risk");
});
test("mutated cases, rubric thresholds, freeze or missing live approval dispatch zero evaluations",async()=>{
 const v=await setup();let calls=0;const deps={authorize:async()=>false,evaluate:async()=>{calls++;return {}},assess:async()=>{throw Error()},verifyAssessment:async()=>true};
 await expect(createImmunoLockedEvaluator(deps).run(v,new AbortController().signal)).rejects.toThrow("disabled");await expect(createImmunoLockedEvaluator({...deps,enabled:true}).run(v,new AbortController().signal)).rejects.toThrow("independently verified");
 const changed=structuredClone(v);changed.cases[0]!.estimand="altered";await expect(authorizeImmunoLockedRun(changed,async()=>true)).rejects.toThrow("changed");const changedPolicy=structuredClone(v);changedPolicy.policy.scopes[0]!.metrics[0]!.minimum=2;await expect(authorizeImmunoLockedRun(changedPolicy,async()=>true)).rejects.toThrow("changed");expect(calls).toBe(0);
});
test("locked evaluator whitelists task fields and never passes gold/expected answers/annotations to model callback",async()=>{
 const v=await setup();let calls=0;const controller=new AbortController();
 const runner=createImmunoLockedEvaluator({enabled:true,authorize:async()=>true,now:()=>Date.parse("2026-11-12T14:00:00Z"),evaluate:async task=>{calls++;expect(Object.keys(task).sort()).toEqual(["caseId","question","taskType","configuration","configurationHash","retrievalPolicyHash","budgetPolicyHash","freezeHash"].sort());expect(JSON.stringify(task)).not.toContain(TEST_GOLD.rationale);controller.abort();return {}},assess:async()=>{throw Error("must not assess after cancel")},verifyAssessment:async()=>true});
 await expect(runner.run(v,controller.signal)).rejects.toThrow("cancelled");expect(calls).toBe(1);
});
test("high quality scores cannot hide hard gate failures or missing configurations/cases",async()=>{
 const v=await setup(),cases=v.cases.filter(c=>c.partition==="held_out"),row=observation(cases[0]!);row.scores.retrieval=5;row.failures=[{kind:"isolation",critical:true,code:"TEST_ONLY_ISOLATION"}];
 const report=await reportImmunoEvaluation(cases,[row],{verifyAssessment:async()=>true});const result=await assessImmunoAcceptance({report,policy:v.policy,cases,freeze:v.freeze},async()=>true);expect(result.engineeringCriteriaMet).toBe(false);expect(result.blockers.some(s=>s.includes("hard-gate"))).toBe(true);expect(result.blockers.some(s=>s.includes("missing case"))).toBe(true);expect(result.scientificApproval).toBe(false);
 await expect(assessImmunoAcceptance({report,policy:v.policy,cases,freeze:v.freeze},async()=>false)).rejects.toThrow("Independent");
});

test("global deadline fences a stalled authority before any model dispatch",async()=>{
 const v=await setup();let calls=0;
 const runner=createImmunoLockedEvaluator({enabled:true,timeoutMs:1000,authorize:async()=>new Promise<boolean>(()=>{}),evaluate:async()=>{calls++;return {}},assess:async()=>{throw Error()},verifyAssessment:async()=>true});
 await expect(runner.run(v,new AbortController().signal)).rejects.toThrow();expect(calls).toBe(0);
});
test("provider failures remain accounted for without invented observations, raw errors or automatic retries",async()=>{
 const v=await setup();let calls=0;const runner=createImmunoLockedEvaluator({enabled:true,authorize:async()=>true,now:()=>Date.parse("2026-11-12T14:00:00Z"),evaluate:async()=>{calls++;throw Error("SECRET_TEST_ERROR_MUST_NOT_EXPORT")},assess:async()=>{throw Error("must not assess unknown completion")},verifyAssessment:async()=>true});
 const r=await runner.run(v,new AbortController().signal);expect(calls).toBe(360);for(const arm of r.configurations){expect(arm.executionFailures).toHaveLength(120);expect(arm.missingCaseIds).toHaveLength(120);expect(arm.overall.caseCount).toBe(0)}expect(JSON.stringify(r)).not.toContain("SECRET_TEST_ERROR");expect(r.scientificApproval).toBe(false);
});
