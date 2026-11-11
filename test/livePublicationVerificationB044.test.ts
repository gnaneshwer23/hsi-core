import {describe,it,expect} from "bun:test";
import {resolveEuropePmcPmid} from "../src/researchV2/livePublicationVerification";
import {adjudicateClaim} from "../src/researchV2/scientificEntailment";
import type {PassageResult} from "../src/researchV2/passageVerification";
const fakeFetch=async()=>new Response(JSON.stringify({resultList:{result:[{id:"123",source:"MED",title:"Example",doi:"10.1/example",isRetracted:false}]}}));
describe("B-04.4 live resolver and scientific challenger contracts",()=>{
 it("resolves source metadata but leaves correction status and passage rights unverified",async()=>{
  const result=await resolveEuropePmcPmid("123",fakeFetch);
  expect(result.source.identityChecked).toBe(true);expect(result.source.correctionStatus).toBe("unknown");expect(result.source.rights.passageUsePermitted).toBe(false);expect(result.source.passage).toBeNull();
 });
 it("rejects ambiguous identity",async()=>{
  const f=async()=>new Response(JSON.stringify({resultList:{result:[{id:"123",source:"MED"},{id:"123",source:"MED"}]}}));
  expect(resolveEuropePmcPmid("123",f)).rejects.toThrow();
 });
 it("blocks claims when independent challenge missing",()=>{
  const receipt:PassageResult={claimId:"c1",sourceId:"s1",disposition:"grounded_candidate",checks:{sourceIdentity:true,sourceStatus:true,rights:true,passageHash:true,exactSpan:true,biologicalContext:true},findings:[],scientificTruthEstablished:false,graphPromotable:false,humanApproval:false};
  expect(adjudicateClaim(receipt,[]).disposition).toBe("insufficient_evidence");
  const challenges=[{claimId:"c1",verifierId:"v1",modelOrMethod:"test1",verdict:"supports" as const,evidenceSpan:"quote",reason:"synthetic",independentEvidenceSourceIds:["s2"]},{claimId:"c1",verifierId:"v2",modelOrMethod:"test2",verdict:"contradicts" as const,evidenceSpan:"quote",reason:"synthetic",independentEvidenceSourceIds:["s3"]}];
  expect(adjudicateClaim(receipt,challenges).disposition).toBe("exception_review");
  challenges[1]!.verdict="supports" as any;
  const result=adjudicateClaim(receipt,challenges);
  expect(result.disposition).toBe("candidate_only");expect(result.scientificApproval).toBe(false);expect(result.graphPromotable).toBe(false);
 });
});
