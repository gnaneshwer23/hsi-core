import {describe,expect,test} from "bun:test";
import {prepareIntegratedResearchDraft} from "../src/evidence/integratedResearchWorkbench";

const context={tissue:"synovium",cellType:"macrophage",disease:"RA",species:"Homo sapiens",
  experimentalSystem:"human biopsy"};
const leadContext={...context,intervention:"anti-TNF",endpoint:"NF-kB activation"};
const lead=(id:string,direction:"supports"|"opposes")=>({
  id,sourceReference:`PMID:${id}`,proteinAccession:"P01375",
  pathwayStableId:"R-HSA-199420",direction,context:leadContext,
  sourceVerified:false as const,scientificApproval:false as const,
});
const fixture={
  reactomeStableId:"R-HSA-199420",proteinAccession:"P01375",
  sourceReference:"PMID:111",biologicalContext:context,
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
  reactomeFetcher:async()=>new Response(JSON.stringify({
    stId:"R-HSA-199420",displayName:"Example pathway",
    schemaClass:"Pathway",species:[{displayName:"Homo sapiens"}],
  }),{status:200}),
  fetcher:async()=>new Response(JSON.stringify({
    primaryAccession:"P01375",
    proteinDescription:{recommendedName:{fullName:{value:"Tumor necrosis factor"}}},
    organism:{scientificName:"Homo sapiens",taxonId:9606},
    genes:[{geneName:{value:"TNF"}}],
  }),{status:200}),
};
describe("Phase 9.1 consolidated research workflow",()=>{
  test("joins Reactome and UniProt draft metadata without approval",async()=>{
    const result=await prepareIntegratedResearchDraft(fixture);
    expect(result.ok).toBe(true);
    if(!result.ok)return;
    expect(result.scientificApproval).toBe(false);
    expect(result.productionPersisted).toBe(false);
    expect(result.proposal.executionAuthorized).toBe(false);
    expect(result.pathwayDraft.sourceIdentifiers[0]?.value).toBe("R-HSA-199420");
  });
  test("fails closed when Reactome provider fails",async()=>{
    const result=await prepareIntegratedResearchDraft({
      ...fixture,reactomeFetcher:async()=>new Response("Unavailable",{status:503}),
    });
    expect(result).toMatchObject({ok:false,stage:"pathway_lookup"});
  });
  test("fails closed on mismatched pathway identity",async()=>{
    const result=await prepareIntegratedResearchDraft({
      ...fixture,reactomeFetcher:async()=>new Response(JSON.stringify({
        stId:"R-HSA-999999",displayName:"Wrong pathway",schemaClass:"Pathway",
      }),{status:200}),
    });
    expect(result).toMatchObject({ok:false,stage:"pathway_lookup"});
  });
});
