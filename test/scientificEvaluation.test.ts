import {describe,test,expect} from "bun:test";
import {createHash} from "node:crypto";
import datasetFile from "../evaluation/phase-e/engineering-cases.json";
import labelsFile from "../evaluation/phase-e/sme-labels.pending.json";
import {canonicalGraphContext} from "../src/investigationGraphContext";
import {baselineRun,evaluateRun,assessThresholdProposal,EMPTY_THRESHOLDS,buildSourceSelectionRequest,compareEvaluationReports,assertEvaluationSeparation,emptyLabelPacket,datasetHash,deterministicAssistance,parseAssistanceOutput,assistanceFromReviewPackage,EVALUATION_CATEGORIES,type EvaluationDataset,type LabelPacket} from "../src/scientificEvaluation";
import {deliveryHarness} from "./fixtures/deliveryHarness";
const dataset=datasetFile as EvaluationDataset,labels=labelsFile as LabelPacket;
const hash=async(s:string)=>createHash("sha256").update(s).digest("hex");
const clone=<T>(x:T):T=>structuredClone(x);
describe("Phase E bounded scientific evaluation",()=>{
 test("versioned fixtures cover every category but have no fabricated SME labels",async()=>{
  expect(new Set(dataset.cases.map(c=>c.category))).toEqual(new Set(EVALUATION_CATEGORIES));
  expect(await emptyLabelPacket(dataset,hash)).toEqual(labels);
  const run=await baselineRun(dataset,hash),report=await evaluateRun(dataset,run,labels,hash);
  expect(report.labelledCases).toBe(0);expect(report.metrics.outcomeAccuracy).toBeNull();expect(report.metrics.abstentionAccuracy).toBeNull();expect(report.metrics.requiredClaimRecall).toBeNull();expect(report.metrics.citationCorrectness).toBe(1);expect(report.metrics.unsupportedClaims).toBe(0);expect(report.metrics.structuralFailures).toBe(0);expect(report.modelActivationAllowed).toBe(false);expect(report.scientificValidityEstablished).toBe(false);
 });
 test("baseline preserves conflict and abstains on missing, unreviewed, wrong context, unclear rights and instructions",async()=>{
  const results=(await baselineRun(dataset,hash)).results;
  expect(results.find(r=>r.caseId==="conflicting")!.output.outcome).toBe("conflicting_sources");
  expect(results.find(r=>r.caseId==="supported-one")!.output.outcome).toBe("source_summary");
  for(const id of ["unassessed","unreviewed","wrong-disease","wrong-species","no-evidence","rights-not-cleared","opposing-only","question-instruction","source-instruction"])expect(results.find(r=>r.caseId===id)!.output).toMatchObject({outcome:"abstain",selections:[]});
 });
 test("plausible citation with fabricated statement is counted unsupported",async()=>{
  const run=await baselineRun(dataset,hash);run.results[0]!.output.selections[0]!.statement="A fabricated causal finding";
  const report=await evaluateRun(dataset,run,labels,hash);expect(report.metrics.citationCorrectness).toBe(1);expect(report.metrics.unsupportedClaims).toBe(1);expect(report.modelActivationAllowed).toBe(false);
 });
 test("wrong quote and forged hash fail citation scoring, even with valid claim id",async()=>{
  const run=await baselineRun(dataset,hash);run.results[0]!.output.selections[0]!.quote="An altered source excerpt";run.results[0]!.output.selections[0]!.passageHash="f".repeat(64);
  const report=await evaluateRun(dataset,run,labels,hash);expect(report.metrics.unsupportedClaims).toBe(1);expect(report.metrics.citationCorrectness).toBeLessThan(1);
 });
 test("unanswered cases and duplicate cases cannot disappear from denominator",async()=>{
  for(const mode of ["missing","duplicate"]){const run=await baselineRun(dataset,hash);if(mode==="missing")run.results.pop();else run.results[1]=clone(run.results[0]!);await expect(evaluateRun(dataset,run,labels,hash)).rejects.toThrow("exactly once")}
 });
 test("dataset, source and label drift are rejected",async()=>{
  const run=await baselineRun(dataset,hash),changed=clone(dataset);changed.cases[0]!.input.evidence[0]!.quote="Changed passage";await expect(datasetHash(changed,hash)).rejects.toThrow("hash mismatch");
  const wrong=clone(labels);wrong.rows[0]!.caseHash="f".repeat(64);await expect(evaluateRun(dataset,run,wrong,hash)).rejects.toThrow("binding");run.datasetHash="f".repeat(64);await expect(evaluateRun(dataset,run,labels,hash)).rejects.toThrow("binding mismatch");
 });
 test("non-finite or negative latency and fabricated free telemetry fields are rejected",async()=>{
  for(const latency of [NaN,-1,Infinity]){const run=await baselineRun(dataset,hash);run.results[0]!.latencyMs=latency;await expect(evaluateRun(dataset,run,labels,hash)).rejects.toThrow("telemetry")}
  const run=await baselineRun(dataset,hash);run.results[0]!.costUsd=-1;await expect(evaluateRun(dataset,run,labels,hash)).rejects.toThrow("telemetry");
 });
 test("unknown cost is not reported as free; unsupported outcomes fail structure",async()=>{
  const run=await baselineRun(dataset,hash);run.results[0]!.costUsd=null;run.results[0]!.output.outcome="abstain";
  const report=await evaluateRun(dataset,run,labels,hash);expect(report.metrics.costUsd).toBeNull();expect(report.metrics.structuralFailures).toBe(1);
 });
 test("operator-imported labels compute metrics but cannot approve model activation",async()=>{
  const run=await baselineRun(dataset,hash),packet=clone(labels);packet.status="operator_supplied_unverified";
  for(const l of packet.rows){const o=run.results.find(r=>r.caseId===l.caseId)!.output;l.expectedOutcome=o.outcome;l.allowedClaimIds=[...new Set(o.selections.map(s=>s.claimId))];l.requiredClaimIds=[...l.allowedClaimIds];l.annotator="TEST-ONLY-ANNOTATOR";l.rationale="Engineering label test; this is not a genuine SME annotation."}
  const report=await evaluateRun(dataset,run,packet,hash);expect(report.metrics.outcomeAccuracy).toBe(1);expect(report.metrics.abstentionAccuracy).toBe(1);expect(report.metrics.requiredClaimRecall).toBe(1);expect(report.modelActivationAllowed).toBe(false);expect(report.measurementScope).toBe("engineering_fixture_only");
 });
 test("malformed/freeform candidate authority or duplicated citations rejected",()=>{
  const output=deterministicAssistance(dataset.cases[0]!.input);expect(()=>parseAssistanceOutput({...output,autoApprove:true})).toThrow();output.selections.push(clone(output.selections[0]!));expect(()=>parseAssistanceOutput(output)).toThrow("Duplicate");
 });
 test("package-based baseline is hash bound and excludes separate RA context",async()=>{
  const f=deliveryHarness(),v=await f.service.view("alice",f.initial.id),p=v.package!;
  const input=await assistanceFromReviewPackage(p,hash);expect(input.binding).toEqual({packageHash:p.packageHash,contextHash:p.context.contentHash});expect(input.evidence.every(e=>e.disease==="systemic_sclerosis")).toBe(true);expect(deterministicAssistance(input).outcome).toBe("source_summary");
  p.context.primary.bundle.passages[0]!.text="Tampered";await expect(assistanceFromReviewPackage(p,hash)).rejects.toThrow();
 });
 test("PHI markers are rejected and evidence/decisions remain unchanged",async()=>{
  const input=clone(dataset.cases[0]!.input);input.question="patient name: an identifying entry";expect(()=>deterministicAssistance(input)).toThrow("non-identifying");
  const before=canonicalGraphContext(dataset);await baselineRun(dataset,hash);expect(canonicalGraphContext(dataset)).toBe(before);
 });
});

test("product adapter request excludes instruction-like, wrong-context and unreviewed evidence",()=>{
 for(const id of ["wrong-disease","wrong-species","unreviewed","source-instruction","question-instruction"]){const c=dataset.cases.find(c=>c.id===id)!;const request=buildSourceSelectionRequest(c.input);expect(request.data.evidence).toHaveLength(0);expect(request.modelActivationAllowed).toBe(false)}
 const safe=buildSourceSelectionRequest(dataset.cases[0]!.input);expect(safe).not.toHaveProperty("actorPrincipal");expect(safe.data.evidence).toHaveLength(1);
});
test("comparison reports deltas only for identical bound cases and labels",async()=>{
 const run=await baselineRun(dataset,hash),a=await evaluateRun(dataset,run,labels,hash),b=structuredClone(a);b.metrics.unsupportedClaims=2;
 expect(compareEvaluationReports(a,b).deltas!.unsupportedClaims).toBe(2);expect(compareEvaluationReports(a,b).scientificSuperiorityEstablished).toBe(false);b.labelsHash="f".repeat(64);expect(()=>compareEvaluationReports(a,b)).toThrow("identical");
});
test("held-out checks reject publication and question leakage",async()=>{
 const held=clone(dataset);held.partition="held_out";await expect(assertEvaluationSeparation(dataset,held,hash)).rejects.toThrow("leakage");
 held.cases=held.cases.map((c,i)=>({...c,input:{...c.input,question:"Independent held-out fixture question "+i,evidence:c.input.evidence.map(e=>({...e,sourceId:"held-out-"+e.sourceId}))}}));await expect(assertEvaluationSeparation(dataset,held,hash)).resolves.toBeUndefined();
});

test("unset or unmeasurable threshold proposals never count as a passing scientific gate",async()=>{
 const r=await evaluateRun(dataset,await baselineRun(dataset,hash),labels,hash);
 expect(assessThresholdProposal(r,EMPTY_THRESHOLDS).allMeasuredProposalsMet).toBeNull();expect(()=>assessThresholdProposal(r,{...EMPTY_THRESHOLDS,status:"sme_approved"})).toThrow("unapproved");expect(()=>assessThresholdProposal(r,{...EMPTY_THRESHOLDS,citationCorrectnessMin:1.2})).toThrow("threshold");
 const all={...EMPTY_THRESHOLDS,citationCorrectnessMin:1,unsupportedClaimsMax:0,abstentionAccuracyMin:1,outcomeAccuracyMin:1,latencyP95MsMax:100,costUsdMax:0};expect(assessThresholdProposal(r,all).allMeasuredProposalsMet).toBeNull();
});
