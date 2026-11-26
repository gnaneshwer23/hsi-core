import {test,expect} from "bun:test";
import {createProvenanceCapture} from "../src/scientificMemoryProvenanceCapture";
const doi="10.1234/example";
const payload=JSON.stringify({status:"ok","message-type":"work",message:{DOI:doi,"updated-by":[{DOI:"10.1234/notice",type:"retraction"}]}});
test("Crossref status and fingerprint derive from one response",async()=>{
 let calls=0;
 const gateway=createProvenanceCapture(async(url)=>{calls++;expect(new URL(url).hostname).toBe("api.crossref.org");return new Response(payload,{headers:{"content-type":"application/json"}});},true,()=>0);
 const r=await gateway.captureCrossref(doi);
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(payload));
 expect(r.provenance.payloadSha256).toBe(Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join(""));
 expect(calls).toBe(1);expect(r.candidate.status).toBe("retracted");expect(r.candidate.noticeDois).toEqual(["10.1234/notice"]);expect(r.ingestionAllowed).toBe(false);
});
test("invalid or mismatched responses cannot produce a bound candidate",async()=>{
 for(const body of [payload,"invalid JSON"])await expect(createProvenanceCapture(async()=>new Response(body,{headers:{"content-type":"application/json"}}),true).captureCrossref("10.1234/other")).rejects.toThrow();
});
