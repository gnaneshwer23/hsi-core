import {describe,it,expect} from "bun:test";
import {runModelEntailment} from "../src/researchV2/modelEntailment";
import {executeDualModelChallenge} from "../src/researchV2/dualModelChallenge";
import {adjudicateClaim} from "../src/researchV2/scientificEntailment";
import {verifyPassageClaim,type EvidenceClaim,type PassageResult,type VerifiedSourceEnvelope} from "../src/researchV2/passageVerification";
import {createProviderRunner,validateProviderConfig} from "../src/researchV2/providerReliability";

const claim:EvidenceClaim={id:"c1",sourceId:"s1",exactQuote:"Human cells express a marker.",subjectId:"CL:1",predicate:"associated_with",objectId:"GO:1",context:{diseaseIds:[],species:"human",tissueId:null,cellId:null,method:null}};
const receipt:PassageResult={claimId:"c1",sourceId:"s1",disposition:"grounded_candidate",checks:{sourceIdentity:true,sourceStatus:true,rights:true,passageHash:true,exactSpan:true,biologicalContext:true},findings:[],scientificTruthEstablished:false,graphPromotable:false,humanApproval:false};
const config={providerId:"openai",modelId:"test",endpoint:"https://api.openai.com/v1/responses",timeoutMs:1000,maxResponseBytes:256};
const payload={instruction:"Verify",claim:"A associated with B",passage:claim.exactQuote};

describe("scientific audit follow-up regressions",()=>{
 it("validates the same endpoint snapshot that the transport receives",()=>{
  let reads=0;
  const input={...config,get endpoint(){return ++reads===1?config.endpoint:"https://127.0.0.1/"}};
  expect(validateProviderConfig(input).endpoint).toBe(config.endpoint);expect(reads).toBe(1);
 });
 it("snapshots payload before validation and transmission",async()=>{
  let reads=0;
  const input={...payload,get passage(){return ++reads===1?payload.passage:"x".repeat(4000)}};
  const runner=createProviderRunner(config,async(_config,p)=>{expect(p.passage).toBe(payload.passage);return Response.json({ok:true})});
  expect(await runner(input)).toEqual({ok:true});expect(reads).toBe(1);
 });
 it("requires exact passage evidence for contradiction as well as support",async()=>{
  for(const evidenceSpan of [null,"invented"," "]){
   const r=await runModelEntailment({claim,sourceId:claim.sourceId,passage:claim.exactQuote},"v1","m1",async()=>({verdict:"contradicts",evidenceSpan,reason:"synthetic"}));
   expect(r.verdict).toBe("insufficient");
  }
 });
 it("rejects malformed model response schemas rather than salvaging support",async()=>{
  for(const raw of [{verdict:"supports",evidenceSpan:"Human cells"},{verdict:"supports",evidenceSpan:"Human cells",reason:42},{verdict:"supports",evidenceSpan:"Human cells",reason:" "},{verdict:"invalid",evidenceSpan:null,reason:"synthetic"}]){
   await expect(runModelEntailment({claim,sourceId:claim.sourceId,passage:claim.exactQuote},"v1","m1",async()=>raw)).rejects.toThrow();
  }
 });
 it("binds the returned verdict to the claim that was actually submitted",async()=>{
  const input={claim:structuredClone(claim),sourceId:claim.sourceId,passage:claim.exactQuote};
  const r=await runModelEntailment(input,"v1","m1",async()=>{input.claim.id="changed";return {verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"}});
  expect(r.claimId).toBe("c1");
 });
 it("validates the same model response snapshot that it returns",async()=>{
  let reads=0;
  const raw={get verdict(){return ++reads===1?"supports":"invalid"},evidenceSpan:"Human cells",reason:"synthetic"};
  const r=await runModelEntailment({claim,sourceId:claim.sourceId,passage:claim.exactQuote},"v1","m1",async()=>raw);
  expect(r.verdict).toBe("supports");expect(reads).toBe(1);
 });
 it("cannot bypass failed grounding through the direct dual-challenge entry point",async()=>{
  let calls=0;const run=async()=>{calls++;return {verdict:"supports",evidenceSpan:"Human cells",reason:"synthetic"}};
  const bad={...receipt,checks:{...receipt.checks,rights:false}};
  await expect(executeDualModelChallenge(claim,claim.exactQuote,bad,{verifierId:"v1",modelId:"m1",runner:run},{verifierId:"v2",modelId:"m2",runner:async()=>run()})).rejects.toThrow();
  expect(calls).toBe(0);
 });
 it("adjudication independently checks receipt flags instead of trusting its disposition",()=>{
  const challenges=["v1","v2"].map(verifierId=>({claimId:"c1",verifierId,modelOrMethod:verifierId,verdict:"supports" as const,evidenceSpan:"Human cells",reason:"synthetic",independentEvidenceSourceIds:["s1"]}));
  expect(adjudicateClaim({...receipt,checks:{...receipt.checks,passageHash:false}},challenges).disposition).toBe("insufficient_evidence");
 });
 it("normalizes causal predicate casing and whitespace before exception gating",async()=>{
  const text=claim.exactQuote;
  const hash=[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)))].map(b=>b.toString(16).padStart(2,"0")).join("");
  const source:VerifiedSourceEnvelope={sourceId:"s1",canonicalId:"PMID:123",sourceUrl:"https://europepmc.org/article/MED/123",retrievedAt:"2026-11-11T00:00:00Z",sourceKind:"publication",identifierKind:"PMID",identityChecked:true,correctionStatus:"clear",rights:{passageUsePermitted:true,licenceId:"TEST",basis:"Synthetic only"},passage:{text,sha256:hash,start:0,end:text.length}};
  for(const predicate of ["Causes"," TREATS ","CURES","Prevents"]){expect((await verifyPassageClaim(source,{...claim,predicate})).disposition).toBe("exception_review");}
 });
});
