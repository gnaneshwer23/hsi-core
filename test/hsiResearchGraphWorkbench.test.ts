import {test,expect} from "bun:test";
import {buildHsiResearchWorkbench} from "../src/hsiResearchGraphWorkbench";
import type {HsiGraphNode,HsiGraphRelationship} from "../src/livingHealthKnowledgeGraph";
const node=(id:string,visibility:HsiGraphNode["visibility"]="governed_research"):HsiGraphNode=>({schemaVersion:"hsi-lhkg-node-1",id,layer:visibility==="restricted_clinical"?"patient_context":"human_biology",kind:"cell",preferredLabel:id,aliases:[],sourceIdentifiers:[],version:"1.0.0",visibility,reviewState:"draft",sourceProvenance:[]});
const edge:HsiGraphRelationship={schemaVersion:"hsi-lhkg-edge-1",id:"edge:1",subjectId:"cell:1",objectId:"pathway:1",predicate:"ASSOCIATED_WITH",layer:"human_biology",epistemicType:"association",visibility:"governed_research",reviewState:"draft",sourceEvidenceIds:[],version:"1.0.0",context:{},causalClaim:false};
const data=()=>({nodes:[node("cell:1"),node("pathway:1")],relationships:[edge],dossiers:[],query:{focusNodeId:"cell:1",maxRelationships:10,includeDrafts:true}});
test("researcher workbench labels draft relationships and missing dossiers",()=>{
 const result=buildHsiResearchWorkbench(data());expect(result.qa.missingDossiers).toBe(1);expect(result.qa.reviewed).toBe(0);
 expect(result.relationships[0]?.warnings).toContain("Not scientifically approved");expect(result.readOnly).toBe(true);
});
test("draft filtering never promotes scientific approval",()=>{
 const result=buildHsiResearchWorkbench({...data(),query:{...data().query,includeDrafts:false}});
 expect(result.relationships).toHaveLength(0);
});
test("patient context is excluded from research workbench",()=>{
 const input=data();input.nodes=[node("patient:1","restricted_clinical"),node("pathway:1")];
 expect(()=>buildHsiResearchWorkbench({...input,query:{...input.query,focusNodeId:"patient:1"}})).toThrow();
});
test("invalid query limits and mismatched dossiers fail closed",()=>{
 expect(()=>buildHsiResearchWorkbench({...data(),query:{...data().query,maxRelationships:101}})).toThrow("Invalid workbench");
});
