import {test,expect} from "bun:test";
import {createProvenanceCapture} from "../src/scientificMemoryProvenanceCapture";
const payload=JSON.stringify({hitCount:1,resultList:{result:[{source:"MED",id:"123",pmid:"123",commentCorrectionList:{commentCorrection:[{type:"Retraction in",source:"MED",id:"456"}]}}]}});
test("one response supplies both digest and adverse projection",async()=>{
 let calls=0;
 const t=createProvenanceCapture(async()=>{calls++;return new Response(payload,{headers:{"content-type":"application/json"}});},true,()=>0);
 const r=await t.captureEuropePmc("123");
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(payload));
 expect(r.provenance.payloadSha256).toBe(Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join(""));
 expect(calls).toBe(1);expect(r.candidate.status).toBe("retracted");expect(r.ingestionAllowed).toBe(false);
});
test("identity mismatch or invalid JSON cannot deliver a bound candidate",async()=>{
 for(const body of [payload,"invalid json"])await expect(createProvenanceCapture(async()=>new Response(body,{headers:{"content-type":"application/json"}}),true).captureEuropePmc("999")).rejects.toThrow();
});
