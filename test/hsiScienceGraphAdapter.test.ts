import {test,expect} from "bun:test";
import {importHsiEditorialScienceGraph} from "../src/hsiScienceGraphAdapter";
import type {TypedGraph} from "../site/src/features/science/typedGraphSchema";
const graph=():TypedGraph=>({
 schemaVersion:"2.0.0",description:"Editorial only",
 nodes:[{id:"cell:1",label:"Cell",kind:"cell",reviewStatus:"draft",version:"1.0.0",ontologyId:"CL:0000000"},{id:"protein:1",label:"Protein",kind:"protein",reviewStatus:"draft",version:"1.0.0"}],
 edges:[{id:"edge:1",subjectId:"cell:1",objectId:"protein:1",predicate:"RELATED_TOPIC",assertionType:"inference",context:{species:"human"},reviewStatus:"draft",evidenceStatus:"not_curated",evidenceIds:[],version:"0.1.0"}],evidence:[]
});
test("editorial import is always restricted to governed research drafts",()=>{
 const result=importHsiEditorialScienceGraph(graph());
 expect(result.nodes.every(n=>n.visibility==="governed_research"&&n.reviewState==="draft")).toBe(true);
 expect(result.relationships[0]?.epistemicType).toBe("computational_inference");
 expect(result.relationships[0]?.reviewState).toBe("draft");
 expect(result.relationships[0]?.causalClaim).toBe(false);
});
test("source approved mechanism is never promoted to approved causal claim",()=>{
 const g=graph();g.evidence=[{id:"source:1",sourceType:"publication",sourceId:"123",url:"https://pubmed.ncbi.nlm.nih.gov/123/",retrievedAt:"2026-11-04T00:00:00Z",assessment:"supported"}];
 g.edges=[{...g.edges[0]!,predicate:"PRODUCES",assertionType:"established_mechanism",reviewStatus:"approved",evidenceStatus:"supported",evidenceIds:["source:1"],reviewer:"scientist",reviewedAt:"2026-11-04T00:00:00Z"}];
 const result=importHsiEditorialScienceGraph(g);
 expect(result.relationships[0]?.epistemicType).toBe("computational_inference");
 expect(result.relationships[0]?.reviewDecisionId).toBeUndefined();
 expect(result.warnings.some(w=>w.includes("downgraded"))).toBe(true);
});
test("invalid dangling editorial edges cannot be imported",()=>{
 const g=graph();g.edges[0]={...g.edges[0]!,objectId:"missing"};
 expect(()=>importHsiEditorialScienceGraph(g)).toThrow("Invalid source science graph");
});
test("ontology mapping remains unreviewed, never exact",()=>{
 const result=importHsiEditorialScienceGraph(graph());
 expect(result.nodes[0]?.sourceIdentifiers[0]?.mapping).toBe("unreviewed");
});
