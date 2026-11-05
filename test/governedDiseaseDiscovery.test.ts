import {describe,expect,test} from "bun:test";
import {investigateGovernedDiseaseGraph} from "../src/governedDiseaseDiscovery";
import type {HsiGraphPage} from "../src/hsiGovernedGraphQuery";
import type {HsiGraphNode,HsiGraphRelationship} from "../src/livingHealthKnowledgeGraph";
const node=(id:string):HsiGraphNode=>({schemaVersion:"hsi-lhkg-node-1",id,layer:"human_biology",kind:"cell",preferredLabel:id,aliases:[],sourceIdentifiers:[],version:"1.0.0",visibility:"governed_research",reviewState:"draft",sourceProvenance:["isi-ssc"]});
const edge=(id:string,predicate:string):HsiGraphRelationship=>({schemaVersion:"hsi-lhkg-edge-1",id,subjectId:"cell:tfh",objectId:"molecule:il21",predicate,layer:"human_biology",epistemicType:"association",visibility:"governed_research",reviewState:"draft",sourceEvidenceIds:["PMID:30760472"],version:"1.0.0",context:{studyContext:"Systemic sclerosis",sourceLocator:"Abstract"},causalClaim:false});
const page:HsiGraphPage={nodes:[node("cell:tfh"),node("molecule:il21")],relationships:[edge("edge:1","activates"),edge("edge:2","inhibits")],scope:"governed_research",limit:25};
describe("Phase 4 supervised disease discovery",()=>{
 test("flags opposing SSc predicates as unvalidated contextual tension",()=>{const x=investigateGovernedDiseaseGraph(page,"systemic_sclerosis");expect(x.candidates.some(c=>c.kind==="contextual_tension")).toBe(true);expect(x.graphPromotable).toBe(false)});
 test("RA does not inherit SSc evidence",()=>{const x=investigateGovernedDiseaseGraph(page,"rheumatoid_arthritis");expect(x.candidates.filter(c=>c.kind==="comparison_gap")).toHaveLength(2)});
 test("reports provenance gaps",()=>{const e={...edge("edge:3","associated_with"),context:{studyContext:"Systemic sclerosis"}};const x=investigateGovernedDiseaseGraph({...page,relationships:[e]},"systemic_sclerosis");expect(x.candidates[0]?.kind).toBe("missing_provenance")});
 test("rejects patient-context leakage",()=>{const e={...edge("edge:4","associated_with"),layer:"patient_context" as const};expect(()=>investigateGovernedDiseaseGraph({...page,relationships:[e]},"systemic_sclerosis")).toThrow()});
 test("rejects public input as governed evidence",()=>{expect(()=>investigateGovernedDiseaseGraph({...page,scope:"public_biomedical"},"systemic_sclerosis")).toThrow()});
});
