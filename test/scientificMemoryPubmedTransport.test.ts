import {test,expect} from "bun:test";
import {createPubmedTransport} from "../src/scientificMemoryPubmedTransport";
test("disabled transport never calls network",async()=>{let called=false;const t=createPubmedTransport(async()=>{called=true;throw Error();});expect((await t.lookup("123")).kind).toBe("unavailable");expect(called).toBe(false);});
test("fixed public endpoint and restricted request",async()=>{
 const t=createPubmedTransport(async(url,init)=>{expect(url).toBe("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=123");expect(init.redirect).toBe("error");expect(init.credentials).toBe("omit");return new Response("<PubmedArticleSet/>",{headers:{"content-type":"text/xml"}});},true);
 expect((await t.lookup("123")).kind).toBe("xml");await expect(t.lookup("123&db=other")).rejects.toThrow();
});
test("rate limit and oversized response fail closed",async()=>{
 expect(await createPubmedTransport(async()=>new Response(null,{status:429}),true).lookup("123")).toEqual({kind:"unavailable",reason:"rate_limited"} as const);
 expect((await createPubmedTransport(async()=>new Response("x".repeat(2097153),{headers:{"content-type":"text/xml"}}),true).lookup("123")).kind).toBe("unavailable");
});
test("timeout aborts transport",async()=>{let aborted=false;const t=createPubmedTransport(async(_,init)=>new Promise<Response>((_,reject)=>init.signal?.addEventListener("abort",()=>{aborted=true;reject(Error());})),true,10);expect((await t.lookup("123")).kind).toBe("unavailable");expect(aborted).toBe(true);});
