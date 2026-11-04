import {test,expect} from "bun:test";
import {validateHsiOntologyIdentifier,validateHsiOntologyMapping,resolveHsiOntologyIdentity,type HsiOntologyMapping} from "../src/hsiOntologyRegistry";
import type {HsiGraphNode} from "../src/livingHealthKnowledgeGraph";
const node=(id:string,system:string,value:string,visibility:HsiGraphNode["visibility"]="governed_research"):HsiGraphNode=>({
 schemaVersion:"hsi-lhkg-node-1",id,layer:"human_biology",kind:"pathway",preferredLabel:id,aliases:[],sourceIdentifiers:[{system,value,mapping:"exact"}],version:"1.0.0",visibility,reviewState:"draft",sourceProvenance:["curation:1"]
});
const reviewed=(relation:HsiOntologyMapping["relation"]):HsiOntologyMapping=>({from:{system:"GO",value:"GO:0008150"},to:{system:"Reactome",value:"R-HSA-12345"},relation,sourceRef:"curation:1",reviewDecisionId:"review:1",version:"1.0.0"});
test("known ontology IDs are validated, malformed identifiers rejected",()=>{
 expect(()=>validateHsiOntologyIdentifier("GO","GO:0008150")).not.toThrow();
 expect(()=>validateHsiOntologyIdentifier("NCT","NCT12345678")).not.toThrow();
 expect(()=>validateHsiOntologyIdentifier("GO","GO:8150")).toThrow();
 expect(()=>validateHsiOntologyIdentifier("unknown","x")).toThrow();
});
test("exact cross-ontology mappings require human review",()=>{
 expect(()=>validateHsiOntologyMapping({...reviewed("exact"),reviewDecisionId:null})).toThrow("human review");
 expect(()=>validateHsiOntologyMapping(reviewed("exact"))).not.toThrow();
});
test("unique exact identifier resolves; related or broad mapping never merges",()=>{
 const nodes=[node("pathway:1","Reactome","R-HSA-12345")];
 expect(resolveHsiOntologyIdentity({system:"GO",value:"GO:0008150",nodes,mappings:[reviewed("related")]}).status).toBe("unresolved");
 expect(resolveHsiOntologyIdentity({system:"GO",value:"GO:0008150",nodes,mappings:[reviewed("broad")]}).status).toBe("unresolved");
 expect(resolveHsiOntologyIdentity({system:"GO",value:"GO:0008150",nodes,mappings:[reviewed("exact")]}).canonicalId).toBe("pathway:1");
});
test("identifier collision fails closed as ambiguous",()=>{
 const nodes=[node("pathway:1","GO","GO:0008150"),node("pathway:2","GO","GO:0008150")];
 const result=resolveHsiOntologyIdentity({system:"GO",value:"GO:0008150",nodes});
 expect(result.status).toBe("ambiguous");expect(result.canonicalId).toBeNull();expect(result.candidates).toHaveLength(2);
});
test("restricted clinical identities are not returned by default",()=>{
 const nodes=[node("patient-context:1","LOINC","1234-5","restricted_clinical")];
 expect(resolveHsiOntologyIdentity({system:"LOINC",value:"1234-5",nodes}).status).toBe("unresolved");
});
