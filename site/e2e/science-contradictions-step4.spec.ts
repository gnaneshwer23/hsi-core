import {test,expect} from "@playwright/test";
import {detectConflictCandidates} from "../src/features/science/contradictionEngine";
import {SCIENCE_TYPED_GRAPH} from "../src/features/science/typedGraphData";
import type {TypedGraph,ScientificEdge} from "../src/features/science/typedGraphSchema";
const makeEdge=(id:string,predicate:ScientificEdge["predicate"],context:ScientificEdge["context"]={}):ScientificEdge=>({id,subjectId:"tnf",objectId:"pathway",predicate,context,assertionType:"reported_association",reviewStatus:"draft",evidenceStatus:"unassessed",evidenceIds:[],version:"1"});
const graph:TypedGraph={schemaVersion:"2.0.0",description:"synthetic test assertions",nodes:[{id:"tnf",label:"TNF",kind:"protein",reviewStatus:"draft",version:"1"},{id:"pathway",label:"Pathway",kind:"pathway",reviewStatus:"draft",version:"1"}],evidence:[],edges:[makeEdge("a","ACTIVATES",{tissue:"skin",species:"human"}),makeEdge("b","INHIBITS",{tissue:"lung",species:"mouse"})]};
test("contradiction engine flags opposing predicates and preserves context differences",()=>{
 expect(detectConflictCandidates(graph)).toHaveLength(0);
 const candidates=detectConflictCandidates(graph,true);
 expect(candidates).toHaveLength(1);
 expect(candidates[0]!.type).toBe("opposing_effect");
 expect(candidates[0]!.contextDifferences).toContain("tissue: skin vs lung");
 expect(candidates[0]!.requiresReview).toBe(true);
});
test("context differences are distinguished from genuine opposing effects",()=>{
 const changed={...graph,edges:[makeEdge("a","ACTIVATES",{tissue:"skin"}),makeEdge("b","ACTIVATES",{tissue:"lung"})]};
 expect(detectConflictCandidates(changed,true)[0]!.type).toBe("context_divergence");
 expect(detectConflictCandidates({...changed,edges:changed.edges.map(e=>({...e,predicate:"RELATED_TOPIC"}))},true)).toHaveLength(0);
});
test("public contradiction explorer discloses missing curated evidence",async({page})=>{
 await page.goto("/science/contradictions");
 await expect(page.getByRole("heading",{name:"Contradiction intelligence"})).toBeVisible();
 await expect(page.getByText(/No candidate tensions in the current dataset/)).toBeVisible();
 await page.getByRole("checkbox",{name:"Include unreviewed draft claims"}).check();
 await expect(page.getByText(/Absence of detected conflicts is not evidence/)).toBeVisible();
 expect(detectConflictCandidates(SCIENCE_TYPED_GRAPH,true)).toHaveLength(0);
});
