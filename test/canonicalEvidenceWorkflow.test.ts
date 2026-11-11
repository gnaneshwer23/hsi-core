import {describe,expect,it} from "bun:test";
import {compareEvidenceInputs} from "../src/evidence/canonicalEvidenceWorkflow";
import type {MechanismEvidenceLead} from "../src/evidence/contextualMechanismComparison";
import type {SourceProof} from "../src/evidence/canonicalEdgeAdapters";
const proof=(id:string):SourceProof=>({sourceId:id,sourceUrl:"https://example.org/"+id,sourceLocator:"Methods section",
  evidenceRecordIds:[id],submitterId:"curator-a"});
function lead(id:string,disease:string,direction:"supports"|"opposes"):MechanismEvidenceLead {
 return {id,sourceReference:id,proteinAccession:"P1",pathwayStableId:"R1",direction,
 context:{disease,tissue:"blood",cellType:"Tfh",species:"human",experimentalSystem:"flow cytometry",
 intervention:"none",endpoint:"cTfh proportion"},sourceVerified:false,scientificApproval:false};
}
const input=(id:string,disease:string,direction:"supports"|"opposes")=>({
 kind:"mechanism" as const,lead:lead(id,disease,direction),proof:proof(id),
});
describe("P0.1.3 disease-agnostic workflow",()=>{
 for(const disease of ["SSc","rheumatoid arthritis","systemic lupus erythematosus","inflammatory bowel disease"]) {
  it(`fails closed on missing gate/denominator in ${disease}`,()=>{
   const r=compareEvidenceInputs(input(disease+"-a",disease,"supports"),input(disease+"-b",disease,"opposes"));
   expect(r.classification).toBe("cannot_compare");
   expect(r.missing).toContain("parentGate");
   expect(r.missing).toContain("denominator");
   expect(r.scientificConclusion).toBe(false);
  });
 }
 it("does not claim the real Ricard-Ly dispute is adjudicated",()=>{
  const a=input("ricard-30760472","SSc","supports");
  const b=input("ly-33175976","SSc","opposes");
  // These are *synthetic directional leads*, not verified extraction of Ly's direction.
  const r=compareEvidenceInputs(a,b);
  expect(r.classification).toBe("cannot_compare");
  expect(r.needsSourceVerification).toBe(true);
 });
});
