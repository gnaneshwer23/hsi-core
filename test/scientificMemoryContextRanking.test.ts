import {test,expect} from "bun:test";
import {rankScientificContext,type ContextCandidate} from "../src/scientificMemoryContextRanking";
const candidate=(n:number,context:ContextCandidate["context"],rank=1):ContextCandidate=>({id:"00000000-0000-4000-8000-"+String(n).padStart(12,"0"),version:1,lexicalRank:rank,semanticRank:null,graphRank:null,context,provenance:[]});
test("matching context precedes missing and different contexts despite retrieval score",()=>{
 const r=rankScientificContext({species:"human",tissue:"brain"},[candidate(1,{species:"mouse",tissue:"brain"}),candidate(2,{species:"human"}),candidate(3,{species:"Human",tissue:"brain"},20)]);
 expect(r.map(x=>x.applicability)).toEqual(["matching_context","context_incomplete","different_context"]);
 expect(r[2]?.mismatches).toEqual(["species"]);
 expect(r.every(x=>x.scientificClaimAllowed===false)).toBe(true);
});
test("provenance presence is not verification",()=>{
 const c=candidate(1,{});
 c.provenance=[{sourceId:"paper",sourceVersion:"v1",locator:"figure 2"}];
 const r=rankScientificContext({},[c])[0];
 expect(r?.provenanceStatus).toBe("references_present_not_verified");
 expect(r?.applicability).toBe("context_not_requested");
});
test("reject duplicate and invalid context",()=>{
 const c=candidate(1,{});
 expect(()=>rankScientificContext({},[c,c])).toThrow();
 expect(()=>rankScientificContext({species:" "},[c])).toThrow();
});
