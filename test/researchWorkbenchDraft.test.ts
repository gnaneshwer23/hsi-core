import {describe,expect,test} from "bun:test";
import {prepareResearchWorkbenchDraft} from "../src/evidence/researchWorkbenchDraft";
import type {HsiGraphNode} from "../src/livingHealthKnowledgeGraph";
import type {MechanismEvidenceLead} from "../src/evidence/contextualMechanismComparison";

const pathwayDraft:HsiGraphNode={
  schemaVersion:"hsi-lhkg-node-1",id:"pathway.reactome.R-HSA-199420",
  layer:"biomedical_evidence",kind:"pathway",preferredLabel:"Example pathway",
  aliases:[],sourceIdentifiers:[{system:"Reactome",value:"R-HSA-199420",mapping:"unreviewed"}],
  version:"1.0.0",visibility:"governed_research",reviewState:"draft",
  sourceProvenance:["reactome:metadata:R-HSA-199420:fixture"],
};
const context={tissue:"synovium",cellType:"macrophage",disease:"RA",species:"Homo sapiens",
  experimentalSystem:"human biopsy",intervention:"anti-TNF",endpoint:"NF-kB activation"};
const lead=(id:string,direction:"supports"|"opposes"):MechanismEvidenceLead=>({
  id,sourceReference:`PMID:${id}`,proteinAccession:"P01375",
  pathwayStableId:"R-HSA-199420",direction,context,sourceVerified:false,scientificApproval:false,
});
const input={
  proteinAccession:"P01375",pathwayDraft,sourceReference:"PMID:111",
  biologicalContext:{tissue:"synovium",cellType:"macrophage",disease:"RA",
    species:"Homo sapiens",experimentalSystem:"human biopsy"},
  leftLead:lead("111","supports"),rightLead:lead("222","opposes"),
  experiment:{
    question:"Does anti-TNF change macrophage pathway activation?",
    prediction:"Matched treatment conditions will yield different activation.",
    experimentalModel:"Matched human synovial macrophage cultures",
    perturbation:"Compare anti-TNF with matched controls",
    primaryReadout:"Pathway activation at prespecified timepoints",
    negativeControl:"Matched isotype control condition",
    replicationPlan:"Independent donor replicates with blinded analysis",
    falsificationCriterion:"No prespecified treatment-control difference",
    confounders:["Prior treatment exposure and donor heterogeneity"],
    limitations:["Ex vivo cultures do not recapitulate intact tissue"],
  },
  fetcher:async()=>new Response(JSON.stringify({
    primaryAccession:"P01375",proteinDescription:{recommendedName:{fullName:{value:"Tumor necrosis factor"}}},
    organism:{scientificName:"Homo sapiens",taxonId:9606},genes:[{geneName:{value:"TNF"}}],
  }),{status:200}),
};
describe("Step 7 headless workbench composition",()=>{
  test("produces only an unapproved, nonpersisted draft",async()=>{
    const result=await prepareResearchWorkbenchDraft(input);
    expect(result.ok).toBe(true);
    if(!result.ok)return;
    expect(result.comparison.classification).toBe("candidate_contradiction");
    expect(result.proposal.executionAuthorized).toBe(false);
    expect(result.scientificApproval).toBe(false);
    expect(result.productionPersisted).toBe(false);
  });
  test("fails closed on provider error",async()=>{
    const result=await prepareResearchWorkbenchDraft({...input,fetcher:async()=>new Response("fail",{status:503})});
    expect(result).toMatchObject({ok:false,stage:"protein_lookup"});
  });
  test("rejects mismatched source leads",async()=>{
    const result=await prepareResearchWorkbenchDraft({
      ...input,rightLead:{...input.rightLead,pathwayStableId:"R-HSA-999999"},
    });
    expect(result).toMatchObject({ok:false,stage:"evidence_comparison"});
  });
});
