/** ARCH-002 Phase 3.7 — privacy-preserving clinical-to-biology lookup.
 * Trusted backend only. This is a contract, NOT a clinical authorisation provider.
 * Patient facts remain in clinical storage; output contains only approved public
 * biomedical concepts and a clinical-safe interpretation, never a research export.
 */
import type {HsiGraphNode,HsiGraphRelationship} from "./livingHealthKnowledgeGraph";
import {validateHsiLogicalGraph} from "./livingHealthKnowledgeGraph";
export type HsiClinicalAccessDecision={
 authenticated:true;principalId:string;patientRef:string;purpose:"direct_care";
 permitted:true;authorisationId:string;expiresAt:string;
};
export type HsiClinicalFact={factRef:string;patientRef:string;kind:"observation"|"condition"|"medication";codeSystem:string;code:string;recordedAt:string};
export interface HsiRestrictedClinicalReader{
 readFacts(patientRef:string,principalId:string,authorisationId:string):Promise<readonly HsiClinicalFact[]>;
}
export interface HsiApprovedBiologyReader{
 findByClinicalCode(codeSystem:string,code:string,limit:number):Promise<{nodes:readonly HsiGraphNode[];relationships:readonly HsiGraphRelationship[]}>;
}
export type HsiClinicalBiologyResult={
 patientRef:string;factCount:number;concepts:readonly {nodeId:string;label:string;kind:string}[];
 advisory:"Biological associations are contextual evidence, not patient-specific diagnosis or treatment advice";
};
const id=/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/;
export async function linkHsiClinicalContextToBiology(input:{
 access:HsiClinicalAccessDecision|null;patientRef:string;clinical:HsiRestrictedClinicalReader;
 biology:HsiApprovedBiologyReader;now:string;maxFacts?:number;
}):Promise<HsiClinicalBiologyResult>{
 const {access}=input;
 if(!access?.authenticated||!access.permitted||access.purpose!=="direct_care"||!access.principalId.trim()||!access.authorisationId.trim()||access.patientRef!==input.patientRef)throw Error("Verified patient-specific direct-care authorisation required");
 if(!Number.isFinite(Date.parse(input.now))||!Number.isFinite(Date.parse(access.expiresAt))||Date.parse(access.expiresAt)<=Date.parse(input.now))throw Error("Clinical authorisation expired");
 if(!id.test(input.patientRef))throw Error("Invalid patient reference");
 const maxFacts=input.maxFacts??25;
 if(!Number.isInteger(maxFacts)||maxFacts<1||maxFacts>50)throw Error("Invalid clinical fact limit");
 const facts=await input.clinical.readFacts(input.patientRef,access.principalId,access.authorisationId);
 if(facts.length>maxFacts)throw Error("Clinical fact limit exceeded");
 const concepts=new Map<string,{nodeId:string;label:string;kind:string}>();
 for(const fact of facts){
  if(fact.patientRef!==input.patientRef||!fact.factRef.trim()||!fact.codeSystem.trim()||!fact.code.trim()||!Number.isFinite(Date.parse(fact.recordedAt)))throw Error("Invalid or cross-patient clinical fact");
  const graph=await input.biology.findByClinicalCode(fact.codeSystem,fact.code,20);
  validateHsiLogicalGraph(graph.nodes,graph.relationships);
  if(graph.nodes.length>20||graph.relationships.length>20||graph.nodes.some(n=>n.visibility!=="public_biomedical"||n.reviewState!=="approved"||n.layer==="patient_context")||graph.relationships.some(e=>e.visibility!=="public_biomedical"||e.reviewState!=="approved"))throw Error("Unapproved or restricted biology response");
  for(const n of graph.nodes)concepts.set(n.id,{nodeId:n.id,label:n.preferredLabel,kind:n.kind});
  if(concepts.size>100)throw Error("Clinical biology response limit exceeded");
 }
 return {patientRef:input.patientRef,factCount:facts.length,concepts:[...concepts.values()],advisory:"Biological associations are contextual evidence, not patient-specific diagnosis or treatment advice"};
}
