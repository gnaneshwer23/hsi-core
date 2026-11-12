import {expect,it} from "bun:test";
import {evaluateContradictionActivationGate,REQUIRED_ACTIVATION_CHECKS} from "../src/db/contradictionActivationGate";
it("fails closed with no independent security evidence",()=>{
 const result=evaluateContradictionActivationGate([]);
 expect(result.ready).toBe(false);
 expect(result.missing).toEqual([...REQUIRED_ACTIVATION_CHECKS]);
});
it("does not activate from a complete but unsigned checklist",()=>{
 const evidence=REQUIRED_ACTIVATION_CHECKS.map(check=>({check,passed:true,artifactUrl:"https://example.org/fixture/"+check,verifiedBy:"caller-asserted-reviewer",verifiedAt:"2026-11-12T00:00:00Z"}));
 const result=evaluateContradictionActivationGate(evidence);expect(result.structurallyComplete).toBe(true);expect(result.ready).toBe(false);
});
it("rejects self-attested or invalid evidence records",()=>{
 const result=evaluateContradictionActivationGate([{check:"self_review_denied",passed:true,
 artifactUrl:"local://test",verifiedBy:"",verifiedAt:"not-a-date"}]);
 expect(result.ready).toBe(false);
 expect(result.invalid).toContain("self_review_denied");
});
it("rejects duplicate and failed checks",()=>{
 const item={check:"tenant_isolation_select_insert" as const,passed:true,
 artifactUrl:"https://example.org/ci/123",verifiedBy:"reviewer-b",verifiedAt:"2026-11-11T00:00:00Z"};
 const result=evaluateContradictionActivationGate([item,item]);
 expect(result.invalid).toContain("tenant_isolation_select_insert");
});
