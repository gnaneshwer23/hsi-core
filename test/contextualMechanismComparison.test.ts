import {describe,expect,test} from "bun:test";
import {compareMechanismLeads,compareMechanismEvidenceSet,type MechanismEvidenceLead} from "../src/evidence/contextualMechanismComparison";
const context={tissue:"synovium",cellType:"macrophage",disease:"RA",
  species:"Homo sapiens",experimentalSystem:"human biopsy",
  intervention:"anti-TNF",endpoint:"NF-kB activation"};
const lead=(id:string,direction:MechanismEvidenceLead["direction"]):MechanismEvidenceLead=>({
  id,sourceReference:`PMID:${id}`,proteinAccession:"P01375",
  pathwayStableId:"R-HSA-199420",direction,context,
  sourceVerified:false,scientificApproval:false,
});
describe("Contextual mechanism comparison",()=>{
  test("flags opposing leads only as candidate contradiction",()=>{
    const result=compareMechanismLeads(lead("111","supports"),lead("222","opposes"));
    expect(result.classification).toBe("candidate_contradiction");
    expect(result.scientificConclusion).toBe(false);
    expect(result.needsSourceVerification).toBe(true);
  });
  test("different tissue is not a contradiction",()=>{
    const right={...lead("222","opposes"),context:{...context,tissue:"blood"}};
    expect(compareMechanismLeads(lead("111","supports"),right).classification).toBe("context_mismatch");
  });
  test("unknown biological context blocks contradiction",()=>{
    const right={...lead("222","opposes"),context:{...context,cellType:"unknown"}};
    expect(compareMechanismLeads(lead("111","supports"),right).classification).toBe("insufficient_context");
  });
  test("same direction is not contradiction",()=>{
    expect(compareMechanismLeads(lead("111","supports"),lead("222","supports")).classification).toBe("no_opposition");
  });
  test("requires distinct sources and caps comparisons",()=>{
    expect(()=>compareMechanismLeads(lead("111","supports"),lead("111","opposes"))).toThrow();
    expect(()=>compareMechanismEvidenceSet(Array.from({length:101},(_,i)=>lead(String(i),"supports")))).toThrow();
  });
});
