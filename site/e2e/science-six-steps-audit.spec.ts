import {test,expect} from "@playwright/test";
import {validateTypedGraph,type TypedGraph,type ScientificEdge} from "../src/features/science/typedGraphSchema";
import {buildEvidenceDossier} from "../src/features/science/evidenceDossier";
import {findGraphPaths} from "../src/features/science/multiscaleTraversal";
import {detectConflictCandidates} from "../src/features/science/contradictionEngine";
import {prescreenSyntheticTrial,SYNTHETIC_TRIALS,SYNTHETIC_OBSERVATIONS} from "../src/features/science/clinicalTrialBridge";
import {runResearchInvestigation} from "../src/features/science/researchOrchestrator";
const edge:ScientificEdge={id:"e",subjectId:"a",objectId:"b",predicate:"ACTIVATES",assertionType:"reported_association",context:{},reviewStatus:"approved",reviewer:"reviewer",reviewedAt:"2026-11-04",evidenceStatus:"supported",evidenceIds:["src"],version:"1"};
const graph:TypedGraph={schemaVersion:"2.0.0",description:"synthetic audit",nodes:[{id:"a",label:"A",kind:"protein",reviewStatus:"draft",version:"1"},{id:"b",label:"B",kind:"pathway",reviewStatus:"draft",version:"1"}],edges:[edge],evidence:[{id:"src",sourceType:"publication",sourceId:"fixture",url:"https://example.org/fixture",retrievedAt:"2026-11-04",assessment:"unassessed"}]};
test("approved edges cannot rely on unassessed source records",()=>{
 expect(validateTypedGraph(graph)).toContain("Invalid approved assertion: e");
 expect(buildEvidenceDossier(graph,"e",[{edgeId:"e",sourceId:"src",scope:"direct_claim",stance:"supports",notes:"fixture",curator:"curator",assessedAt:"2026-11-04",reviewedBy:"reviewer",reviewedAt:"2026-11-04"}])?.readyForReview).toBe(false);
});
test("rejected relationships stay hidden in draft exploration and contradiction search",()=>{
 const rejected={...edge,id:"rejected",reviewStatus:"rejected" as const,predicate:"INHIBITS" as const};
 const g={...graph,edges:[edge,rejected]};
 expect(findGraphPaths(g,"a","b",{includeDraft:true}).map(p=>p.edges[0]?.id)).toEqual(["e"]);
 expect(detectConflictCandidates(g,true)).toHaveLength(0);
});
test("exclusion criteria are described as exclusion triggers, not eligibility",()=>{
 const trial={...SYNTHETIC_TRIALS[0]!,criteria:[{...SYNTHETIC_TRIALS[0]!.criteria[0]!,criterionType:"exclusion" as const}]};
 const result=prescreenSyntheticTrial(trial,SYNTHETIC_OBSERVATIONS,"synthetic-case-001");
 expect(result.results[0]?.reason).toContain("Exclusion threshold triggered");
 expect(result.state).toBe("requires_clinician_review");
});
test("no scientific agent workstream claims contradiction review without approved evidence",()=>{
 const report=runResearchInvestigation("pancreas");
 expect(report.workItems.find(w=>w.role==="contradiction_investigator")?.status).toBe("blocked");
 expect(report.hypotheses).toEqual([]);
});
