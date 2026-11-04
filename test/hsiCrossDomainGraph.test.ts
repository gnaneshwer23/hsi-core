import {test,expect} from "bun:test";
import {adaptHsiCrossDomainRecord,traverseHsiCrossDomainDraftGraph,type HsiCrossDomainInput} from "../src/hsiCrossDomainGraph";
const record=(source:HsiCrossDomainInput["source"]="microbiome"):HsiCrossDomainInput=>({
 source,sourceRecordId:"source:1",sourceVersion:"1.0.0",retrievedAt:"2026-11-04T00:00:00Z",
 subject:{id:"microbe:1",kind:"microbe",label:"Microbe"},object:{id:"metabolite:1",kind:"metabolite",label:"Metabolite"},
 predicate:source==="trial_registry"?"EVALUATED_IN":"ASSOCIATED_WITH",
 evidenceIds:["study:1"],context:{species:"human",population:"cohort A"},classification:"reported_association"
});
test("microbiome associations remain unapproved and noncausal",()=>{
 const graph=adaptHsiCrossDomainRecord(record());const edge=graph.relationships[0]!;
 expect(edge.epistemicType).toBe("association");expect(edge.causalClaim).toBe(false);expect(edge.reviewState).toBe("draft");expect(edge.visibility).toBe("governed_research");
});
test("trial records are evidence-layer drafts, not eligibility decisions",()=>{
 const graph=adaptHsiCrossDomainRecord(record("trial_registry"));
 expect(graph.relationships[0]?.layer).toBe("biomedical_evidence");
 expect(graph.relationships[0]?.reviewDecisionId).toBeUndefined();
});
test("invalid source and missing evidence are rejected",()=>{
 expect(()=>adaptHsiCrossDomainRecord({...record(),evidenceIds:[]})).toThrow("evidence");
 expect(()=>adaptHsiCrossDomainRecord({...record("trial_registry"),predicate:"ASSOCIATED_WITH"})).toThrow("Trial");
});
test("bounded traversal preserves scope and returns only connected drafts",()=>{
 const graph=adaptHsiCrossDomainRecord(record());
 const result=traverseHsiCrossDomainDraftGraph({...graph,query:{startId:"microbe:1",maxHops:2,allowedLayers:["gut_immune_metabolic"],limit:5}});
 expect(result.nodeIds).toContain("metabolite:1");expect(result.relationshipIds).toEqual(["source:1"]);
});
test("patient context and unrestricted graph queries fail closed",()=>{
 const graph=adaptHsiCrossDomainRecord(record());
 expect(()=>traverseHsiCrossDomainDraftGraph({...graph,query:{startId:"microbe:1",maxHops:1,allowedLayers:["gut_immune_metabolic"],limit:101}})).toThrow("Invalid");
 expect(()=>traverseHsiCrossDomainDraftGraph({...graph,query:{startId:"microbe:1",maxHops:1,allowedLayers:["patient_context" as never],limit:5}})).toThrow("Invalid");
});
