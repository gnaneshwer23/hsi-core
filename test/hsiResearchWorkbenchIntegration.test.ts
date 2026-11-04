import {test,expect} from "bun:test";
import {queryHsiEvidenceBackedWorkbench} from "../src/hsiResearchWorkbenchIntegration";
import type {HsiGraphNode,HsiGraphRelationship} from "../src/livingHealthKnowledgeGraph";
import type {HsiGraphActor} from "../src/hsiGovernedGraphQuery";
const actor:HsiGraphActor={principalId:"researcher:1",authenticated:true,roles:["researcher"],clinicalPurposeVerified:false};
const node=(id:string):HsiGraphNode=>({schemaVersion:"hsi-lhkg-node-1",id,layer:"human_biology",kind:"cell",preferredLabel:id,aliases:[],sourceIdentifiers:[],version:"1.0.0",visibility:"governed_research",reviewState:"draft",sourceProvenance:[]});
const edge:HsiGraphRelationship={schemaVersion:"hsi-lhkg-edge-1",id:"edge:1",subjectId:"cell:1",objectId:"pathway:1",predicate:"ASSOCIATED_WITH",layer:"human_biology",epistemicType:"association",visibility:"governed_research",reviewState:"draft",sourceEvidenceIds:[],version:"1.0.0",context:{},causalClaim:false};
const base=()=>({actor,focusNodeId:"cell:1",graph:{list:async()=>({nodes:[node("cell:1"),node("pathway:1")],relationships:[edge]})},dossiers:{readByRelationshipIds:async()=>[]}});
test("authenticated researcher can inspect scoped draft with missing dossier warning",async()=>{
 const result=await queryHsiEvidenceBackedWorkbench(base());
 expect(result.relationships[0]?.evidenceAssessment).toBe("missing");expect(result.qa.reviewed).toBe(0);expect(result.readOnly).toBe(true);
});
test("unauthenticated and clinician-only actors are denied",async()=>{
 await expect(queryHsiEvidenceBackedWorkbench({...base(),actor:null})).rejects.toThrow("research role");
 await expect(queryHsiEvidenceBackedWorkbench({...base(),actor:{...actor,roles:["clinician"],clinicalPurposeVerified:true}})).rejects.toThrow("research role");
});
test("research workbench denies restricted nodes even when repository returns them",async()=>{
 const graph={list:async()=>({nodes:[{...node("cell:1"),visibility:"restricted_clinical" as const,layer:"patient_context" as const},node("pathway:1")],relationships:[edge]})};
 await expect(queryHsiEvidenceBackedWorkbench({...base(),graph})).rejects.toThrow();
});
test("missing focus and invalid limit fail closed",async()=>{
 await expect(queryHsiEvidenceBackedWorkbench({...base(),focusNodeId:"missing:1"})).rejects.toThrow("focus");
 await expect(queryHsiEvidenceBackedWorkbench({...base(),limit:101})).rejects.toThrow("limit");
});
