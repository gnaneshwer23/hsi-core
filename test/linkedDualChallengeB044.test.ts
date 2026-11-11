import {describe,it,expect} from "bun:test";
import {retrieveLinkedPublication} from "../src/researchV2/publicationLinkage";
import {executeDualModelChallenge} from "../src/researchV2/dualModelChallenge";
import type {EvidenceClaim,PassageResult} from "../src/researchV2/passageVerification";
const xml='<article><abstract><p>Human immune cells expressed a marker in sampled tissue.</p></abstract></article>';
const fetcher=async (url:string|URL|Request)=>String(url).includes("fullTextXML")?new Response(xml,{headers:{"content-type":"application/xml"}}):new Response(JSON.stringify({resultList:{result:[{id:"123",source:"MED",pmcid:"PMC456",doi:"10.1234/test",title:"Test",isRetracted:false}]}}),{headers:{"content-type":"application/json"}});
const claim:EvidenceClaim={id:"c1",sourceId:"europepmc:MED:123",exactQuote:"Human immune cells expressed a marker in sampled tissue.",subjectId:"CL:1",predicate:"expressed_in",objectId:"UBERON:1",context:{diseaseIds:["EFO_1"],species:"human",tissueId:"UBERON:1",cellId:"CL:1",method:null}};
const receipt:PassageResult={claimId:"c1",sourceId:claim.sourceId,disposition:"grounded_candidate",checks:{sourceIdentity:true,sourceStatus:true,rights:true,passageHash:true,exactSpan:true,biologicalContext:true},findings:[],scientificTruthEstablished:false,graphPromotable:false,humanApproval:false};
describe("B-04.4 linked publication and dual challenger",()=>{
 it("links PMID to PMCID without pretending to verify rights or retraction status",async()=>{
  const x=await retrieveLinkedPublication("123",fetcher);expect(x.pmcid).toBe("PMC456");expect(x.excerpt.passage).toContain("immune cells");expect(x.rightsStatus).toBe("unverified");expect(x.readyForScientificApproval).toBe(false);
 });
 it("rejects missing PMCID",async()=>{
  const f=async()=>new Response(JSON.stringify({resultList:{result:[{id:"123",source:"MED"}]}}));
  expect(retrieveLinkedPublication("123",f)).rejects.toThrow();
 });
 it("executes two separate model runners without granting scientific approval",async()=>{
  const runner1=async()=>({verdict:"supports",evidenceSpan:"Human immune cells",reason:"test"});
  const runner2=async()=>({verdict:"contradicts",evidenceSpan:"sampled tissue",reason:"test"});
  const r=await executeDualModelChallenge(claim,claim.exactQuote,receipt,{verifierId:"v1",modelId:"model1",runner:runner1},{verifierId:"v2",modelId:"model2",runner:runner2});
  expect(r.adjudication.disposition).toBe("exception_review");expect(r.modelIndependenceVerified).toBe(false);expect(r.adjudication.graphPromotable).toBe(false);
 });
 it("abstains when a model fails",async()=>{
  const runner1=async()=>{throw Error("unavailable")};
  const runner2=async()=>({verdict:"supports",evidenceSpan:"Human immune cells",reason:"test"});
  const r=await executeDualModelChallenge(claim,claim.exactQuote,receipt,{verifierId:"v1",modelId:"model1",runner:runner1},{verifierId:"v2",modelId:"model2",runner:runner2});
  expect(r.adjudication.disposition).toBe("insufficient_evidence");
 });
});
