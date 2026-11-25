import {test,expect} from "bun:test";
import {createCrossrefTransport} from "../src/scientificMemoryCrossrefTransport";
const doi="10.1234/example";
test("disabled transport never calls network",async()=>{let called=false;const t=createCrossrefTransport(async()=>{called=true;throw Error();});expect((await t.lookup(doi)).kind).toBe("unavailable");expect(called).toBe(false);});
test("fixed endpoint and restricted request",async()=>{
 const t=createCrossrefTransport(async(url,init)=>{expect(url).toBe("https://api.crossref.org/works/10.1234%2Fexample");expect(init.redirect).toBe("error");expect(init.credentials).toBe("omit");return new Response(JSON.stringify({status:"ok","message-type":"work",message:{DOI:doi}}),{headers:{"content-type":"application/json"}});},true);
 const r=await t.lookup(doi);expect(r.kind).toBe("metadata");if(r.kind==="metadata")expect(r.candidate.status).toBe("unknown");
});
test("rate limit and oversized responses fail closed",async()=>{
 const limited=await createCrossrefTransport(async()=>new Response(null,{status:429}),true).lookup(doi);
 expect(limited).toEqual({kind:"unavailable",reason:"rate_limited"} as const);
 const large=await createCrossrefTransport(async()=>new Response("x".repeat(1048577),{headers:{"content-type":"application/json"}}),true).lookup(doi);expect(large.kind).toBe("unavailable");
});
test("timeout aborts transport",async()=>{let aborted=false;const t=createCrossrefTransport(async(_,init)=>new Promise<Response>((_,reject)=>init.signal?.addEventListener("abort",()=>{aborted=true;reject(Error());})),true,10);expect((await t.lookup(doi)).kind).toBe("unavailable");expect(aborted).toBe(true);});
