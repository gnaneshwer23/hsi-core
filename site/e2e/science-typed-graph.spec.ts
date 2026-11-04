import {test,expect} from "@playwright/test";
import {PREDICATES,validateTypedGraph,type TypedGraph} from "../src/features/science/typedGraphSchema";
import {SCIENCE_TYPED_GRAPH,typedGraphNeighbours} from "../src/features/science/typedGraphData";
test("v2 schema migrates without upgrading draft relationships",()=>{
 expect(validateTypedGraph(SCIENCE_TYPED_GRAPH)).toEqual([]);
 expect(SCIENCE_TYPED_GRAPH.edges.every(e=>e.predicate==="RELATED_TOPIC"&&e.reviewStatus==="draft"&&e.evidenceStatus==="not_curated")).toBe(true);
 expect(typedGraphNeighbours("pancreas").length).toBeGreaterThan(0);
 expect(PREDICATES).toContain("PRODUCES");
 expect(PREDICATES).toContain("EVALUATED_IN");
});
test("v2 rejects unsupported approvals, dangling references and type-invalid predicates",()=>{
 const graph:TypedGraph={schemaVersion:"2.0.0",description:"test",nodes:[
 {id:"cell",label:"Macrophage",kind:"cell",reviewStatus:"draft",version:"1"},
 {id:"protein",label:"TNF",kind:"protein",reviewStatus:"draft",version:"1"}],
 evidence:[],edges:[{id:"edge1",subjectId:"cell",objectId:"protein",predicate:"PRODUCES",assertionType:"reported_association",context:{tissue:"synovium"},reviewStatus:"approved",evidenceStatus:"unassessed",evidenceIds:[],version:"1"}]};
 expect(validateTypedGraph(graph)).toContain("Invalid approved assertion: edge1");
 graph.edges[0]!.reviewStatus="draft";
 expect(validateTypedGraph(graph)).toEqual([]);
 graph.edges[0]!.predicate="EVALUATED_IN";
 expect(validateTypedGraph(graph)).toContain("Invalid predicate types: edge1");
 graph.edges[0]!.predicate="PRODUCES";
 graph.edges[0]!.evidenceIds=["missing"];
 expect(validateTypedGraph(graph)).toContain("Unknown evidence: edge1 -> missing");
});
test("graph explorer displays v2 relationship metadata",async({page})=>{
 await page.goto("/science/graph?node=pancreas");
 await expect(page.getByText(/Typed relationships/)).toBeVisible();
 await expect(page.getByText(/not_curated/).first()).toBeVisible();
});
