import {describe,it,expect} from "bun:test";
import {evaluateWithTwoModels} from "../src/researchV2/reliabilityEvaluationHarness";
import type {EvaluationExample} from "../src/researchV2/reliabilityEvaluationHarness";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {createSourceClearanceVerifier,sourceClearanceSigningText,type SourceClearanceReceipt} from "../src/researchV2/sourceClearanceReceipt";
import {createEvaluationGroundingVerifier} from "../src/researchV2/trustedEvaluationGrounding";
import type {EvaluationExecutionReceipt} from "../src/researchV2/reliabilityEvaluationHarness";
const example:EvaluationExample={id:"e1",claim:{id:"c1",sourceId:"s1",exactQuote:"Human cells express a marker.",subjectId:"CL:1",predicate:"associated_with",objectId:"GO:1",context:{diseaseIds:["EFO_1"],species:"human",tissueId:null,cellId:null,method:null}},passage:"Human cells express a marker.",receipt:{claimId:"c1",sourceId:"s1",disposition:"grounded_candidate",checks:{sourceIdentity:true,sourceStatus:true,rights:true,passageHash:true,exactSpan:true,biologicalContext:true},findings:[],scientificTruthEstablished:false,graphPromotable:false,humanApproval:false},gold:"insufficient",goldReviewerIds:["reviewer1","reviewer2"],goldAdjudicated:true,sourceIdentityVerified:false,rightsVerified:false,retractionCleared:false};
const {publicKey,privateKey}=generateKeyPairSync("ed25519");
const now=Date.parse("2026-11-11T12:00:00Z");
function cleared():EvaluationExample{
 const r:SourceClearanceReceipt={schemaVersion:"hsi-source-clearance-1",id:"receipt1",issuer:"synthetic-authority",keyId:"key1",sourceId:"s1",sourceVersion:"v1",canonicalId:"PMID:123",passageSha256:createHash("sha256").update(example.passage).digest("hex"),permittedActions:["model_transmission"],licenceId:"TEST-ONLY",attribution:"Synthetic test evidence",identity:"matched",rights:"verified",retraction:"clear",checkedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+10000).toISOString(),signature:""};
 r.signature=sign(null,Buffer.from(sourceClearanceSigningText(r)),privateKey).toString("base64url");
 return {...structuredClone(example),sourceIdentityVerified:true,rightsVerified:true,retractionCleared:true,sourceVersion:"v1",clearanceReceipt:r};
}
const policy=(isRevoked=async()=>false)=>({grounding:{authorize:async()=>true},receipts:{append:async()=>{}},clearance:createSourceClearanceVerifier({authorities:[{issuer:"synthetic-authority",keyId:"key1",publicKey}],now:()=>now,isRevoked})});
const pair=(run:()=>Promise<unknown>)=>[{verifierId:"v1",modelId:"m1",runner:run},{verifierId:"v2",modelId:"m2",runner:async()=>run()}] as const;
describe("B-04.4 operational evaluation harness",()=>{
 it("requires trusted grounding and a receipt adapter before any egress",async()=>{
  let calls=0;const [a,b]=pair(async()=>{calls++;return {}});
  for(const missing of [{grounding:undefined},{receipts:undefined}]){
   const result=await evaluateWithTwoModels([cleared()],a,b,{...policy(),...missing});
   expect(result.cases[0]?.prediction).toBe("not_assessed");
  }
  expect(calls).toBe(0);
 });
 it("recomputes grounding from trusted versioned source content rather than declared flags",async()=>{
  const input=cleared();
  const source={sourceId:"s1",canonicalId:"PMID:123",sourceUrl:"https://example.org/source",retrievedAt:new Date(now).toISOString(),sourceKind:"publication" as const,identifierKind:"PMID" as const,identityChecked:true,correctionStatus:"clear" as const,rights:{passageUsePermitted:true,licenceId:"TEST-ONLY",basis:"synthetic"},passage:{text:input.passage,sha256:createHash("sha256").update(input.passage).digest("hex"),start:0,end:input.passage.length}};
  let calls=0;const [a,b]=pair(async()=>{calls++;return {verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"}});
  const grounding=createEvaluationGroundingVerifier(async()=>({sourceVersion:"v1",source:structuredClone(source)}));
  expect((await evaluateWithTwoModels([input],a,b,{...policy(),grounding})).cases[0]?.prediction).toBe("supports");
  calls=0;
  for(const corrupt of [()=>{source.passage.start=1},()=>{source.passage.start=0;source.passage.sha256="0".repeat(64)},()=>{source.passage.sha256=createHash("sha256").update(input.passage).digest("hex");source.passage.text+=" changed"}]){
   corrupt();expect((await evaluateWithTwoModels([input],a,b,{...policy(),grounding})).cases[0]?.prediction).toBe("not_assessed");
  }
  expect(calls).toBe(0);
 });
 it("blocks an entire mixed batch when trusted grounding rejects a later case",async()=>{
  let calls=0;const [a,b]=pair(async()=>{calls++;return {}});const bad=cleared();bad.id="second";bad.claim.id="untrusted";bad.receipt.claimId="untrusted";
  const result=await evaluateWithTwoModels([cleared(),bad],a,b,{...policy(),grounding:{authorize:async b=>b.claim.id!=="untrusted"}});
  expect(calls).toBe(0);expect(result.executions).toHaveLength(0);
 });
 it("blocks stale and mismatched source clearance across the entire corpus",async()=>{
  let calls=0;const [a,b]=pair(async()=>{calls++;return {}});
  for(const change of ["stale","version","passage"]){
   const bad=cleared();bad.id="second";
   if(change==="stale"){
    const r=bad.clearanceReceipt as SourceClearanceReceipt;r.expiresAt=new Date(now-1).toISOString();
    r.signature=sign(null,Buffer.from(sourceClearanceSigningText(r)),privateKey).toString("base64url");
   }else if(change==="version")bad.sourceVersion="v2";else bad.passage+=" changed";
   expect((await evaluateWithTwoModels([cleared(),bad],a,b,policy())).cases.every(c=>c.prediction==="not_assessed")).toBe(true);
  }
  expect(calls).toBe(0);
 });
 it("rechecks grounding after receipt acknowledgement before dispatch",async()=>{
  let groundCalls=0,calls=0;const [a,b]=pair(async()=>{calls++;return {}});
  const result=await evaluateWithTwoModels([cleared()],a,b,{...policy(),grounding:{authorize:async()=>++groundCalls===1}});
  expect(calls).toBe(0);expect(result.cases[0]?.prediction).toBe("not_assessed");
 });
 it("acknowledges both starts before dispatch and terminal receipts before scoring",async()=>{
  const stored:EvaluationExecutionReceipt[]=[];const [a,b]=pair(async()=>{expect(stored.filter(r=>r.status==="started")).toHaveLength(2);return {verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"}});
  const result=await evaluateWithTwoModels([cleared()],a,b,{...policy(),receipts:{append:async r=>{stored.push(structuredClone(r))}}});
  expect(stored.map(r=>r.status)).toEqual(["started","started","assessed","assessed"]);
  expect(new Set(stored.map(r=>r.runId)).size).toBe(2);expect(result.cases[0]?.modelRunIds).toHaveLength(2);
  for(const r of stored){expect(r.inputSha256).toMatch(/^[a-f0-9]{64}$/);expect(r.promptSha256).toMatch(/^[a-f0-9]{64}$/);expect(r.scientificApproval).toBe(false);expect(r.graphPromotable).toBe(false);expect(r.providerRequestId).toBeNull();}
 });
 it("denies dispatch on receipt start failure and denies scoring on terminal failure",async()=>{
  for(const failAt of [1,3]){
   let calls=0,appends=0;const [a,b]=pair(async()=>{calls++;return {verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"}});
   const result=await evaluateWithTwoModels([cleared()],a,b,{...policy(),receipts:{append:async()=>{if(++appends===failAt)throw Error("store offline")}}});
   expect(calls).toBe(failAt===1?0:2);expect(result.cases[0]?.prediction).toBe("not_assessed");expect(result.cases[0]?.modelRunIds).toHaveLength(0);
  }
 });
 it("never sends unlicensed passages to models",async()=>{
  let called=0;const runner=async()=>{called++;return {verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"}};
  const result=await evaluateWithTwoModels([example],{verifierId:"v1",modelId:"m1",runner},{verifierId:"v2",modelId:"m2",runner:async()=>runner()});
  expect(called).toBe(0);expect(result.cases[0]?.prediction).toBe("not_assessed");expect(result.releaseEligible).toBe(false);
 });
 it("counts model errors as abstentions on cleared synthetic input",async()=>{
  const result=await evaluateWithTwoModels([cleared()],{verifierId:"v1",modelId:"m1",runner:async()=>{throw Error("offline")}},{verifierId:"v2",modelId:"m2",runner:async()=>({verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"})},policy());
  expect(result.modelFailures).toBe(1);expect(result.cases[0]?.prediction).toBe("not_assessed");
  expect(result.executions).toHaveLength(2);expect(result.executions.filter(r=>r.status==="assessed")).toHaveLength(1);
 });
 it("cannot authorize model egress using caller clearance booleans alone",async()=>{
  let calls=0;const [a,b]=pair(async()=>{calls++;return {}});
  const result=await evaluateWithTwoModels([cleared()],a,b);
  expect(calls).toBe(0);expect(result.cases[0]?.sourceIdentityVerified).toBe(false);
 });
 it("blocks the complete batch before calls when any grounding receipt fails",async()=>{
  let calls=0;const [a,b]=pair(async()=>{calls++;return {verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"}});
  const bad=cleared();bad.id="bad";bad.receipt.disposition="needs_evidence";bad.receipt.checks.passageHash=false;
  const result=await evaluateWithTwoModels([cleared(),bad],a,b,policy());
  expect(calls).toBe(0);expect(result.cases.every(c=>c.prediction==="not_assessed")).toBe(true);expect(Object.keys(result.blockedReasons)).toHaveLength(2);expect(result.releaseEligible).toBe(false);
 });
 it("prevalidates malformed gold, reviewers, receipts and duplicate IDs across the whole batch",async()=>{
  let calls=0,authorityCalls=0;const [a,b]=pair(async()=>{calls++;return {}});
  for(const change of [{gold:"invalid"},{goldReviewerIds:["r1","r1"]},{goldReviewerIds:["r1"," "]},{goldAdjudicated:false},{receipt:{...example.receipt,checks:{...example.receipt.checks,rights:"true"}}},{claim:{...example.claim,subjectId:""}}]){
   await expect(evaluateWithTwoModels([cleared(),{...cleared(),id:"second",...change}] as EvaluationExample[],a,b,{clearance:{authorize:async()=>{authorityCalls++;return true}}})).rejects.toThrow();
  }
  await expect(evaluateWithTwoModels([cleared(),cleared()],a,b,policy())).rejects.toThrow();
  expect(calls).toBe(0);expect(authorityCalls).toBe(0);
 });
 it("rejects wrong-passage and revoked authority receipts before model calls",async()=>{
  let calls=0;const [a,b]=pair(async()=>{calls++;return {}});
  const wrong=cleared();wrong.passage+=" changed";
  for(const result of [await evaluateWithTwoModels([wrong],a,b,policy()),await evaluateWithTwoModels([cleared()],a,b,policy(async()=>true))])expect(result.cases[0]?.prediction).toBe("not_assessed");
  expect(calls).toBe(0);
 });
 it("records distinct execution IDs and preserves safe concordant verdicts",async()=>{
  for(const verdict of ["supports","contradicts","insufficient"] as const){
   const [a,b]=pair(async()=>({verdict,evidenceSpan:"Human cells",reason:"synthetic"}));
   const result=await evaluateWithTwoModels([cleared()],a,b,policy());
   expect(result.cases[0]?.prediction).toBe(verdict);expect(new Set(result.cases[0]?.modelRunIds).size).toBe(2);expect(result.releaseEligible).toBe(false);
  }
 });
 it("does not count whitespace evidence as support",async()=>{
  const [a,b]=pair(async()=>({verdict:"supports",evidenceSpan:" ",reason:"synthetic"}));
  const result=await evaluateWithTwoModels([cleared()],a,b,policy());expect(result.cases[0]?.prediction).toBe("insufficient");
 });
 it("rechecks revocation immediately before execution",async()=>{
  let checks=0,calls=0;const [a,b]=pair(async()=>{calls++;return {}});
  const result=await evaluateWithTwoModels([cleared()],a,b,policy(async()=>++checks>1));
  expect(calls).toBe(0);expect(result.cases[0]?.sourceIdentityVerified).toBe(false);
 });
 it("blocks normalized causal predicates before authority or model calls",async()=>{
  let calls=0,lookups=0;const [a,b]=pair(async()=>{calls++;return {}});
  for(const predicate of ["Causes"," TREATS ","CURES","Prevents"]){
   const input=cleared();input.claim.predicate=predicate;
   const result=await evaluateWithTwoModels([input],a,b,{clearance:{authorize:async()=>{lookups++;return true}}});
   expect(result.cases[0]?.prediction).toBe("not_assessed");
  }
  expect(calls).toBe(0);expect(lookups).toBe(0);
 });
 it("records malformed model outputs as technical abstention, not scientific insufficiency",async()=>{
  const [a,b]=pair(async()=>({verdict:"supports",evidenceSpan:"Human cells"}));
  const result=await evaluateWithTwoModels([cleared()],a,b,policy());
  expect(result.modelFailures).toBe(2);expect(result.cases[0]?.prediction).toBe("not_assessed");
  expect(result.report.technicalAbstentionRate).toBe(1);expect(result.report.insufficientEvidenceRate).toBe(0);
 });
});
