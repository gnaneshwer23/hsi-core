import {describe,it,expect} from "bun:test";
import {verifyPassageClaim,type VerifiedSourceEnvelope,type EvidenceClaim} from "../src/researchV2/passageVerification";
const passage="Human immune cells expressed marker X in the sampled tissue.";
async function hash(s:string){return [...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function fixture(){
 const source:VerifiedSourceEnvelope={sourceId:"europepmc:MED:123",canonicalId:"PMID:123",sourceUrl:"https://europepmc.org/article/MED/123",retrievedAt:"2026-11-11T00:00:00Z",sourceKind:"publication",identifierKind:"PMID",identityChecked:true,correctionStatus:"clear",rights:{passageUsePermitted:true,licenceId:"test-permission",basis:"synthetic test only"},passage:{text:passage,sha256:await hash(passage),start:0,end:passage.length}};
 const claim:EvidenceClaim={id:"claim1",sourceId:source.sourceId,exactQuote:passage,subjectId:"CL:1",predicate:"expressed_in",objectId:"UBERON:1",context:{diseaseIds:["EFO_1"],species:"human",tissueId:"UBERON:1",cellId:"CL:1",method:"synthetic test"}};
 return {source,claim};
}
describe("B-04.4.2/3 passage and source integrity",()=>{
 it("checks synthetic licensed exact passage without approving scientific truth",async()=>{
  const {source,claim}=await fixture();const result=await verifyPassageClaim(source,claim);
  expect(result.disposition).toBe("grounded_candidate");expect(result.graphPromotable).toBe(false);expect(result.scientificTruthEstablished).toBe(false);
 });
 it("rejects altered quotes and hashes",async()=>{
  const {source,claim}=await fixture();claim.exactQuote="invented";source.passage!.sha256="0".repeat(64);
  const result=await verifyPassageClaim(source,claim);expect(result.disposition).toBe("needs_evidence");expect(result.checks.exactSpan).toBe(false);expect(result.checks.passageHash).toBe(false);
 });
 it("escalates retracted or causal evidence",async()=>{
  const {source,claim}=await fixture();source.correctionStatus="retracted";claim.predicate="causes";
  expect((await verifyPassageClaim(source,claim)).disposition).toBe("exception_review");
 });
 it("rejects undocumented passage rights",async()=>{
  const {source,claim}=await fixture();source.rights.passageUsePermitted=false;
  expect((await verifyPassageClaim(source,claim)).checks.rights).toBe(false);
 });
 it("rejects source substitution",async()=>{
  const {source,claim}=await fixture();claim.sourceId="europepmc:MED:999";
  expect(verifyPassageClaim(source,claim)).rejects.toThrow();
 });
});
