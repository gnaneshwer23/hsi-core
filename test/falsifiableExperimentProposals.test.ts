import {describe,expect,test} from "bun:test";
import {compareMechanismLeads,type MechanismEvidenceLead} from "../src/evidence/contextualMechanismComparison";
import {proposeFalsifiableExperiment} from "../src/evidence/falsifiableExperimentProposals";
const context={tissue:"synovium",cellType:"macrophage",disease:"RA",species:"Homo sapiens",
  experimentalSystem:"human biopsy",intervention:"anti-TNF",endpoint:"NF-kB activation"};
const lead=(id:string,direction:"supports"|"opposes"):MechanismEvidenceLead=>({
  id,sourceReference:`PMID:${id}`,proteinAccession:"P01375",
  pathwayStableId:"R-HSA-199420",direction,context,
  sourceVerified:false,scientificApproval:false,
});
const left=lead("111","supports"),right=lead("222","opposes");
const experiment={
  question:"Does anti-TNF change macrophage pathway activation?",
  prediction:"Under matched conditions the pathway response will differ.",
  experimentalModel:"Matched human synovial macrophage cultures",
  perturbation:"Compare anti-TNF and matched control conditions",
  primaryReadout:"Quantified pathway activation at fixed timepoints",
  negativeControl:"Matched vehicle and isotype control groups",
  replicationPlan:"Independent donors with blinded analysis",
  falsificationCriterion:"No prespecified difference from matched controls",
  confounders:["Donor heterogeneity and prior treatment exposure"],
  limitations:["Cell culture may not recapitulate synovial tissue"],
};
describe("Step 6 falsifiable experiment proposals",()=>{
  test("creates only a nonexecuting, unapproved draft",()=>{
    const comparison=compareMechanismLeads(left,right);
    const result=proposeFalsifiableExperiment({comparison,left,right,...experiment});
    expect(result.status).toBe("draft_unvalidated_hypothesis");
    expect(result.humanReviewRequired).toBe(true);
    expect(result.executionAuthorized).toBe(false);
    expect(result.scientificApproval).toBe(false);
    expect(result.sourceReferences).toEqual(["PMID:111","PMID:222"]);
  });
  test("rejects missing falsification criteria",()=>{
    expect(()=>proposeFalsifiableExperiment({
      comparison:compareMechanismLeads(left,right),left,right,...experiment,
      falsificationCriterion:"",
    })).toThrow();
  });
  test("rejects context mismatch as contradiction",()=>{
    const changed={...right,context:{...context,tissue:"blood"}};
    expect(()=>proposeFalsifiableExperiment({
      comparison:compareMechanismLeads(left,changed),left,right:changed,...experiment,
    })).toThrow();
  });
  test("rejects mismatched lead identities",()=>{
    expect(()=>proposeFalsifiableExperiment({
      comparison:compareMechanismLeads(left,right),left,right:{...right,id:"333"},...experiment,
    })).toThrow();
  });
});
