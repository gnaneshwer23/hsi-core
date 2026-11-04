import {test,expect} from "@playwright/test";
import {findGraphPaths,graphCoverage} from "../src/features/science/multiscaleTraversal";
import type {TypedGraph} from "../src/features/science/typedGraphSchema";
import {SCIENCE_TYPED_GRAPH} from "../src/features/science/typedGraphData";
const graph:TypedGraph={schemaVersion:"2.0.0",description:"synthetic traversal fixture",evidence:[],nodes:["a","b","c"].map(id=>({id,label:id,kind:"process" as const,reviewStatus:"draft" as const,version:"1"})),edges:[
 {id:"ab",subjectId:"a",objectId:"b",predicate:"ACTIVATES",assertionType:"inference",context:{},reviewStatus:"draft",evidenceStatus:"not_curated",evidenceIds:[],version:"1"},
 {id:"bc",subjectId:"b",objectId:"c",predicate:"ACTIVATES",assertionType:"inference",context:{},reviewStatus:"draft",evidenceStatus:"not_curated",evidenceIds:[],version:"1"}
]};
test("multi-hop traversal respects direction, depth and review boundaries",()=>{
 expect(findGraphPaths(graph,"a","c")).toEqual([]);
 expect(findGraphPaths(graph,"a","c",{includeDraft:true,maxHops:1})).toEqual([]);
 expect(findGraphPaths(graph,"a","c",{includeDraft:true,maxHops:2,direction:"outgoing"})).toHaveLength(1);
 expect(findGraphPaths(graph,"c","a",{includeDraft:true,direction:"outgoing"})).toEqual([]);
 expect(findGraphPaths(graph,"c","a",{includeDraft:true,direction:"incoming"})).toHaveLength(1);
 expect(graphCoverage(SCIENCE_TYPED_GRAPH).approvedEdges).toBe(0);
});
test("multi-scale explorer keeps draft evidence opt-in",async({page})=>{
 await page.goto("/science/paths");
 await expect(page.getByRole("heading",{name:"Multi-scale biology paths"})).toBeVisible();
 await expect(page.getByText(/No paths meet these evidence/)).toBeVisible();
 await page.getByRole("checkbox",{name:"Include unreviewed draft links"}).check();
 await expect(page.getByRole("heading",{name:/paths found/})).toBeVisible();
});
