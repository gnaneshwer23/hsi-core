import {test,expect} from "bun:test";
import {createEuropePmcTransport} from "../src/scientificMemoryEuropePmcTransport";
test("transport preserves adverse notice and blocks ingestion",async()=>{
 const payload={hitCount:1,resultList:{result:[{source:"MED",id:"123",pmid:"123",commentCorrectionList:{commentCorrection:[{type:"Retraction in",source:"MED",id:"456"}]}}]}};
 const t=createEuropePmcTransport(async()=>new Response(JSON.stringify(payload),{headers:{"content-type":"application/json"}}),true);
 const r=await t.lookup("123");
 if(r.kind!=="metadata")throw Error("Expected metadata");
 expect(r.candidate.status).toBe("retracted");expect(r.candidate.noticePmids).toEqual(["456"]);expect(r.candidate.ingestionAllowed).toBe(false);
});
