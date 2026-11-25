import {test,expect} from "bun:test";
import {createEuropePmcTransport} from "../src/scientificMemoryEuropePmcTransport";
const payload={hitCount:1,resultList:{result:[{source:"MED",id:"123",pmid:"123"}]}};
const json=(value:unknown)=>new Response(JSON.stringify(value),{headers:{"content-type":"application/json"}});
test("disabled transport never fetches",async()=>{expect(await createEuropePmcTransport(async()=>{throw Error("Unexpected fetch");}).lookup("123")).toEqual({kind:"unavailable",reason:"disabled"});});
test("fixed endpoint and exact identity",async()=>{
 const t=createEuropePmcTransport(async(url,init)=>{const u=new URL(url);expect(u.origin).toBe("https://www.ebi.ac.uk");expect(u.pathname).toBe("/europepmc/webservices/rest/search");expect(u.searchParams.get("query")).toBe("EXT_ID:123 AND SRC:MED");expect(init.redirect).toBe("error");expect(init.credentials).toBe("omit");return json(payload);},true);
 const r=await t.lookup("123");expect(r.kind).toBe("metadata");if(r.kind==="metadata")expect(r.candidate.ingestionAllowed).toBe(false);
 await expect(t.lookup("123&x=1")).rejects.toThrow();
});
test("rate limit and absent records",async()=>{
 expect(await createEuropePmcTransport(async()=>new Response(null,{status:429}),true).lookup("123")).toEqual({kind:"unavailable",reason:"rate_limited"});
 expect(await createEuropePmcTransport(async()=>json({hitCount:0,resultList:{result:[]}}),true).lookup("123")).toEqual({kind:"unavailable",reason:"not_found"});
});
test("rejects mismatched identity and oversized response",async()=>{
 for(const response of [json(payload),new Response("x".repeat(2097153),{headers:{"content-type":"application/json"}})])expect(await createEuropePmcTransport(async()=>response,true).lookup("456")).toEqual({kind:"unavailable",reason:"transport_or_response"});
});
test("timeout aborts",async()=>{let signal:AbortSignal|null|undefined;const t=createEuropePmcTransport(async(_,init)=>{signal=init.signal;return new Promise<Response>(()=>{});},true,5);expect(await t.lookup("123")).toEqual({kind:"unavailable",reason:"transport_or_response"});expect(signal?.aborted).toBe(true);});
