import {describe,expect,test} from "bun:test";
import {assertWorkbenchContextConsistency} from "../src/evidence/researchWorkbenchValidation";
import type {ResearchWorkbenchInput} from "../src/evidence/researchWorkbenchDraft";

const context={tissue:"synovium",cellType:"macrophage",disease:"RA",
  species:"Homo sapiens",experimentalSystem:"human biopsy"};
const evidenceContext={...context,intervention:"anti-TNF",endpoint:"NF-kB activation"};
const fixture={
  proteinAccession:"P01375",
  pathwayDraft:{
    schemaVersion:"hsi-lhkg-node-1",id:"pathway.reactome.R-HSA-199420",
    layer:"biomedical_evidence",kind:"pathway",preferredLabel:"Example",
    aliases:[],sourceIdentifiers:[{system:"Reactome",value:"R-HSA-199420",mapping:"unreviewed"}],
    version:"1.0.0",visibility:"governed_research",reviewState:"draft",
    sourceProvenance:["fixture"],
  },
  sourceReference:"PMID:111",biologicalContext:context,
  leftLead:{id:"111",sourceReference:"PMID:111",proteinAccession:"P01375",
    pathwayStableId:"R-HSA-199420",direction:"supports",context:evidenceContext,
    sourceVerified:false,scientificApproval:false},
  rightLead:{id:"222",sourceReference:"PMID:222",proteinAccession:"P01375",
    pathwayStableId:"R-HSA-199420",direction:"opposes",context:evidenceContext,
    sourceVerified:false,scientificApproval:false},
} as unknown as ResearchWorkbenchInput;
describe("Step 8 cross-stage validation",()=>{
  test("accepts consistent draft sources and context",()=>{
    expect(()=>assertWorkbenchContextConsistency(fixture)).not.toThrow();
  });
  test("rejects tissue mismatch",()=>{
    const changed={...fixture,rightLead:{...fixture.rightLead,context:{...fixture.rightLead.context,tissue:"blood"}}};
    expect(()=>assertWorkbenchContextConsistency(changed)).toThrow(/context mismatch/);
  });
  test("rejects duplicate source references",()=>{
    const changed={...fixture,rightLead:{...fixture.rightLead,sourceReference:"PMID:111"}};
    expect(()=>assertWorkbenchContextConsistency(changed)).toThrow(/distinct source/);
  });
  test("rejects source reference not linked to leads",()=>{
    expect(()=>assertWorkbenchContextConsistency({...fixture,sourceReference:"PMID:333"})).toThrow(/comparison sources/);
  });
});
