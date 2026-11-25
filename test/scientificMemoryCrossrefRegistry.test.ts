import {test,expect} from "bun:test";
import {prepareCrossrefRegistryCandidate} from "../src/scientificMemoryCrossrefRegistry";
import type {CrossrefStatusCandidate} from "../src/scientificMemoryCrossref";
const c:CrossrefStatusCandidate={doi:"10.1234/example",status:"retracted",noticeDois:["10.1234/notice","10.1234/NOTICE"],scientificClaimAllowed:false};
const checked="2026-01-01T00:00:00Z",now=Date.parse(checked);
test("preserves identity version and deduplicated notices without authorizing ingestion",()=>{
 const r=prepareCrossrefRegistryCandidate(c,"v1",checked,now);
 expect(r.sourceId).toBe("doi:10.1234/example");expect(r.sourceVersion).toBe("v1");expect(r.noticeRefs).toEqual(["doi:10.1234/notice"]);expect(r.ingestionAllowed).toBe(false);expect(r.scientificClaimAllowed).toBe(false);
});
test("rejects unsupported current status and missing adverse notice",()=>{
 expect(()=>prepareCrossrefRegistryCandidate({...c,status:"current"},"v1",checked,now)).toThrow();
 expect(()=>prepareCrossrefRegistryCandidate({...c,noticeDois:[]},"v1",checked,now)).toThrow();
});
test("unknown status remains unknown",()=>{expect(prepareCrossrefRegistryCandidate({...c,status:"unknown",noticeDois:[]},"v1",checked,now).status).toBe("unknown");});
test("rejects missing version and future observation",()=>{expect(()=>prepareCrossrefRegistryCandidate(c,"",checked,now)).toThrow();expect(()=>prepareCrossrefRegistryCandidate(c,"v1","2027-01-01T00:00:00Z",now)).toThrow();});
