import {test,expect} from "bun:test";
import {createProvenanceCapture} from "../src/scientificMemoryProvenanceCapture";
test("disabled gateway performs no request",async()=>{await expect(createProvenanceCapture(async()=>{throw Error("Unexpected fetch");}).capture("pubmed","123")).rejects.toThrow("Capture disabled");});
test("fingerprint computed from exact response bytes",async()=>{
 const t=createProvenanceCapture(async(url,init)=>{expect(new URL(url).hostname).toBe("www.ebi.ac.uk");expect(init.redirect).toBe("error");expect(init.credentials).toBe("omit");return new Response("abc",{headers:{"content-type":"application/json"}});},true,()=>0);
 const r=await t.capture("europe_pmc","123");expect(r.payloadSha256).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");expect(r.byteLength).toBe(3);expect(r.checkedAt).toBe("1970-01-01T00:00:00.000Z");expect(r.authorityAuthenticated).toBe(false);expect(r.ingestionAllowed).toBe(false);
});
test("oversized or wrong media responses rejected",async()=>{
 for(const r of [new Response("x".repeat(2097153),{headers:{"content-type":"application/json"}}),new Response("abc",{headers:{"content-type":"text/html"}})])await expect(createProvenanceCapture(async()=>r,true).capture("crossref","10.1234/example")).rejects.toThrow();
});
