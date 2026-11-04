import {test,expect} from "bun:test";
import {validateHsiLogicalGraph,type HsiGraphNode,type HsiGraphRelationship} from "../src/livingHealthKnowledgeGraph";
const node=(id:string,layer:HsiGraphNode["layer"]="human_biology",visibility:HsiGraphNode["visibility"]="governed_research"):HsiGraphNode=>({
 schemaVersion:"hsi-lhkg-node-1",id,layer,kind:"pathway",preferredLabel:id,aliases:[],sourceIdentifiers:[{system:"Reactome",value:"R-HSA-1",mapping:"related"}],version:"1.0.0",visibility,reviewState:visibility==="public_biomedical"?"approved":"draft",sourceProvenance:["source:1"]
});
const edge=(changes:Partial<HsiGraphRelationship>={}):HsiGraphRelationship=>({
 schemaVersion:"hsi-lhkg-edge-1",id:"edge:1",subjectId:"pathway:1",predicate:"ASSOCIATED_WITH",objectId:"pathway:2",
 layer:"human_biology",epistemicType:"association",visibility:"governed_research",reviewState:"draft",sourceEvidenceIds:[],version:"1.0.0",context:{species:"human"},causalClaim:false,...changes
});
test("valid draft graph can be explored without scientific approval",()=>expect(()=>validateHsiLogicalGraph([node("pathway:1"),node("pathway:2")],[edge()])).not.toThrow());
test("public graph cannot reference patient context",()=>expect(()=>validateHsiLogicalGraph([node("pathway:1","patient_context","restricted_clinical"),node("pathway:2","human_biology","public_biomedical")],[edge({visibility:"public_biomedical",reviewState:"approved",sourceEvidenceIds:["source:1"],reviewDecisionId:"review:1"})])).toThrow());
test("association cannot claim causality",()=>expect(()=>validateHsiLogicalGraph([node("pathway:1"),node("pathway:2")],[edge({causalClaim:true})])).toThrow("causal"));
test("unreviewed hypothesis cannot be publicly published",()=>expect(()=>validateHsiLogicalGraph([node("pathway:1","human_biology","public_biomedical"),node("pathway:2","human_biology","public_biomedical")],[edge({epistemicType:"unvalidated_hypothesis",visibility:"public_biomedical",reviewState:"approved",sourceEvidenceIds:["source:1"],reviewDecisionId:"review:1"})])).toThrow());
test("public approved association with source and review can pass schema",()=>expect(()=>validateHsiLogicalGraph([node("pathway:1","human_biology","public_biomedical"),node("pathway:2","human_biology","public_biomedical")],[edge({visibility:"public_biomedical",reviewState:"approved",sourceEvidenceIds:["source:1"],reviewDecisionId:"review:1"})])).not.toThrow());
test("duplicate IDs and dangling links fail closed",()=>{
 expect(()=>validateHsiLogicalGraph([node("pathway:1"),node("pathway:1")],[])).toThrow("Duplicate");
 expect(()=>validateHsiLogicalGraph([node("pathway:1")],[edge()])).toThrow("Dangling");
});
