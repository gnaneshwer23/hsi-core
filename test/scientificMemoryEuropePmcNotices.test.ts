import {test,expect} from "bun:test";
import {interpretEuropePmcNotices} from "../src/scientificMemoryEuropePmcNotices";
import type {EuropePmcCandidate} from "../src/scientificMemoryEuropePmc";
const identity:EuropePmcCandidate={pmid:"123",doi:null,pmcid:null,status:"unknown",ingestionAllowed:false,scientificClaimAllowed:false};
const projection=(links:unknown[])=>({source:"MED",pmid:"123",links});
const link=(relation:string,pmid="456")=>({source:"MED",relation,pmid});
test("adverse status precedence and provenance",()=>{
 const r=interpretEuropePmcNotices(identity,projection([link("ErratumIn","789"),link("RetractionIn"),link("RetractionIn")]));
 expect(r.status).toBe("retracted");expect(r.noticePmids).toEqual(["456","789"]);expect(r.ingestionAllowed).toBe(false);expect(r.scientificClaimAllowed).toBe(false);
});
test("empty or reverse relationships do not establish current status",()=>{
 expect(interpretEuropePmcNotices(identity,projection([])).status).toBe("unknown");
 expect(interpretEuropePmcNotices(identity,projection([link("RetractionOf")])).status).toBe("unknown");
});
test("rejects wrong identity, source and self reference",()=>{
 expect(()=>interpretEuropePmcNotices(identity,{...projection([]),pmid:"999"})).toThrow();
 expect(()=>interpretEuropePmcNotices(identity,projection([link("RetractionIn","123")]))).toThrow();
 expect(()=>interpretEuropePmcNotices(identity,projection([{...link("RetractionIn"),source:"PMC"}]))).toThrow();
});
