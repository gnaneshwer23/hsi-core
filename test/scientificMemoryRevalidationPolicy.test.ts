import {test,expect} from "bun:test";
import {planEvidenceRevalidation,type RevalidationCandidate} from "../src/scientificMemoryRevalidationPolicy";
const c:RevalidationCandidate={doi:"10.1234/fixture-paper",version:"v1",decision:"recheck_required",checkedAtMs:0,consecutiveFailures:0,lastFailureAtMs:null};
test("six hour boundary and never checked",()=>{expect(planEvidenceRevalidation(c,21600000-1).due).toBe(false);expect(planEvidenceRevalidation(c,21600000).due).toBe(true);expect(planEvidenceRevalidation({...c,checkedAtMs:null},0).due).toBe(true);});
test("retry backoff and quarantine remain fail closed",()=>{const r=planEvidenceRevalidation({...c,decision:"quarantine",checkedAtMs:null,consecutiveFailures:3,lastFailureAtMs:1000},2000);expect(r.dueAtMs).toBe(241000);expect(r.due).toBe(false);expect(r.quarantinePreserved).toBe(true);expect(r.ingestionAllowed).toBe(false);});
test("invalid future time and inconsistent failure state rejected",()=>{expect(()=>planEvidenceRevalidation({...c,checkedAtMs:1},0)).toThrow();expect(()=>planEvidenceRevalidation({...c,consecutiveFailures:1},0)).toThrow();});
