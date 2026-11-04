import {expect,test} from "bun:test";
import {loadSscCuration,validateSscCuration} from "../src/sscCuration";
const path="research/ssc-tfh-il21/curation-candidates.v1.json";
test("candidate corpus is unreviewed and cannot be published",()=>{
 const c=loadSscCuration(path);
 expect(c.graphPromotable).toBe(false);
 expect(c.reviewedByHuman).toBe(false);
 expect(c.claims.length).toBeGreaterThan(3);
 expect(c.comparisonCandidates.length).toBeGreaterThan(0);
});
test("rejects automatic promotion",()=>{
 const c=loadSscCuration(path);
 expect(()=>validateSscCuration({...c,graphPromotable:true})).toThrow("Unsafe");
});
test("requires provenance and scientific context",()=>{
 const c=loadSscCuration(path);
 const bad={...c,claims:[{...c.claims[0],context:""}]};
 expect(()=>validateSscCuration(bad)).toThrow("Missing scientific context");
});
