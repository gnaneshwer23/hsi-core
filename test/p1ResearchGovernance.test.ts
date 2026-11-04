import {test,expect} from "bun:test";
import {validateAgentExecution,validateResearchRecord,mayPublishResearchOutput,type AgentRegistryEntry,type InvestigationProvenance} from "../src/p1ResearchGovernance";
const agent:AgentRegistryEntry={id:"evidence-v1",role:"evidence_investigator",version:"1.0.0",intendedUse:"Retrieve evidence",permittedTools:["hsi.graph.read"],modelProvider:"deterministic",modelVersion:"1",promptVersion:"none",evaluationId:"eval-1",approvedForExecution:true,maxCostUsd:1};
const run:InvestigationProvenance={runId:"r1",actorId:"researcher-1",dataClass:"public_biomedical",question:"Tfh in SSc?",releaseId:"HSI-GR-1",sourceIds:["pmid:30760472"],agentId:"evidence-v1",agentVersion:"1",modelVersion:"1",promptVersion:"none",toolCalls:["hsi.graph.read"],costUsd:0,scientificState:"context_limited",humanReviewId:null,output:"Context-specific association"};
test("approved bounded tool execution only",()=>{
 expect(()=>validateAgentExecution(agent,{role:"evidence_investigator",tools:["hsi.graph.read"],budgetUsd:0.5,dataClass:"public_biomedical"})).not.toThrow();
 expect(()=>validateAgentExecution(agent,{role:"evidence_investigator",tools:["db.write"],budgetUsd:0.5,dataClass:"public_biomedical"})).toThrow();
 expect(()=>validateAgentExecution(agent,{role:"evidence_investigator",tools:[],budgetUsd:2,dataClass:"public_biomedical"})).toThrow();
});
test("unreviewed agent cannot run",()=>expect(()=>validateAgentExecution({...agent,evaluationId:null},{role:"evidence_investigator",tools:[],budgetUsd:0,dataClass:"public_biomedical"})).toThrow());
test("patient-identifiable and synthetic data excluded from research",()=>{
 for(const dataClass of ["patient_identifiable_clinical","synthetic"] as const){
 expect(()=>validateAgentExecution(agent,{role:"evidence_investigator",tools:[],budgetUsd:0,dataClass})).toThrow();
 expect(()=>validateResearchRecord({...run,dataClass})).toThrow();
 }
});
test("approval claims need human review and source provenance",()=>{
 expect(()=>validateResearchRecord({...run,scientificState:"approved_curated"})).toThrow();
 expect(()=>validateResearchRecord({...run,scientificState:"approved_curated",humanReviewId:"review-1",sourceIds:[]})).toThrow();
 expect(mayPublishResearchOutput({...run,scientificState:"approved_curated",humanReviewId:"review-1"})).toBe(false);
});
