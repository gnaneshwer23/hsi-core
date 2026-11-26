import {test,expect} from "bun:test";
import {adjudicatePublication,type PublicationObservation} from "../src/scientificMemoryPublicationAdjudication";
const now=Date.parse("2026-11-25T12:00:00Z");
const base:PublicationObservation={authority:"crossref",doi:"10.1234/example",version:"v1",status:"current",checkedAt:"2026-11-25T11:00:00Z",noticeRefs:[]};
const run=(rows:PublicationObservation[])=>adjudicatePublication(base.doi,"v1",rows,now);
test("adverse notice survives stale timestamp and conflicting current report",()=>{const r=run([base,{...base,authority:"pubmed",status:"retracted",checkedAt:"2025-01-01T00:00:00Z",noticeRefs:["pmid:456"]}]);expect(r.decision).toBe("quarantine");expect(r.statusConflict).toBe(true);expect(r.noticeRefs).toEqual(["pmid:456"]);});
test("multiple provider labels cannot establish independent corroboration",()=>{const r=run([base,{...base,authority:"pubmed"},{...base,authority:"europe_pmc"}]);expect(r.independentCorroborationVerified).toBe(false);expect(r.ingestionAllowed).toBe(false);expect(r.decision).toBe("insufficient_verified_provenance");});
test("wrong version requires recheck",()=>{expect(run([{...base,version:"v2"}]).decision).toBe("recheck_required");});
test("future observations rejected",()=>{expect(()=>run([{...base,checkedAt:"2027-01-01T00:00:00Z"}])).toThrow();});
