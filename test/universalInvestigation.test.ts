import {describe,it,expect} from "bun:test";
import {parseInvestigationV2,transitionEvidenceState,assertRelationshipV2} from "../src/researchV2/universalInvestigation";
describe("B-04.1 universal investigation",()=>{
 const base={schemaVersion:"hsi-investigation-v2",id:"inv:1",question:"Shared mechanisms?",diseaseIds:["MONDO:0008383","MONDO:0007915","MONDO:0005109"],domains:["immunology"],purpose:"research_only",containsPhi:false,clinicalAdvice:false,livePersistence:false,sourceIds:[],createdAt:"2026-11-11T00:00:00Z"};
 it("accepts cross-disease public research",()=>expect(parseInvestigationV2(base).diseaseIds).toHaveLength(3));
 it("rejects patient data or live writes",()=>{expect(()=>parseInvestigationV2({...base,containsPhi:true})).toThrow();expect(()=>parseInvestigationV2({...base,livePersistence:true})).toThrow()});
 it("rejects duplicate disease identifiers",()=>expect(()=>parseInvestigationV2({...base,diseaseIds:["MONDO:1","MONDO:1"]})).toThrow());
 it("blocks unreviewed graph promotion",()=>expect(()=>transitionEvidenceState("reviewed","approved")).toThrow());
 it("requires review record on approved relationship",()=>expect(()=>assertRelationshipV2({id:"r1",subjectId:"a",predicate:"associated_with",objectId:"b",context:{diseaseIds:["MONDO:1"],species:"human",tissueId:null,cellStateId:null,cohortId:null,method:null,timepoint:null},sourceRefs:["pmid:1"],state:"approved",uncertainty:null,review:null,previousVersionId:null})).toThrow());
});
