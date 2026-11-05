import {describe,expect,test} from "bun:test";
import {alignIsiMechanismRelease} from "../src/isiCanonicalAlignment";
const fixture={schemaVersion:"hsi-isi-mechanism-release-1",releaseId:"isi-ssc-1",version:"1.0.0",reviewedByHuman:false,graphPromotable:false,containsPhi:false,nodes:[{id:"ssc:tfh",preferredLabel:"Tfh",kind:"cell"},{id:"ssc:il21",preferredLabel:"IL-21",kind:"molecule"}],relationships:[{id:"ssc:edge1",subjectId:"ssc:tfh",objectId:"ssc:il21",predicate:"ASSOCIATED_WITH",reviewState:"draft",sourceEvidenceIds:["PMID:30760472"],context:{studyContext:"SSc cohort",sourceLocator:"Abstract",limitations:"Full-text review needed"}}]};
describe("Phase 3.1 ISI canonical alignment",()=>{
 test("preserves draft context and source identifiers without approval",()=>{const x=alignIsiMechanismRelease(fixture);expect(x.graphPromotable).toBe(false);expect(x.relationships[0]?.epistemicType).toBe("association");expect(x.relationships[0]?.causalClaim).toBe(false);expect(x.relationships[0]?.sourceEvidenceIds).toEqual(["PMID:30760472"]);expect(x.mappingGaps).toHaveLength(2)});
 test("reports missing provenance rather than silently inventing it",()=>{const x=alignIsiMechanismRelease({...fixture,relationships:[{...fixture.relationships[0],sourceEvidenceIds:[],context:{}}]});expect(x.provenanceGaps).toHaveLength(3)});
 test("rejects PHI and auto-promotion",()=>{expect(()=>alignIsiMechanismRelease({...fixture,containsPhi:true})).toThrow();expect(()=>alignIsiMechanismRelease({...fixture,graphPromotable:true})).toThrow()});
 test("rejects dangling graph endpoints",()=>{expect(()=>alignIsiMechanismRelease({...fixture,relationships:[{...fixture.relationships[0],objectId:"missing"}]})).toThrow()});
 test("deterministic canonical projection",()=>{expect(alignIsiMechanismRelease(fixture)).toEqual(alignIsiMechanismRelease(fixture))});
});
