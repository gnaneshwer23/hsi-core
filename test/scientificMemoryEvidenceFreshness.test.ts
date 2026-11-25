import {test,expect} from "bun:test";
import {assessMemoryEvidence,type EvidenceObservation} from "../src/scientificMemoryEvidenceFreshness";
const ref={sourceId:"fixture:paper",sourceVersion:"v1"};
const now=Date.parse("2026-01-02T00:00:00Z");
const obs:EvidenceObservation={...ref,status:"current",checkedAt:"2026-01-01T23:00:00Z",authority:"synthetic-fixture"};
test("fresh status permits review, never claim promotion",()=>{
 const r=assessMemoryEvidence([ref],[obs],now,7200000);
 expect(r.disposition).toBe("eligible_for_review");expect(r.scientificClaimAllowed).toBe(false);
});
test("missing stale or wrong-version observations require recheck",()=>{
 for(const records of [[],[{...obs,sourceVersion:"v2"}],[{...obs,checkedAt:"2025-01-01T00:00:00Z"}]])expect(assessMemoryEvidence([ref],records,now,7200000).disposition).toBe("recheck_required");
});
test("adverse status cannot be silently overridden",()=>{
 for(const status of ["retracted","corrected","superseded","expression_of_concern"] as const){
 expect(assessMemoryEvidence([ref],[obs,{...obs,status,checkedAt:"2025-01-01T00:00:00Z"}],now,7200000).disposition).toBe("quarantine");
 }
});
test("unknown status and empty references require recheck",()=>{
 expect(assessMemoryEvidence([ref],[{...obs,status:"unknown"}],now,7200000).disposition).toBe("recheck_required");
 expect(assessMemoryEvidence([],[],now,7200000).disposition).toBe("recheck_required");
});
test("future observations rejected",()=>{expect(()=>assessMemoryEvidence([ref],[{...obs,checkedAt:"2027-01-01T00:00:00Z"}],now,7200000)).toThrow();});
